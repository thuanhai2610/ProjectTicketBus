import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { OtpService } from 'src/otp/otp.service';
import { MailerService } from '@nestjs-modules/mailer';
import { randomInt } from 'crypto';
import { Types } from 'mongoose';
@Injectable()
export class AuthService {
    constructor (
        private usersService : UsersService,
        private jwtService: JwtService,
        private otpService: OtpService,
        private mailerService: MailerService,
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
          console.log('Username already exists:', username);
          throw new BadRequestException('Username already exists');
      }

      const user = await this.usersService.create(username, password, email, role, false);
      console.log('User created successfully:', user);

      const userObject = user.toObject ? user.toObject() : user;
      const { password: _, ...result } = userObject;

      try {
          const otp = randomInt(100000, 999999).toString();
          console.log('Generated OTP:', otp);

          await this.otpService.create(result._id, otp);
          console.log('OTP saved to database for user:', result._id);

          if (!result.email) {
              console.log('Email is missing for user:', result._id);
              throw new BadRequestException('Email is missing for the user');
          }

          await this.mailerService.sendMail({
              to: result.email,
              subject: 'Verify your email',
              template: './verify-email',
              context: {
                  name: result.username,
                  otp,
              },
          });
          console.log('Email sent successfully to:', result.email);
      } catch (error) {
          // Rollback: Delete the user if OTP creation or email sending fails
          console.log('Rolling back user creation due to error:', error.message);
          await this.usersService.delete(result._id);
          console.log('User deleted:', result._id);
          throw error;
      }

      return { message: 'OTP sent to your email', userId: result._id };
  } catch (error) {
      console.error('Error during registration:', error);
      const errorMessage = error.message || 'Unknown error occurred during registration';
      throw new BadRequestException(errorMessage);
  }
}
async verifyOtp(otp: string) {
  console.log('Verifying OTP:', otp);

  // Find the OTP record using the OTP code
  const otpRecord = await this.otpService.findByOtp(otp);
  if (!otpRecord) {
      console.log('OTP not found:', otp);
      throw new BadRequestException('Invalid or expired OTP');
  }
  console.log('OTP record found:', otpRecord);

  // Convert otpRecord.userId to ObjectId
  const userId = new Types.ObjectId(otpRecord.userId);

  // Find the user using the converted userId
  const user = await this.usersService.findById(userId.toString());
  if (!user) {
      console.log('User not found for userId:', userId);
      // Delete the OTP record using the converted userId
      await this.otpService.delete(userId.toString(), otp);
      throw new BadRequestException('User not found. Please register again.');
  }
  console.log('User found:', user);

  // Update email verification status
  await this.usersService.updateEmailVerified(userId.toString(), true);
  console.log('Email verified for user:', userId);

  // Delete the OTP record
  await this.otpService.delete(userId.toString(), otp);
  console.log('OTP deleted:', otp);

  return { message: 'Email verified successfully. You can now log in.' };
}
}