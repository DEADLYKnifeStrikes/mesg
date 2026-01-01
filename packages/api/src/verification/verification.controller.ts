import { Controller, Post, Body, UseGuards, Request, Get } from '@nestjs/common';
import { VerificationService } from './verification.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('verification')
export class VerificationController {
  constructor(private verificationService: VerificationService) {}

  @Post('generate')
  @UseGuards(JwtAuthGuard)
  async generateLink(@Request() req) {
    return this.verificationService.generateVerificationLink(req.user.id);
  }

  @Post('webhook')
  async handleTelegramWebhook(@Body() body: any) {
    // This endpoint receives Telegram bot webhook
    // Expected format: { message: { text: '/start <code>', from: { id: telegramUserId } } }
    
    if (!body.message || !body.message.text) {
      return { ok: true };
    }

    const text = body.message.text;
    const telegramUserId = body.message.from?.id?.toString();

    if (!telegramUserId) {
      return { ok: true };
    }

    // Check if message starts with /start
    if (text.startsWith('/start ')) {
      const code = text.substring(7).trim();
      
      try {
        await this.verificationService.verifyCode(code, telegramUserId);
        // You can send a confirmation message back to the user here
        return { ok: true };
      } catch (error) {
        console.error('Verification error:', error.message);
        return { ok: true };
      }
    }

    return { ok: true };
  }
}
