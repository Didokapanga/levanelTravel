import type { OperationSegmentWithDetails } from "../types/operation_segments";
import type { OperationWithDetails } from "../types/operations";
import type { OrtherOperationWithDetails } from "../types/orther_operations";
import { Button } from "./Button";
import "../styles/Card.css";

interface ValidationCardProps {
    operation: OperationWithDetails | OrtherOperationWithDetails;
    segments?: OperationSegmentWithDetails[];
    onValidate: (
        op: OperationWithDetails | OrtherOperationWithDetails,
        segments?: OperationSegmentWithDetails[]
    ) => void;
    onCancel: (op: OperationWithDetails | OrtherOperationWithDetails) => void;
}

export default function ValidationCard({ operation, segments, onValidate, onCancel }: ValidationCardProps) {
    const isBilletterie = "partner_id" in operation;

    const ttcSegments =
        segments?.map(s => (s.tht ?? 0) + (s.tax ?? 0) + (s.service_fee ?? 0)) ?? [];
    const totalTTC = ttcSegments.reduce((acc, val) => acc + val, 0);

    return (
        <div className="validation-card">
            <h3>{isBilletterie ? "Billetterie" : "Autre Opération"}</h3>

            <p><strong>Client :</strong> {operation.client_name}</p>
            {isBilletterie && (
                <p>
                    <strong>Partenaire :</strong>{" "}
                    {(operation as OperationWithDetails).partner_name}
                </p>
            )}
            {isBilletterie && (
                <p>
                    <strong>Contrat :</strong>{" "}
                    {(operation as OperationWithDetails).contract_type}
                </p>
            )}
            <p><strong>Service :</strong> {operation.service_name ?? "-"}</p>
            <p><strong>Date demande :</strong> {operation.date_demande}</p>
            {operation.date_emission && (
                <p><strong>Date émission :</strong> {operation.date_emission}</p>
            )}
            {operation.total_amount !== undefined && (
                <p><strong>TTC :</strong> {operation.total_amount}</p>
            )}

            {segments && segments.length > 0 && (
                <>
                    <p><strong>Segments :</strong></p>
                    <ul>
                        {segments.map(s => (
                            <li key={s.id}>
                                {s.airline_name ?? ""} | Ticket: {s.ticket_number} |
                                Sold Debit: {s.sold_debit ?? 0} |
                                Remaining: {s.remaining_amount ?? 0}
                            </li>
                        ))}
                    </ul>
                    <p><strong>Total TTC Segments :</strong> {totalTTC}</p>
                </>
            )}

            {operation.observation && (
                <p><strong>Observation :</strong> {operation.observation}</p>
            )}

            <div className="card-actions">
                <Button
                    label="Annuler"
                    variant="secondary"
                    onClick={() => onCancel(operation)}
                />
                <Button
                    label="Valider"
                    variant="primary"
                    onClick={() => onValidate(operation, segments)}
                />
            </div>
        </div>
    );
}