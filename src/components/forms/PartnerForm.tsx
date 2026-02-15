import { useState } from "react";
import { Button } from "../Button";
import "../../styles/form.css";

type PartnerType = "airline" | "agency" | "supplier" | "other";

interface PartnerFormData {
    name: string;
    type: PartnerType;
}

interface PartnerFormProps {
    onSubmit: (data: PartnerFormData) => void;
    onCancel: () => void;
    initialData?: Partial<PartnerFormData>;
}

export default function PartnerForm({ onSubmit, onCancel, initialData }: PartnerFormProps) {
    const [formData, setFormData] = useState<PartnerFormData>({
        name: initialData?.name || "",
        type: initialData?.type || "agency"
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
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
                    <label>Nom du partenaire</label>
                    <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                    />
                </div>

                <div className="form-field">
                    <label>Type de partenaire</label>
                    <select
                        name="type"
                        value={formData.type}
                        onChange={handleChange}
                    >
                        <option value="airline">Compagnie aérienne</option>
                        <option value="agency">Agence</option>
                        <option value="supplier">Fournisseur</option>
                        <option value="other">Autre</option>
                    </select>
                </div>
            </div>

            <div className="form-actions">
                <Button label="Annuler" variant="secondary" onClick={onCancel} />
                <Button label="Enregistrer" variant="primary" />
            </div>

        </form>
    );
}
