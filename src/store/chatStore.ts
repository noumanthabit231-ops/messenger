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
  status?: 'sending' | 'sent' | 'read';
}

interface ChatState {
  messages: Message[];
  activeChat: any | null;
  isLoading: boolean;
  setActiveChat: (chat: any | null) => void;
  loadMessages: (userId: string, contactId: string) => Promise<void>;
  sendMessage: (senderId: string, receiverId: string, content: string, type?: string, fileUrl?: string) => Promise<void>;
  addMessage: (msg: Message) => void;
  updateMessageStatus: (messageId: string, isRead: boolean) => void;
}

export const useChatStore = create<ChatState>((set, get) => ({
  messages: [],
  activeChat: null,
  isLoading: false,

  setActiveChat: (chat) => set({ activeChat: chat, messages: [] }),

  addMessage: (msg) =>
    set((state) => ({
      messages: state.messages.find((m) => m.id === msg.id) ? state.messages : [...state.messages, msg],
    })),

  updateMessageStatus: (messageId, isRead) =>
    set((state) => ({
      messages: state.messages.map((msg) =>
        msg.id === messageId ? { ...msg, is_read: isRead, status: isRead ? 'read' : msg.status } : msg
      ),
    })),

  loadMessages: async (userId, contactId) => {
    set({ isLoading: true });
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .or(`and(sender_id.eq.${userId},receiver_id.eq.${contactId}),and(sender_id.eq.${contactId},receiver_id.eq.${userId})`)
      .order('created_at', { ascending: true });

    if (!error && data) {
      const withStatus = data.map((msg) => ({
        ...msg,
        status: msg.is_read ? 'read' : 'sent',
      }));
      set({ messages: withStatus, isLoading: false });
    } else {
      set({ isLoading: false });
    }
  },

  sendMessage: async (senderId, receiverId, content, type = 'text', fileUrl) => {
    const tempId = Date.now().toString();
    const tempMessage: Message = {
      id: tempId,
      sender_id: senderId,
      receiver_id: receiverId,
      content,
      message_type: type as any,
      file_url: fileUrl,
      is_read: false,
      created_at: new Date().toISOString(),
      status: 'sending',
    };
    set((state) => ({ messages: [...state.messages, tempMessage] }));

    const { data, error } = await supabase
      .from('messages')
      .insert([{ sender_id: senderId, receiver_id: receiverId, content, message_type: type, file_url: fileUrl }])
      .select()
      .single();

    if (!error && data) {
      set((state) => ({
        messages: state.messages.map((msg) =>
          msg.id === tempId ? { ...data, status: 'sent' } : msg
        ),
      }));
    } else {
      // Удалить временное сообщение при ошибке
      set((state) => ({ messages: state.messages.filter((m) => m.id !== tempId) }));
      console.error('Ошибка отправки:', error);
    }
  },
}));
