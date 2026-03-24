import { useAuth } from "../auth/AuthContext";

let currentUserId: string | null = null;

// Hook React pour mettre à jour currentUserId
export const useCurrentUser = () => {
    const { user } = useAuth();
    currentUserId = user?.username ?? null;
    return user;
};

// Fonction pour accéder à l’utilisateur en dehors de React
export const getCurrentUserId = (): string | null => currentUserId;