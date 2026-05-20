import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { MessageSquare, UserMinus, Check, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useChatStore } from '../store/chatStore';
import { useAuthStore } from '../store/authStore';

export default function FriendsPage() {
  const navigate = useNavigate();
  const { setActiveChat } = useChatStore();
  const { user } = useAuthStore();
  
  const [friends, setFriends] = useState<any[]>([]);
  const [requests, setRequests] = useState<any[]>([]);

  useEffect(() => {
    const fetchUsers = async () => {
      if (!user?.id) return;
      // Здесь ИСПРАВЛЕНО на profiles
      const { data } = await supabase.from('profiles').select('*').neq('id', user.id).limit(6);
      if (data) {
        setFriends(data.slice(0, 3)); 
        setRequests(data.slice(3, 6)); 
      }
    };
    fetchUsers();
  }, [user]);

  const removeFriend = (id: string) => setFriends(friends.filter(f => f.id !== id));
  const acceptRequest = (u: any) => { setRequests(requests.filter(r => r.id !== u.id)); setFriends([...friends, u]); };
  const rejectRequest = (id: string) => setRequests(requests.filter(r => r.id !== id));
  const startChat = (u: any) => { setActiveChat(u); navigate('/messages'); };

  return (
    <div className="p-4 md:p-6 max-w-5xl mx-auto h-full overflow-y-auto no-scrollbar pb-20 md:pb-6">
      <div className="mb-8 md:mb-10">
        <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">Друзья</h1>
        <p className="text-gray-400 text-sm md:text-base">Управляйте списком контактов</p>
      </div>

      {requests.length > 0 && (
        <div className="mb-8 md:mb-12">
          <h2 className="text-lg md:text-xl font-semibold text-white mb-4 px-2">Заявки в друзья ({requests.length})</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {requests.map(u => (
              <div key={u.id} className="bg-[#2d3748] border border-[#4a5568] rounded-2xl p-4 flex items-center justify-between shadow-sm">
                <div className="flex items-center space-x-3 min-w-0">
                  <img src={u.avatar_url || `https://api.dicebear.com/7.x/bottts/svg?seed=${u.username}`} alt="" className="w-12 h-12 rounded-full object-cover shrink-0 bg-[#1a202c]" />
                  <div className="min-w-0">
                    <h3 className="text-white font-medium truncate">{u.full_name || u.username}</h3>
                    <p className="text-gray-400 text-xs truncate">Хочет добавить вас</p>
                  </div>
                </div>
                <div className="flex space-x-2 shrink-0">
                  <button onClick={() => acceptRequest(u)} className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-colors"><Check size={20} /></button>
                  <button onClick={() => rejectRequest(u.id)} className="p-2 bg-[#1a202c] border border-[#4a5568] hover:bg-red-500/20 hover:text-red-500 text-gray-400 rounded-xl transition-colors"><X size={20} /></button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div>
        <h2 className="text-lg md:text-xl font-semibold text-white mb-4 px-2">Мои друзья ({friends.length})</h2>
        <div className="grid grid-cols-1 gap-3 md:gap-4">
          {friends.map(u => (
            <div key={u.id} className="bg-[#2d3748] border border-[#4a5568] rounded-2xl p-4 flex items-center justify-between hover:border-blue-500/30 transition-colors shadow-sm">
              <div className="flex items-center space-x-3 md:space-x-4 min-w-0">
                <div className="relative shrink-0">
                  <img src={u.avatar_url || `https://api.dicebear.com/7.x/bottts/svg?seed=${u.username}`} alt="" className="w-12 h-12 md:w-14 md:h-14 rounded-full object-cover bg-[#1a202c]" />
                  <div className={`absolute bottom-0 right-0 w-3 h-3 md:w-3.5 md:h-3.5 rounded-full border-2 border-[#2d3748] ${u.is_online ? 'bg-green-500' : 'bg-gray-500'}`}></div>
                </div>
                <div className="min-w-0">
                  <h3 className="text-white font-medium text-base md:text-lg truncate">{u.full_name || u.username}</h3>
                  <p className="text-gray-400 text-xs md:text-sm truncate">{u.is_online ? 'В сети' : 'Не в сети'}</p>
                </div>
              </div>
              <div className="flex space-x-2 shrink-0">
                <button onClick={() => startChat(u)} className="p-2.5 bg-[#1a202c] border border-[#4a5568] hover:bg-blue-600 hover:border-blue-600 text-gray-300 hover:text-white rounded-xl transition-colors"><MessageSquare size={20} /></button>
                <button onClick={() => removeFriend(u.id)} className="p-2.5 bg-[#1a202c] border border-[#4a5568] hover:bg-red-600 hover:border-red-600 text-gray-300 hover:text-white rounded-xl transition-colors"><UserMinus size={20} /></button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
