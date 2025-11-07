import { 
  Controller, 
  Post, 
  Body, 
  HttpCode, 
  HttpStatus,
  UsePipes,
  ValidationPipe 
} from '@nestjs/common';
import { AuthService } from '../Services/auth.service';
import { RegisterDto } from '../DTOs/register.dto';
import { LoginDto } from '../DTOs/login.dto';
import { LoginAdminDto } from '../DTOs/loginAdmin.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
  async register(@Body() registerDto: RegisterDto) {
    return await this.authService.register(registerDto);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
  async login(@Body() loginDto: LoginDto) {
    return await this.authService.login(loginDto);
  }

  @Post('admin/login')
  @HttpCode(HttpStatus.OK)
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
  async loginAdmin(@Body() loginAdminDto: LoginAdminDto) {
    return await this.authService.loginAdmin(loginAdminDto);
  }
}