import { Body, Controller, Get, Post } from '@nestjs/common';
import { LoginDto, SignupDto } from './dto';

@Controller('auth')
export class AuthController {
  @Post('/signup')
  signup(@Body() dto: SignupDto) {
    return '';
  }

  @Post('/login')
  login(@Body() dto: LoginDto) {
    return '';
  }

  @Get('/me')
  getCurrentUser() {
    return '';
  }
}
