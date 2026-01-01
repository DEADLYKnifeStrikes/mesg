import { Controller, Get, Post, Body, Param, Query, UseGuards, Request } from '@nestjs/common';
import { MessagesService } from './messages.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('messages')
@UseGuards(JwtAuthGuard)
export class MessagesController {
  constructor(private messagesService: MessagesService) {}

  @Post()
  async createMessage(
    @Request() req,
    @Body('chatId') chatId: string,
    @Body('type') type: string,
    @Body('content') content?: string,
    @Body('filePath') filePath?: string,
    @Body('fileName') fileName?: string,
    @Body('fileSize') fileSize?: number,
    @Body('mimeType') mimeType?: string,
  ) {
    return this.messagesService.createMessage(
      chatId,
      req.user.id,
      type,
      content,
      filePath,
      fileName,
      fileSize,
      mimeType,
    );
  }

  @Get('chat/:chatId')
  async getMessages(
    @Request() req,
    @Param('chatId') chatId: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.messagesService.getMessages(
      chatId,
      req.user.id,
      page ? parseInt(page) : 1,
      limit ? parseInt(limit) : 50,
    );
  }
}
