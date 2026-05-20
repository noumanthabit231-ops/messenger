import { create } from 'zustand';
import { supabase } from '../lib/supabase';

export interface User {
  id: string;
  username: string;
  full_name: string | null;
  avatar_url: string | null;
  is_online: boolean;
  created_at?: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (username: string) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => void;
}

// Специальная функция для создания безопасного email из любого логина (включая русский язык)
const generateSafeEmail = (username: string) => {
  // Конвертируем строку в безопасный латинский формат, убирая все спецсимволы
  const safeString = btoa(encodeURIComponent(username)).replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
  return `${safeString}@risala.app`;
};

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,

  checkAuth: async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();

      if (profile) {
        set({ user: profile, isAuthenticated: true });
      }
    }
  },

  login: async (username: string) => {
    set({ isLoading: true });
    const cleanUsername = username.trim().toLowerCase();
    
    // Генерируем email, который точно понравится Supabase
    const dummyEmail = generateSafeEmail(cleanUsername);
    const dummyPassword = `${generateSafeEmail(cleanUsername)}-Risala-2026!`;

    try {
      let { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: dummyEmail,
        password: dummyPassword,
      });

      if (authError && authError.message.includes('Invalid login credentials')) {
        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
          email: dummyEmail,
          password: dummyPassword,
          options: {
            data: {
              username: cleanUsername,
              full_name: username.trim(),
              avatar_url: `https://api.dicebear.com/7.x/bottts/svg?seed=${cleanUsername}`
            }
          }
        });
        
        if (signUpError) throw signUpError;
        authData = signUpData;
        
        await new Promise(resolve => setTimeout(resolve, 1000));
      } else if (authError) {
        throw authError;
      }

      if (authData.user) {
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', authData.user.id)
          .single();

        if (profileError) throw profileError;

        await supabase
          .from('profiles')
          .update({ is_online: true })
          .eq('id', profile.id);

        const updatedUser = { ...profile, is_online: true };
        set({ user: updatedUser, isAuthenticated: true, isLoading: false });
      }

    } catch (error: any) {
      console.error('Ошибка входа/регистрации:', error.message);
      alert('Ошибка: ' + error.message);
      set({ isLoading: false });
    }
  },

  logout: async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      await supabase
        .from('profiles')
        .update({ is_online: false })
        .eq('id', session.user.id);
    }
    await supabase.auth.signOut();
    set({ user: null, isAuthenticated: false });
  },
}));
