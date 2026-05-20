import { create } from 'zustand';
import { supabase } from '../lib/supabase';

export interface User {
  id: string;
  username: string;
  full_name: string | null;
  avatar_url: string | null;
  is_online: boolean;
  last_seen: string;
  created_at?: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<boolean>;
  register: (username: string, fullName: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  updateProfile: (updates: { username: string; full_name: string; avatar_url: string }) => Promise<boolean>;
  checkAuth: () => Promise<void>;
}

const generateSafeEmail = (username: string) => {
  const safeString = btoa(encodeURIComponent(username.trim().toLowerCase())).replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
  return `${safeString}@risala.app`;
};

export const useAuthStore = create<AuthState>((set, get) => ({
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

  login: async (username: string, password: string) => {
    set({ isLoading: true });
    const dummyEmail = generateSafeEmail(username);
    try {
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: dummyEmail,
        password: password,
      });
      if (authError) throw authError;
      if (authData.user) {
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', authData.user.id)
          .single();
        if (profileError) throw profileError;
        await supabase
          .from('profiles')
          .update({ is_online: true, last_seen: new Date().toISOString() })
          .eq('id', profile.id);
        set({ user: { ...profile, is_online: true, last_seen: new Date().toISOString() }, isAuthenticated: true, isLoading: false });
        return true;
      }
      return false;
    } catch (error: any) {
      console.error('Ошибка входа:', error.message);
      alert('Неверный логин или пароль');
      set({ isLoading: false });
      return false;
    }
  },

  register: async (username: string, fullName: string, password: string) => {
    set({ isLoading: true });
    const cleanUsername = username.trim().toLowerCase();
    const dummyEmail = generateSafeEmail(username);
    try {
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email: dummyEmail,
        password: password,
        options: {
          data: {
            username: cleanUsername,
            full_name: fullName.trim(),
            avatar_url: `https://api.dicebear.com/7.x/bottts/svg?seed=${cleanUsername}`
          }
        }
      });
      if (signUpError) throw signUpError;
      if (signUpData.user) {
        await new Promise(resolve => setTimeout(resolve, 1500));
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', signUpData.user.id)
          .single();
        if (profileError) throw profileError;
        await supabase
          .from('profiles')
          .update({ is_online: true, last_seen: new Date().toISOString() })
          .eq('id', profile.id);
        set({ user: { ...profile, is_online: true, last_seen: new Date().toISOString() }, isAuthenticated: true, isLoading: false });
        return true;
      }
      return false;
    } catch (error: any) {
      console.error('Ошибка регистрации:', error.message);
      alert('Ошибка при регистрации: ' + error.message);
      set({ isLoading: false });
      return false;
    }
  },

  updateProfile: async (updates: { username: string; full_name: string; avatar_url: string }) => {
    const currentUser = get().user;
    if (!currentUser?.id) return false;
    set({ isLoading: true });
    try {
      const { data, error } = await supabase
        .from('profiles')
        .update({
          username: updates.username.trim().toLowerCase(),
          full_name: updates.full_name.trim(),
          avatar_url: updates.avatar_url.trim()
        })
        .eq('id', currentUser.id)
        .select()
        .single();
      if (error) throw error;
      if (data) {
        set({ user: data, isLoading: false });
        return true;
      }
      return false;
    } catch (error: any) {
      console.error('Ошибка обновления профиля:', error.message);
      alert('Ошибка: Возможно, этот логин уже занят другим пользователем.');
      set({ isLoading: false });
      return false;
    }
  },

  logout: async () => {
    const currentUser = get().user;
    if (currentUser?.id) {
      await supabase
        .from('profiles')
        .update({ is_online: false, last_seen: new Date().toISOString() })
        .eq('id', currentUser.id);
    }
    await supabase.auth.signOut();
    set({ user: null, isAuthenticated: false });
  },
}));
