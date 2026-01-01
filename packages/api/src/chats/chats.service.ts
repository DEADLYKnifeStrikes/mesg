import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ChatsService {
  constructor(private prisma: PrismaService) {}

  async getOrCreateChat(user1Id: string, user2Id: string) {
    // Ensure consistent ordering: smaller ID is always user1
    const [userId1, userId2] = [user1Id, user2Id].sort();

    // Try to find existing chat
    let chat = await this.prisma.chat.findUnique({
      where: {
        user1Id_user2Id: {
          user1Id: userId1,
          user2Id: userId2,
        },
      },
      include: {
        user1: {
          select: {
            id: true,
            email: true,
            phone: true,
            phoneVerified: true,
          },
        },
        user2: {
          select: {
            id: true,
            email: true,
            phone: true,
            phoneVerified: true,
          },
        },
      },
    });

    // Create if doesn't exist
    if (!chat) {
      chat = await this.prisma.chat.create({
        data: {
          user1Id: userId1,
          user2Id: userId2,
        },
        include: {
          user1: {
            select: {
              id: true,
              email: true,
              phone: true,
              phoneVerified: true,
            },
          },
          user2: {
            select: {
              id: true,
              email: true,
              phone: true,
              phoneVerified: true,
            },
          },
        },
      });
    }

    return chat;
  }

  async getUserChats(userId: string) {
    const chats = await this.prisma.chat.findMany({
      where: {
        OR: [
          { user1Id: userId },
          { user2Id: userId },
        ],
      },
      include: {
        user1: {
          select: {
            id: true,
            email: true,
            phone: true,
            phoneVerified: true,
          },
        },
        user2: {
          select: {
            id: true,
            email: true,
            phone: true,
            phoneVerified: true,
          },
        },
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
      orderBy: { updatedAt: 'desc' },
    });

    // Map to include the other user as 'otherUser'
    return chats.map(chat => {
      const otherUser = chat.user1Id === userId ? chat.user2 : chat.user1;
      const lastMessage = chat.messages[0] || null;
      
      return {
        id: chat.id,
        otherUser,
        lastMessage,
        updatedAt: chat.updatedAt,
      };
    });
  }

  async getChatById(chatId: string, userId: string) {
    const chat = await this.prisma.chat.findUnique({
      where: { id: chatId },
      include: {
        user1: {
          select: {
            id: true,
            email: true,
            phone: true,
            phoneVerified: true,
          },
        },
        user2: {
          select: {
            id: true,
            email: true,
            phone: true,
            phoneVerified: true,
          },
        },
      },
    });

    if (!chat) {
      throw new Error('Chat not found');
    }

    // Verify user is part of the chat
    if (chat.user1Id !== userId && chat.user2Id !== userId) {
      throw new Error('Unauthorized');
    }

    return chat;
  }
}
