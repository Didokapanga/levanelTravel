// src/components/forms/OperationForm.tsx
import { useEffect, useState } from "react";
import { Button } from "../Button";

import type { Operations } from "../../types/operations";
import type { Contract } from "../../types/contract";

import { partnerService } from "../../services/PartnerService";
import { contractService } from "../../services/ContractService";
import { serviceService } from "../../services/ServiceService";
import { operationService } from "../../services/OperationService";
import type { Clients } from "../../types/clients";
import { clientService } from "../../services/ClientService";

interface Props {
    initialData?: Partial<Operations>;
    onSubmit: (data: Partial<Operations>) => void;
    onCancel: () => void;
}

interface Option {
    id: string;
    label: string;
}

export default function OperationForm({ initialData, onSubmit, onCancel }: Props) {

    const [formData, setFormData] = useState<Partial<Operations>>({
        partner_id: initialData?.partner_id ?? "",
        contract_id: initialData?.contract_id ?? "",
        service_id: initialData?.service_id ?? "",
        client_id: initialData?.client_id ?? "",
        date_demande: initialData?.date_demande ?? "",
        total_amount: initialData?.total_amount,
        receipt_reference: initialData?.receipt_reference ?? "",
        observation: initialData?.observation ?? ""
    });

    const [partnerOptions, setPartnerOptions] = useState<Option[]>([]);
    const [contractOptions, setContractOptions] = useState<Option[]>([]);
    const [serviceOptions, setServiceOptions] = useState<Option[]>([]);
    const [clientOptions, setClientOptions] = useState<Option[]>([]);

    /* ========================= */
    /* CHARGER PARTENAIRES & SERVICES */
    /* ========================= */
    useEffect(() => {
        const loadOptions = async () => {
            try {
                const partners = await partnerService.getAll();
                const services = await serviceService.getAll();

                setPartnerOptions(partners.map(p => ({ id: p.id, label: p.name })));
                setServiceOptions(services.map(s => ({ id: s.id, label: s.name ?? "" })));
            } catch (err) {
                console.error("Erreur chargement partenaires ou services :", err);
            }
        };

        loadOptions();
    }, []);

    /* ========================= */
    /* CHARGER CONTRAT ACTIF DU PARTENAIRE SÉLECTIONNÉ */
    /* ========================= */
    useEffect(() => {
        const loadContract = async () => {
            if (!formData.partner_id) {
                setContractOptions([]);
                setFormData(prev => ({ ...prev, contract_id: "" }));
                return;
            }

            try {
                const contracts: Contract[] = await contractService.getByPartner(formData.partner_id);
                const activeContract = contracts.find(c => c.status === "active");

                if (activeContract) {
                    setContractOptions([{
                        id: activeContract.id,
                        label: `${activeContract.contract_type} (${activeContract.status})`
                    }]);

                    setFormData(prev => ({ ...prev, contract_id: activeContract.id }));
                } else {
                    setContractOptions([]);
                    setFormData(prev => ({ ...prev, contract_id: "" }));
                }
            } catch (err) {
                console.error("Erreur chargement contrat :", err);
            }
        };

        loadContract();
    }, [formData.partner_id]);

    /* ========================= */
    /* GÉNÉRER RÉFÉRENCE REÇU */
    /* ========================= */
    useEffect(() => {
        const generateReceiptReference = async (dateStr: string) => {
            try {
                const existingOps = await operationService.getByDate(dateStr);

                // 🔹 Extraire les numéros existants
                const numbers = existingOps
                    .map(op => {
                        const parts = op.receipt_reference?.split("-");
                        return parts?.length === 4 ? parseInt(parts[3], 10) : 0;
                    })
                    .filter(n => !isNaN(n));

                const maxNumber = numbers.length > 0 ? Math.max(...numbers) : 0;

                const nextNumber = maxNumber + 1;
                const numberStr = String(nextNumber).padStart(4, "0");

                return `${dateStr}-${numberStr}`;
            } catch (err) {
                console.error("Erreur génération référence reçu :", err);
                return `${dateStr}-0001`;
            }
        };

        const updateReference = async () => {
            const date = formData.date_demande
                ? formData.date_demande.slice(0, 10)
                : new Date().toISOString().slice(0, 10);

            const generatedRef = await generateReceiptReference(date);

            setFormData(prev => ({ ...prev, receipt_reference: generatedRef }));
        };

        updateReference();
    }, [formData.date_demande]);

    /**
     * Changement client 
     */
    useEffect(() => {
        const loadClients = async () => {
            try {
                const clients: Clients[] = await clientService.getAll();
                setClientOptions(clients.map((c: Clients) => ({ id: c.id, label: c.name })));
            } catch (err) {
                console.error("Erreur chargement clients :", err);
            }
        };
        loadClients();
    }, []);

    /* Remaining amount */
    useEffect(() => {
        const total = formData.total_amount ?? 0;
        const received = formData.amount_received ?? 0;
        setFormData(prev => ({ ...prev, remaining_amount: total - received }));
    }, [formData.total_amount, formData.amount_received]);

    /* ========================= */
    /* HANDLE CHANGE             */
    /* ========================= */
    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
    ) => {
        const { name, value } = e.target;

        setFormData(prev => ({
            ...prev,
            [name]: ["total_amount", "amount_received", "remaining_amount"].includes(name)
                ? Number(value)
                : value
        }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(formData);
    };

    /* ========================= */
    /* RENDER FORM               */
    /* ========================= */
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
                        {partnerOptions.map(o => <option key={o.id} value={o.id}>{o.label}</option>)}
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
                        {contractOptions.map(o => <option key={o.id} value={o.id}>{o.label}</option>)}
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
                        {serviceOptions.map(o => <option key={o.id} value={o.id}>{o.label}</option>)}
                    </select>
                </div>

                {/* Client */}
                <div className="form-field">
                    <label>Client</label>
                    <select
                        name="client_id"
                        value={formData.client_id}
                        onChange={handleChange}
                        required
                    >
                        <option value="">-- sélectionner --</option>
                        {clientOptions.map((c: Option) => <option key={c.id} value={c.id}>{c.label}</option>)}
                    </select>
                </div>

                {/* Montant perçu */}
                <div className="form-field">
                    <label>PNR</label>
                    <input
                        type="text"
                        name="pnr"
                        value={formData.pnr ?? ""}
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

                {/* Montant perçu */}
                <div className="form-field">
                    <label>Montant perçu</label>
                    <input
                        type="number"
                        name="amount_received"
                        value={formData.amount_received ?? ""}
                        onChange={handleChange}
                        required
                    />
                </div>

                {/* Montant restant */}
                <div className="form-field">
                    <label>Montant restant</label>
                    <input
                        type="number"
                        name="remaining_amount"
                        value={formData.remaining_amount ?? ""}
                        readOnly
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