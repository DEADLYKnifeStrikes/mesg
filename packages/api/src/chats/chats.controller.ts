import { Controller, Get, Post, Body, Param, UseGuards, Request } from '@nestjs/common';
import { ChatsService } from './chats.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('chats')
@UseGuards(JwtAuthGuard)
export class ChatsController {
  constructor(private chatsService: ChatsService) {}

  @Post()
  async createChat(@Request() req, @Body('otherUserId') otherUserId: string) {
    return this.chatsService.getOrCreateChat(req.user.id, otherUserId);
  }

  @Get()
  async getUserChats(@Request() req) {
    return this.chatsService.getUserChats(req.user.id);
  }

  @Get(':id')
  async getChat(@Request() req, @Param('id') id: string) {
    return this.chatsService.getChatById(id, req.user.id);
  }
}
