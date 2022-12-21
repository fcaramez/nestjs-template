import { Controller, Get, Post } from '@nestjs/common';

@Controller('auth')
export class AuthController {
  @Post('/signup')
  signup() {
    return '';
  }

  @Post('/login')
  login() {
    return '';
  }

  @Get('/me')
  getCurrentUser() {
    return '';
  }
}
