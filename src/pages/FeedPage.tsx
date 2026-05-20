import React, { useState, useEffect } from 'react';
import { usePostStore } from '../store/postStore';
import { useAuthStore } from '../store/authStore';
import { supabase } from '../lib/supabase';
import { Heart, MessageCircle, Image as ImageIcon, Send } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ru } from 'date-fns/locale';
import clsx from 'clsx';

export default function FeedPage() {
  const { user } = useAuthStore();
  const { posts, addPost, likePost, addComment } = usePostStore();
  const [newPostContent, setNewPostContent] = useState('');
  const [commentInput, setCommentInput] = useState<{ [key: string]: string }>({});
  const [activeComments, setActiveComments] = useState<{ [key: string]: boolean }>({});
  
  // Храним реальных пользователей для отображения их аватарок и имен в постах
  const [realUsers, setRealUsers] = useState<any[]>([]);

  useEffect(() => {
    const fetchUsers = async () => {
      const { data } = await supabase.from('users').select('*');
      if (data) setRealUsers(data);
    };
    fetchUsers();
  }, []);

  const getUser = (id: string) => {
    if (id === user?.id) return user;
    return realUsers.find(u => u.id === id) || user;
  };

  const handleCreatePost = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPostContent.trim()) {
      const hasImage = Math.random() > 0.7;
      const imageUrl = hasImage ? `https://images.unsplash.com/photo-${Math.floor(Math.random()*1000000)}?w=800&q=80` : undefined;
      
      addPost(user!.id, newPostContent.trim(), imageUrl);
      setNewPostContent('');
    }
  };

  const handleAddComment = (e: React.FormEvent, postId: string) => {
    e.preventDefault();
    const content = commentInput[postId];
    if (content?.trim()) {
      addComment(postId, user!.id, content.trim());
      setCommentInput({ ...commentInput, [postId]: '' });
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
          const author = getUser(post.author_id);
          const isLiked = post.likes.includes(user?.id || '');

          return (
            <div key={post.id} className="bg-[#2d3748] border border-[#4a5568] rounded-2xl p-4 md:p-6 shadow-sm">
              <div className="flex items-center space-x-3 mb-4">
                <img src={author?.avatar_url || `https://api.dicebear.com/7.x/bottts/svg?seed=${author?.username}`} alt="" className="w-10 h-10 md:w-12 md:h-12 rounded-full object-cover bg-[#1a202c]" />
                <div>
                  <h3 className="text-white font-medium">{author?.full_name || author?.username || 'Неизвестный'}</h3>
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
                <button 
                  onClick={() => likePost(post.id, user!.id)}
                  className={clsx("flex items-center space-x-2 transition-colors", isLiked ? "text-red-500" : "text-gray-400 hover:text-red-500")}
                >
                  <Heart size={20} className={clsx(isLiked && "fill-current")} />
                  <span>{post.likes.length}</span>
                </button>
                <button 
                  onClick={() => setActiveComments({ ...activeComments, [post.id]: !activeComments[post.id] })}
                  className="flex items-center space-x-2 text-gray-400 hover:text-blue-500 transition-colors"
                >
                  <MessageCircle size={20} />
                  <span>{post.comments.length}</span>
                </button>
              </div>

              {activeComments[post.id] && (
                <div className="mt-4 border-t border-[#4a5568] pt-4 space-y-4">
                  {post.comments.map((comment) => {
                    const commentAuthor = getUser(comment.author_id);
                    return (
                      <div key={comment.id} className="flex space-x-3">
                        <img src={commentAuthor?.avatar_url || `https://api.dicebear.com/7.x/bottts/svg?seed=${commentAuthor?.username}`} alt="" className="w-8 h-8 rounded-full object-cover shrink-0 bg-[#1a202c]" />
                        <div className="flex-1 bg-[#1a202c] rounded-2xl rounded-tl-none p-3 border border-[#4a5568]">
                          <h4 className="text-white text-xs font-medium">{commentAuthor?.full_name || commentAuthor?.username}</h4>
                          <p className="text-gray-300 text-sm mt-1">{comment.content}</p>
                        </div>
                      </div>
                    );
                  })}
                  
                  <form onSubmit={(e) => handleAddComment(e, post.id)} className="flex items-center space-x-3 mt-4">
                    <img src={user?.avatar_url || `https://api.dicebear.com/7.x/bottts/svg?seed=${user?.username}`} alt="" className="w-8 h-8 rounded-full object-cover bg-[#1a202c] shrink-0" />
                    <div className="flex-1 relative">
                      <input
                        type="text"
                        value={commentInput[post.id] || ''}
                        onChange={(e) => setCommentInput({ ...commentInput, [post.id]: e.target.value })}
                        placeholder="Написать комментарий..."
                        className="w-full bg-[#1a202c] border border-[#4a5568] rounded-full px-4 py-2 pr-10 text-white focus:ring-1 focus:ring-blue-500 outline-none text-sm"
                      />
                      <button 
                        type="submit"
                        disabled={!commentInput[post.id]?.trim()}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-blue-500 disabled:opacity-50 p-1"
                      >
                        <Send size={18} />
                      </button>
                    </div>
                  </form>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
