import React, { useState, useEffect } from 'react';
import { usePostStore } from '../store/postStore';
import { useAuthStore } from '../store/authStore';
import { supabase } from '../lib/supabase';
import { Heart, MessageCircle, Image as ImageIcon, Send, Trash2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ru } from 'date-fns/locale';
import clsx from 'clsx';

export default function FeedPage() {
  const { user } = useAuthStore();
  const { posts, fetchPosts, addPost, deletePost } = usePostStore();
  const [newPostContent, setNewPostContent] = useState('');
  const [realUsers, setRealUsers] = useState<any[]>([]);

  // Загружаем профили и посты при открытии страницы
  useEffect(() => {
    const fetchUsersAndPosts = async () => {
      const { data } = await supabase.from('profiles').select('*'); // Ищем в profiles!
      if (data) setRealUsers(data);
      await fetchPosts();
    };
    fetchUsersAndPosts();
  }, []);

  const getUser = (id: string) => {
    if (id === user?.id) return user;
    return realUsers.find(u => u.id === id) || { username: 'Неизвестный', full_name: 'Пользователь удален' };
  };

  const handleCreatePost = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPostContent.trim() && user) {
      // Имитация случайной картинки для демо (потом можно прикрутить Supabase Storage)
      const hasImage = Math.random() > 0.8;
      const imageUrl = hasImage ? `https://images.unsplash.com/photo-${Math.floor(Math.random()*1000000)}?w=800&q=80` : undefined;
      
      addPost(user.id, newPostContent.trim(), imageUrl);
      setNewPostContent('');
    }
  };

  return (
    <div className="p-4 md:p-6 max-w-2xl mx-auto h-full overflow-y-auto no-scrollbar">
      <div className="mb-6 md:mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">Лента</h1>
        <p className="text-gray-400 text-sm md:text-base">Смотрите, что нового у ваших друзей</p>
      </div>

      <div className="bg-[#2d3748] border border-[#4a5568] rounded-2xl p-4 md:p-6 mb-8 shadow-sm">
        <form onSubmit={handleCreatePost}>
          <textarea
            value={newPostContent}
            onChange={(e) => setNewPostContent(e.target.value)}
            placeholder="Что у вас нового?"
            className="w-full bg-[#1a202c] border border-[#4a5568] rounded-xl p-4 text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none mb-4"
            rows={3}
          />
          <div className="flex justify-between items-center">
            <button type="button" className="p-2 text-gray-400 hover:text-blue-500 hover:bg-[#1a202c] rounded-lg transition-colors">
              <ImageIcon size={20} />
            </button>
            <button
              type="submit"
              disabled={!newPostContent.trim()}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-xl font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
            >
              Опубликовать
            </button>
          </div>
        </form>
      </div>

      <div className="space-y-6 pb-20 md:pb-6">
        {posts.map((post) => {
          const author = getUser(post.user_id);
          const isLiked = post.likes?.includes(user?.id || '');
          const isMyPost = post.user_id === user?.id; // Проверяем, мой ли это пост

          return (
            <div key={post.id} className="bg-[#2d3748] border border-[#4a5568] rounded-2xl p-4 md:p-6 shadow-sm relative">
              
              {/* Кнопка удаления (показывается только автору) */}
              {isMyPost && (
                <button 
                  onClick={() => {
                    if (window.confirm('Точно удалить этот пост?')) deletePost(post.id);
                  }}
                  className="absolute top-4 right-4 p-2 text-gray-500 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                  title="Удалить пост"
                >
                  <Trash2 size={18} />
                </button>
              )}

              <div className="flex items-center space-x-3 mb-4 pr-10">
                <img src={author.avatar_url || `https://api.dicebear.com/7.x/bottts/svg?seed=${author.username}`} alt="" className="w-10 h-10 md:w-12 md:h-12 rounded-full object-cover bg-[#1a202c]" />
                <div>
                  <h3 className="text-white font-medium">{author.full_name || author.username}</h3>
                  <p className="text-gray-400 text-xs md:text-sm">
                    {formatDistanceToNow(new Date(post.created_at), { addSuffix: true, locale: ru })}
                  </p>
                </div>
              </div>

              <p className="text-gray-200 mb-4 whitespace-pre-wrap text-sm md:text-base leading-relaxed">{post.content}</p>

              {post.image_url && (
                <div className="mb-4 rounded-xl overflow-hidden border border-[#4a5568]">
                  <img src={post.image_url} alt="Post attachment" className="w-full h-auto object-cover max-h-96" />
                </div>
              )}

              <div className="flex items-center space-x-6 border-t border-[#4a5568] pt-4">
                <button className={clsx("flex items-center space-x-2 transition-colors", isLiked ? "text-red-500" : "text-gray-400 hover:text-red-500")}>
                  <Heart size={20} className={clsx(isLiked && "fill-current")} />
                  <span>{post.likes?.length || 0}</span>
                </button>
                <button className="flex items-center space-x-2 text-gray-400 hover:text-blue-500 transition-colors">
                  <MessageCircle size={20} />
                  <span>{post.comments?.length || 0}</span>
                </button>
              </div>
            </div>
          );
        })}

        {posts.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            Здесь пока нет постов. Напишите что-нибудь!
          </div>
        )}
      </div>
    </div>
  );
}
