// src/pages/Profile.tsx
import { useEffect, useState } from "react";
import { Button } from "../components/Button";
import { Modal } from "../components/Modal";
import Alert from "../components/Alert";
import { useAuth } from "../auth/AuthContext";
import { userService } from "../services/UserService";
import type { User } from "../types/users";
import "../styles/pages.css";

export default function Profile() {
    const { user: authUser, login } = useAuth();
    const [user, setUser] = useState<User | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [alert, setAlert] = useState<{ message: string; type: "success" | "error" | "info" | "warning" } | null>(null);

    const [formData, setFormData] = useState<Partial<User>>({
        full_name: "",
        email: "",
        password: "",
    });

    // Charger les données de l'utilisateur connecté
    useEffect(() => {
        if (authUser) {
            // ⚡️ Récupérer les infos à jour depuis la DB
            userService.findByUsername(authUser.username).then(users => {
                if (users.length > 0) {
                    setUser(users[0]);
                    setFormData({
                        full_name: users[0].full_name,
                        email: users[0].email,
                    });
                }
            });
        }
    }, [authUser]);

    // Gestion du formulaire
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async () => {
        if (!user) return;
        try {
            // Si le password est vide, on ne le met pas à jour
            const updates: Partial<User> = {
                full_name: formData.full_name,
                email: formData.email,
            };
            if (formData.password && formData.password.trim() !== "") {
                updates.password = formData.password;
            }

            const updatedUser = await userService.update(user.id, updates);
            if (updatedUser) {
                setUser(updatedUser);
                setAlert({ message: "Profil mis à jour avec succès !", type: "success" });
                setIsModalOpen(false);
            } else {
                setAlert({ message: "Impossible de mettre à jour le profil.", type: "error" });
            }
        } catch (err: any) {
            setAlert({ message: err.message || "Erreur lors de la mise à jour", type: "error" });
        }
    };

    return (
        <div className="page-container">
            <div className="page-header">
                <div className="page-header-left">
                    <h1>Profil utilisateur</h1>
                    <p>Gérez vos informations personnelles</p>
                </div>
            </div>

            {alert && (
                <Alert
                    type={alert.type}
                    message={alert.message}
                    onClose={() => setAlert(null)}
                />
            )}

            <div className="profile-card">
                <p>
                    <strong>Nom complet:</strong> {user?.full_name}
                </p>
                <p>
                    <strong>Email:</strong> {user?.email}
                </p>
                <p>
                    <strong>Rôle:</strong> {user?.role}
                </p>

                <Button
                    label="Modifier le profil"
                    variant="primary"
                    onClick={() => setIsModalOpen(true)}
                />
            </div>

            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title="Modifier mon profil"
            >
                <div className="form-group">
                    <label>Nom complet</label>
                    <input
                        type="text"
                        name="full_name"
                        value={formData.full_name || ""}
                        onChange={handleChange}
                        placeholder="Votre nom complet"
                    />
                </div>

                <div className="form-group">
                    <label>Email</label>
                    <input
                        type="email"
                        name="email"
                        value={formData.email || ""}
                        onChange={handleChange}
                        placeholder="Votre email"
                    />
                </div>

                <div className="form-group">
                    <label>Mot de passe (laisser vide pour ne pas changer)</label>
                    <input
                        type="password"
                        name="password"
                        value={formData.password || ""}
                        onChange={handleChange}
                        placeholder="Nouveau mot de passe"
                    />
                </div>

                <div style={{ display: "flex", gap: "10px", marginTop: "15px" }}>
                    <Button
                        label="Annuler"
                        variant="secondary"
                        onClick={() => setIsModalOpen(false)}
                    />
                    <Button
                        label="Enregistrer"
                        variant="primary"
                        onClick={handleSubmit}
                    />
                </div>
            </Modal>
        </div>
    );
}
