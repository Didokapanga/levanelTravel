import { useEffect, useState } from "react";
import { Button } from "../Button";
import Alert from "../Alert";

import type { OperationSegments } from "../../types/operation_segments";
import type { OperationWithDetails } from "../../types/operations";

import { airlineService } from "../../services/AirlineService";
import { systemService } from "../../services/SystemService";
import { itineraireService } from "../../services/ItineraireService";
import { operationService } from "../../services/OperationService";

interface Props {
    segmentType: "change" | "canceled";
    initialData?: Partial<OperationSegments>;
    onSubmit: (data: Partial<OperationSegments>) => void;
    onCancel: () => void;
}

interface Option {
    id: string;
    label: string;
}

export default function SegmentChangeForm({
    segmentType,
    initialData,
    onSubmit,
    onCancel
}: Props) {

    const [formData, setFormData] = useState<Partial<OperationSegments>>({
        operation_id: initialData?.operation_id ?? "",
        passenger_name: initialData?.passenger_name ?? "",
        travel_class: initialData?.travel_class ?? "economy",
        airline_id: initialData?.airline_id ?? "",
        system_id: initialData?.system_id ?? "",
        itineraire_id: initialData?.itineraire_id ?? "",
        ticket_number: initialData?.ticket_number ?? "",
        tht: initialData?.tht ?? 0,
        tax: initialData?.tax ?? 0,
        service_fee: initialData?.service_fee ?? 0,
        related_costs: initialData?.related_costs ?? 0,
        commission: initialData?.commission ?? 0,
        sold_debit: initialData?.sold_debit ?? 0,
        update_price: initialData?.update_price ?? 0,
        cancel_price: initialData?.cancel_price ?? 0,
        operation_type: initialData?.operation_type ?? segmentType
    });

    const [airlineOptions, setAirlineOptions] = useState<Option[]>([]);
    const [systemOptions, setSystemOptions] = useState<Option[]>([]);
    const [itineraireOptions, setItineraireOptions] = useState<Option[]>([]);
    const [operations, setOperations] = useState<Option[]>([]);
    const [operationsRaw, setOperationsRaw] = useState<OperationWithDetails[]>([]);

    const [alert, setAlert] = useState<{
        type: "success" | "error" | "warning" | "info";
        message: string;
    } | null>(null);

    useEffect(() => {

        const loadOptions = async () => {

            const airlines = await airlineService.getAll();
            const systems = await systemService.getAll();
            const itineraires = await itineraireService.getAll();
            const ops = await operationService.getAllWithDetails();

            setOperationsRaw(ops);

            setAirlineOptions(
                airlines.map(a => ({
                    id: a.id,
                    label: a.name ?? ""
                }))
            );

            setSystemOptions(
                systems.map(s => ({
                    id: s.id,
                    label: s.name ?? ""
                }))
            );

            setItineraireOptions(
                itineraires.map(i => ({
                    id: i.id,
                    label: i.code ?? ""
                }))
            );

            const filteredOps = ops.filter(o => o.status !== "pending");

            setOperations(
                filteredOps.map(o => ({
                    id: o.id,
                    label: `${o.client_name} (${o.status})`
                }))
            );
        };

        loadOptions();

    }, []);

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
    ) => {

        const { name, value } = e.target;

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

        setFormData(prev => ({
            ...prev,
            [name]: numericFields.includes(name)
                ? Number(value.replace(",", "."))
                : value
        }));

    };

    const handleSubmit = (e: React.FormEvent) => {

        e.preventDefault();

        setAlert(null);

        const selectedOperation = operationsRaw.find(
            o => o.id === formData.operation_id
        );

        if (!selectedOperation) {

            setAlert({
                type: "warning",
                message: "Veuillez sélectionner une opération."
            });

            return;
        }

        // 🔒 Sécurité métier
        if (segmentType === "change" && selectedOperation.status === "cancelled") {

            setAlert({
                type: "error",
                message:
                    "Impossible de créer une modification : cette opération est annulée."
            });

            return;
        }

        onSubmit(formData);

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
                            <option key={o.id} value={o.id}>
                                {o.label}
                            </option>
                        ))}

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
                    <label>Itinéraire</label>
                    <select
                        name="itineraire_id"
                        value={formData.itineraire_id ?? ""}
                        onChange={handleChange}
                        required
                    >
                        <option value="">-- sélectionner --</option>

                        {itineraireOptions.map(o => (
                            <option key={o.id} value={o.id}>
                                {o.label}
                            </option>
                        ))}

                    </select>
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