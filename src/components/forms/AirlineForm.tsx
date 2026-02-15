import { useState } from "react";
import { Button } from "../Button";
import "../../styles/form.css";

interface AirlineFormData {
    code: string;
    name?: string;
}

interface AirlineFormProps {
    onSubmit: (data: AirlineFormData) => void;
    onCancel: () => void;
    initialData?: Partial<AirlineFormData>;
}

export default function AirlineForm({ onSubmit, onCancel, initialData }: AirlineFormProps) {
    const [formData, setFormData] = useState<AirlineFormData>({
        code: initialData?.code || "",
        name: initialData?.name || ""
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
                        value={formData.code}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div className="form-field">
                    <label>Nom complet (optionnel)</label>
                    <input
                        type="text"
                        name="name"
                        value={formData.name}
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
