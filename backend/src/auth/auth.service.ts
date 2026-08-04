import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcryptjs';
import * as jwt from 'jsonwebtoken';
import { CreateAuthDto } from './dto/create-auth.dto';
import { LoginDto } from './dto/update-auth.dto';

@Injectable()
export class AuthService {
  constructor(private prisma: PrismaService) {}

  private generateToken(id: number, email: string, name: string): string {
    const secret = process.env.JWT_SECRET || 'fallbacksecret';
    return jwt.sign({ id, email, name }, secret, { expiresIn: '7d' });
  }

  async register(createAuthDto: CreateAuthDto) {
    const { name, email, password } = createAuthDto;
    const existingUser = await this.prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      throw new ConflictException('User already exists with this email.');
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await this.prisma.user.create({
      data: { name, email, password: hashedPassword },
    });
    const token = this.generateToken(user.id, user.email, user.name);
    return { token, user: { id: user.id, name: user.name, email: user.email } };
  }

  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) {
      throw new UnauthorizedException('Invalid email or password.');
    }
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      throw new UnauthorizedException('Invalid email or password.');
    }
    const token = this.generateToken(user.id, user.email, user.name);
    return { token, user: { id: user.id, name: user.name, email: user.email } };
  }

  async getMe(id: number) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: { id: true, name: true, email: true, createdAt: true },
    });
    if (!user) throw new UnauthorizedException('User not found.');
    return user;
  }
}
