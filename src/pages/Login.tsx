import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { supabaseSyncService } from '../services/SupabaseSyncService';
import Alert from '../components/Alert';
import '../styles/login.css'

export default function Login() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    const { login } = useAuth();
    const navigate = useNavigate();

    // 🔹 Sync initial des users
    useEffect(() => {
        const syncUsers = async () => {
            try {
                setLoading(true);
                // Sync seulement la table users pour accélérer
                await supabaseSyncService.syncTable("users");
            } catch (err: any) {
                console.error("Erreur sync initiale:", err);
            } finally {
                setLoading(false);
            }
        };

        syncUsers();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (loading) return; // bloque login tant que sync pas terminée

        try {
            // Login maintenant que Dexie est à jour
            await login(username, password);
            setError(null);
            navigate('/');
        } catch (err: any) {
            setError(err.message || 'Identifiants invalides');
        }
    };

    return (
        <div className="login-page">
            <div className="login-card">
                <div className="login-card-header">
                    <div className="login-logo">
                        <img src="/logo.png" alt="Logo ERP" />
                    </div>
                    <p>Accès sécurisé à l’application</p>
                </div>

                <form className="login-card-body" onSubmit={handleSubmit}>
                    {loading && <p>Chargement des utilisateurs… ⏳</p>}
                    {error && <Alert type="error" message={error} onClose={() => setError(null)} />}

                    <div className="login-field">
                        <label>Prenom</label>
                        <input
                            placeholder="Ex : vannel"
                            value={username}
                            onChange={e => setUsername(e.target.value)}
                            disabled={loading}
                        />
                    </div>

                    <div className="login-field">
                        <label>Mot de passe</label>
                        <div className="password-wrapper">
                            <input
                                type={showPassword ? 'text' : 'password'}
                                placeholder="••••••••"
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                disabled={loading}
                            />
                            <button
                                type="button"
                                className="password-toggle"
                                onClick={() => setShowPassword(v => !v)}
                                aria-label={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
                            >
                                {showPassword ? '🙈' : '👁️'}
                            </button>
                        </div>
                    </div>

                    <button type="submit" className="login-button" disabled={loading}>
                        Se connecter
                    </button>
                </form>
            </div>
        </div>
    );
}