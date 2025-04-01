import { Controller, Post, Request, UseGuards, Body, Get, Headers } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './local-auth.guard';
import { JwtAuthGuard } from './jwt-auth.guard';
import { RolesGuard } from './roles.guard';
import { Roles } from './roles.decorator';
import { RegisterDto } from './dto/register.dto';

@Controller()
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  async register(@Body() registerDto: RegisterDto) {
    const { username, password, email, role } = registerDto;
    return this.authService.register(username, password, email, role ?? 'user');
  }

  @UseGuards(LocalAuthGuard)
  @Post('login')
  async login(@Request() req, @Headers('authorization') authorization?: string) {
    let accessToken: string | undefined;
    if (authorization && authorization.startsWith('Bearer ')) {
        accessToken = authorization.split(' ')[1]; 
    }
    return this.authService.login(req.user, accessToken);
}

@Post('verify-otp')
async verifyOtp(@Body('otp') otp: string) {
    return this.authService.verifyOtp(otp);
}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Post('protected')
  getProtected(@Request() req) {
    return { message: 'this is protected for admin', user: req.user };
  }
}