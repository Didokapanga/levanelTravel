import { useEffect, useState } from "react";
import { Button } from "../Button";
import Alert from "../Alert";
import { round2 } from "../../utils/money";

import type { OperationSegments } from "../../types/operation_segments";

import { airlineService } from "../../services/AirlineService";
import { systemService } from "../../services/SystemService";
import { operationSegmentsService } from "../../services/OperationSegmentsService";

interface Props {
    segmentType: "change" | "canceled";
    onSubmit: (data: Partial<OperationSegments>) => void;
    onCancel: () => void;
}

interface Option {
    id: string;
    label: string;
}

export default function SegmentChangeForm({
    segmentType,
    onSubmit,
    onCancel
}: Props) {

    const [segmentReferenceInput, setSegmentReferenceInput] = useState("");

    const [formData, setFormData] = useState<Partial<OperationSegments>>({
        operation_id: "",
        passenger_name: "",
        travel_class: "economy",
        airline_id: "",
        system_id: "",
        itineraire: "",
        ticket_number: "",
        tht: 0,
        tax: 0,
        service_fee: 0,
        related_costs: 0,
        commission: 0,
        sold_debit: 0,
        total_amount: 0,
        update_price: 0,
        cancel_price: 0,
        operation_type: segmentType
    });

    const [airlineOptions, setAirlineOptions] = useState<Option[]>([]);
    const [systemOptions, setSystemOptions] = useState<Option[]>([]);

    const [alert, setAlert] = useState<{
        type: "success" | "error" | "warning" | "info";
        message: string;
    } | null>(null);

    useEffect(() => {

        const loadOptions = async () => {

            const airlines = await airlineService.getAll();
            const systems = await systemService.getAll();

            setAirlineOptions(
                airlines.map(a => ({ id: a.id, label: a.name ?? "" }))
            );

            setSystemOptions(
                systems.map(s => ({ id: s.id, label: s.name ?? "" }))
            );
        };

        loadOptions();

    }, []);

    /* ========================= */
    /* LOAD SEGMENT BY REFERENCE */
    /* ========================= */

    const handleLoadSegment = async () => {

        setAlert(null);

        if (!segmentReferenceInput) {
            setAlert({
                type: "warning",
                message: "Veuillez saisir une référence segment."
            });
            return;
        }

        const segments = await operationSegmentsService.getAll();

        const segment = segments.find(
            s => s.segment_reference === segmentReferenceInput
        );

        if (!segment) {
            setAlert({
                type: "error",
                message: "Aucun segment trouvé avec cette référence."
            });
            return;
        }

        // ✅ remplissage propre (SANS duplication)
        setFormData({
            id: crypto.randomUUID(),
            operation_id: segment.operation_id,
            passenger_name: segment.passenger_name,
            travel_class: segment.travel_class,
            airline_id: segment.airline_id,
            system_id: segment.system_id,
            itineraire: segment.itineraire,
            ticket_number: segment.ticket_number,

            departure_date: segment.departure_date,

            // 🔥 reset financier
            tht: 0,
            tax: 0,
            service_fee: 0,
            related_costs: 0,
            commission: 0,
            sold_debit: 0,
            total_amount: 0,

            update_price: segmentType === "change" ? 0 : undefined,
            cancel_price: segmentType === "canceled" ? 0 : undefined,

            operation_type: segmentType
        });
    };

    /* ========================= */
    /* HANDLE CHANGE             */
    /* ========================= */

    const numericFields = [
        "tht",
        "tax",
        "service_fee",
        "related_costs",
        "commission",
        "sold_debit",
        "update_price",
        "cancel_price"
    ];

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
    ) => {

        const { name, value } = e.target;

        const updated: any = {
            ...formData,
            [name]: numericFields.includes(name)
                ? round2(Number(value.replace(",", ".")))
                : value
        };

        const ttc = round2(
            (updated.tht ?? 0) +
            (updated.tax ?? 0) +
            (updated.service_fee ?? 0) +
            (updated.related_costs ?? 0)
        );

        updated.total_amount = ttc;
        updated.sold_debit = round2(ttc - (updated.commission ?? 0));

        setFormData(updated);
    };

    /* ========================= */
    /* SUBMIT                    */
    /* ========================= */

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.operation_id) {
            setAlert({
                type: "warning",
                message: "Veuillez charger un segment valide."
            });
            return;
        }

        const cleanData = {
            ...formData,
            segment_reference: undefined
        };

        onSubmit(cleanData);
    };

    return (

        <form onSubmit={handleSubmit} className="app-form">

            {alert && (
                <Alert
                    type={alert.type}
                    message={alert.message}
                    onClose={() => setAlert(null)}
                />
            )}

            <div className="form-field">
                <label>Référence segment</label>
                <div style={{ display: "flex", gap: 8 }}>
                    <input
                        value={segmentReferenceInput}
                        onChange={(e) => setSegmentReferenceInput(e.target.value)}
                        placeholder="SEG-03-2026-0001"
                    />
                    <Button
                        label="Charger"
                        variant="secondary"
                        onClick={handleLoadSegment}
                    />
                </div>
            </div>

            <div className="form-grid">

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
                    <label>Date départ</label>
                    <input
                        type="date"
                        name="departure_date"
                        value={formData.departure_date ?? ""}
                        onChange={handleChange}
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
                        {airlineOptions.map(o => (
                            <option key={o.id} value={o.id}>
                                {o.label}
                            </option>
                        ))}
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
                        {systemOptions.map(o => (
                            <option key={o.id} value={o.id}>
                                {o.label}
                            </option>
                        ))}
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

                {segmentType === "change" && (
                    <div className="form-field">
                        <label>Frais de modification</label>
                        <input
                            type="number"
                            name="update_price"
                            value={formData.update_price ?? 0}
                            onChange={handleChange}
                        />
                    </div>
                )}

                {segmentType === "canceled" && (
                    <div className="form-field">
                        <label>Frais d'annulation</label>
                        <input
                            type="number"
                            name="cancel_price"
                            value={formData.cancel_price ?? 0}
                            onChange={handleChange}
                        />
                    </div>
                )}

            </div>

            <div className="form-actions">

                <Button
                    label="Annuler"
                    variant="secondary"
                    onClick={onCancel}
                />

                <Button
                    label="Enregistrer"
                    variant="primary"
                />

            </div>

        </form>
    );
}