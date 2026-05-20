import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';

let audio: HTMLAudioElement | null = null;
const playNotificationSound = () => {
  try {
    if (!audio) {
      audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2354/2354-preview.mp3');
      audio.volume = 0.5;
      audio.load();
    }
    audio.play().catch(() => {});
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
    const { count: msgCount } = await supabase.from('messages').select('*', { count: 'exact', head: true }).eq('receiver_id', userId).eq('is_read', false);
    const { count: reqCount } = await supabase.from('friends').select('*', { count: 'exact', head: true }).eq('friend_id', userId).eq('status', 'pending');
    set({ unreadMessages: msgCount || 0, pendingRequests: reqCount || 0 });
  },

  initBadges: async (userId: string) => {
    const { refreshBadges } = useBadgeStore.getState();
    await refreshBadges(userId);
    if (activeChannel) supabase.removeChannel(activeChannel);
    activeChannel = supabase.channel('global_badges')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages', filter: `receiver_id=eq.${userId}` }, async (payload) => {
        await refreshBadges(userId);
        playNotificationSound();
        const { data: sender } = await supabase.from('profiles').select('full_name, username').eq('id', payload.new.sender_id).single();
        toast.success(`📨 ${sender?.full_name || sender?.username}: ${payload.new.content.substring(0, 50)}`);
      })
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'friends', filter: `friend_id=eq.${userId}` }, async (payload) => {
        await refreshBadges(userId);
        playNotificationSound();
        const { data: requester } = await supabase.from('profiles').select('full_name, username').eq('id', payload.new.user_id).single();
        toast.info(`👥 Заявка в друзья от ${requester?.full_name || requester?.username}`);
      })
      .subscribe();
  },

  cleanup: () => { if (activeChannel) supabase.removeChannel(activeChannel); },
}));
