import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class MessagesService {
  constructor(private prisma: PrismaService) {}

  async createMessage(
    chatId: string,
    senderId: string,
    type: string,
    content?: string,
    filePath?: string,
    fileName?: string,
    fileSize?: number,
    mimeType?: string,
  ) {
    // Verify sender is part of the chat
    const chat = await this.prisma.chat.findUnique({
      where: { id: chatId },
    });

    if (!chat) {
      throw new Error('Chat not found');
    }

    if (chat.user1Id !== senderId && chat.user2Id !== senderId) {
      throw new Error('Unauthorized');
    }

    // Create message
    const message = await this.prisma.message.create({
      data: {
        chatId,
        senderId,
        type,
        content,
        filePath,
        fileName,
        fileSize,
        mimeType,
      },
      include: {
        sender: {
          select: {
            id: true,
            email: true,
            phone: true,
          },
        },
      },
    });

    // Update chat updatedAt
    await this.prisma.chat.update({
      where: { id: chatId },
      data: { updatedAt: new Date() },
    });

    return message;
  }

  async getMessages(chatId: string, userId: string, page: number = 1, limit: number = 50) {
    // Verify user is part of the chat
    const chat = await this.prisma.chat.findUnique({
      where: { id: chatId },
    });

    if (!chat) {
      throw new Error('Chat not found');
    }

    if (chat.user1Id !== userId && chat.user2Id !== userId) {
      throw new Error('Unauthorized');
    }

    // Get messages with pagination
    const skip = (page - 1) * limit;
    const messages = await this.prisma.message.findMany({
      where: { chatId },
      include: {
        sender: {
          select: {
            id: true,
            email: true,
            phone: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    });

    const total = await this.prisma.message.count({
      where: { chatId },
    });

    return {
      messages: messages.reverse(), // Reverse to show oldest first
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    };
  }
}
