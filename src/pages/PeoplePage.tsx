import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Search, UserPlus, UserCheck } from 'lucide-react';
import { useAuthStore } from '../store/authStore';

export default function PeoplePage() {
  const { user } = useAuthStore();
  const [search, setSearch] = useState('');
  const [friends, setFriends] = useState<string[]>([]);
  const [users, setUsers] = useState<any[]>([]);

  // Загружаем всех реальных пользователей, кроме себя
  useEffect(() => {
    const fetchUsers = async () => {
      if (!user?.id) return;
      const { data } = await supabase.from('users').select('*').neq('id', user.id);
      if (data) setUsers(data);
    };
    fetchUsers();
  }, [user]);

  const filteredUsers = users.filter(u => 
    (u.full_name?.toLowerCase().includes(search.toLowerCase()) || 
     u.username?.toLowerCase().includes(search.toLowerCase()))
  );

  const toggleFriend = (id: string) => {
    setFriends(prev => prev.includes(id) ? prev.filter(fId => fId !== id) : [...prev, id]);
  };

  return (
    <div className="p-4 md:p-6 max-w-5xl mx-auto h-full flex flex-col">
      <div className="mb-6 md:mb-8 shrink-0">
        <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">Люди</h1>
        <p className="text-gray-400 text-sm md:text-base">Найти новых собеседников</p>
      </div>

      <div className="relative mb-6 md:mb-8 shrink-0">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-gray-500" />
        </div>
        <input
          type="text"
          placeholder="Поиск по имени или логину..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-[#2d3748] border border-[#4a5568] rounded-xl pl-12 pr-4 py-3.5 text-white focus:ring-2 focus:ring-blue-500 outline-none transition-shadow shadow-sm"
        />
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 pb-20 md:pb-6 content-start">
        {filteredUsers.map(u => {
          const isFriend = friends.includes(u.id);
          return (
            <div key={u.id} className="bg-[#2d3748] border border-[#4a5568] rounded-2xl p-4 md:p-6 flex items-center space-x-4 hover:border-blue-500/50 transition-colors shadow-sm">
              <div className="relative shrink-0">
                <img src={u.avatar_url || `https://api.dicebear.com/7.x/bottts/svg?seed=${u.username}`} alt={u.username} className="w-14 h-14 md:w-16 md:h-16 rounded-full object-cover bg-[#1a202c]" />
                <div className={`absolute bottom-0 right-0 w-3.5 h-3.5 md:w-4 md:h-4 rounded-full border-2 border-[#2d3748] ${u.is_online ? 'bg-green-500' : 'bg-gray-500'}`}></div>
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-white font-medium truncate text-base md:text-lg">{u.full_name || u.username}</h3>
                <p className="text-gray-400 text-xs md:text-sm truncate">@{u.username}</p>
              </div>
              <button 
                onClick={() => toggleFriend(u.id)}
                className={`p-3 rounded-xl transition-colors shrink-0 ${
                  isFriend 
                    ? 'bg-[#1a202c] text-green-500 border border-green-500/30' 
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
                title={isFriend ? "Удалить из друзей" : "Добавить в друзья"}
              >
                {isFriend ? <UserCheck size={20} /> : <UserPlus size={20} />}
              </button>
            </div>
          );
        })}
        {filteredUsers.length === 0 && (
          <div className="col-span-full flex flex-col items-center justify-center py-12 text-gray-500">
            <Search size={48} className="mb-4 opacity-20" />
            <p>Пользователи не найдены</p>
          </div>
        )}
      </div>
    </div>
  );
}
