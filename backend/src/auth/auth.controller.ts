import { Body, Controller, Get, Post } from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('dev-login')
  devLogin(@Body() body: { role?: UserRole }) {
    return this.authService.devLogin(body.role || UserRole.PROFESSIONAL);
  }

  @Get('google')
  google() {
    return this.authService.googlePlaceholder();
  }

  @Get('google/callback')
  googleCallback() {
    return this.authService.googlePlaceholder();
  }
}
