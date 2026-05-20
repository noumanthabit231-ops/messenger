import { create } from 'zustand';
// import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { User } from './authStore';

export type MessageType = 'text' | 'voice' | 'file' | 'image';

export interface Message {
  id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  message_type: MessageType;
  file_url?: string;
  is_read: boolean;
  created_at: string;
}

export interface ChatState {
  messages: Message[];
  activeChat: User | null;
  setActiveChat: (user: User) => void;
  sendMessage: (content: string, type?: MessageType, fileUrl?: string) => void;
  loadMessages: (userId: string, otherUserId: string) => void;
}

// Mock Data
const MOCK_MESSAGES: Message[] = [
  { id: '1', sender_id: 'mock-2', receiver_id: '123e4567-e89b-12d3-a456-426614174000', content: 'Привет! Как дела?', message_type: 'text', is_read: true, created_at: new Date(Date.now() - 3600000).toISOString() },
  { id: '2', sender_id: '123e4567-e89b-12d3-a456-426614174000', receiver_id: 'mock-2', content: 'Отлично! Работаю над новым проектом.', message_type: 'text', is_read: true, created_at: new Date(Date.now() - 3500000).toISOString() },
  { id: '3', sender_id: 'mock-2', receiver_id: '123e4567-e89b-12d3-a456-426614174000', content: 'Круто! Покажешь?', message_type: 'text', is_read: true, created_at: new Date(Date.now() - 3400000).toISOString() },
];

export const useChatStore = create<ChatState>((set, get) => ({
  messages: [],
  activeChat: null,
  setActiveChat: (user) => {
    set({ activeChat: user });
  },
  sendMessage: (content, type = 'text', fileUrl) => {
    const newMessage: Message = {
      id: Math.random().toString(36).substring(7),
      sender_id: '123e4567-e89b-12d3-a456-426614174000', // Current user mock id
      receiver_id: get().activeChat?.id || '',
      content,
      message_type: type,
      file_url: fileUrl,
      is_read: false,
      created_at: new Date().toISOString()
    };
    
    set((state) => ({ messages: [...state.messages, newMessage] }));
  },
  loadMessages: (_userId, _otherUserId) => {
    // In real app, fetch from Supabase. Here we just set mock messages if demo
    set({ messages: MOCK_MESSAGES });
  }
}));
