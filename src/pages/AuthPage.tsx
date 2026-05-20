import React, { useState } from 'react';
import { useAuthStore } from '../store/authStore';
import { MessageSquare } from 'lucide-react';
import { isSupabaseConfigured } from '../lib/supabase';

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
    <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4 text-white">
      <div className="max-w-md w-full bg-gray-900 rounded-2xl shadow-xl p-8 border border-gray-800">
        <div className="flex justify-center mb-8">
          <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center">
            <MessageSquare size={32} className="text-white" />
          </div>
        </div>
        
        <h1 className="text-3xl font-bold text-center mb-2 text-white">Добро пожаловать</h1>
        <p className="text-gray-400 text-center mb-8">
          {isSupabaseConfigured 
            ? 'Войдите в свой аккаунт' 
            : 'Демонстрационный режим. Введите любое имя пользователя.'}
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-400 mb-2">
              Имя пользователя (Login)
            </label>
            <input
              id="username"
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-white transition-all"
              placeholder="Введите логин..."
            />
          </div>

          <button
            type="submit"
            disabled={isLoading || !username.trim()}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {isLoading ? (
              <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
            ) : (
              'Войти / Создать'
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
