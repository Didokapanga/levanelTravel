import { useState, useEffect } from "react";
import { Button } from "../Button";
import type { FinancialOperation } from "../../types/fiancial_operation";
import type { Contract } from "../../types/contract";
import { contractService } from "../../services/ContractService";
import { partnerService } from "../../services/PartnerService";
import "../../styles/form.css";

interface Props {
    initialData?: Partial<FinancialOperation>;
    onSubmit: (data: Partial<FinancialOperation>) => void;
    onCancel: () => void;
}

interface ContractOption {
    id: string;
    label: string;
}

export default function FinancialOperationForm({ initialData, onSubmit, onCancel }: Props) {

    const [formData, setFormData] = useState<Partial<FinancialOperation>>({
        contract_id: initialData?.contract_id ?? "",
        source: initialData?.source ?? "cash_register",
        type: initialData?.type ?? "payment",
        amount: initialData?.amount ?? 0,
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

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
    ) => {

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
                >
                    <option value="">-- Sélectionnez un contrat --</option>

                    {contractOptions.map(opt => (
                        <option key={opt.id} value={opt.id}>
                            {opt.label}
                        </option>
                    ))}
                </select>
            </div>

            <div className="form-group">
                <label>Source</label>
                <select
                    name="source"
                    value={formData.source}
                    onChange={handleChange}
                >
                    <option value="cash_register">Caisse</option>
                    <option value="stock">Stock</option>
                    <option value="caution">Caution</option>
                </select>
            </div>

            <div className="form-group">
                <label>Type d'opération</label>
                <select
                    name="type"
                    value={formData.type}
                    onChange={handleChange}
                >
                    <option value="payment">Paiement</option>
                    <option value="refund">Remboursement</option>
                    <option value="deduction">Déduction</option>
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
                <label>Description</label>
                <textarea
                    name="description"
                    value={formData.description ?? ""}
                    onChange={handleChange}
                    rows={3}
                />
            </div>

            <div className="form-actions">
                <Button
                    type="button"
                    label="Annuler"
                    onClick={onCancel}
                />

                <Button
                    type="submit"
                    label="Enregistrer"
                />
            </div>

        </form>
    );
}