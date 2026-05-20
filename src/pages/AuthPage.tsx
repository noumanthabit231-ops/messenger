import React, { useState } from 'react';
import { useAuthStore } from '../store/authStore';
import { MessageSquare } from 'lucide-react';

export default function AuthPage() {
  const [username, setUsername] = useState('');
  const { login, isLoading } = useAuthStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (username.trim()) {
      await login(username.trim());
    }
  };

  return (
    <div className="min-h-[100dvh] bg-[#1a202c] flex items-center justify-center p-4 text-gray-100">
      <div className="max-w-md w-full bg-[#2d3748] rounded-2xl shadow-xl p-6 md:p-8 border border-[#4a5568]">
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center shadow-lg">
            <MessageSquare size={32} className="text-white" />
          </div>
        </div>
        
        <h1 className="text-3xl font-bold text-center mb-2 text-white tracking-wide">Risala</h1>
        <p className="text-gray-300 text-center text-sm mb-8">
          Введите ваш логин для авторизации или мгновенной регистрации
        </p>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-300 mb-2">
              Имя пользователя / Логин
            </label>
            <input
              id="username"
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-3 bg-[#1a202c] border border-[#4a5568] rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-white transition-all placeholder-gray-500 text-base"
              placeholder="Например: shamil_dev"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading || !username.trim()}
            className="w-full bg-blue-500 hover:bg-blue-600 text-white font-medium py-3 px-4 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center text-base shadow-md active:scale-[0.98] transform"
          >
            {isLoading ? (
              <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
            ) : (
              'Войти в аккаунт'
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
