import { useEffect, useState } from "react";
import { Button } from "../Button";

import { serviceService } from "../../services/ServiceService";
import type { OrtherOperations } from "../../types/orther_operations";

interface Props {
    initialData?: Partial<OrtherOperations>;
    onSubmit: (data: Partial<OrtherOperations>) => void;
    onCancel: () => void;
}

interface Option {
    id: string;
    label: string;
}

export default function OtherOperationForm({
    initialData,
    onSubmit,
    onCancel
}: Props) {

    const [services, setServices] = useState<Option[]>([]);

    const [formData, setFormData] = useState<Partial<OrtherOperations>>({
        service_id: initialData?.service_id ?? "",
        client_name: initialData?.client_name ?? "",
        total_amount: initialData?.total_amount ?? 0,
        service_fee: initialData?.service_fee ?? 0,
        observation: initialData?.observation ?? "",
        date_demande: initialData?.date_demande ?? "",
        date_emission: initialData?.date_emission ?? ""
    });

    useEffect(() => {
        serviceService.getAll().then(s =>
            setServices(s.map(x => ({ id: x.id, label: x.name ?? "" })))
        );
    }, []);

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
    ) => {
        const { name, value } = e.target;

        setFormData(prev => ({
            ...prev,
            [name]: ["total_amount", "service_fee"].includes(name)
                ? parseFloat(value)
                : value
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
                    <label>Service</label>
                    <select
                        name="service_id"
                        value={formData.service_id}
                        onChange={handleChange}
                    >
                        <option value="">-- sélectionner --</option>
                        {services.map(s =>
                            <option key={s.id} value={s.id}>{s.label}</option>
                        )}
                    </select>
                </div>

                <div className="form-field">
                    <label>Client</label>
                    <input
                        name="client_name"
                        value={formData.client_name}
                        onChange={handleChange}
                        required
                    />
                </div>

                <div className="form-field">
                    <label>Montant</label>
                    <input
                        type="number"
                        step="0.01"
                        name="total_amount"
                        value={formData.total_amount ?? ""}
                        onChange={handleChange}
                    />
                </div>

                <div className="form-field">
                    <label>Frais service</label>
                    <input
                        type="number"
                        step="0.01"
                        name="service_fee"
                        value={formData.service_fee ?? ""}
                        onChange={handleChange}
                        required
                    />
                </div>

                <div className="form-field">
                    <label>Date demande</label>
                    <input
                        type="date"
                        name="date_demande"
                        value={formData.date_demande?.slice(0, 10) || ""}
                        onChange={handleChange}
                    />
                </div>

                <div className="form-field">
                    <label>Date émission</label>
                    <input
                        type="date"
                        name="date_emission"
                        value={formData.date_emission?.slice(0, 10) || ""}
                        onChange={handleChange}
                    />
                </div>

                <div className="form-field">
                    <label>Observation</label>
                    <input
                        name="observation"
                        value={formData.observation ?? ""}
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
