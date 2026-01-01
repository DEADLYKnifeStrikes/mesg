import axios from 'axios';
import type { AuthResponse, User, Contact, Chat, Message, MessagesResponse } from '../types';

const API_URL = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? '/api' : window.location.origin);

const api = axios.create({
  baseURL: API_URL,
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth
export const register = async (email: string, phone: string, password: string): Promise<AuthResponse> => {
  const response = await api.post('/auth/register', { email, phone, password });
  return response.data;
};

export const login = async (email: string, password: string): Promise<AuthResponse> => {
  const response = await api.post('/auth/login', { email, password });
  return response.data;
};

// Users
export const searchUserByPhone = async (phone: string): Promise<User | null> => {
  const response = await api.get(`/users/search?phone=${encodeURIComponent(phone)}`);
  return response.data;
};

export const getCurrentUser = async (): Promise<User> => {
  const response = await api.get('/users/me');
  return response.data;
};

// Verification
export const generateVerificationLink = async (): Promise<{ deepLink: string; code: string }> => {
  const response = await api.post('/verification/generate');
  return response.data;
};

// Contacts
export const addContact = async (contactId: string): Promise<Contact> => {
  const response = await api.post('/contacts', { contactId });
  return response.data;
};

export const getContacts = async (): Promise<Contact[]> => {
  const response = await api.get('/contacts');
  return response.data;
};

export const removeContact = async (contactId: string): Promise<void> => {
  await api.delete(`/contacts/${contactId}`);
};

// Chats
export const createChat = async (otherUserId: string): Promise<Chat> => {
  const response = await api.post('/chats', { otherUserId });
  return response.data;
};

export const getUserChats = async (): Promise<Chat[]> => {
  const response = await api.get('/chats');
  return response.data;
};

export const getChat = async (chatId: string): Promise<Chat> => {
  const response = await api.get(`/chats/${chatId}`);
  return response.data;
};

// Messages
export const getMessages = async (chatId: string, page: number = 1, limit: number = 50): Promise<MessagesResponse> => {
  const response = await api.get(`/messages/chat/${chatId}?page=${page}&limit=${limit}`);
  return response.data;
};

export const sendMessage = async (
  chatId: string,
  type: string,
  content?: string,
  filePath?: string,
  fileName?: string,
  fileSize?: number,
  mimeType?: string,
): Promise<Message> => {
  const response = await api.post('/messages', {
    chatId,
    type,
    content,
    filePath,
    fileName,
    fileSize,
    mimeType,
  });
  return response.data;
};

// Uploads
export const uploadFile = async (file: File): Promise<{ filePath: string; fileName: string; fileSize: number; mimeType: string }> => {
  const formData = new FormData();
  formData.append('file', file);
  
  const response = await api.post('/uploads', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};
