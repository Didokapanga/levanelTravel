// src/components/forms/ClientForm.tsx
import { useState } from "react";
import { Button } from "../Button";
import type { Clients } from "../../types/clients";

interface Props {
    initialData?: Partial<Clients>;
    onSubmit: (data: Partial<Clients>) => void;
    onCancel: () => void;
}

export default function ClientForm({ initialData, onSubmit, onCancel }: Props) {

    const [formData, setFormData] = useState<Partial<Clients>>({
        name: initialData?.name ?? "",
        client_type: initialData?.client_type ?? "individual",
        phone: initialData?.phone ?? "",
        email: initialData?.email ?? "",
        address: initialData?.address ?? "",
        contact_person: initialData?.contact_person ?? "",
        tax_number: initialData?.tax_number ?? ""
    });

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
    ) => {
        const { name, value } = e.target;

        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(formData);
    };

    return (
        <form onSubmit={handleSubmit} className="app-form">

            <div className="form-grid">

                <div className="form-field">
                    <label>Nom</label>
                    <input
                        name="name"
                        value={formData.name ?? ""}
                        onChange={handleChange}
                        required
                    />
                </div>

                <div className="form-field">
                    <label>Type de client</label>
                    <select
                        name="client_type"
                        value={formData.client_type ?? "individual"}
                        onChange={handleChange}
                        required
                    >
                        <option value="individual">Particulier</option>
                        <option value="company">Entreprise</option>
                    </select>
                </div>

                <div className="form-field">
                    <label>Téléphone</label>
                    <input
                        name="phone"
                        value={formData.phone ?? ""}
                        onChange={handleChange}
                    />
                </div>

                <div className="form-field">
                    <label>Email</label>
                    <input
                        type="email"
                        name="email"
                        value={formData.email ?? ""}
                        onChange={handleChange}
                    />
                </div>

                <div className="form-field">
                    <label>Adresse</label>
                    <input
                        name="address"
                        value={formData.address ?? ""}
                        onChange={handleChange}
                    />
                </div>

                <div className="form-field">
                    <label>Personne contact</label>
                    <input
                        name="contact_person"
                        value={formData.contact_person ?? ""}
                        onChange={handleChange}
                    />
                </div>

                <div className="form-field">
                    <label>Numéro fiscal / RCCM</label>
                    <input
                        name="tax_number"
                        value={formData.tax_number ?? ""}
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