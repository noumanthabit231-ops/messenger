import { create } from 'zustand';
import { supabase } from '../lib/supabase';

export interface Post {
  id: string;
  user_id: string;
  content: string;
  image_url?: string;
  created_at: string;
  likes: string[];
  comments: any[];
}

interface PostState {
  posts: Post[];
  isLoading: boolean;
  fetchPosts: () => Promise<void>;
  addPost: (userId: string, content: string, imageUrl?: string) => Promise<void>;
  deletePost: (postId: string) => Promise<void>;
  likePost: (postId: string, userId: string) => Promise<void>;
  unlikePost: (postId: string, userId: string) => Promise<void>;
}

export const usePostStore = create<PostState>((set, get) => ({
  posts: [],
  isLoading: false,

  fetchPosts: async () => {
    set({ isLoading: true });
    const { data: postsData, error } = await supabase.from('posts').select('*').order('created_at', { ascending: false });
    if (error) { set({ isLoading: false }); return; }
    const formattedPosts = await Promise.all(postsData.map(async (post) => {
      const { data: likes } = await supabase.from('post_likes').select('user_id').eq('post_id', post.id);
      const { data: comments } = await supabase.from('post_comments').select('*').eq('post_id', post.id);
      return { ...post, likes: likes ? likes.map(l => l.user_id) : [], comments: comments || [] };
    }));
    set({ posts: formattedPosts, isLoading: false });
  },

  addPost: async (userId, content, imageUrl) => {
    await supabase.from('posts').insert([{ user_id: userId, content, image_url: imageUrl }]);
    get().fetchPosts();
  },

  deletePost: async (postId) => {
    await supabase.from('posts').delete().eq('id', postId);
    set(state => ({ posts: state.posts.filter(p => p.id !== postId) }));
  },

  likePost: async (postId, userId) => {
    await supabase.from('post_likes').insert({ post_id: postId, user_id: userId });
    set(state => ({ posts: state.posts.map(post => post.id === postId ? { ...post, likes: [...post.likes, userId] } : post) }));
  },

  unlikePost: async (postId, userId) => {
    await supabase.from('post_likes').delete().eq('post_id', postId).eq('user_id', userId);
    set(state => ({ posts: state.posts.map(post => post.id === postId ? { ...post, likes: post.likes.filter(id => id !== userId) } : post) }));
  },
}));
