import { Outlet, NavLink } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { MessageSquare, Users, UserPlus, Image as ImageIcon, LogOut, Bell } from 'lucide-react';

export default function Layout() {
  const { user, logout } = useAuthStore();

  const navItems = [
    { to: '/messages', icon: MessageSquare, label: 'Сообщения' },
    { to: '/friends', icon: Users, label: 'Друзья' },
    { to: '/people', icon: UserPlus, label: 'Люди' },
    { to: '/feed', icon: ImageIcon, label: 'Лента' },
  ];

  return (
    // Используем 100dvh для корректной высоты на мобилках и базовый темный фон #1a202c
    <div className="flex flex-col md:flex-row h-[100dvh] bg-[#1a202c] text-gray-100 font-sans">
      
      {/* Десктопный сайдбар (Скрыт на телефонах) */}
      <aside className="hidden md:flex w-64 bg-[#2d3748] border-r border-[#4a5568] flex-col">
        <div className="p-4 border-b border-[#4a5568] flex items-center space-x-3 shrink-0">
          <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-xl font-bold overflow-hidden shadow-sm">
            {user?.avatar_url ? (
              <img src={user.avatar_url} alt={user.username} className="w-full h-full object-cover" />
            ) : (
              user?.username?.charAt(0).toUpperCase()
            )}
          </div>
          <div>
            <h2 className="font-semibold text-white truncate w-40">{user?.full_name || user?.username}</h2>
            <p className="text-xs text-gray-300">@{user?.username}</p>
          </div>
        </div>

        <nav className="flex-1 p-4 flex flex-col gap-2 overflow-y-auto no-scrollbar">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center space-x-3 px-4 py-3 rounded-xl transition-colors ${
                  isActive
                    ? 'bg-blue-500 text-white shadow-md'
                    : 'text-gray-300 hover:bg-[#4a5568] hover:text-white'
                }`
              }
            >
              <item.icon size={20} />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-[#4a5568] shrink-0">
          <button onClick={logout} className="flex items-center space-x-3 text-gray-300 hover:text-white px-4 py-2 w-full transition-colors">
            <LogOut size={20} />
            <span>Выйти</span>
          </button>
        </div>
      </aside>

      {/* Основной контент */}
      <main className="flex-1 flex flex-col overflow-hidden relative">
        <header className="h-16 border-b border-[#4a5568] bg-[#2d3748] flex items-center justify-between px-4 md:px-6 shrink-0 shadow-sm z-10">
          <h1 className="text-2xl font-bold text-white tracking-wide">Risala</h1>
          <div className="flex items-center space-x-4">
            <button className="text-gray-300 hover:text-white relative p-2">
              <Bell size={22} />
              <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 border-2 border-[#2d3748] rounded-full"></span>
            </button>
          </div>
        </header>
        
        {/* Добавляем pb-[72px] на мобилках, чтобы контент не перекрывался нижним меню */}
        <div className="flex-1 overflow-auto bg-[#1a202c] pb-[72px] md:pb-0 scroll-smooth no-scrollbar">
          <Outlet />
        </div>
      </main>

      {/* Мобильная нижняя навигация */}
      <nav className="md:hidden fixed bottom-0 w-full bg-[#2d3748] border-t border-[#4a5568] flex justify-around items-center h-[72px] px-2 z-50 pb-safe shadow-lg">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors ${
                isActive ? 'text-blue-400' : 'text-gray-400 hover:text-gray-200'
              }`
            }
          >
            <item.icon size={24} />
            <span className="text-[10px] font-medium">{item.label}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  );
}