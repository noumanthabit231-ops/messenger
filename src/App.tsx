import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/authStore';
import { useBadgeStore } from './store/badgeStore';
import Layout from './components/Layout';
import AuthPage from './pages/AuthPage';
import MessagesPage from './pages/MessagesPage';
import FriendsPage from './pages/FriendsPage';
import FeedPage from './pages/FeedPage';
import ProfilePage from './pages/ProfilePage';

function App() {
  const { isAuthenticated, isLoading, checkAuth, user } = useAuthStore();
  const { initBadges, cleanup } = useBadgeStore();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  useEffect(() => {
    if (isAuthenticated && user?.id) {
      initBadges(user.id);
      return () => cleanup();
    }
  }, [isAuthenticated, user, initBadges, cleanup]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[100dvh] bg-[#1a202c] text-white">
        <div className="animate-spin rounded-full h-12 w-12 border-2 border-t-transparent border-blue-500"></div>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        {!isAuthenticated ? (
          <>
            <Route path="/auth" element={<AuthPage />} />
            <Route path="*" element={<Navigate to="/auth" replace />} />
          </>
        ) : (
          <Route element={<Layout />}>
            <Route path="/" element={<Navigate to="/messages" replace />} />
            <Route path="/messages/*" element={<MessagesPage />} />
            <Route path="/friends" element={<FriendsPage />} />
            <Route path="/feed" element={<FeedPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="*" element={<Navigate to="/messages" replace />} />
          </Route>
        )}
      </Routes>
    </BrowserRouter>
  );
}

export default App;
