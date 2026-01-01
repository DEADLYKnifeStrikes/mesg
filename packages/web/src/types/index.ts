export interface User {
  id: string;
  email: string;
  phone: string;
  phoneVerified: boolean;
  telegramUserId?: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface Contact {
  id: string;
  email: string;
  phone: string;
  phoneVerified: boolean;
}

export interface Chat {
  id: string;
  otherUser: User;
  lastMessage?: Message;
  updatedAt: string;
}

export interface Message {
  id: string;
  chatId: string;
  senderId: string;
  type: 'text' | 'voice' | 'file';
  content?: string;
  filePath?: string;
  fileName?: string;
  fileSize?: number;
  mimeType?: string;
  createdAt: string;
  sender: {
    id: string;
    email: string;
    phone: string;
  };
}

export interface MessagesResponse {
  messages: Message[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}
