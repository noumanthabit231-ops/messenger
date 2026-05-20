import { create } from 'zustand';
import { supabase } from '../lib/supabase';

export interface Message {
  id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  message_type: 'text' | 'voice' | 'file' | 'image';
  file_url?: string;
  is_read: boolean;
  created_at: string;
}

interface ChatState {
  messages: Message[];
  activeChat: any | null;
  isLoading: boolean;
  setActiveChat: (chat: any | null) => void;
  loadMessages: (userId: string, contactId: string) => Promise<void>;
  sendMessage: (senderId: string, receiverId: string, content: string, type?: string, fileUrl?: string) => Promise<void>;
  addMessage: (msg: Message) => void;
}

export const useChatStore = create<ChatState>((set) => ({
  messages: [],
  activeChat: null,
  isLoading: false,

  setActiveChat: (chat) => set({ activeChat: chat, messages: [] }),

  addMessage: (msg) => set((state) => ({ 
    // Защита от дубликатов при обновлениях
    messages: state.messages.find(m => m.id === msg.id) ? state.messages : [...state.messages, msg] 
  })),

  loadMessages: async (userId, contactId) => {
    set({ isLoading: true });
    // Загружаем только сообщения между этими двумя пользователями
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .or(`and(sender_id.eq.${userId},receiver_id.eq.${contactId}),and(sender_id.eq.${contactId},receiver_id.eq.${userId})`)
      .order('created_at', { ascending: true });

    if (!error && data) {
      set({ messages: data, isLoading: false });
    } else {
      set({ isLoading: false });
    }
  },

  sendMessage: async (senderId, receiverId, content, type = 'text', fileUrl) => {
    const { data, error } = await supabase
      .from('messages')
      .insert([{ 
        sender_id: senderId, 
        receiver_id: receiverId, 
        content, 
        message_type: type, 
        file_url: fileUrl 
      }])
      .select()
      .single();

    if (!error && data) {
      // Добавляем отправленное сообщение в интерфейс мгновенно
      set((state) => ({ messages: [...state.messages, data] }));
    }
  }
}));
