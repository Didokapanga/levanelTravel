import { useState } from "react";
import { Button } from "../Button";
import "../../styles/form.css";

export type UserRole = "agent" | "manager" | "comptable" | "admin";

interface UserFormData {
    username: string;
    full_name: string;
    email: string;
    password: string;
    role: UserRole;
    is_active: boolean;
}

interface UserFormProps {
    onSubmit: (data: UserFormData) => void;
    onCancel: () => void;
    initialData?: Partial<UserFormData>; // pour edition plus tard
}

export default function UserForm({
    onSubmit,
    onCancel,
    initialData
}: UserFormProps) {

    const [formData, setFormData] = useState<UserFormData>({
        username: initialData?.username || "",
        full_name: initialData?.full_name || "",
        email: initialData?.email || "",
        password: "",
        role: initialData?.role || "agent",
        is_active: initialData?.is_active ?? true
    });

    const [showPassword, setShowPassword] = useState(false);

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
    ) => {
        const { name, value, type } = e.target;

        if (type === "checkbox") {
            setFormData(prev => ({
                ...prev,
                [name]: (e.target as HTMLInputElement).checked
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                [name]: value
            }));
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(formData);
    };

    return (
        <form onSubmit={handleSubmit} className="app-form">

            {/* Ligne 1 */}
            <div className="form-row">
                <div className="form-field">
                    <label>Nom d'utilisateur</label>
                    <input
                        type="text"
                        name="username"
                        value={formData.username}
                        onChange={handleChange}
                        required
                    />
                </div>

                <div className="form-field">
                    <label>Nom complet</label>
                    <input
                        type="text"
                        name="full_name"
                        value={formData.full_name}
                        onChange={handleChange}
                        required
                    />
                </div>
            </div>

            {/* Ligne 2 */}
            <div className="form-row">
                <div className="form-field">
                    <label>Email</label>
                    <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                    />
                </div>

                <div className="form-field">
                    <label>Mot de passe</label>
                    <div className="password-field">
                        <input
                            type={showPassword ? "text" : "password"}
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            required={!initialData}
                        />
                        <button
                            type="button"
                            className="toggle-password"
                            onClick={() => setShowPassword(v => !v)}
                        >
                            {showPassword ? "Masquer" : "Afficher"}
                        </button>
                    </div>
                </div>
            </div>

            {/* Ligne 3 */}
            <div className="form-row">
                <div className="form-field">
                    <label>Rôle</label>
                    <select
                        name="role"
                        value={formData.role}
                        onChange={handleChange}
                    >
                        <option value="agent">Agent</option>
                        <option value="manager">Manager</option>
                        <option value="comptable">Comptable</option>
                        <option value="admin">Admin</option>
                    </select>
                </div>

                <div className="form-field checkbox-field">
                    <label className="checkbox-label">
                        <input
                            type="checkbox"
                            name="is_active"
                            checked={formData.is_active}
                            onChange={handleChange}
                        />
                        Utilisateur actif
                    </label>
                </div>
            </div>

            <div className="form-actions">
                <Button label="Annuler" variant="secondary" onClick={onCancel} />
                <Button label="Enregistrer" variant="primary" />
            </div>

        </form>
    );
}
