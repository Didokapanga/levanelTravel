import { useState } from "react";
import { Button } from "../Button";
import "../../styles/form.css";
import type { Contract, ContractType, ContractStatus } from "../../types/contract";

interface Partner {
    id: string;
    name: string;
}

interface ContractFormProps {
    onSubmit: (data: Partial<Contract>) => void;
    onCancel: () => void;
    initialData?: Partial<Contract>;
    partners: Partner[]; // <-- liste des partenaires pour le champ
}

export default function ContractForm({ onSubmit, onCancel, initialData, partners }: ContractFormProps) {
    const [formData, setFormData] = useState<{
        partner_id: string;
        contract_type: ContractType;
        status: ContractStatus;
        start_date: string;
        end_date: string;
        description: string;
    }>({
        partner_id: initialData?.partner_id ?? "",
        contract_type: initialData?.contract_type ?? "caution_only",
        status: initialData?.status ?? "active",
        start_date: initialData?.start_date ?? "",
        end_date: initialData?.end_date ?? "",
        description: initialData?.description ?? "",
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(formData);
    };

    const contractTypes: ContractType[] = ['caution_only', 'caution_and_stock', 'agency_service'];
    const statuses: ContractStatus[] = ['active', 'inactive', 'expired', 'exhausted'];

    return (
        <form onSubmit={handleSubmit} className="app-form">

            {/* Ligne 1 */}
            <div className="form-row">
                <div className="form-field">
                    <label>Partenaire</label>
                    <select
                        name="partner_id"
                        value={formData.partner_id}
                        onChange={handleChange}
                        required
                    >
                        <option value="">Sélectionnez un partenaire</option>
                        {partners.map(p => (
                            <option key={p.id} value={p.id}>
                                {p.name} — {p.id.slice(0, 6)}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="form-field">
                    <label>Type de contrat</label>
                    <select
                        name="contract_type"
                        value={formData.contract_type}
                        onChange={handleChange}
                    >
                        {contractTypes.map(t => (
                            <option key={t} value={t}>{t}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Ligne 2 */}
            <div className="form-row">
                <div className="form-field">
                    <label>Date de début</label>
                    <input
                        type="date"
                        name="start_date"
                        value={(formData.start_date ?? "").slice(0, 10)}
                        onChange={handleChange}
                        required
                    />
                </div>

                <div className="form-field">
                    <label>Date de fin (optionnelle)</label>
                    <input
                        type="date"
                        name="end_date"
                        value={(formData.end_date ?? "").slice(0, 10)}
                        onChange={handleChange}
                    />
                </div>
            </div>

            {/* Ligne 3 */}
            <div className="form-row">
                <div className="form-field">
                    <label>Description</label>
                    <textarea
                        name="description"
                        value={formData.description || ""}
                        onChange={handleChange}
                        rows={3}
                    />
                </div>

                <div className="form-field">
                    <label>Status</label>
                    <select
                        name="status"
                        value={formData.status}
                        onChange={handleChange}
                    >
                        {statuses.map(s => (
                            <option key={s} value={s}>{s}</option>
                        ))}
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
