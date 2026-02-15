import { Navigate } from 'react-router-dom';
import { useAuth } from './AuthContext';
import type { JSX } from 'react';

interface PublicRouteProps {
  children: JSX.Element;
}

export const PublicRoute = ({ children }: PublicRouteProps) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) return <div>Chargement...</div>;

  // Si déjà authentifié, redirige vers la page principale (dashboard)
  if (isAuthenticated) return <Navigate to="/" replace />;

  return children;
};
