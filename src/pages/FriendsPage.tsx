import { useState } from 'react';
import { MOCK_USERS } from '../lib/mockData';
import { MessageSquare, UserMinus, Check, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useChatStore } from '../store/chatStore';

export default function FriendsPage() {
  const navigate = useNavigate();
  const { setActiveChat } = useChatStore();
  const [friends, setFriends] = useState(MOCK_USERS.slice(0, 3));
  const [requests, setRequests] = useState(MOCK_USERS.slice(3, 5));

  const removeFriend = (id: string) => {
    setFriends(friends.filter(f => f.id !== id));
  };

  const acceptRequest = (user: typeof MOCK_USERS[0]) => {
    setRequests(requests.filter(r => r.id !== user.id));
    setFriends([...friends, user]);
  };

  const rejectRequest = (id: string) => {
    setRequests(requests.filter(r => r.id !== id));
  };

  const startChat = (user: typeof MOCK_USERS[0]) => {
    setActiveChat(user);
    navigate('/messages');
  };

  return (
    <div className="p-6 max-w-5xl mx-auto h-full overflow-y-auto">
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-white mb-2">Друзья</h1>
        <p className="text-gray-400">Управляйте списком контактов</p>
      </div>

      {requests.length > 0 && (
        <div className="mb-12">
          <h2 className="text-xl font-semibold text-white mb-4 flex items-center">
            Заявки в друзья
            <span className="ml-3 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
              {requests.length}
            </span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {requests.map(u => (
              <div key={u.id} className="bg-gray-900 border border-gray-800 rounded-2xl p-5 flex flex-col">
                <div className="flex items-center space-x-4 mb-4">
                  <img src={u.avatar_url!} alt="" className="w-14 h-14 rounded-full object-cover" />
                  <div>
                    <h3 className="text-white font-medium">{u.full_name}</h3>
                    <p className="text-gray-400 text-sm">@{u.username}</p>
                  </div>
                </div>
                <div className="flex space-x-2 mt-auto">
                  <button onClick={() => acceptRequest(u)} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg flex items-center justify-center transition-colors">
                    <Check size={18} className="mr-1" /> Принять
                  </button>
                  <button onClick={() => rejectRequest(u.id)} className="flex-1 bg-gray-800 hover:bg-gray-700 text-gray-300 py-2 rounded-lg flex items-center justify-center transition-colors">
                    <X size={18} className="mr-1" /> Скрыть
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div>
        <h2 className="text-xl font-semibold text-white mb-4">Мои друзья ({friends.length})</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {friends.map(u => (
            <div key={u.id} className="bg-gray-900 border border-gray-800 rounded-2xl p-4 flex items-center justify-between hover:border-gray-700 transition-all">
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <img src={u.avatar_url!} alt="" className="w-14 h-14 rounded-full object-cover" />
                  {u.is_online && (
                    <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-gray-900"></div>
                  )}
                </div>
                <div>
                  <h3 className="text-white font-medium text-lg">{u.full_name}</h3>
                  <p className="text-gray-400 text-sm">{u.is_online ? 'В сети' : 'Был(а) недавно'}</p>
                </div>
              </div>
              <div className="flex space-x-2">
                <button onClick={() => startChat(u)} className="p-2.5 bg-gray-800 hover:bg-blue-600 text-gray-300 hover:text-white rounded-xl transition-colors" title="Написать">
                  <MessageSquare size={20} />
                </button>
                <button onClick={() => removeFriend(u.id)} className="p-2.5 bg-gray-800 hover:bg-red-600 text-gray-300 hover:text-white rounded-xl transition-colors" title="Удалить">
                  <UserMinus size={20} />
                </button>
              </div>
            </div>
          ))}
          {friends.length === 0 && (
             <div className="col-span-full text-center py-12 text-gray-500 bg-gray-900 rounded-2xl border border-gray-800">
               У вас пока нет друзей
             </div>
          )}
        </div>
      </div>
    </div>
  );
}
