// src/components/forms/OperationForm.tsx
import { useEffect, useState } from "react";
import { Button } from "../Button";

import type { Operations } from "../../types/operations";
import type { Contract } from "../../types/contract";

import { partnerService } from "../../services/PartnerService";
import { contractService } from "../../services/ContractService";
import { serviceService } from "../../services/ServiceService";
import { operationService } from "../../services/OperationService";

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
            const services = await serviceService.getAll();

            setPartnerOptions(
                partners.map(p => ({ id: p.id, label: p.name }))
            );

            setServiceOptions(
                services.map(s => ({ id: s.id, label: s.name ?? "" }))
            );
        };
        load();
    }, []);

    /* ========================= */
    /* CHARGER CONTRAT DU PARTENAIRE SÉLECTIONNÉ */
    /* ========================= */
    useEffect(() => {
        const loadContract = async () => {
            if (!formData.partner_id) {
                setContractOptions([]);
                setFormData(prev => ({ ...prev, contract_id: "" }));
                return;
            }

            const contracts: Contract[] = await contractService.getByPartner(formData.partner_id);

            // On ne garde que le contrat actif
            const activeContract = contracts.find(c => c.status === "active");

            if (activeContract) {
                setContractOptions([{
                    id: activeContract.id,
                    label: `${activeContract.contract_type} (${activeContract.status})`
                }]);

                setFormData(prev => ({
                    ...prev,
                    contract_id: activeContract.id
                }));
            } else {
                setContractOptions([]);
                setFormData(prev => ({ ...prev, contract_id: "" }));
            }
        };

        loadContract();
    }, [formData.partner_id]);

    useEffect(() => {
        const generateReceiptReference = async () => {
            const date = formData.date_demande
                ? formData.date_demande.slice(0, 10)
                : new Date().toISOString().slice(0, 10);

            const existingOps = await operationService.getByDate(date);
            const nextNumber = existingOps.length + 1;

            const numberStr = String(nextNumber).padStart(4, "0");
            const generatedRef = `${date}-${numberStr}`;

            setFormData(prev => ({
                ...prev,
                receipt_reference: generatedRef
            }));
        };

        generateReceiptReference();
    }, [formData.date_demande]);

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

                {/* Partenaire */}
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

                {/* Contrat */}
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

                {/* Service */}
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

                {/* Client */}
                <div className="form-field">
                    <label>Client</label>
                    <input
                        name="client_name"
                        value={formData.client_name}
                        onChange={handleChange}
                        required
                    />
                </div>

                {/* Date demande */}
                <div className="form-field">
                    <label>Date demande</label>
                    <input
                        type="date"
                        name="date_demande"
                        value={formData.date_demande?.slice(0, 10) || ""}
                        onChange={handleChange}
                    />
                </div>

                {/* Date émission */}
                <div className="form-field">
                    <label>Date émission</label>
                    <input
                        type="date"
                        name="date_emission"
                        value={formData.date_emission?.slice(0, 10) || ""}
                        onChange={handleChange}
                    />
                </div>

                {/* Montant total */}
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

                {/* Commission */}
                <div className="form-field">
                    <label>Commission</label>
                    <input
                        type="number"
                        name="total_commission"
                        value={formData.total_commission ?? 0}
                        onChange={handleChange}
                    />
                </div>

                {/* Taxe */}
                <div className="form-field">
                    <label>Taxe</label>
                    <input
                        type="number"
                        name="total_tax"
                        value={formData.total_tax ?? 0}
                        onChange={handleChange}
                    />
                </div>

                {/* Référence reçu */}
                <div className="form-field">
                    <label>Référence reçu</label>
                    <input
                        name="receipt_reference"
                        value={formData.receipt_reference}
                        readOnly
                    />
                </div>

                {/* Observation */}
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
