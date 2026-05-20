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

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,

  checkAuth: async () => {
    // Проверяем сессию через официальный метод Supabase
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      // Загружаем профиль из твоей таблицы
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
    
    // Технические email и пароль для работы встроенного Supabase Auth
    const dummyEmail = `${cleanUsername}@risala.local`;
    const dummyPassword = `${cleanUsername}-Risala-2026!`; // Надежный пароль, чтобы база не ругалась

    try {
      // 1. Пытаемся войти
      let { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: dummyEmail,
        password: dummyPassword,
      });

      // 2. Если такого пользователя нет — регистрируем
      if (authError && authError.message.includes('Invalid login credentials')) {
        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
          email: dummyEmail,
          password: dummyPassword,
          options: {
            data: {
              // Эти данные поймает твой SQL-триггер "handle_new_user"
              username: cleanUsername,
              full_name: username.trim(),
              avatar_url: `https://api.dicebear.com/7.x/bottts/svg?seed=${cleanUsername}`
            }
          }
        });
        
        if (signUpError) throw signUpError;
        authData = signUpData;
        
        // Ждем секунду, чтобы SQL-триггер успел создать запись в public.profiles
        await new Promise(resolve => setTimeout(resolve, 1000));
      } else if (authError) {
        throw authError;
      }

      // 3. Получаем созданный профиль из базы
      if (authData.user) {
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', authData.user.id)
          .single();

        if (profileError) throw profileError;

        // Обновляем статус онлайна
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
