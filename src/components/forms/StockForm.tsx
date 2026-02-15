// src/components/forms/StockForm.tsx
import { useState, useEffect } from "react";
import { Button } from "../Button";
import type { Stock } from "../../types/stocks";
import type { Contract } from "../../types/contract";
import { contractService } from "../../services/ContractService";
import { partnerService } from "../../services/PartnerService";
import "../../styles/form.css";

interface Props {
    initialData?: Partial<Stock>;
    onSubmit: (data: Partial<Stock>) => void;
    onCancel: () => void;
}

interface ContractOption {
    id: string;
    label: string; // Nom partenaire + type de contrat
}

export default function StockForm({ initialData, onSubmit, onCancel }: Props) {
    const [formData, setFormData] = useState<Partial<Stock>>({
        contract_id: initialData?.contract_id ?? "",
        amount_initial: initialData?.amount_initial ?? 0,
        amount_remaining: initialData?.amount_remaining ?? 0,
    });

    const [contractOptions, setContractOptions] = useState<ContractOption[]>([]);

    useEffect(() => {
        const loadContracts = async () => {
            const contracts: Contract[] = await contractService.getAll();
            const partners = await partnerService.getAll();

            // Filtrer uniquement les contrats de type 'caution_and_stock'
            const filtered = contracts.filter(c => c.contract_type === "caution_and_stock");

            const options: ContractOption[] = filtered.map(c => {
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

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: name.includes("amount") ? Number(value) : value
        }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(formData);
    };

    return (
        <form onSubmit={handleSubmit} className="app-form">
            <div className="form-group">
                <label>Contrat (caution + stock)</label>
                <select
                    name="contract_id"
                    value={formData.contract_id}
                    onChange={handleChange}
                    required
                >
                    <option value="">-- Sélectionnez un contrat --</option>
                    {contractOptions.map(opt => (
                        <option key={opt.id} value={opt.id}>{opt.label}</option>
                    ))}
                </select>
            </div>

            <div className="form-group">
                <label>Montant initial</label>
                <input
                    type="number"
                    name="amount_initial"
                    value={formData.amount_initial}
                    onChange={handleChange}
                    required
                />
            </div>

            <div className="form-group">
                <label>Montant restant</label>
                <input
                    type="number"
                    name="amount_remaining"
                    value={formData.amount_remaining}
                    onChange={handleChange}
                />
            </div>

            <div className="form-actions">
                <Button type="button" label="Annuler" onClick={onCancel} />
                <Button type="submit" label="Enregistrer" />
            </div>
        </form>
    );
}
