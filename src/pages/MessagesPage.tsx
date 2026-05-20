import React, { useState, useEffect, useRef } from 'react';
import { useChatStore } from '../store/chatStore';
import { useAuthStore } from '../store/authStore';
import { supabase } from '../lib/supabase';
import { Send, Mic, Paperclip, Phone, Video, MoreVertical, Play, Square, MessageSquare, ChevronLeft } from 'lucide-react';
import { format } from 'date-fns';
import clsx from 'clsx';

export default function MessagesPage() {
  const { user } = useAuthStore();
  const { messages, activeChat, setActiveChat, sendMessage, loadMessages, addMessage } = useChatStore();
  
  const [inputText, setInputText] = useState('');
  const [realUsers, setRealUsers] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const recordingInterval = useRef<NodeJS.Timeout | null>(null);

  // Получение пользователей из базы
  useEffect(() => {
    const fetchUsers = async () => {
      if (!user?.id) return;
      const { data } = await supabase.from('profiles').select('*').neq('id', user.id);
      if (data) setRealUsers(data);
    };
    fetchUsers();
  }, [user]);

  // Загрузка сообщений и подписка на новые
  useEffect(() => {
    if (!activeChat || !user) return;

    loadMessages(user.id, activeChat.id);

    const channel = supabase
      .channel('chat_messages')
      .on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'messages',
        filter: `receiver_id=eq.${user.id}` // Слушаем только то, что прислали НАМ
      }, (payload) => {
        // Если сообщение от текущего активного собеседника
        if (payload.new.sender_id === activeChat.id) {
          addMessage(payload.new as any);
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [activeChat, user, loadMessages, addMessage]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (inputText.trim() && user && activeChat) {
      sendMessage(user.id, activeChat.id, inputText.trim(), 'text');
      setInputText('');
    }
  };

  const toggleRecording = () => {
    if (isRecording) {
      setIsRecording(false);
      if (recordingInterval.current) clearInterval(recordingInterval.current);
      if (user && activeChat) {
        sendMessage(user.id, activeChat.id, 'Голосовое сообщение', 'voice', 'mock-audio.mp3');
      }
      setRecordingTime(0);
    } else {
      setIsRecording(true);
      setRecordingTime(0);
      recordingInterval.current = setInterval(() => setRecordingTime((prev) => prev + 1), 1000);
    }
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const filteredUsers = realUsers.filter((u) => {
    const name = u.full_name?.toLowerCase() || '';
    const nick = u.username?.toLowerCase() || '';
    return name.includes(searchQuery.toLowerCase()) || nick.includes(searchQuery.toLowerCase());
  });

  return (
    <div className="flex h-full bg-[#1a202c]">
      <div className={clsx("w-full md:w-80 border-r border-[#4a5568] flex flex-col bg-[#2d3748] h-full shrink-0", activeChat ? "hidden md:flex" : "flex")}>
        <div className="p-4 border-b border-[#4a5568]">
          <input
            type="text"
            placeholder="Поиск собеседников..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#1a202c] border border-[#4a5568] rounded-xl px-4 py-2.5 text-gray-200 focus:ring-2 focus:ring-blue-500 outline-none text-sm"
          />
        </div>
        <div className="flex-1 overflow-y-auto no-scrollbar">
          {filteredUsers.map((realUser) => (
            <div
              key={realUser.id}
              onClick={() => setActiveChat(realUser)}
              className={clsx("flex items-center space-x-3 p-4 cursor-pointer hover:bg-[#4a5568] border-b border-[#4a5568]/30", activeChat?.id === realUser.id ? "bg-[#4a5568]" : "")}
            >
              <div className="relative shrink-0">
                <img src={realUser.avatar_url || `https://api.dicebear.com/7.x/bottts/svg?seed=${realUser.username}`} alt="" className="w-12 h-12 rounded-full object-cover bg-[#1a202c]" />
                <div className={clsx("absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full border-2 border-[#2d3748]", realUser.is_online ? "bg-green-500" : "bg-gray-500")}></div>
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-gray-100 font-medium truncate">{realUser.full_name || realUser.username}</h3>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className={clsx("flex-1 flex-col h-full bg-[#1a202c]", activeChat ? "flex" : "hidden md:flex")}>
        {activeChat ? (
          <>
            <div className="h-16 border-b border-[#4a5568] flex items-center justify-between px-3 md:px-6 bg-[#2d3748] shrink-0">
              <div className="flex items-center space-x-2 md:space-x-3">
                <button onClick={() => setActiveChat(null)} className="md:hidden p-2 -ml-2 text-gray-300 hover:text-white rounded-lg active:bg-[#4a5568]"><ChevronLeft size={26} /></button>
                <img src={activeChat.avatar_url || `https://api.dicebear.com/7.x/bottts/svg?seed=${activeChat.username}`} alt="" className="w-10 h-10 rounded-full object-cover shrink-0" />
                <div className="min-w-0">
                  <h2 className="text-gray-100 font-medium truncate">{activeChat.full_name || activeChat.username}</h2>
                  <p className={clsx("text-xs font-medium", activeChat.is_online ? "text-green-400" : "text-gray-400")}>{activeChat.is_online ? 'В сети' : 'Не в сети'}</p>
                </div>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4 no-scrollbar scroll-smooth">
              {messages.map((msg) => {
                const isMine = msg.sender_id === user?.id;
                return (
                  <div key={msg.id} className={clsx("flex flex-col", isMine ? "items-end" : "items-start")}>
                    <div className={clsx("max-w-[85%] md:max-w-[70%] rounded-2xl px-4 py-2.5 shadow-sm break-words", isMine ? "bg-blue-600 text-white rounded-br-none" : "bg-[#2d3748] text-gray-100 rounded-bl-none")}>
                      {msg.message_type === 'text' && <p className="leading-relaxed">{msg.content}</p>}
                      {msg.message_type === 'voice' && (
                        <div className="flex items-center space-x-3 py-1">
                          <button className="w-8 h-8 bg-blue-700 rounded-full flex items-center justify-center hover:bg-blue-800"><Play size={14} className="ml-0.5 text-white" /></button>
                          <div className="h-1 w-28 bg-[#4a5568] rounded-full"><div className="h-full w-1/3 bg-blue-400 rounded-full"></div></div>
                        </div>
                      )}
                    </div>
                    <span className="text-[10px] text-gray-500 mt-1 px-1">{msg.created_at ? format(new Date(msg.created_at), 'HH:mm') : ''}</span>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            <div className="p-3 md:p-4 bg-[#2d3748] border-t border-[#4a5568]">
              <form onSubmit={handleSend} className="flex items-end space-x-2">
                <button type="button" className="p-2.5 text-gray-400 hover:text-white rounded-xl"><Paperclip size={22} /></button>
                <div className="flex-1 bg-[#1a202c] border border-[#4a5568] rounded-2xl overflow-hidden">
                  {isRecording ? (
                    <div className="flex items-center space-x-3 px-4 py-3"><div className="w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse"></div><span className="text-red-500">{formatTime(recordingTime)}</span></div>
                  ) : (
                    <textarea value={inputText} onChange={(e) => setInputText(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }} placeholder="Напишите сообщение..." className="w-full bg-transparent border-none focus:ring-0 text-white px-4 py-3 max-h-32 resize-none outline-none" rows={1} />
                  )}
                </div>
                {inputText.trim() ? (
                  <button type="submit" className="p-3 bg-blue-600 text-white rounded-xl"><Send size={20} /></button>
                ) : (
                  <button type="button" onClick={toggleRecording} className={clsx("p-3 rounded-xl", isRecording ? "bg-red-500 text-white" : "bg-[#1a202c] border border-[#4a5568] text-gray-400")}>
                    {isRecording ? <Square size={20} /> : <Mic size={20} />}
                  </button>
                )}
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center flex-col text-gray-500"><MessageSquare size={32} className="mb-4 text-gray-400" /><p>Выберите чат для начала общения</p></div>
        )}
      </div>
    </div>
  );
}
