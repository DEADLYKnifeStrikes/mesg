import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { parsePhoneNumber } from 'libphonenumber-js';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findByPhone(phone: string) {
    // Normalize phone to E.164 format for exact match
    const normalizedPhone = this.normalizePhone(phone);
    
    const user = await this.prisma.user.findUnique({
      where: { phone: normalizedPhone },
      select: {
        id: true,
        email: true,
        phone: true,
        phoneVerified: true,
        createdAt: true,
      },
    });

    return user;
  }

  async findById(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        phone: true,
        phoneVerified: true,
        telegramUserId: true,
        createdAt: true,
      },
    });

    return user;
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
}
