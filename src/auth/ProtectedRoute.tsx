import { Navigate } from 'react-router-dom';
import { useAuth } from './AuthContext';
import type { JSX } from 'react';

interface ProtectedRouteProps {
    children: JSX.Element;
}

export const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
    const { isAuthenticated, isLoading } = useAuth();

    // Si on est en train de vérifier l'authentification, on peut afficher un loader
    if (isLoading) return <div>Chargement...</div>;

    // Si non authentifié, redirige vers login
    if (!isAuthenticated) return <Navigate to="/login" replace />;

    // Sinon, affiche le contenu protégé
    return children;
};
