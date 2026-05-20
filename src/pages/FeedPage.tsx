import React, { useState } from 'react';
import { usePostStore } from '../store/postStore';
import { useAuthStore } from '../store/authStore';
import { MOCK_USERS } from '../lib/mockData';
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

  const getUser = (id: string) => {
    if (id === user?.id) return user;
    return MOCK_USERS.find(u => u.id === id) || user; // Fallback to current user if not found in mock
  };

  const handleCreatePost = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPostContent.trim()) {
      // randomly add an image sometimes for demo
      const hasImage = Math.random() > 0.7;
      const imageUrl = hasImage ? `https://images.unsplash.com/photo-${Math.floor(Math.random()*1000000)}?w=800&q=80` : undefined;
      
      addPost(newPostContent, imageUrl);
      setNewPostContent('');
    }
  };

  const handleAddComment = (e: React.FormEvent, postId: string) => {
    e.preventDefault();
    if (commentInput[postId]?.trim() && user) {
      addComment(postId, user.id, commentInput[postId].trim());
      setCommentInput({ ...commentInput, [postId]: '' });
    }
  };

  return (
    <div className="p-6 max-w-2xl mx-auto h-full overflow-y-auto pb-20">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Лента</h1>
        <p className="text-gray-400">Что нового у ваших друзей?</p>
      </div>

      {/* Create Post */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-4 mb-8">
        <div className="flex space-x-4">
          <img src={user?.avatar_url!} alt="" className="w-12 h-12 rounded-full object-cover" />
          <div className="flex-1">
            <textarea
              value={newPostContent}
              onChange={(e) => setNewPostContent(e.target.value)}
              placeholder="Что у вас нового?"
              className="w-full bg-gray-800 border-none rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-blue-500 outline-none min-h-[100px] resize-none"
            />
            <div className="flex justify-between items-center mt-3">
              <button className="text-gray-400 hover:text-blue-500 p-2 rounded-lg transition-colors flex items-center space-x-2 bg-gray-800 hover:bg-gray-700">
                <ImageIcon size={20} />
                <span className="text-sm font-medium">Фото</span>
              </button>
              <button
                onClick={handleCreatePost}
                disabled={!newPostContent.trim()}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-xl font-medium transition-colors disabled:opacity-50"
              >
                Опубликовать
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Posts */}
      <div className="space-y-6">
        {posts.map(post => {
          const postAuthor = getUser(post.user_id);
          const isLiked = user ? post.likes.includes(user.id) : false;
          const showComments = activeComments[post.id];

          return (
            <div key={post.id} className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
              <div className="p-4 flex items-center space-x-3">
                <img src={postAuthor?.avatar_url!} alt="" className="w-10 h-10 rounded-full object-cover" />
                <div>
                  <h3 className="text-white font-medium">{postAuthor?.full_name}</h3>
                  <p className="text-gray-400 text-xs">
                    {formatDistanceToNow(new Date(post.created_at), { addSuffix: true, locale: ru })}
                  </p>
                </div>
              </div>

              <div className="px-4 pb-3 text-gray-200 whitespace-pre-wrap">
                {post.content}
              </div>

              {post.image_url && (
                <div className="w-full bg-black">
                  <img src={post.image_url} alt="Post" className="w-full h-auto max-h-[500px] object-cover" />
                </div>
              )}

              <div className="p-4 border-t border-gray-800 flex items-center space-x-6">
                <button 
                  onClick={() => user && likePost(post.id, user.id)}
                  className={clsx(
                    "flex items-center space-x-2 transition-colors",
                    isLiked ? "text-red-500" : "text-gray-400 hover:text-red-500"
                  )}
                >
                  <Heart size={22} className={isLiked ? "fill-current" : ""} />
                  <span className="font-medium">{post.likes.length}</span>
                </button>
                <button 
                  onClick={() => setActiveComments({ ...activeComments, [post.id]: !showComments })}
                  className="flex items-center space-x-2 text-gray-400 hover:text-blue-500 transition-colors"
                >
                  <MessageCircle size={22} />
                  <span className="font-medium">{post.comments.length}</span>
                </button>
              </div>

              {/* Comments Section */}
              {showComments && (
                <div className="bg-gray-950 p-4 border-t border-gray-800 space-y-4">
                  {post.comments.map(comment => {
                    const commentAuthor = getUser(comment.user_id);
                    return (
                      <div key={comment.id} className="flex space-x-3">
                        <img src={commentAuthor?.avatar_url!} alt="" className="w-8 h-8 rounded-full object-cover" />
                        <div className="bg-gray-900 rounded-2xl rounded-tl-none px-4 py-2 flex-1">
                          <h4 className="text-white text-sm font-medium">{commentAuthor?.full_name}</h4>
                          <p className="text-gray-300 text-sm mt-0.5">{comment.content}</p>
                        </div>
                      </div>
                    );
                  })}
                  
                  <form onSubmit={(e) => handleAddComment(e, post.id)} className="flex items-center space-x-3 mt-4">
                    <img src={user?.avatar_url!} alt="" className="w-8 h-8 rounded-full object-cover" />
                    <div className="flex-1 relative">
                      <input
                        type="text"
                        value={commentInput[post.id] || ''}
                        onChange={(e) => setCommentInput({ ...commentInput, [post.id]: e.target.value })}
                        placeholder="Написать комментарий..."
                        className="w-full bg-gray-900 border border-gray-800 rounded-full px-4 py-2 pr-10 text-white focus:ring-1 focus:ring-blue-500 outline-none text-sm"
                      />
                      <button 
                        type="submit"
                        disabled={!commentInput[post.id]?.trim()}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-blue-500 disabled:opacity-50"
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
