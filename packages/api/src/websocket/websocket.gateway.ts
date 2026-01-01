import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { MessagesService } from '../messages/messages.service';

@WebSocketGateway({
  cors: {
    origin: process.env.FRONTEND_URL || '*',
    credentials: true,
  },
})
export class WebsocketGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private userSockets = new Map<string, string>(); // userId -> socketId

  constructor(
    private jwtService: JwtService,
    private messagesService: MessagesService,
  ) {}

  async handleConnection(client: Socket) {
    try {
      // Extract token from handshake
      const token = client.handshake.auth.token || client.handshake.headers.authorization?.split(' ')[1];
      
      if (!token) {
        client.disconnect();
        return;
      }

      // Verify token
      const payload = this.jwtService.verify(token);
      const userId = payload.sub;

      // Store user socket mapping
      this.userSockets.set(userId, client.id);
      client.data.userId = userId;

      console.log(`User ${userId} connected`);
    } catch (error) {
      console.error('WebSocket connection error:', error);
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    const userId = client.data.userId;
    if (userId) {
      this.userSockets.delete(userId);
      console.log(`User ${userId} disconnected`);
    }
  }

  @SubscribeMessage('send_message')
  async handleMessage(
    @MessageBody() data: any,
    @ConnectedSocket() client: Socket,
  ) {
    try {
      const userId = client.data.userId;
      if (!userId) {
        return;
      }

      // Create message
      const message = await this.messagesService.createMessage(
        data.chatId,
        userId,
        data.type,
        data.content,
        data.filePath,
        data.fileName,
        data.fileSize,
        data.mimeType,
      );

      // Emit to both users in the chat
      // Send to sender
      client.emit('new_message', message);

      // Send to recipient
      const chat = await this.messagesService['prisma'].chat.findUnique({
        where: { id: data.chatId },
      });

      if (chat) {
        const recipientId = chat.user1Id === userId ? chat.user2Id : chat.user1Id;
        const recipientSocketId = this.userSockets.get(recipientId);
        
        if (recipientSocketId) {
          this.server.to(recipientSocketId).emit('new_message', message);
        }
      }

      return message;
    } catch (error) {
      console.error('Error sending message:', error);
      client.emit('error', { message: error.message });
    }
  }

  @SubscribeMessage('join_chat')
  async handleJoinChat(
    @MessageBody() data: { chatId: string },
    @ConnectedSocket() client: Socket,
  ) {
    client.join(`chat:${data.chatId}`);
  }

  @SubscribeMessage('leave_chat')
  async handleLeaveChat(
    @MessageBody() data: { chatId: string },
    @ConnectedSocket() client: Socket,
  ) {
    client.leave(`chat:${data.chatId}`);
  }
}
