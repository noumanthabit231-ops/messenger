import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../store/authStore';
import { useChatStore } from '../store/chatStore';
import { Search, UserPlus, UserCheck, UserMinus, Clock, MessageSquare, Check, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import clsx from 'clsx';

export default function FriendsPage() {
  const { user } = useAuthStore();
  const { setActiveChat } = useChatStore();
  const navigate = useNavigate();

  const [search, setSearch] = useState('');
  const [profiles, setProfiles] = useState<any[]>([]);

  const fetchData = async () => {
    if (!user?.id) return;
    
    // Получаем всех пользователей
    const { data: allUsers } = await supabase.from('profiles').select('*').neq('id', user.id);
    
    // Получаем все связи, где мы участвуем
    const { data: relations } = await supabase
      .from('friends')
      .select('*')
      .or(`user_id.eq.${user.id},friend_id.eq.${user.id}`);

    if (allUsers && relations) {
      const mapped = allUsers.map(p => {
        const rel = relations.find(r => r.user_id === p.id || r.friend_id === p.id);
        let status = 'none';
        let relId = null;
        if (rel) {
          relId = rel.id;
          if (rel.status === 'accepted') status = 'friend';
          else if (rel.status === 'pending') {
            status = rel.user_id === user.id ? 'pending_outgoing' : 'pending_incoming';
          }
        }
        return { ...p, relStatus: status, relId };
      });
      setProfiles(mapped);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user]);

  const handleAction = async (action: 'add' | 'accept' | 'cancel', profile: any) => {
    if (!user?.id) return;
    
    if (action === 'add') {
      await supabase.from('friends').insert({ user_id: user.id, friend_id: profile.id, status: 'pending' });
    } else if (action === 'accept') {
      await supabase.from('friends').update({ status: 'accepted' }).eq('id', profile.relId);
    } else if (action === 'cancel') {
      await supabase.from('friends').delete().eq('id', profile.relId);
    }
    fetchData(); // Перезагружаем список
  };

  const startChat = (u: any) => {
    setActiveChat(u);
    navigate('/messages');
  };

  const friends = profiles.filter(p => p.relStatus === 'friend');
  const incoming = profiles.filter(p => p.relStatus === 'pending_incoming');
  const outgoing = profiles.filter(p => p.relStatus === 'pending_outgoing');
  
  const searchResults = search.trim() ? profiles.filter(u => 
    (u.full_name?.toLowerCase().includes(search.toLowerCase()) || u.username?.toLowerCase().includes(search.toLowerCase()))
  ) : [];

  const UserCard = ({ p }: { p: any }) => (
    <div className="bg-[#2d3748] border border-[#4a5568] rounded-2xl p-4 flex items-center justify-between hover:border-blue-500/30 transition-colors shadow-sm">
      <div className="flex items-center space-x-3 md:space-x-4 min-w-0 cursor-pointer" onClick={() => p.relStatus === 'friend' && startChat(p)}>
        <div className="relative shrink-0">
          <img src={p.avatar_url || `https://api.dicebear.com/7.x/bottts/svg?seed=${p.username}`} alt="" className="w-12 h-12 md:w-14 md:h-14 rounded-full object-cover bg-[#1a202c]" />
          <div className={clsx("absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full border-2 border-[#2d3748]", p.is_online ? "bg-green-500" : "bg-gray-500")}></div>
        </div>
        <div className="min-w-0">
          <h3 className="text-white font-medium text-base md:text-lg truncate">{p.full_name || p.username}</h3>
          <p className="text-gray-400 text-xs truncate">@{p.username}</p>
        </div>
      </div>
      
      <div className="flex space-x-2 shrink-0">
        {p.relStatus === 'friend' && (
          <>
            <button onClick={() => startChat(p)} className="p-2.5 bg-[#1a202c] border border-[#4a5568] hover:bg-blue-600 hover:border-blue-600 text-gray-300 hover:text-white rounded-xl transition-colors"><MessageSquare size={18} /></button>
            <button onClick={() => handleAction('cancel', p)} className="p-2.5 bg-[#1a202c] border border-[#4a5568] hover:bg-red-600 hover:border-red-600 text-gray-300 hover:text-white rounded-xl transition-colors"><UserMinus size={18} /></button>
          </>
        )}
        {p.relStatus === 'pending_incoming' && (
          <>
            <button onClick={() => handleAction('accept', p)} className="p-2.5 bg-blue-600 text-white hover:bg-blue-700 rounded-xl transition-colors"><Check size={18} /></button>
            <button onClick={() => handleAction('cancel', p)} className="p-2.5 bg-[#1a202c] border border-[#4a5568] text-gray-400 hover:text-red-500 rounded-xl transition-colors"><X size={18} /></button>
          </>
        )}
        {p.relStatus === 'pending_outgoing' && (
          <button onClick={() => handleAction('cancel', p)} className="px-3 py-2 bg-[#1a202c] border border-[#4a5568] text-gray-400 hover:text-red-500 rounded-xl text-xs font-medium flex items-center space-x-1"><Clock size={14}/> <span>Отменить</span></button>
        )}
        {p.relStatus === 'none' && (
          <button onClick={() => handleAction('add', p)} className="p-2.5 bg-blue-600 text-white hover:bg-blue-700 rounded-xl transition-colors"><UserPlus size={18} /></button>
        )}
      </div>
    </div>
  );

  return (
    <div className="p-4 md:p-6 max-w-5xl mx-auto h-full flex flex-col">
      <div className="mb-6 shrink-0">
        <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">Друзья и поиск</h1>
      </div>

      <div className="relative mb-6 shrink-0">
        <Search className="absolute inset-y-0 left-0 pl-4 h-full w-9 text-gray-500 pointer-events-none" />
        <input
          type="text"
          placeholder="Поиск по имени или логину..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-[#2d3748] border border-[#4a5568] rounded-xl pl-12 pr-4 py-3.5 text-white focus:ring-2 focus:ring-blue-500 outline-none shadow-sm"
        />
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar pb-20 md:pb-6">
        {search.trim() ? (
          <div className="space-y-4">
            <h2 className="text-gray-400 text-sm font-semibold uppercase px-2">Результаты поиска</h2>
            {searchResults.length > 0 ? searchResults.map(p => <UserCard key={p.id} p={p} />) : <p className="text-gray-500 text-center py-8">Ничего не найдено</p>}
          </div>
        ) : (
          <div className="space-y-8">
            {incoming.length > 0 && (
              <div className="space-y-3">
                <h2 className="text-white font-semibold px-2">Входящие заявки ({incoming.length})</h2>
                {incoming.map(p => <UserCard key={p.id} p={p} />)}
              </div>
            )}
            
            {outgoing.length > 0 && (
              <div className="space-y-3">
                <h2 className="text-gray-400 font-semibold px-2">Отправленные заявки ({outgoing.length})</h2>
                {outgoing.map(p => <UserCard key={p.id} p={p} />)}
              </div>
            )}

            <div className="space-y-3">
              <h2 className="text-white font-semibold px-2">Мои друзья ({friends.length})</h2>
              {friends.length > 0 ? friends.map(p => <UserCard key={p.id} p={p} />) : <p className="text-gray-500 text-center py-8">У вас пока нет друзей. Используйте поиск!</p>}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
