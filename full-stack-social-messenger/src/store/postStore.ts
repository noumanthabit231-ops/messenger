import { create } from 'zustand';


export interface Comment {
  id: string;
  user_id: string;
  content: string;
  created_at: string;
}

export interface Post {
  id: string;
  user_id: string;
  content: string;
  image_url?: string;
  likes: string[]; // array of user_ids
  comments: Comment[];
  created_at: string;
}

interface PostState {
  posts: Post[];
  addPost: (content: string, image_url?: string) => void;
  likePost: (postId: string, userId: string) => void;
  addComment: (postId: string, userId: string, content: string) => void;
}

const MOCK_POSTS: Post[] = [
  {
    id: 'p1',
    user_id: 'mock-1',
    content: 'Всем привет! Наконец-то закончил новый проект. Посмотрите как круто получилось! 🚀',
    image_url: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800&q=80',
    likes: ['mock-2', 'mock-3'],
    comments: [
      { id: 'c1', user_id: 'mock-2', content: 'Выглядит отлично!', created_at: new Date().toISOString() }
    ],
    created_at: new Date(Date.now() - 86400000).toISOString()
  },
  {
    id: 'p2',
    user_id: 'mock-3',
    content: 'Сегодня отличный день для продуктивной работы. Пьем кофе и пишем код ☕💻',
    likes: ['mock-1'],
    comments: [],
    created_at: new Date(Date.now() - 43200000).toISOString()
  }
];

export const usePostStore = create<PostState>((set) => ({
  posts: MOCK_POSTS,
  addPost: (content, image_url) => set((state) => {
    const newPost: Post = {
      id: Math.random().toString(36).substring(7),
      user_id: '123e4567-e89b-12d3-a456-426614174000', // Mock logged in user
      content,
      image_url,
      likes: [],
      comments: [],
      created_at: new Date().toISOString()
    };
    return { posts: [newPost, ...state.posts] };
  }),
  likePost: (postId, userId) => set((state) => ({
    posts: state.posts.map(post => {
      if (post.id === postId) {
        const isLiked = post.likes.includes(userId);
        return {
          ...post,
          likes: isLiked ? post.likes.filter(id => id !== userId) : [...post.likes, userId]
        };
      }
      return post;
    })
  })),
  addComment: (postId, userId, content) => set((state) => ({
    posts: state.posts.map(post => {
      if (post.id === postId) {
        return {
          ...post,
          comments: [...post.comments, {
            id: Math.random().toString(36).substring(7),
            user_id: userId,
            content,
            created_at: new Date().toISOString()
          }]
        };
      }
      return post;
    })
  }))
}));
