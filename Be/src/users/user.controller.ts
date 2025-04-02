import { 
    BadRequestException, 
    Controller, 
    Get, 
    NotFoundException, 
    Post,
    Query, 
    Req, 
    UseGuards,
    Body,
    UseInterceptors,
    UploadedFile
  } from '@nestjs/common';
  import { AuthGuard } from '@nestjs/passport';
  import { UsersService } from './users.service';
import { FileInterceptor } from '@nestjs/platform-express/multer';
import { diskStorage } from 'multer';
import { extname } from 'path';
  
  @Controller('user')
  export class UserController {
    constructor(private readonly userService: UsersService) {}
  
    @Get('profile')
    async getUser(@Query('username') username: string) {
      console.log("Received username:", username); // Debugging
  
      if (!username) {
        throw new BadRequestException('Username is required');
      }
  
      const user = await this.userService.findOne(username);
      if (!user) {
        throw new NotFoundException('User not found');
      }
  
      return {
        username: user.username,
        email: user.email,
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        phone: user.phone || '',
        dob: user.dob || '',
        gender: user.gender || '',
        avatar: user.avatar || 'https://via.placeholder.com/150', // Default avatar
      };
    }
    @Post('update-profile')
    @UseInterceptors(FileInterceptor('avatar', {
      storage: diskStorage({
        destination: './uploads/', // Thư mục lưu ảnh
        filename: (req, file, callback) => {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
          callback(null, uniqueSuffix + '-' + file.originalname);
        }
      }),
    }))
    async updateProfile(@UploadedFile() file: Express.Multer.File, @Body() userData: any) {
      console.log("Received data:", userData);
      console.log("Uploaded file:", file);
  
      if (!userData.username) {
        throw new BadRequestException('Username is required');
      }
  
      // Lưu file vào DB nếu có
      if (file) {
        userData.avatar = `/uploads/${file.filename}`;
      }
  
      const updatedUser = await this.userService.updateProfile(userData);
  
      return {
        success: true,
        message: 'Profile updated successfully',
        user: updatedUser,
      };
    }
  
    @Post('update-avatar')
    async updateAvatar(@Body() data: { username: string, avatar: string }) {
      if (!data.username || !data.avatar) {
        throw new BadRequestException('Username and avatar are required');
      }
  
      await this.userService.updateAvatar(data.username, data.avatar);
      
      return {
        success: true,
        message: 'Avatar updated successfully'
      };
    }
  }