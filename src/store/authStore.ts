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

  checkAuth: () => {
    const storedUser = localStorage.getItem('risala_user');
    if (storedUser) {
      set({ user: JSON.parse(storedUser), isAuthenticated: true });
    }
  },

  login: async (username: string) => {
    set({ isLoading: true });
    const cleanUsername = username.trim().toLowerCase();

    try {
      // 1. Пытаемся найти пользователя в базе данных по username
      const { data: existingUser, error: searchError } = await supabase
        .from('users')
        .select('*')
        .eq('username', cleanUsername)
        .maybeSingle();

      if (searchError) throw searchError;

      if (existingUser) {
        // Если пользователь найден, обновляем его статус на "онлайн"
        await supabase
          .from('users')
          .update({ is_online: true })
          .eq('id', existingUser.id);

        const updatedUser = { ...existingUser, is_online: true };
        localStorage.setItem('risala_user', JSON.stringify(updatedUser));
        set({ user: updatedUser, isAuthenticated: true, isLoading: false });
        return;
      }

      // 2. Если пользователя нет в таблице, регистрируем его (создаем запись)
      const { data: newUser, error: insertError } = await supabase
        .from('users')
        .insert([
          {
            username: cleanUsername,
            full_name: username.trim(), // Используем оригинальное написание для отображаемого имени
            avatar_url: `https://api.dicebear.com/7.x/bottts/svg?seed=${cleanUsername}`,
            is_online: true,
          },
        ])
        .select()
        .single();

      if (insertError) throw insertError;

      localStorage.setItem('risala_user', JSON.stringify(newUser));
      set({ user: newUser, isAuthenticated: true, isLoading: false });
    } catch (error) {
      console.error('Ошибка в процессе аутентификации:', error);
      alert('Не удалось выполнить вход. Проверьте подключение к Supabase или структуру таблицы.');
      set({ isLoading: false });
    }
  },

  logout: async () => {
    const storedUser = localStorage.getItem('risala_user');
    if (storedUser) {
      const parsed = JSON.parse(storedUser);
      // При выходе ставим статус оффлайн в базе
      await supabase
        .from('users')
        .update({ is_online: false })
        .eq('id', parsed.id)
        .catch((err) => console.error(err));
    }
    localStorage.removeItem('risala_user');
    set({ user: null, isAuthenticated: false });
  },
}));
