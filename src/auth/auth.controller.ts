import { Controller, Post, Body, ValidationPipe } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/auth-register.dto';
import { LoginDto } from './dto/auth-login.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  register(@Body(ValidationPipe) registerDto: RegisterDto) {
    return this.authService.register(registerDto.email, registerDto.password);
  }

  @Post('login')
  login(@Body(ValidationPipe) loginDto: LoginDto) {
    return this.authService.login(loginDto.email, loginDto.password);
  }
}