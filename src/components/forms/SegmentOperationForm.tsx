// src/components/forms/SegmentOperationForm.tsx
import { useEffect, useState } from "react";
import { Button } from "../Button";

import type { OperationSegments } from "../../types/operation_segments";
import type { Airline } from "../../types/airline";
import type { System } from "../../types/systems";
import type { Itineraire } from "../../types/Itineraire";
import type { OperationWithDetails } from "../../types/operations";

import { airlineService } from "../../services/AirlineService";
import { systemService } from "../../services/SystemService";
import { itineraireService } from "../../services/ItineraireService";
import { operationService } from "../../services/OperationService";

interface Props {
    initialData?: Partial<OperationSegments>;
    onSubmit: (data: Partial<OperationSegments>) => void;
    onCancel: () => void;
}

interface Option {
    id: string;
    label: string;
}

export default function SegmentOperationForm({ initialData, onSubmit, onCancel }: Props) {
    const [formData, setFormData] = useState<Partial<OperationSegments>>({
        operation_id: initialData?.operation_id ?? "",
        airline_id: initialData?.airline_id ?? "",
        system_id: initialData?.system_id ?? "",
        itineraire_id: initialData?.itineraire_id ?? "",
        ticket_number: initialData?.ticket_number ?? "",
        pnr: initialData?.pnr ?? "",
        tht: initialData?.tht,
        tax: initialData?.tax,
        service_fee: initialData?.service_fee,
        commission: initialData?.commission,
        sold_debit: initialData?.sold_debit,
        amount_received: initialData?.amount_received,
        remaining_amount: initialData?.remaining_amount,
        update_price: initialData?.update_price ?? 0,
        cancel_price: initialData?.cancel_price ?? 0
    });

    const [airlineOptions, setAirlineOptions] = useState<Option[]>([]);
    const [systemOptions, setSystemOptions] = useState<Option[]>([]);
    const [itineraireOptions, setItineraireOptions] = useState<Option[]>([]);
    const [operations, setOperations] = useState<Option[]>([]);
    const [commissionPercent, setCommissionPercent] = useState<number>(0);

    /* ========================= */
    /* LOAD DATA                 */
    /* ========================= */
    useEffect(() => {
        const loadOptions = async () => {
            const airlines: Airline[] = await airlineService.getAll();
            const systems: System[] = await systemService.getAll();
            const itineraires: Itineraire[] = await itineraireService.getAll();
            const ops: OperationWithDetails[] = await operationService.getAllWithDetails();

            setAirlineOptions(airlines.map(a => ({ id: a.id, label: a.name ?? "" })));
            setSystemOptions(systems.map(s => ({ id: s.id, label: s.name ?? "" })));
            setItineraireOptions(itineraires.map(i => ({ id: i.id, label: i.code ?? "" })));

            // 🔹 Filtrer uniquement les opérations pending
            const pendingOps = ops.filter(o => o.status === "pending");

            setOperations(pendingOps.map(o => ({ id: o.id, label: o.client_name })));
        };
        loadOptions();
    }, []);

    /* ========================= */
    /* HANDLE CHANGE             */
    /* ========================= */
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;

        setFormData(prev => {
            const updated = {
                ...prev,
                [name]: ["tht", "tax", "service_fee", "amount_received", "commission"].includes(name)
                    ? Number(value.replace(",", "."))
                    : value
            };

            const ttc = (updated.tht ?? 0) + (updated.tax ?? 0) + (updated.service_fee ?? 0);
            const remaining = ttc - (updated.amount_received ?? 0);
            const soldDebit = ttc - (updated.commission ?? 0);

            return {
                ...updated,
                remaining_amount: remaining,
                sold_debit: soldDebit
            };
        });
    };

    const handleCommissionPercent = (e: React.ChangeEvent<HTMLInputElement>) => {
        const percent = Number(e.target.value);
        setCommissionPercent(percent);

        setFormData(prev => {
            const tht = prev.tht ?? 0;
            const commission = (tht * percent) / 100;  // uniquement sur THT
            const ttc = tht + (prev.tax ?? 0) + (prev.service_fee ?? 0);
            const soldDebit = ttc - commission;

            return {
                ...prev,
                commission,
                sold_debit: soldDebit
            };
        });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(formData);
    };

    const ttcValue = (formData.tht ?? 0) + (formData.tax ?? 0) + (formData.service_fee ?? 0);

    /* ========================= */
    /* RENDER FORM               */
    /* ========================= */
    return (
        <form onSubmit={handleSubmit} className="app-form">
            <div className="form-grid">

                {/* Operation */}
                <div className="form-field">
                    <label>Opération</label>
                    <select name="operation_id" value={formData.operation_id ?? ""} onChange={handleChange} required>
                        <option value="">-- sélectionner --</option>
                        {operations.map((o: Option) => (
                            <option key={o.id} value={o.id}>{o.label}</option>
                        ))}
                    </select>
                </div>

                {/* Airline */}
                <div className="form-field">
                    <label>Airline</label>
                    <select name="airline_id" value={formData.airline_id ?? ""} onChange={handleChange} required>
                        <option value="">-- sélectionner --</option>
                        {airlineOptions.map(o => <option key={o.id} value={o.id}>{o.label}</option>)}
                    </select>
                </div>

                {/* System */}
                <div className="form-field">
                    <label>System</label>
                    <select name="system_id" value={formData.system_id ?? ""} onChange={handleChange} required>
                        <option value="">-- sélectionner --</option>
                        {systemOptions.map(o => <option key={o.id} value={o.id}>{o.label}</option>)}
                    </select>
                </div>

                {/* Itinéraire */}
                <div className="form-field">
                    <label>Itinéraire</label>
                    <select name="itineraire_id" value={formData.itineraire_id ?? ""} onChange={handleChange} required>
                        <option value="">-- sélectionner --</option>
                        {itineraireOptions.map(o => <option key={o.id} value={o.id}>{o.label}</option>)}
                    </select>
                </div>

                {/* Ticket & PNR */}
                <div className="form-field">
                    <label>Ticket Number</label>
                    <input name="ticket_number" value={formData.ticket_number ?? ""} onChange={handleChange} required />
                </div>
                <div className="form-field">
                    <label>PNR</label>
                    <input name="pnr" value={formData.pnr ?? ""} onChange={handleChange} required />
                </div>

                {/* THT, Tax, Service Fee */}
                <div className="form-field">
                    <label>THT</label>
                    <input type="number" name="tht" value={formData.tht} onChange={handleChange} required />
                </div>
                <div className="form-field">
                    <label>Tax</label>
                    <input type="number" name="tax" value={formData.tax} onChange={handleChange} required />
                </div>
                <div className="form-field">
                    <label>Service Fee</label>
                    <input type="number" name="service_fee" value={formData.service_fee} onChange={handleChange} required />
                </div>

                {/* Commission */}
                <div className="form-field">
                    <label>% Commission</label>
                    <input type="number" value={commissionPercent} onChange={handleCommissionPercent} required />
                </div>
                <div className="form-field">
                    <label>Commission</label>
                    <input type="number" value={formData.commission} readOnly />
                </div>

                {/* TTC */}
                <div className="form-field">
                    <label>TTC</label>
                    <input type="number" value={ttcValue} readOnly />
                </div>

                {/* Amount Received & Remaining */}
                <div className="form-field">
                    <label>Amount Received</label>
                    <input type="number" name="amount_received" value={formData.amount_received} onChange={handleChange} required />
                </div>
                <div className="form-field">
                    <label>Remaining Amount</label>
                    <input type="number" value={formData.remaining_amount} readOnly />
                </div>

                {/* Sold Debit */}
                <div className="form-field">
                    <label>Sold Debit</label>
                    <input type="number" value={formData.sold_debit} readOnly />
                </div>

                {/* Update / Cancel Price */}
                <div className="form-field">
                    <label>Update Price</label>
                    <input type="number" name="update_price" value={formData.update_price} onChange={handleChange} />
                </div>
                <div className="form-field">
                    <label>Cancel Price</label>
                    <input type="number" name="cancel_price" value={formData.cancel_price} onChange={handleChange} />
                </div>

            </div>

            <div className="form-actions">
                <Button label="Annuler" variant="secondary" onClick={onCancel} />
                <Button label="Enregistrer" variant="primary" />
            </div>
        </form>
    );
}
