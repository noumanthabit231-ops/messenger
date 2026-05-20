import { create } from 'zustand';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

export type User = {
  id: string;
  username: string;
  full_name: string | null;
  avatar_url: string | null;
  is_online: boolean;
};

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (username: string) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

// Mock User for Demo
const MOCK_USER: User = {
  id: '123e4567-e89b-12d3-a456-426614174000',
  username: 'demo_user',
  full_name: 'Demo User',
  avatar_url: 'https://i.pravatar.cc/150?u=demo',
  is_online: true,
};

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,

  login: async (username) => {
    set({ isLoading: true });
    try {
      if (isSupabaseConfigured) {
        // Mocking real login for simplicity in this demo, normally you'd use email/password or OAuth
        const { data, error } = await supabase.from('profiles').select('*').eq('username', username).single();
        if (error) throw error;
        set({ user: data, isAuthenticated: true });
      } else {
        // Mock Login
        setTimeout(() => {
          set({ 
            user: { ...MOCK_USER, username, full_name: username, avatar_url: `https://i.pravatar.cc/150?u=${username}` }, 
            isAuthenticated: true, 
            isLoading: false 
          });
        }, 500);
      }
    } catch (error) {
      console.error('Login failed', error);
      set({ isLoading: false });
    }
  },

  logout: async () => {
    if (isSupabaseConfigured) {
      await supabase.auth.signOut();
    }
    set({ user: null, isAuthenticated: false });
  },

  checkAuth: async () => {
    if (isSupabaseConfigured) {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        const { data } = await supabase.from('profiles').select('*').eq('id', session.user.id).single();
        set({ user: data, isAuthenticated: true, isLoading: false });
      } else {
        set({ user: null, isAuthenticated: false, isLoading: false });
      }
    } else {
      // For mock, auto-login or stay logged out. Let's start logged out.
      set({ user: null, isAuthenticated: false, isLoading: false });
    }
  }
}));
