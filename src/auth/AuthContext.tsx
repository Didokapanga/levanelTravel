// src/contexts/AuthContext.tsx
import { createContext, useContext, useEffect, useState } from 'react';
import { userService } from '../services/UserService';
import bcrypt from 'bcryptjs';

interface User {
    username: string;
    role: string;
}

interface AuthContextType {
    isAuthenticated: boolean;
    isLoading: boolean;
    user: User | null;
    login: (username: string, password: string) => Promise<void>;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [user, setUser] = useState<User | null>(null);

    useEffect(() => {
        const storedUser = localStorage.getItem('auth_user');
        if (storedUser) {
            const parsed = JSON.parse(storedUser);
            setUser(parsed);
            setIsAuthenticated(true);
        }
        setIsLoading(false);
    }, []);

    const login = async (username: string, password: string) => {
        // ✅ Cas admin hors DB
        if (username === 'admin') {
            const adminPassword = 'motdepasse123'; // <- ton mot de passe admin fixe
            if (password !== adminPassword) {
                throw new Error('Mot de passe admin incorrect');
            }
            const authUser: User = { username: 'admin', role: 'admin' };
            setUser(authUser);
            setIsAuthenticated(true);
            localStorage.setItem('auth_user', JSON.stringify(authUser));
            return;
        }

        // 🔹 Cas utilisateur normal via DB
        const users = await userService.findByUsername(username);
        if (!users.length) throw new Error('Utilisateur non trouvé');

        const u = users[0];

        // Vérifier le mot de passe hashé
        const valid = bcrypt.compareSync(password, u.password!);
        if (!valid) throw new Error('Mot de passe incorrect');

        const authUser: User = { username: u.username, role: u.role };
        setUser(authUser);
        setIsAuthenticated(true);
        localStorage.setItem('auth_user', JSON.stringify(authUser));
    };

    const logout = () => {
        setUser(null);
        setIsAuthenticated(false);
        localStorage.removeItem('auth_user');
    };

    return (
        <AuthContext.Provider
            value={{ isAuthenticated, isLoading, user, login, logout }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
    return ctx;
};
