import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { randomBytes } from 'crypto';

@Injectable()
export class VerificationService {
  constructor(private prisma: PrismaService) {}

  async generateVerificationLink(userId: string) {
    // Generate a unique code
    const code = randomBytes(16).toString('hex');
    
    // Set expiration to 1 hour from now
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 1);

    // Store verification code
    await this.prisma.verificationCode.create({
      data: {
        userId,
        code,
        expiresAt,
      },
    });

    // Generate Telegram deep link
    const botUsername = process.env.TELEGRAM_BOT_USERNAME || 'your_bot';
    const deepLink = `https://t.me/${botUsername}?start=${code}`;

    return { deepLink, code };
  }

  async verifyCode(code: string, telegramUserId: string) {
    // Find verification code
    const verificationCode = await this.prisma.verificationCode.findUnique({
      where: { code },
      include: { user: true },
    });

    if (!verificationCode) {
      throw new Error('Invalid verification code');
    }

    if (verificationCode.used) {
      throw new Error('Verification code already used');
    }

    if (verificationCode.expiresAt < new Date()) {
      throw new Error('Verification code expired');
    }

    // Mark code as used and update user
    await this.prisma.$transaction([
      this.prisma.verificationCode.update({
        where: { id: verificationCode.id },
        data: { used: true },
      }),
      this.prisma.user.update({
        where: { id: verificationCode.userId },
        data: {
          phoneVerified: true,
          telegramUserId,
        },
      }),
    ]);

    return verificationCode.user;
  }
}
