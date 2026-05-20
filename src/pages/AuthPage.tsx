import React, { useState } from 'react';
import { useAuthStore } from '../store/authStore';
import { MessageSquare, Lock, User, Menu } from 'lucide-react';

export default function AuthPage() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [username, setUsername] = useState('');
  const [fullName, setFullName] = useState('');
  const [password, setPassword] = useState('');
  
  const { login, register, isLoading } = useAuthStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) return;

    if (isSignUp) {
      await register(username.trim(), fullName.trim() || username.trim(), password);
    } else {
      await login(username.trim(), password);
    }
  };

  return (
    <div className="min-h-[100dvh] bg-[#1a202c] flex items-center justify-center p-4 text-gray-100">
      <div className="max-w-md w-full bg-[#2d3748] rounded-2xl shadow-2xl p-6 md:p-8 border border-[#4a5568]">
        <div className="flex justify-center mb-4">
          <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center shadow-lg">
            <MessageSquare size={32} className="text-white" />
          </div>
        </div>
        
        <h1 className="text-3xl font-bold text-center mb-1 text-white tracking-wider">Risala</h1>
        <p className="text-gray-300 text-center text-xs md:text-sm mb-6">
          {isSignUp ? 'Создайте защищенный аккаунт в мессенджере' : 'Вход в систему по логину и паролю'}
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-300 mb-1.5 uppercase tracking-wider">Логин (Латиница)</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-gray-400"><User size={18} /></span>
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value.replace(/[^a-zA-Z0-9_]/g, ''))}
                className="w-full pl-10 pr-4 py-3 bg-[#1a202c] border border-[#4a5568] rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-white text-sm"
                placeholder="shamil_dev"
              />
            </div>
          </div>

          {isSignUp && (
            <div>
              <label className="block text-xs font-medium text-gray-300 mb-1.5 uppercase tracking-wider">Ваше имя для отображения</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-gray-400"><Menu size={18} /></span>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-[#1a202c] border border-[#4a5568] rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-white text-sm"
                  placeholder="Шамиль"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-gray-300 mb-1.5 uppercase tracking-wider">Пароль</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-gray-400"><Lock size={18} /></span>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-[#1a202c] border border-[#4a5568] rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-white text-sm"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-blue-500 hover:bg-blue-600 text-white font-medium py-3 rounded-xl transition-all shadow-md flex items-center justify-center text-sm transform active:scale-[0.98]"
          >
            {isLoading ? (
              <div className="animate-spin rounded-full h-5 w-5 border-2 border-t-transparent border-white"></div>
            ) : isSignUp ? (
              'Зарегистрироваться'
            ) : (
              'Войти в аккаунт'
            )}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button
            onClick={() => setIsSignUp(!isSignUp)}
            className="text-xs text-blue-400 hover:underline outline-none"
          >
            {isSignUp ? 'Уже есть аккаунт? Войти' : 'Нет аккаунта? Зарегистрироваться'}
          </button>
        </div>
      </div>
    </div>
  );
}
