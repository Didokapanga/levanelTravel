import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import Alert from '../components/Alert'; // Assure-toi que le chemin est correct
import '../styles/login.css'

export default function Login() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            await login(username, password); // ici tu passes les deux
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
                    {/* Logo */}
                    <div className="login-logo">
                        <img src="/logo.png" alt="Logo ERP" />
                    </div>

                    {/* Header */}
                    <p>Accès sécurisé à l’application</p>
                </div>

                <form className="login-card-body" onSubmit={handleSubmit}>
                    {/* ⚡ Affichage des erreurs */}
                    {error && <Alert type="error" message={error} onClose={() => setError(null)} />}

                    <div className="login-field">
                        <label>Prenom</label>
                        <input
                            placeholder="Ex : vannel"
                            value={username}
                            onChange={e => setUsername(e.target.value)}
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

                    <button type="submit" className="login-button">
                        Se connecter
                    </button>
                </form>
            </div>
        </div>
    );
}
