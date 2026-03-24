import { useEffect, useState } from "react";
import { Button } from "../Button";
import { round2 } from "../../utils/money";

import type { OperationSegments } from "../../types/operation_segments";
import { airlineService } from "../../services/AirlineService";
import { systemService } from "../../services/SystemService";
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

export default function OperationSegmentForm({ initialData, onSubmit, onCancel }: Props) {

    const [formData, setFormData] = useState<Partial<OperationSegments>>({
        operation_id: initialData?.operation_id ?? "",
        passenger_name: initialData?.passenger_name ?? "",
        travel_class: initialData?.travel_class ?? "economy",
        airline_id: initialData?.airline_id ?? "",
        system_id: initialData?.system_id ?? "",
        itineraire: initialData?.itineraire ?? "",
        ticket_number: initialData?.ticket_number ?? "",
        departure_date: initialData?.departure_date ?? "",
        tht: initialData?.tht ?? 0,
        tax: initialData?.tax ?? 0,
        segment_reference: initialData?.segment_reference ?? "",
        service_fee: initialData?.service_fee ?? 0,
        related_costs: initialData?.related_costs ?? 0,
        commission: initialData?.commission ?? 0,
        sold_debit: initialData?.sold_debit ?? 0,
        total_amount: initialData?.total_amount ?? 0,
        update_price: initialData?.update_price ?? 0,
        cancel_price: initialData?.cancel_price ?? 0,
        operation_type: initialData?.operation_type ?? "sale",
    });

    const [operations, setOperations] = useState<Option[]>([]);
    const [airlineOptions, setAirlineOptions] = useState<Option[]>([]);
    const [systemOptions, setSystemOptions] = useState<Option[]>([]);

    const isSale = formData.operation_type === "sale";
    const isChange = formData.operation_type === "change";
    const isCancel = formData.operation_type === "canceled";

    useEffect(() => {

        const loadOptions = async () => {

            const airlines = await airlineService.getAll();
            const systems = await systemService.getAll();
            const ops = await operationService.getAllWithDetails();

            let filteredOps;

            const isEditing = !!initialData?.id;

            if (isEditing) {
                filteredOps = ops.filter(o => o.id === initialData?.operation_id);
            } else {
                filteredOps = ops.filter(o => o.status === "pending");
            }

            if (!initialData?.id && !formData.segment_reference) {
                const now = new Date();
                const month = String(now.getMonth() + 1).padStart(2, "0");
                const year = now.getFullYear();

                setFormData(prev => ({
                    ...prev,
                    segment_reference: `SEG-${month}-${year}`
                }));
            }

            setOperations(
                filteredOps.map(o => ({
                    id: o.id,
                    label: `${o.client_name} (${o.status})`
                }))
            );

            setAirlineOptions(
                airlines.map(a => ({ id: a.id, label: a.name ?? "" }))
            );

            setSystemOptions(
                systems.map(s => ({ id: s.id, label: s.name ?? "" }))
            );
        };

        loadOptions();

    }, [initialData]);

    const numericFields = [
        "tht", "tax", "service_fee", "related_costs",
        "commission", "sold_debit", "update_price", "cancel_price"
    ];

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;

        let updated: any = {
            ...formData,
            [name]: numericFields.includes(name) ? round2(Number(value || 0)) : value
        };

        // Recalcul TTC / SoldDebit seulement pour sale
        if (updated.operation_type === "sale") {
            const ttc = round2(
                (updated.tht ?? 0) +
                (updated.tax ?? 0) +
                (updated.service_fee ?? 0) +
                (updated.related_costs ?? 0)
            );
            updated.total_amount = ttc;
            updated.sold_debit = round2(ttc - (updated.commission ?? 0));
        } else {
            // Reset montants pour change / canceled
            updated.tht = 0;
            updated.tax = 0;
            updated.service_fee = 0;
            updated.related_costs = 0;
            updated.commission = 0;
            updated.sold_debit = 0;
            updated.total_amount = 0;
        }

        setFormData(updated);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(formData);
    };

    const ttcValue = round2(
        (formData.tht ?? 0) +
        (formData.tax ?? 0) +
        (formData.service_fee ?? 0) +
        (formData.related_costs ?? 0)
    );

    return (
        <form onSubmit={handleSubmit} className="app-form">

            <div className="form-grid">

                <div className="form-field">
                    <label>Opération</label>
                    <select
                        name="operation_id"
                        value={formData.operation_id ?? ""}
                        onChange={handleChange}
                        required
                    >
                        <option value="">-- sélectionner --</option>
                        {operations.map(o => (
                            <option key={o.id} value={o.id}>{o.label}</option>
                        ))}
                    </select>
                </div>

                <div className="form-field">
                    <label>Type d'opération</label>
                    <select
                        name="operation_type"
                        value={formData.operation_type ?? "sale"}
                        onChange={handleChange}
                        required
                    >
                        <option value="sale">Vente</option>
                        <option value="change">Modification</option>
                        <option value="canceled">Annulation</option>
                    </select>
                </div>

                <div className="form-field">
                    <label>Passager</label>
                    <input
                        name="passenger_name"
                        value={formData.passenger_name ?? ""}
                        onChange={handleChange}
                        required
                    />
                </div>

                <div className="form-field">
                    <label>Classe</label>
                    <select
                        name="travel_class"
                        value={formData.travel_class ?? "economy"}
                        onChange={handleChange}
                    >
                        <option value="economy">Economy</option>
                        <option value="premium_economy">Premium Economy</option>
                        <option value="business">Business</option>
                        <option value="first">First</option>
                    </select>
                </div>

                <div className="form-field">
                    <label>Compagnie aérienne</label>
                    <select
                        name="airline_id"
                        value={formData.airline_id ?? ""}
                        onChange={handleChange}
                        required
                    >
                        <option value="">-- sélectionner --</option>
                        {airlineOptions.map(o => <option key={o.id} value={o.id}>{o.label}</option>)}
                    </select>
                </div>

                <div className="form-field">
                    <label>Système</label>
                    <select
                        name="system_id"
                        value={formData.system_id ?? ""}
                        onChange={handleChange}
                        required
                    >
                        <option value="">-- sélectionner --</option>
                        {systemOptions.map(o => <option key={o.id} value={o.id}>{o.label}</option>)}
                    </select>
                </div>

                <div className="form-field">
                    <label>Itinéraire / code</label>
                    <input
                        name="itineraire"
                        value={formData.itineraire ?? ""}
                        onChange={handleChange}
                        placeholder="FIH-DXB"
                        required
                    />
                </div>

                <div className="form-field">
                    <label>Numéro Ticket</label>
                    <input
                        name="ticket_number"
                        value={formData.ticket_number ?? ""}
                        onChange={handleChange}
                        required
                    />
                </div>

                <div className="form-field">
                    <label>Date départ</label>
                    <input
                        type="date"
                        name="departure_date"
                        value={formData.departure_date ?? ""}
                        onChange={handleChange}
                    />
                </div>

                {isSale && <>
                    <div className="form-field">
                        <label>THT</label>
                        <input type="number" name="tht" value={formData.tht} onChange={handleChange} />
                    </div>

                    <div className="form-field">
                        <label>Taxe</label>
                        <input type="number" name="tax" value={formData.tax} onChange={handleChange} />
                    </div>

                    <div className="form-field">
                        <label>Frais services</label>
                        <input type="number" name="service_fee" value={formData.service_fee} onChange={handleChange} />
                    </div>

                    <div className="form-field">
                        <label>Frais connexe</label>
                        <input type="number" name="related_costs" value={formData.related_costs} onChange={handleChange} />
                    </div>

                    <div className="form-field">
                        <label>Commission (ex : 12,15)</label>
                        <input type="number" name="commission" value={formData.commission} onChange={handleChange} />
                    </div>

                    <div className="form-field">
                        <label>TTC</label>
                        <input type="number" value={ttcValue} readOnly />
                    </div>

                    <div className="form-field">
                        <label>Sold Debit</label>
                        <input type="number" value={formData.sold_debit} readOnly />
                    </div>

                    <div className="form-field">
                        <label>Référence segment</label>
                        <input type="text" value={formData.segment_reference ?? ""} readOnly />
                    </div>
                </>}

                {isChange && <div className="form-field">
                    <label>Frais modification</label>
                    <input type="number" name="update_price" value={formData.update_price} onChange={handleChange} />
                </div>}

                {isCancel && <div className="form-field">
                    <label>Frais annulation</label>
                    <input type="number" name="cancel_price" value={formData.cancel_price} onChange={handleChange} />
                </div>}

            </div>

            <div className="form-actions">
                <Button label="Annuler" variant="secondary" onClick={onCancel} />
                <Button label="Enregistrer" variant="primary" />
            </div>

        </form>
    );
}