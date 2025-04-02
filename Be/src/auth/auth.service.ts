import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { OtpService } from 'src/otp/otp.service';
import { MailerService } from '@nestjs-modules/mailer';
import { randomInt } from 'crypto';
import { Types } from 'mongoose';
import { PendingUsersService } from 'src/pending-users/pending-users.service';
@Injectable()
export class AuthService {
    constructor (
        private usersService : UsersService,
        private jwtService: JwtService,
        private otpService: OtpService,
        private mailerService: MailerService,
        private pendingUsersService: PendingUsersService,
    ) {}
    async verifyToken(token: string): Promise<any> {
      try {
          const payload = this.jwtService.verify(token);
          const user = await this.usersService.findById(payload.sub);
          if (!user) {
              throw new UnauthorizedException('User not found');
          }
          return { user, payload };
      } catch (error) {
          throw new UnauthorizedException('Invalid or expired token');
      }
  }
  async validateUser(username: string, password: string): Promise<any> {
    const user = await this.usersService.validateUser(username, password);
    if (user) {
        const userObject = user.toObject ? user.toObject() : user;
        const { password, ...result } = userObject;
        if (!result.role) {
            throw new BadRequestException('User role is missing');
        }
        return result;
    }
    return null;
}

async login(user: any, accessToken?: string) {
    if (!user.isEmailVerified === false) {
        throw new BadRequestException('Email not verified. Please verify your email before logging in.');
    }
  if (accessToken && typeof accessToken === 'string') {
      try {
          const { user: tokenUser, payload } = await this.verifyToken(accessToken);
          if (tokenUser.username === user.username) {
              console.log('Token is valid for user:', user.username);
              return {
                  access_token: accessToken,
                  role: user.role,
              };
          } else {
              console.log('Token does not belong to this user, proceeding with new token generation');
          }
      } catch (error) {
          console.log('Token verification failed:', error.message);
      }
  }
  console.log('User object in login:', user);
  const payload = { username: user.username, sub: user.id, role: user.role };
  console.log('Token payload:', payload);
  return {
      access_token: this.jwtService.sign(payload),
      role: user.role,
  };
}
async register(username: string, password: string, email: string, role: string = 'user') {
    try {
        console.log('Starting registration:', { username, email, role });
        const existingUser = await this.usersService.findOne(username);
        if (existingUser) {
            console.log('Username already exists in users:', username);
            throw new BadRequestException('Username already exists');
        }
        const existingPendingUser = await this.pendingUsersService.findByUsername(username);
        if (existingPendingUser) {
            console.log('Username already exists in pendingUsers:', username);
            throw new BadRequestException('Username already exists (pending verification)');
        }
        console.log('Username is available:', username);
        const hashedPassword = await this.usersService.hashedPassword(password);
        const userData = {
            username,
            password: hashedPassword,
            email,
            role,
            emailVerified: false,
        };
        console.log('User data prepared:', userData);
        const pendingUser = await this.pendingUsersService.create(
            userData.username,
            userData.password,
            userData.email,
            userData.role,
            userData.emailVerified,
        );
        console.log('Pending user created successfully:', pendingUser);
        const otp = randomInt(100000, 999999).toString();
        console.log('Generated OTP:', otp);
        if (!email) {
            console.log('Email is missing');
            throw new BadRequestException('Email is required');
        }
        console.log('Email validated:', email);
        const otpRecord = await this.otpService.create(pendingUser._id.toString(), otp);
        console.log('OTP saved to database for pending user:', pendingUser._id, 'OTP record:', otpRecord);
        console.log('Attempting to send email with OTP to:', email);
        await this.mailerService.sendMail({
            to: email,
            subject: 'Verify your email',
            template: './verify-email',
            context: {
                name: username,
                otp,
            },
        });
        console.log('Email with OTP sent successfully to:', email);

        return { message: 'OTP sent to your email', userId: pendingUser._id };
    } catch (error) {
        console.error('Error during registration:', error);
        const errorMessage = error.message || 'Unknown error occurred during registration';
        throw new BadRequestException(errorMessage);
    }
}
async verifyOtp(otp: string) {
    console.log('Verifying OTP:', otp);

    const otpRecord = await this.otpService.findByOtp(otp);
    if (!otpRecord) {
        console.log('OTP not found:', otp);

        const expiredOtpRecord = await this.otpService.findByOtpWithoutExpiration(otp);
        if (expiredOtpRecord) {
            console.log('OTP exists but is expired:', expiredOtpRecord);
            throw new BadRequestException('The OTP has expired. Please request a new one.');
        }

        throw new BadRequestException('Invalid OTP. Please try again.');
    }
    console.log('OTP record found:', otpRecord);

    const userId = new Types.ObjectId(otpRecord.userId);

    // Check if the user is in the pendingUsers collection (for registration)
    const pendingUser = await this.pendingUsersService.findPendingUserById(userId.toString());
    if (pendingUser) {
        console.log('Pending user found:', pendingUser);

        const user = await this.usersService.create(
            pendingUser.username,
            pendingUser.password,
            pendingUser.email,
            pendingUser.role,
            true,
        );
        console.log('User created from pending user:', user);

        await this.pendingUsersService.delete(userId.toString());
        console.log('Pending user deleted:', userId);

        await this.otpService.delete(userId.toString(), otp);
        console.log('OTP deleted:', otp);

        return { message: 'Email verified successfully. You can now log in.' };
    }

    // Check if the user is in the users collection (for password reset)
    const user = await this.usersService.findById(userId.toString());
    if (!user) {
        console.log('User not found for userId:', userId);
        await this.otpService.delete(userId.toString(), otp);
        throw new BadRequestException('User not found. Please register again.');
    }
    console.log('User found:', user);

    await this.otpService.delete(userId.toString(), otp);
    console.log('OTP deleted:', otp);

    // Return the userId so the frontend can use it to change the password
    return { message: 'OTP verified successfully. You can now change your password.', userId: userId.toString() };
}
async forgotPassword(email: string) {
    try {
        console.log('Starting forgot password process for email:', email);

        const user = await this.usersService.findByEmail(email);
        if (!user) {
            console.log('User not found for email:', email);
            throw new BadRequestException('Email not found. Please register first.');
        }
        console.log('User found:', user);

        const otp = randomInt(100000, 999999).toString();
        console.log('Generated OTP for password reset:', otp);
        const otpRecord = await this.otpService.create(user._id.toString(), otp);
        console.log('OTP saved to database for user:', user._id, 'OTP record:', otpRecord);

        await this.mailerService.sendMail({
            to: user.email,
            subject: 'Reset your password',
            template: './reset-password',
            context: {
                name: user.username,
                otp,
            },
        });
        console.log('Password reset email sent successfully to:', user.email);

        return { message: 'OTP sent to your email for password reset.', userId: user._id };
    } catch (error) {
        console.error('Error during forgot password process:', error);
        const errorMessage = error.message || 'Unknown error occurred during forgot password process';
        throw new BadRequestException(errorMessage);
    }
}
async changePassword(userId: string, newPassword: string) {
    try {
        console.log('Changing password for userId:', userId);

        const user = await this.usersService.findById(userId);
        if (!user) {
            console.log('User not found for userId:', userId);
            throw new BadRequestException('User not found.');
        }
        console.log('User found:', user);

        await this.usersService.updatePassword(userId, newPassword);
        console.log('Password updated successfully for user:', userId);

        return { message: 'Password changed successfully. You can now log in with your new password.' };
    } catch (error) {
        console.error('Error during password change:', error);
        const errorMessage = error.message || 'Unknown error occurred during password change';
        throw new BadRequestException(errorMessage);
    }
}
}