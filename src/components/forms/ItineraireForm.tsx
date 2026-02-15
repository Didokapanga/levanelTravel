import { useState } from "react";
import { Button } from "../Button";
import "../../styles/form.css";
import type { Itineraire } from "../../types/Itineraire";

interface ItineraireFormProps {
    onSubmit: (data: Partial<Itineraire>) => void;
    onCancel: () => void;
    initialData?: Partial<Itineraire>;
}

export default function ItineraireForm({ onSubmit, onCancel, initialData }: ItineraireFormProps) {
    const [formData, setFormData] = useState<Partial<Itineraire>>({
        code: initialData?.code || "",
        country: initialData?.country || "",
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
                    <label>Code</label>
                    <input
                        type="text"
                        name="code"
                        value={formData.code || ""}
                        onChange={handleChange}
                    />
                </div>

                <div className="form-field">
                    <label>Pays</label>
                    <input
                        type="text"
                        name="country"
                        value={formData.country || ""}
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
