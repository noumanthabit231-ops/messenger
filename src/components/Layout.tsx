import { Outlet, NavLink } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { useBadgeStore } from '../store/badgeStore';
import { MessageSquare, Users, Image as ImageIcon, LogOut, Bell, User } from 'lucide-react';
import clsx from 'clsx';

export default function Layout() {
  const { user, logout } = useAuthStore();
  const { unreadMessages, pendingRequests } = useBadgeStore();

  const navItems = [
    { to: '/messages', icon: MessageSquare, label: 'Сообщения', badge: unreadMessages },
    { to: '/friends', icon: Users, label: 'Друзья', badge: pendingRequests },
    { to: '/feed', icon: ImageIcon, label: 'Лента' },
    { to: '/profile', icon: User, label: 'Профиль' },
  ];

  const totalNotifications = unreadMessages + pendingRequests;

  return (
    <div className="flex flex-col md:flex-row h-[100dvh] bg-[#1a202c] text-gray-100 font-sans overflow-hidden">
      
      {/* Десктопная панель */}
      <aside className="hidden md:flex w-64 bg-[#2d3748] border-r border-[#4a5568] flex-col shrink-0">
        <div className="p-4 border-b border-[#4a5568] flex items-center space-x-3 shrink-0">
          <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-xl font-bold overflow-hidden shadow-inner shrink-0">
            {user?.avatar_url ? (
              <img src={user.avatar_url} alt="" className="w-full h-full object-cover" />
            ) : (
              user?.username?.charAt(0).toUpperCase()
            )}
          </div>
          <div className="min-w-0">
            <h2 className="font-semibold text-white truncate w-40 text-sm">{user?.full_name || user?.username}</h2>
            <p className="text-xs text-gray-400 truncate">@{user?.username}</p>
          </div>
        </div>

        <nav className="flex-1 p-4 flex flex-col gap-1.5 overflow-y-auto no-scrollbar">
          {navItems.map((item) => (
            <NavLink key={item.to} to={item.to} className={({ isActive }) => clsx("flex items-center space-x-3 px-4 py-3 rounded-xl transition-all font-medium text-sm", isActive ? 'bg-blue-500 text-white shadow-md' : 'text-gray-300 hover:bg-[#4a5568] hover:text-white')}>
              <div className="relative">
                <item.icon size={18} />
                {item.badge ? (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full shadow-sm">{item.badge}</span>
                ) : null}
              </div>
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-[#4a5568] shrink-0">
          <button onClick={logout} className="flex items-center space-x-3 text-gray-300 hover:text-red-400 px-4 py-2.5 w-full transition-colors font-medium text-sm rounded-xl hover:bg-[#4a5568]/50">
            <LogOut size={18} />
            <span>Выйти</span>
          </button>
        </div>
      </aside>

      {/* Центральная часть */}
      <main className="flex-1 flex flex-col overflow-hidden relative min-w-0">
        <header className="h-16 border-b border-[#4a5568] bg-[#2d3748] flex items-center justify-between px-4 md:px-6 shrink-0 shadow-sm z-10">
          <h1 className="text-2xl font-bold text-white tracking-wider">Risala</h1>
          <button className="text-gray-300 hover:text-white relative p-1.5 rounded-lg active:bg-[#4a5568]">
            <Bell size={22} />
            {totalNotifications > 0 && <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-500 border border-[#2d3748] rounded-full"></span>}
          </button>
        </header>
        
        <div className="flex-1 overflow-hidden bg-[#1a202c] pb-[72px] md:pb-0 relative">
          <Outlet />
        </div>
      </main>

      {/* Мобильная навигация */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-[#2d3748] border-t border-[#4a5568] flex justify-around items-center h-[72px] px-2 z-50 shadow-2xl pb-safe">
        {navItems.map((item) => (
          <NavLink key={item.to} to={item.to} className={({ isActive }) => clsx("flex flex-col items-center justify-center w-full h-full space-y-1 transition-all", isActive ? 'text-blue-400 scale-105' : 'text-gray-400 active:text-gray-200')}>
            <div className="relative">
              <item.icon size={22} />
              {item.badge ? (
                <span className="absolute -top-1.5 -right-2 bg-red-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full border border-[#2d3748]">{item.badge}</span>
              ) : null}
            </div>
            <span className="text-[10px] font-medium tracking-wide">{item.label}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
