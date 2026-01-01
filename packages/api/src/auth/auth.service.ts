import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { parsePhoneNumber } from 'libphonenumber-js';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async register(email: string, phone: string, password: string) {
    // Normalize phone to E.164 format
    const normalizedPhone = this.normalizePhone(phone);
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await this.prisma.user.create({
      data: {
        email,
        phone: normalizedPhone,
        password: hashedPassword,
      },
    });

    // Generate JWT token
    const token = this.generateToken(user.id);

    return {
      user: {
        id: user.id,
        email: user.email,
        phone: user.phone,
        phoneVerified: user.phoneVerified,
      },
      token,
    };
  }

  async login(email: string, password: string) {
    // Find user by email
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new Error('Invalid credentials');
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new Error('Invalid credentials');
    }

    // Generate JWT token
    const token = this.generateToken(user.id);

    return {
      user: {
        id: user.id,
        email: user.email,
        phone: user.phone,
        phoneVerified: user.phoneVerified,
        telegramUserId: user.telegramUserId,
      },
      token,
    };
  }

  async validateUser(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return null;
    }

    return {
      id: user.id,
      email: user.email,
      phone: user.phone,
      phoneVerified: user.phoneVerified,
      telegramUserId: user.telegramUserId,
    };
  }

  private normalizePhone(phone: string): string {
    try {
      const phoneNumber = parsePhoneNumber(phone);
      if (!phoneNumber || !phoneNumber.isValid()) {
        throw new Error('Invalid phone number');
      }
      return phoneNumber.format('E.164');
    } catch (error) {
      throw new Error('Invalid phone number format');
    }
  }

  private generateToken(userId: string): string {
    return this.jwtService.sign({ sub: userId });
  }
}
