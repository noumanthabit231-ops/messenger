import { useState } from 'react';
import { MOCK_USERS } from '../lib/mockData';
import { Search, UserPlus, UserCheck } from 'lucide-react';
import { useAuthStore } from '../store/authStore';

export default function PeoplePage() {
  const { user } = useAuthStore();
  const [search, setSearch] = useState('');
  const [friends, setFriends] = useState<string[]>([]); // Mock friend status

  const filteredUsers = MOCK_USERS.filter(u => 
    u.id !== user?.id && 
    (u.full_name?.toLowerCase().includes(search.toLowerCase()) || 
     u.username.toLowerCase().includes(search.toLowerCase()))
  );

  const toggleFriend = (id: string) => {
    setFriends(prev => prev.includes(id) ? prev.filter(fId => fId !== id) : [...prev, id]);
  };

  return (
    <div className="p-6 max-w-5xl mx-auto h-full flex flex-col">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Люди</h1>
        <p className="text-gray-400">Найти новых собеседников</p>
      </div>

      <div className="relative mb-8">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-gray-500" />
        </div>
        <input
          type="text"
          placeholder="Поиск по имени или @username..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-gray-900 border border-gray-800 rounded-xl pl-12 pr-4 py-3 text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 overflow-y-auto pb-8">
        {filteredUsers.map(u => {
          const isFriend = friends.includes(u.id);
          return (
            <div key={u.id} className="bg-gray-900 border border-gray-800 rounded-2xl p-6 flex items-center space-x-4 hover:border-gray-700 transition-colors">
              <div className="relative">
                <img src={u.avatar_url!} alt={u.username} className="w-16 h-16 rounded-full object-cover" />
                {u.is_online && (
                  <div className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 rounded-full border-2 border-gray-900"></div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-white font-medium truncate text-lg">{u.full_name}</h3>
                <p className="text-gray-400 text-sm truncate">@{u.username}</p>
              </div>
              <button 
                onClick={() => toggleFriend(u.id)}
                className={`p-3 rounded-xl transition-colors ${
                  isFriend 
                    ? 'bg-gray-800 text-green-500 hover:bg-gray-700' 
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
          <div className="col-span-full text-center py-12 text-gray-500">
            Никого не найдено
          </div>
        )}
      </div>
    </div>
  );
}
