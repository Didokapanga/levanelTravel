import { useEffect, useState } from "react";
import { Button } from "../Button";

import { serviceService } from "../../services/ServiceService";
import { clientService } from "../../services/ClientService";
import type { OrtherOperations } from "../../types/orther_operations";
import { otherOperationService } from "../../services/OtherOperationService";

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
    const [clients, setClients] = useState<Option[]>([]);

    const [formData, setFormData] = useState<Partial<OrtherOperations>>({
        service_id: initialData?.service_id ?? "",
        client_id: initialData?.client_id ?? "",
        total_amount: initialData?.total_amount ?? 0,
        service_fee: initialData?.service_fee ?? 0,
        observation: initialData?.observation ?? "",
        date_demande: initialData?.date_demande ?? "",
        receipt_reference: initialData?.receipt_reference ?? "", // ✅ AJOUT
        status: initialData?.status ?? "pending"
    });

    useEffect(() => {
        // Charger tous les services
        serviceService.getAll().then(s =>
            setServices(s.map(x => ({ id: x.id, label: x.name ?? "" })))
        );

        // Charger tous les clients
        clientService.getAll().then(c =>
            setClients(c.map(x => ({ id: x.id, label: x.name ?? "" })))
        );
    }, []);

    useEffect(() => {

        const generateReceiptReference = async (dateStr: string) => {

            try {

                const existingOps = await otherOperationService.getByDate(dateStr);

                const numbers = existingOps
                    .map((op: OrtherOperations) => {

                        const parts = op.receipt_reference?.split("-");

                        return parts?.length === 4
                            ? parseInt(parts[3], 10)
                            : 0;

                    })
                    .filter((n: number) => !isNaN(n));

                const maxNumber =
                    numbers.length > 0
                        ? Math.max(...numbers)
                        : 0;

                const nextNumber = maxNumber + 1;

                const numberStr =
                    String(nextNumber).padStart(4, "0");

                return `${dateStr}-${numberStr}`;

            } catch (err) {

                console.error("Erreur génération référence :", err);

                return `${dateStr}-0001`;

            }

        };

        const updateReference = async () => {

            const date =
                formData.date_demande
                    ? formData.date_demande.slice(0, 10)
                    : new Date().toISOString().slice(0, 10);

            const ref = await generateReceiptReference(date);

            setFormData(prev => ({
                ...prev,
                receipt_reference: ref
            }));

        };

        updateReference();

    }, [formData.date_demande]);

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
                        required
                    >
                        <option value="">-- sélectionner --</option>
                        {services.map(s =>
                            <option key={s.id} value={s.id}>{s.label}</option>
                        )}
                    </select>
                </div>

                <div className="form-field">
                    <label>Client</label>
                    <select
                        name="client_id"
                        value={formData.client_id}
                        onChange={handleChange}
                        required
                    >
                        <option value="">-- sélectionner --</option>
                        {clients.map(c =>
                            <option key={c.id} value={c.id}>{c.label}</option>
                        )}
                    </select>
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
                        required
                    />
                </div>

                <div className="form-field">
                    <label>Référence reçu</label>
                    <input
                        name="receipt_reference"
                        value={formData.receipt_reference ?? ""}
                        readOnly
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