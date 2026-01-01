import { io, Socket } from 'socket.io-client';
import type { Message } from '../types';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:3000';

class WebSocketService {
  private socket: Socket | null = null;
  private messageHandlers: ((message: Message) => void)[] = [];

  connect(token: string) {
    if (this.socket?.connected) {
      return;
    }

    this.socket = io(SOCKET_URL, {
      auth: { token },
    });

    this.socket.on('connect', () => {
      console.log('WebSocket connected');
    });

    this.socket.on('disconnect', () => {
      console.log('WebSocket disconnected');
    });

    this.socket.on('new_message', (message: Message) => {
      this.messageHandlers.forEach(handler => handler(message));
    });

    this.socket.on('error', (error: any) => {
      console.error('WebSocket error:', error);
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  sendMessage(chatId: string, type: string, content?: string, filePath?: string, fileName?: string, fileSize?: number, mimeType?: string) {
    if (!this.socket) {
      throw new Error('Socket not connected');
    }

    this.socket.emit('send_message', {
      chatId,
      type,
      content,
      filePath,
      fileName,
      fileSize,
      mimeType,
    });
  }

  joinChat(chatId: string) {
    if (!this.socket) {
      return;
    }
    this.socket.emit('join_chat', { chatId });
  }

  leaveChat(chatId: string) {
    if (!this.socket) {
      return;
    }
    this.socket.emit('leave_chat', { chatId });
  }

  onMessage(handler: (message: Message) => void) {
    this.messageHandlers.push(handler);
  }

  offMessage(handler: (message: Message) => void) {
    this.messageHandlers = this.messageHandlers.filter(h => h !== handler);
  }
}

export const websocketService = new WebSocketService();
