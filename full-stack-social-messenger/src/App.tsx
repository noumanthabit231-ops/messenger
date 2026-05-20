import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/authStore';
import Layout from './components/Layout';
import AuthPage from './pages/AuthPage';
import MessagesPage from './pages/MessagesPage';
import PeoplePage from './pages/PeoplePage';
import FriendsPage from './pages/FriendsPage';
import FeedPage from './pages/FeedPage';

function App() {
  const { isAuthenticated, isLoading, checkAuth } = useAuthStore();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900 text-white">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
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
            <Route path="/people" element={<PeoplePage />} />
            <Route path="/friends" element={<FriendsPage />} />
            <Route path="/feed" element={<FeedPage />} />
            <Route path="*" element={<Navigate to="/messages" replace />} />
          </Route>
        )}
      </Routes>
    </BrowserRouter>
  );
}

export default App;
