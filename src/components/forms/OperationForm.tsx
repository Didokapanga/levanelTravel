// src/components/forms/OperationForm.tsx

import { useEffect, useState } from "react";
import { Button } from "../Button";

import type { Operations } from "../../types/operations";
import type { Contract } from "../../types/contract";

import { partnerService } from "../../services/PartnerService";
import { contractService } from "../../services/ContractService";
import { serviceService } from "../../services/ServiceService";

interface Props {
    initialData?: Partial<Operations>;
    onSubmit: (data: Partial<Operations>) => void;
    onCancel: () => void;
}

interface Option {
    id: string;
    label: string;
}

export default function OperationForm({
    initialData,
    onSubmit,
    onCancel
}: Props) {

    const [formData, setFormData] = useState<Partial<Operations>>({
        partner_id: initialData?.partner_id ?? "",
        contract_id: initialData?.contract_id ?? "",
        service_id: initialData?.service_id ?? "",
        client_name: initialData?.client_name ?? "",
        date_demande: initialData?.date_demande ?? "",
        date_emission: initialData?.date_emission ?? "",
        total_amount: initialData?.total_amount ?? 0,
        total_commission: initialData?.total_commission ?? 0,
        total_tax: initialData?.total_tax ?? 0,
        receipt_reference: initialData?.receipt_reference ?? "",
        observation: initialData?.observation ?? ""
    });

    const [partnerOptions, setPartnerOptions] = useState<Option[]>([]);
    const [contractOptions, setContractOptions] = useState<Option[]>([]);
    const [serviceOptions, setServiceOptions] = useState<Option[]>([]);

    /* ========================= */
    /* LOAD DATA                 */
    /* ========================= */

    useEffect(() => {

        const load = async () => {

            const partners = await partnerService.getAll();
            const contracts: Contract[] = await contractService.getAll();
            const services = await serviceService.getAll();

            setPartnerOptions(
                partners.map(p => ({ id: p.id, label: p.name }))
            );

            setContractOptions(
                contracts.map(c => ({
                    id: c.id,
                    label: `${c.contract_type} (${c.status})`
                }))
            );

            setServiceOptions(
                services.map(s => ({
                    id: s.id,
                    label: s.name ?? s.name
                }))
            );
        };

        load();
    }, []);

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
    ) => {
        const { name, value } = e.target;

        setFormData(prev => ({
            ...prev,
            [name]: name.includes("amount")
                ? Number(value)
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
                    <label>Partenaire</label>
                    <select
                        name="partner_id"
                        value={formData.partner_id}
                        onChange={handleChange}
                        required
                    >
                        <option value="">-- sélectionner --</option>
                        {partnerOptions.map(o =>
                            <option key={o.id} value={o.id}>{o.label}</option>
                        )}
                    </select>
                </div>

                <div className="form-field">
                    <label>Contrat</label>
                    <select
                        name="contract_id"
                        value={formData.contract_id}
                        onChange={handleChange}
                        required
                    >
                        <option value="">-- sélectionner --</option>
                        {contractOptions.map(o =>
                            <option key={o.id} value={o.id}>{o.label}</option>
                        )}
                    </select>
                </div>

                <div className="form-field">
                    <label>Service</label>
                    <select
                        name="service_id"
                        value={formData.service_id}
                        onChange={handleChange}
                        required
                    >
                        <option value="">-- sélectionner --</option>
                        {serviceOptions.map(o =>
                            <option key={o.id} value={o.id}>{o.label}</option>
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
                    <label>Montant total</label>
                    <input
                        type="number"
                        name="total_amount"
                        value={formData.total_amount}
                        onChange={handleChange}
                        required
                    />
                </div>

                <div className="form-field">
                    <label>Commission</label>
                    <input
                        type="number"
                        name="total_commission"
                        value={formData.total_commission ?? 0}
                        onChange={handleChange}
                    />
                </div>

                <div className="form-field">
                    <label>Taxe</label>
                    <input
                        type="number"
                        name="total_tax"
                        value={formData.total_tax ?? 0}
                        onChange={handleChange}
                    />
                </div>

                <div className="form-field">
                    <label>Référence reçu</label>
                    <input
                        name="receipt_reference"
                        value={formData.receipt_reference}
                        onChange={handleChange}
                    />
                </div>

                <div className="form-field">
                    <label>Observation</label>
                    <input
                        name="observation"
                        value={formData.observation || ""}
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
