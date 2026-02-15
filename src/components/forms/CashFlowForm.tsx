// src/components/forms/CashFlowForm.tsx
import { useState, useEffect } from "react";
import { Button } from "../Button";
import type { CashFlow } from "../../types/cash_flow";
import type { Contract } from "../../types/contract";
import { contractService } from "../../services/ContractService";
import { partnerService } from "../../services/PartnerService";
import "../../styles/form.css";

interface Props {
    initialData?: Partial<CashFlow>;
    onSubmit: (data: Partial<CashFlow>) => void;
    onCancel: () => void;
}

interface ContractOption {
    id: string;
    label: string; // Nom partenaire + type de contrat
}

export default function CashFlowForm({ initialData, onSubmit, onCancel }: Props) {
    const [formData, setFormData] = useState<Partial<CashFlow>>({
        contract_id: initialData?.contract_id ?? "",
        partner_id: initialData?.partner_id ?? "",
        direction: initialData?.direction ?? "in",
        amount: initialData?.amount ?? 0,
        currency: initialData?.currency ?? "USD",
        source: initialData?.source ?? "expense",
        operation_date: initialData?.operation_date ?? new Date().toISOString().slice(0, 10),
        description: initialData?.description ?? ""
    });

    const [contractOptions, setContractOptions] = useState<ContractOption[]>([]);

    useEffect(() => {
        const loadContracts = async () => {
            const contracts: Contract[] = await contractService.getAll();
            const partners = await partnerService.getAll();

            const options: ContractOption[] = contracts.map(c => {
                const partner = partners.find(p => p.id === c.partner_id);
                return {
                    id: c.id,
                    label: `${partner?.name ?? "Sans partenaire"} - ${c.contract_type}`
                };
            });

            setContractOptions(options);
        };

        loadContracts();
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: name === "amount" ? Number(value) : value
        }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(formData);
    };

    return (
        <form onSubmit={handleSubmit} className="app-form">

            <div className="form-group">
                <label>Contrat</label>
                <select
                    name="contract_id"
                    value={formData.contract_id}
                    onChange={handleChange}
                // required
                >
                    <option value="">-- Sélectionnez un contrat --</option>
                    {contractOptions.map(opt => (
                        <option key={opt.id} value={opt.id}>{opt.label}</option>
                    ))}
                </select>
            </div>

            <div className="form-group">
                <label>Direction</label>
                <select
                    name="direction"
                    value={formData.direction}
                    onChange={handleChange}
                // required
                >
                    <option value="in">Entrée</option>
                    <option value="out">Sortie</option>
                </select>
            </div>

            <div className="form-group">
                <label>Montant</label>
                <input
                    type="number"
                    name="amount"
                    value={formData.amount}
                    onChange={handleChange}
                    required
                />
            </div>

            <div className="form-group">
                <label>Currency</label>
                <input
                    type="text"
                    name="currency"
                    value={formData.currency}
                    onChange={handleChange}
                    required
                />
            </div>

            <div className="form-group">
                <label>Source</label>
                <select
                    name="source"
                    value={formData.source}
                    onChange={handleChange}
                    required
                >
                    <option value="expense">Dépense</option>
                    <option value="reservation">Réservation</option>
                    <option value="refund">Remboursement</option>
                    <option value="service">Service</option>
                    <option value="adjustment">Ajustement</option>
                </select>
            </div>

            <div className="form-group">
                <label>Date opération</label>
                <input
                    type="date"
                    name="operation_date"
                    value={formData.operation_date?.slice(0, 10)}
                    onChange={handleChange}
                    required
                />
            </div>

            <div className="form-group">
                <label>Description</label>
                <textarea
                    name="description"
                    value={formData.description ?? ""}
                    onChange={handleChange}
                    required
                    rows={3}
                />
            </div>

            <div className="form-actions">
                <Button type="button" label="Annuler" onClick={onCancel} />
                <Button type="submit" label="Enregistrer" />
            </div>
        </form>
    );
}
