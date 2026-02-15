import { useState, useEffect } from "react";
import type { Caution } from "../../types/caution";
import type { Contract } from "../../types/contract";
import { contractService } from "../../services/ContractService";
import { partnerService } from "../../services/PartnerService";
import { Button } from "../Button";

interface Props {
    initialData?: Partial<Caution>;
    onSubmit: (data: Partial<Caution>) => void;
    onCancel: () => void;
}

interface ContractOption {
    id: string;
    label: string; // Nom partenaire + type de contrat
}

export default function CautionForm({ initialData, onSubmit, onCancel }: Props) {
    const [formData, setFormData] = useState({
        contract_id: initialData?.contract_id ?? "",
        amount_initial: initialData?.amount_initial ?? 0,
        amount_remaining: initialData?.amount_remaining ?? 0
    });

    const [contractOptions, setContractOptions] = useState<ContractOption[]>([]);

    useEffect(() => {
        const loadContracts = async () => {
            const contracts: Contract[] = await contractService.getAll();
            const partners = await partnerService.getAll();

            const options: ContractOption[] = contracts.map((c: Contract) => {
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
        <form onSubmit={handleSubmit} className="user-form">
            <div className="form-group">
                <label>Contrat</label>
                <select
                    name="contract_id"
                    value={formData.contract_id}
                    onChange={handleChange}
                    required
                >
                    <option value="">-- Sélectionnez un contrat --</option>
                    {contractOptions.map((opt: ContractOption) => (
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
