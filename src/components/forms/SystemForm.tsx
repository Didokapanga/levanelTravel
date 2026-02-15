import { useState } from "react";
import { Button } from "../Button";
import "../../styles/form.css";
import type { System } from "../../types/systems";

interface SystemFormProps {
    onSubmit: (data: Partial<System>) => void;
    onCancel: () => void;
    initialData?: Partial<System>;
}

export default function SystemForm({ onSubmit, onCancel, initialData }: SystemFormProps) {
    const [formData, setFormData] = useState<Partial<System>>({
        name: initialData?.name || "",
        description: initialData?.description || "",
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(formData);
    };

    return (
        <form onSubmit={handleSubmit} className="app-form">
            <div className="form-row">
                <div className="form-field">
                    <label>Nom du système</label>
                    <input
                        type="text"
                        name="name"
                        value={formData.name || ""}
                        onChange={handleChange}
                        required
                    />
                </div>

                <div className="form-field">
                    <label>Code (optionnel)</label>
                    <input
                        type="text"
                        name="description"
                        value={formData.description || ""}
                        onChange={handleChange}
                    />
                </div>
            </div>

            <div className="form-actions">
                <Button label="Annuler" variant="secondary" onClick={onCancel} />
                <Button label="Enregistrer" variant="primary" />
            </div>
        </form>
    );
}
