import { create } from 'zustand';
import { supabase } from '../lib/supabase';

let audio: HTMLAudioElement | null = null;
const playNotificationSound = () => {
  try {
    if (!audio) {
      audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2354/2354-preview.mp3');
      audio.volume = 0.5;
      audio.load();
    }
    const playPromise = audio.play();
    if (playPromise !== undefined) playPromise.catch(() => {});
  } catch (e) {}
};

interface BadgeState {
  unreadMessages: number;
  pendingRequests: number;
  initBadges: (userId: string) => void;
  refreshBadges: (userId: string) => Promise<void>;
  cleanup: () => void;
}

let activeChannel: any = null;

export const useBadgeStore = create<BadgeState>((set) => ({
  unreadMessages: 0,
  pendingRequests: 0,

  refreshBadges: async (userId: string) => {
    const { count: msgCount } = await supabase
      .from('messages')
      .select('*', { count: 'exact', head: true })
      .eq('receiver_id', userId)
      .eq('is_read', false);
    const { count: reqCount } = await supabase
      .from('friends')
      .select('*', { count: 'exact', head: true })
      .eq('friend_id', userId)
      .eq('status', 'pending');
    set({ unreadMessages: msgCount || 0, pendingRequests: reqCount || 0 });
  },

  initBadges: async (userId: string) => {
    const { refreshBadges } = useBadgeStore.getState();
    await refreshBadges(userId);

    if (activeChannel) supabase.removeChannel(activeChannel);

    activeChannel = supabase.channel('global_badges')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'messages', filter: `receiver_id=eq.${userId}` }, (payload) => {
        refreshBadges(userId);
        if (payload.eventType === 'INSERT') playNotificationSound();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'friends', filter: `friend_id=eq.${userId}` }, () => {
        refreshBadges(userId);
        if (payload.eventType === 'INSERT') playNotificationSound();
      })
      .subscribe();
  },

  cleanup: () => {
    if (activeChannel) supabase.removeChannel(activeChannel);
  },
}));
