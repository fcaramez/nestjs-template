import { PrismaService } from '@/prisma/prisma.service';
import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { LoginDto, SignupDto } from './dto';
import * as argon from 'argon2';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
    private config: ConfigService,
  ) {}

  async signup(signupDto: SignupDto) {
    const { email, username, password } = signupDto;

    if (!email || !username || !password) {
      throw new BadRequestException({
        message: 'All fields are mandatory.',
        success: false,
      });
    }

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

      const authToken = this.signToken(newUser);

      return {
        message: `Welcome, ${username}!`,
        success: true,
        data: { ...newUser },
        authToken,
      };
    } catch (error: any) {
      throw new BadRequestException({
        message: error?.message || 'An error has occurred',
        success: false,
      });
    }
  }

  async login(dto: LoginDto) {
    try {
      const { email, password } = dto;

      if (!email || !password) {
        throw new BadRequestException({
          message: 'All fields are mandatory.',
          success: false,
        });
      }

      const user = await this.prisma.user.findUnique({
        where: {
          email,
        },
      });

      const verify = await argon.verify(password, user.password);

      if (!verify || !user) {
        throw new UnauthorizedException({
          message: 'Wrong Credentials',
          success: false,
        });
      }
      delete user.password;
      const authToken = this.signToken(user);

      return {
        message: `Welcome back, ${user.username}`,
        success: true,
        data: { ...user },
        authToken,
      };
    } catch (error) {}
  }

  signToken(userData: {
    email: string;
    username: string;
    id: string;
  }): Promise<string> {
    const payload = {
      ...userData,
    };

    return this.jwt.signAsync(payload, {
      expiresIn: '12h',
      secret: this.config.get('JWT_SECRET'),
    });
  }
}
