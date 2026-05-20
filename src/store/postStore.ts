import { create } from 'zustand';
import { supabase } from '../lib/supabase';

export interface Post {
  id: string;
  user_id: string;
  content: string;
  image_url?: string;
  created_at: string;
  likes: string[]; // Массив ID пользователей, лайкнувших пост
  comments: any[];
}

interface PostState {
  posts: Post[];
  isLoading: boolean;
  fetchPosts: () => Promise<void>;
  addPost: (userId: string, content: string, imageUrl?: string) => Promise<void>;
  deletePost: (postId: string) => Promise<void>;
}

export const usePostStore = create<PostState>((set, get) => ({
  posts: [],
  isLoading: false,

  fetchPosts: async () => {
    set({ isLoading: true });
    // Получаем посты, сортируем по дате (новые сверху)
    const { data: postsData, error } = await supabase
      .from('posts')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Ошибка загрузки постов:', error);
      set({ isLoading: false });
      return;
    }

    // Для каждого поста получаем лайки (пока упрощенно)
    const formattedPosts = await Promise.all(
      postsData.map(async (post) => {
        const { data: likes } = await supabase.from('post_likes').select('user_id').eq('post_id', post.id);
        const { data: comments } = await supabase.from('post_comments').select('*').eq('post_id', post.id);
        
        return {
          ...post,
          likes: likes ? likes.map(l => l.user_id) : [],
          comments: comments || [],
        };
      })
    );

    set({ posts: formattedPosts, isLoading: false });
  },

  addPost: async (userId: string, content: string, imageUrl?: string) => {
    const { error } = await supabase
      .from('posts')
      .insert([{ user_id: userId, content, image_url: imageUrl }]);

    if (error) {
      console.error('Ошибка при создании поста:', error);
    } else {
      get().fetchPosts(); // Обновляем ленту
    }
  },

  deletePost: async (postId: string) => {
    const { error } = await supabase
      .from('posts')
      .delete()
      .eq('id', postId);

    if (error) {
      console.error('Ошибка удаления поста:', error);
    } else {
      // Убираем пост из локального состояния
      set((state) => ({
        posts: state.posts.filter((p) => p.id !== postId)
      }));
    }
  }
}));
