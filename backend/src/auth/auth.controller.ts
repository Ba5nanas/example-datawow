import { Controller, Post, Body, HttpCode, HttpStatus, UseGuards, Request } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { LoginUserDto } from '../users/dto/login-user.dto';
import { JwtAuthGuard } from './jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  async register(@Body() createUserDto: CreateUserDto) {
    return await this.authService.register(
      createUserDto.name,
      createUserDto.email,
      createUserDto.password,
    );
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() loginUserDto: LoginUserDto) {
    return await this.authService.login(loginUserDto.email, loginUserDto.password);
  }

  @Post('validate')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async validate(@Request() req) {
    return { valid: true, user: req.user };
  }
}
