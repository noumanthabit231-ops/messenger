import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import { usePostStore } from '../store/postStore';
import { supabase } from '../lib/supabase';
import { User, Image as ImageIcon, Check, Trash2, Heart, MessageCircle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ru } from 'date-fns/locale';

export default function ProfilePage() {
  const { user, updateProfile, isLoading: authLoading } = useAuthStore();
  const { posts, fetchPosts, deletePost } = usePostStore();

  const [username, setUsername] = useState(user?.username || '');
  const [fullName, setFullName] = useState(user?.full_name || '');
  const [avatarUrl, setAvatarUrl] = useState(user?.avatar_url || '');
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  const myPosts = posts.filter(post => post.user_id === user?.id);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !fullName.trim()) return;
    const success = await updateProfile({
      username: username.trim(),
      full_name: fullName.trim(),
      avatar_url: avatarUrl.trim()
    });
    if (success) {
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 3000);
    }
  };

  return (
    <div className="p-4 md:p-6 max-w-2xl mx-auto h-full overflow-y-auto no-scrollbar pb-24 md:pb-6">
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-white mb-1">Настройки профиля</h1>
        <p className="text-gray-400 text-xs md:text-sm">Управляйте своими личными данными и публикациями</p>
      </div>

      <div className="bg-[#2d3748] border border-[#4a5568] rounded-2xl p-4 md:p-6 mb-8 shadow-md">
        <form onSubmit={handleUpdate} className="space-y-4">
          <div className="flex flex-col sm:flex-row items-center space-y-3 sm:space-y-0 sm:space-x-4 pb-2 border-b border-[#4a5568]/50">
            <img src={avatarUrl || `https://api.dicebear.com/7.x/bottts/svg?seed=${user?.username}`} alt="Avatar Preview" className="w-16 h-16 rounded-full object-cover bg-[#1a202c] border border-[#4a5568]" />
            <div className="w-full flex-1">
              <label className="block text-xs font-semibold text-gray-400 uppercase mb-1">Ссылка на аватарку</label>
              <input type="text" value={avatarUrl} onChange={(e) => setAvatarUrl(e.target.value)} className="w-full bg-[#1a202c] border border-[#4a5568] rounded-xl px-3 py-2 text-sm text-white outline-none focus:ring-1 focus:ring-blue-500" placeholder="https://example.com/avatar.jpg" />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase mb-1">Уникальный никнейм</label>
              <input type="text" required value={username} onChange={(e) => setUsername(e.target.value.replace(/[^a-zA-Z0-9_]/g, ''))} className="w-full bg-[#1a202c] border border-[#4a5568] rounded-xl px-3 py-2.5 text-sm text-white outline-none focus:ring-1 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase mb-1">Отображаемое имя</label>
              <input type="text" required value={fullName} onChange={(e) => setFullName(e.target.value)} className="w-full bg-[#1a202c] border border-[#4a5568] rounded-xl px-3 py-2.5 text-sm text-white outline-none focus:ring-1 focus:ring-blue-500" />
            </div>
          </div>
          <div className="flex items-center justify-between pt-2">
            {isSaved ? <span className="text-green-400 text-xs font-medium flex items-center space-x-1"><Check size={16} /> <span>Изменения сохранены!</span></span> : <div />}
            <button type="submit" disabled={authLoading} className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-medium text-sm transition-colors shadow flex items-center justify-center min-w-[120px]">
              {authLoading ? 'Сохранение...' : 'Сохранить'}
            </button>
          </div>
        </form>
      </div>

      <div className="space-y-4">
        <h2 className="text-lg md:text-xl font-bold text-white px-1">Мои публикации ({myPosts.length})</h2>
        {myPosts.map((post) => (
          <div key={post.id} className="bg-[#2d3748] border border-[#4a5568] rounded-2xl p-4 shadow-sm relative">
            <button onClick={() => { if (window.confirm('Вы уверены, что хотите удалить этот пост?')) deletePost(post.id); }} className="absolute top-4 right-4 p-2 text-gray-400 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all" title="Удалить публикацию"><Trash2 size={18} /></button>
            <div className="flex items-center space-x-3 mb-3 pr-10">
              <img src={user?.avatar_url || `https://api.dicebear.com/7.x/bottts/svg?seed=${user?.username}`} alt="" className="w-10 h-10 rounded-full object-cover bg-[#1a202c]" />
              <div>
                <h3 className="text-white text-sm font-medium">{user?.full_name || user?.username}</h3>
                <p className="text-gray-500 text-[11px]">{formatDistanceToNow(new Date(post.created_at), { addSuffix: true, locale: ru })}</p>
              </div>
            </div>
            <p className="text-gray-200 text-sm md:text-base whitespace-pre-wrap leading-relaxed mb-3">{post.content}</p>
            {post.image_url && <div className="mb-3 rounded-xl overflow-hidden border border-[#4a5568] max-h-60"><img src={post.image_url} alt="" className="w-full h-full object-cover" /></div>}
            <div className="flex items-center space-x-4 border-t border-[#4a5568]/40 pt-3 text-gray-400 text-xs">
              <div className="flex items-center space-x-1"><Heart size={16} /> <span>{post.likes?.length || 0}</span></div>
              <div className="flex items-center space-x-1"><MessageCircle size={16} /> <span>{post.comments?.length || 0}</span></div>
            </div>
          </div>
        ))}
        {myPosts.length === 0 && <div className="text-center py-8 bg-[#2d3748]/40 border border-dashed border-[#4a5568] rounded-2xl text-gray-500 text-sm">Вы еще ничего не публиковали</div>}
      </div>
    </div>
  );
}
