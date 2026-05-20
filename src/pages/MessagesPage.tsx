import React, { useState, useEffect, useRef } from 'react';
import { useChatStore } from '../store/chatStore';
import { useAuthStore } from '../store/authStore';
import { MOCK_USERS } from '../lib/mockData';
import { Send, Mic, Paperclip, Phone, Video, MoreVertical, Play, Square, MessageSquare, ChevronLeft } from 'lucide-react';
import { format } from 'date-fns';
import clsx from 'clsx';

export default function MessagesPage() {
  const { user } = useAuthStore();
  const { messages, activeChat, setActiveChat, sendMessage, loadMessages } = useChatStore();
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Audio recording state
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const recordingInterval = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (activeChat && user) {
      loadMessages(user.id, activeChat.id);
    }
  }, [activeChat, user, loadMessages]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (inputText.trim()) {
      sendMessage(inputText.trim(), 'text');
      setInputText('');
      
      // Play a tiny send sound (optional, user wanted sound notifications)
      // new Audio('/send.mp3').play().catch(()=>{}); 
    }
  };

  const toggleRecording = () => {
    if (isRecording) {
      setIsRecording(false);
      clearInterval(recordingInterval.current!);
      // Mock sending audio
      sendMessage('Голосовое сообщение', 'voice', 'mock-audio.mp3');
      setRecordingTime(0);
    } else {
      setIsRecording(true);
      setRecordingTime(0);
      recordingInterval.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    }
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="flex h-full bg-[#1a202c]">
      
      {/* Sidebar - Chats List (Скрывается на телефонах, если открыт диалог) */}
      <div className={clsx(
        "w-full md:w-80 border-r border-[#4a5568] flex-col bg-[#2d3748] h-full shrink-0",
        activeChat ? "hidden md:flex" : "flex"
      )}>
        <div className="p-4 border-b border-[#4a5568]">
          <input
            type="text"
            placeholder="Поиск чатов..."
            className="w-full bg-[#1a202c] border border-[#4a5568] rounded-xl px-4 py-2.5 text-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
          />
        </div>
        <div className="flex-1 overflow-y-auto no-scrollbar">
          {MOCK_USERS.map((mockUser) => (
            <div
              key={mockUser.id}
              onClick={() => setActiveChat(mockUser)}
              className={clsx(
                "flex items-center space-x-3 p-4 cursor-pointer hover:bg-[#4a5568] transition-colors border-b border-[#4a5568]/50",
                activeChat?.id === mockUser.id ? "bg-[#4a5568]" : ""
              )}
            >
              <div className="relative shrink-0">
                <img src={mockUser.avatar_url!} alt="" className="w-12 h-12 rounded-full object-cover" />
                {mockUser.is_online && (
                  <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-[#2d3748]"></div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-gray-100 font-medium truncate">{mockUser.full_name}</h3>
                <p className="text-gray-400 text-sm truncate">Последнее сообщение...</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main Chat Area (Скрывается на телефонах, если чат не выбран) */}
      <div className={clsx(
        "flex-1 flex-col h-full bg-[#1a202c]",
        activeChat ? "flex" : "hidden md:flex"
      )}>
        {activeChat ? (
          <>
            {/* Chat Header */}
            <div className="h-16 border-b border-[#4a5568] flex items-center justify-between px-3 md:px-6 bg-[#2d3748] shrink-0 shadow-sm">
              <div className="flex items-center space-x-2 md:space-x-3">
                {/* Кнопка "Назад" только для мобильных */}
                <button 
                  onClick={() => setActiveChat(null)}
                  className="md:hidden p-2 -ml-2 text-gray-300 hover:text-white rounded-lg active:bg-[#4a5568] transition-colors"
                >
                  <ChevronLeft size={26} />
                </button>
                <img src={activeChat.avatar_url!} alt="" className="w-10 h-10 rounded-full object-cover shrink-0" />
                <div className="min-w-0">
                  <h2 className="text-gray-100 font-medium truncate">{activeChat.full_name}</h2>
                  <p className="text-xs text-blue-400">
                    {activeChat.is_online ? 'В сети' : 'Был(а) недавно'}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-3 md:space-x-4 text-gray-400">
                <button className="hover:text-blue-500 transition-colors p-1"><Phone size={20} /></button>
                <button className="hover:text-blue-500 transition-colors p-1 hidden sm:block"><Video size={20} /></button>
                <button className="hover:text-white transition-colors p-1"><MoreVertical size={20} /></button>
              </div>
            </div>

            {/* Messages Scroll Area */}
            <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4 no-scrollbar scroll-smooth">
              {messages.map((msg) => {
                const isMine = msg.sender_id === user?.id;
                return (
                  <div key={msg.id} className={clsx("flex flex-col", isMine ? "items-end" : "items-start")}>
                    <div
                      className={clsx(
                        "max-w-[85%] md:max-w-[70%] rounded-2xl px-4 py-2.5 shadow-sm",
                        isMine ? "bg-blue-600 text-white rounded-br-none" : "bg-[#2d3748] text-gray-100 rounded-bl-none border border-[#4a5568]"
                      )}
                    >
                      {msg.message_type === 'text' && <p className="leading-relaxed">{msg.content}</p>}
                      {msg.message_type === 'voice' && (
                        <div className="flex items-center space-x-2">
                          <button className="w-8 h-8 bg-blue-700 rounded-full flex items-center justify-center hover:bg-blue-800 shrink-0">
                            <Play size={14} className="ml-0.5 text-white" />
                          </button>
                          <div className="h-1 w-24 bg-blue-400 rounded-full"></div>
                          <span className="text-xs">0:12</span>
                        </div>
                      )}
                    </div>
                    <span className="text-[11px] text-gray-500 mt-1 px-1">
                      {format(new Date(msg.created_at), 'HH:mm')}
                    </span>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-3 md:p-4 bg-[#2d3748] border-t border-[#4a5568] shrink-0">
              <form onSubmit={handleSend} className="flex items-end space-x-2">
                <button type="button" className="p-2.5 text-gray-400 hover:text-white transition-colors rounded-xl active:bg-[#4a5568]">
                  <Paperclip size={22} />
                </button>
                
                <div className="flex-1 bg-[#1a202c] border border-[#4a5568] rounded-2xl relative shadow-inner">
                  {isRecording ? (
                    <div className="flex items-center space-x-3 px-4 py-3 h-full animate-pulse">
                      <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                      <span className="text-red-500 font-medium">{formatTime(recordingTime)}</span>
                      <span className="text-gray-400 text-sm">Запись...</span>
                    </div>
                  ) : (
                    <textarea
                      value={inputText}
                      onChange={(e) => setInputText(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleSend();
                        }
                      }}
                      placeholder="Напишите сообщение..."
                      className="w-full bg-transparent border-none focus:ring-0 text-gray-100 px-4 py-3 max-h-32 resize-none outline-none"
                      rows={1}
                    />
                  )}
                </div>

                {inputText.trim() ? (
                  <button type="submit" className="p-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors shadow-md">
                    <Send size={22} />
                  </button>
                ) : (
                  <button 
                    type="button" 
                    onClick={toggleRecording}
                    className={clsx(
                      "p-3 rounded-xl transition-colors text-white shadow-sm",
                      isRecording ? "bg-red-500 hover:bg-red-600 shadow-md" : "bg-[#1a202c] border border-[#4a5568] hover:bg-[#4a5568] text-gray-400"
                    )}
                  >
                    {isRecording ? <Square size={22} /> : <Mic size={22} />}
                  </button>
                )}
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center flex-col text-gray-500 bg-[#1a202c]">
            <div className="w-20 h-20 bg-[#2d3748] rounded-full flex items-center justify-center mb-4 shadow-md">
              <MessageSquare size={32} />
            </div>
            <p className="text-gray-400">Выберите чат для начала общения</p>
          </div>
        )}
      </div>
    </div>
  );
}
