import React, { type ReactNode } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { TOKEN_COOKIE_KEY, USER_COOKIE_KEY } from '@/utils/constants';
import { BrowserStorage } from '@/utils/browserStorage';

const ProtectedRoute = () => {
  const { isAuthenticated } = useAuth();
  const token = BrowserStorage.getLocalStorage(TOKEN_COOKIE_KEY);

  if (!isAuthenticated && !token) {
    BrowserStorage.deleteLocalStorage(USER_COOKIE_KEY);
    BrowserStorage.deleteLocalStorage(TOKEN_COOKIE_KEY);
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;