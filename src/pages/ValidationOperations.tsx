// src/pages/ValidationOperations.tsx
import { useEffect, useState } from "react";
import { Button } from "../components/Button";

import type { OperationWithDetails } from "../types/operations";
import type { OperationSegmentWithDetails } from "../types/operation_segments";
import type { OrtherOperationWithDetails } from "../types/orther_operations";

import { operationService } from "../services/OperationService";
import { operationSegmentsService } from "../services/OperationSegmentsService";
import { otherOperationService } from "../services/OtherOperationService";
import { operationWorkflowService } from "../services/OperationWorkflowService";

import "../styles/pages.css";
import "../styles/Card.css";
import Alert from "../components/Alert";

interface ValidationCardProps {
    operation: OperationWithDetails | OrtherOperationWithDetails;
    segments?: OperationSegmentWithDetails[];
    onValidate: (op: OperationWithDetails | OrtherOperationWithDetails, segments?: OperationSegmentWithDetails[]) => void;
    onCancel: (op: OperationWithDetails | OrtherOperationWithDetails) => void;
}

function ValidationCard({ operation, segments, onValidate, onCancel }: ValidationCardProps) {
    const isBilletterie = "partner_id" in operation;

    const ttcSegments = segments?.map(s => (s.tht ?? 0) + (s.tax ?? 0) + (s.service_fee ?? 0)) ?? [];
    const totalTTC = ttcSegments.reduce((acc, val) => acc + val, 0);

    return (
        <div className="validation-card">
            <h3>{isBilletterie ? "Billetterie" : "Autre Opération"}</h3>

            <p><strong>Client :</strong> {operation.client_name}</p>
            {isBilletterie && <p><strong>Partenaire :</strong> {(operation as OperationWithDetails).partner_name}</p>}
            {isBilletterie && <p><strong>Contrat :</strong> {(operation as OperationWithDetails).contract_type}</p>}
            <p><strong>Service :</strong> {operation.service_name ?? "-"}</p>
            <p><strong>Date demande :</strong> {operation.date_demande}</p>
            {operation.date_emission && <p><strong>Date émission :</strong> {operation.date_emission}</p>}
            {operation.total_amount !== undefined && <p><strong>TTC :</strong> {operation.total_amount}</p>}

            {segments && segments.length > 0 && (
                <>
                    <p><strong>Segments :</strong></p>
                    <ul>
                        {segments.map(s => (
                            <li key={s.id}>
                                {s.airline_name ?? ""} | Ticket: {s.ticket_number} | Sold Debit: {s.sold_debit ?? 0} | Remaining: {s.remaining_amount ?? 0}
                            </li>
                        ))}
                    </ul>
                    <p><strong>Total TTC Segments :</strong> {totalTTC}</p>
                </>
            )}

            {operation.observation && <p><strong>Observation :</strong> {operation.observation}</p>}

            <div className="card-actions">
                <Button label="Annuler" variant="secondary" onClick={() => onCancel(operation)} />
                <Button label="Valider" variant="primary" onClick={() => onValidate(operation, segments)} />
            </div>
        </div>
    );
}

export default function ValidationOperations() {
    const [operations, setOperations] = useState<OperationWithDetails[]>([]);
    const [segments, setSegments] = useState<OperationSegmentWithDetails[]>([]);
    const [ortherOperations, setOrtherOperations] = useState<OrtherOperationWithDetails[]>([]);
    const [alert, setAlert] = useState<{ type: 'success' | 'error' | 'warning' | 'info'; message: string } | null>(null);

    useEffect(() => {
        const loadData = async () => {
            const ops = await operationService.getAllWithDetails();
            const segs = await operationSegmentsService.getAllWithDetails();
            const ortherOps = await otherOperationService.getAllWithDetails();

            setOperations(ops.filter(o => o.status === "pending"));
            setSegments(segs);
            setOrtherOperations(ortherOps.filter(o => o.status === "pending"));
        };
        loadData();
    }, []);

    const handleValidate = async (op: OperationWithDetails | OrtherOperationWithDetails) => {
        try {
            if ("partner_id" in op) {
                const { operation, segments: updatedSegments } = await operationWorkflowService.validateOperation(op);
                setOperations(prev => prev.filter(o => o.id !== operation.id));
                setSegments(prev => prev.map(s => updatedSegments.find(u => u.id === s.id) ?? s));
                setAlert({ type: 'success', message: `Opération ${op.client_name} validée avec succès !` });
            } else {
                await otherOperationService.update(op.id, { status: "validated" });
                setOrtherOperations(prev => prev.filter(o => o.id !== op.id));
                setAlert({ type: 'success', message: `Autre opération ${op.client_name} validée !` });
            }
        } catch (error: any) {
            setAlert({ type: 'error', message: error.message || "Erreur lors de la validation" });
        }
    };

    const handleCancel = async (op: OperationWithDetails | OrtherOperationWithDetails) => {
        try {
            if ("partner_id" in op) {
                await operationService.update(op.id, { status: "cancelled" });
                setOperations(prev => prev.filter(o => o.id !== op.id));
            } else {
                await otherOperationService.update(op.id, { status: "cancelled" });
                setOrtherOperations(prev => prev.filter(o => o.id !== op.id));
            }
            setAlert({ type: 'info', message: `Opération ${op.client_name} annulée.` });
        } catch (error: any) {
            setAlert({ type: 'error', message: error.message || "Erreur lors de l'annulation" });
        }
    };

    return (
        <div className="page-container">
            <h1>Validation des opérations</h1>

            {/* Alerte */}
            {alert && (
                <Alert
                    type={alert.type}
                    message={alert.message}
                    onClose={() => setAlert(null)}
                />
            )}

            <div className="cards-grid">
                {operations.map(o => {
                    const opSegments = segments.filter(s => s.operation_id === o.id);
                    return (
                        <ValidationCard
                            key={o.id}
                            operation={o}
                            segments={opSegments}
                            onValidate={handleValidate}
                            onCancel={handleCancel}
                        />
                    );
                })}

                {ortherOperations.map(o => (
                    <ValidationCard
                        key={o.id}
                        operation={o}
                        onValidate={handleValidate}
                        onCancel={handleCancel}
                    />
                ))}
            </div>
        </div>
    );
}
