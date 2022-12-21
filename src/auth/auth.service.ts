import { PrismaService } from '@/prisma/prisma.service';
import {
  BadRequestException,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { SignupDto } from './dto';
import * as argon from 'argon2';
@Injectable()
export class AuthService {
  constructor(private prisma: PrismaService) {}

  async signup(signupDto: SignupDto) {
    const { email, username, password } = signupDto;

    try {
      const userToFind = await this.prisma.user.findUnique({
        where: {
          email,
        },
      });

      if (userToFind) {
        throw new ForbiddenException({
          success: false,
          message: 'This user already exists',
        });
      }

      const hashedPassword = await argon.hash(password);

      const newUser = await this.prisma.user.create({
        data: {
          email,
          password: hashedPassword,
          username,
        },
      });

      delete newUser.password;

      return {
        message: `Welcome, ${username}!`,
        success: true,
        data: { ...newUser },
      };
    } catch (error: any) {
      throw new BadRequestException({
        message: error?.message || 'An error has occurred',
        success: false,
      });
    }
  }
}
