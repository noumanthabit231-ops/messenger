import { create } from 'zustand';
import { supabase } from '../lib/supabase';

// Звук уведомления (мягкий iOS-подобный "поп")
const playNotificationSound = () => {
  try {
    const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2354/2354-preview.mp3');
    audio.volume = 0.5;
    const playPromise = audio.play();
    if (playPromise !== undefined) {
      playPromise.catch(() => { /* Игнорируем блокировку автоплея браузером */ });
    }
  } catch (e) {}
};

interface BadgeState {
  unreadMessages: number;
  pendingRequests: number;
  initBadges: (userId: string) => void;
  cleanup: () => void;
}

let activeChannel: any = null;

export const useBadgeStore = create<BadgeState>((set) => ({
  unreadMessages: 0,
  pendingRequests: 0,
  
  initBadges: async (userId: string) => {
    const fetchCounts = async () => {
      // Считаем непрочитанные сообщения
      const { count: msgCount } = await supabase
        .from('messages')
        .select('*', { count: 'exact', head: true })
        .eq('receiver_id', userId)
        .eq('is_read', false);
        
      // Считаем входящие заявки в друзья
      const { count: reqCount } = await supabase
        .from('friends')
        .select('*', { count: 'exact', head: true })
        .eq('friend_id', userId)
        .eq('status', 'pending');

      set({ unreadMessages: msgCount || 0, pendingRequests: reqCount || 0 });
    };

    await fetchCounts();

    if (activeChannel) supabase.removeChannel(activeChannel);

    // Подписываемся на изменения в реальном времени
    activeChannel = supabase.channel('global_badges')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'messages', filter: `receiver_id=eq.${userId}` }, (payload) => {
         fetchCounts();
         // Если добавилось новое сообщение — играем звук
         if (payload.eventType === 'INSERT') playNotificationSound();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'friends', filter: `friend_id=eq.${userId}` }, () => {
         fetchCounts();
      })
      .subscribe();
  },

  cleanup: () => {
    if (activeChannel) supabase.removeChannel(activeChannel);
  }
}));
