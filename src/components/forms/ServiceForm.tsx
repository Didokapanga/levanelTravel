import { useState } from "react";
import { Button } from "../Button";
import "../../styles/form.css";

interface ServiceFormData {
    name: string;
    initial?: string;
}

interface ServiceFormProps {
    onSubmit: (data: ServiceFormData) => void;
    onCancel: () => void;
    initialData?: Partial<ServiceFormData>;
}

export default function ServiceForm({ onSubmit, onCancel, initialData }: ServiceFormProps) {
    const [formData, setFormData] = useState<ServiceFormData>({
        name: initialData?.name || "",
        initial: initialData?.initial || ""
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
                    <label>Nom du service</label>
                    <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                    />
                </div>

                <div className="form-field">
                    <label>Initial (optionnel)</label>
                    <input
                        type="text"
                        name="initial"
                        value={formData.initial}
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
