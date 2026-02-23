// src/pages/ValidationOperations.tsx
import { useEffect, useState } from "react";

import type { OperationWithDetails } from "../types/operations";
import type { OperationSegmentWithDetails } from "../types/operation_segments";
import type { OrtherOperationWithDetails } from "../types/orther_operations";

import { operationService } from "../services/OperationService";
import { operationSegmentsService } from "../services/OperationSegmentsService";
import { otherOperationService } from "../services/OtherOperationService";
import { operationWorkflowService } from "../services/OperationWorkflowService";

import "../styles/pages.css";
import Alert from "../components/Alert";
import ValidationCard from "../components/ValidationCard";
import { Button } from "../components/Button";
import { Modal } from "../components/Modal";

export default function ValidationOperations() {
    const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
    const [cancelOperation, setCancelOperation] = useState<OperationWithDetails | null>(null);
    const [cancelSegments, setCancelSegments] = useState<OperationSegmentWithDetails[] | null>(null);

    const [operations, setOperations] = useState<OperationWithDetails[]>([]);
    const [segments, setSegments] = useState<OperationSegmentWithDetails[]>([]);
    const [ortherOperations, setOrtherOperations] =
        useState<OrtherOperationWithDetails[]>([]);
    const [alert, setAlert] = useState<{
        type: "success" | "error" | "warning" | "info";
        message: string;
    } | null>(null);

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

    const openCancelModal = async (op: OperationWithDetails) => {
        const segs = await operationSegmentsService.findByOperation(op.id);
        if (!segs.length) {
            setAlert({
                type: "error",
                message: `Aucun segment trouvé pour l'opération ${op.client_name}`,
            });
            return;
        }

        setCancelOperation(op);
        setCancelSegments(segs);
        setIsCancelModalOpen(true);
    };

    const handleValidateCancel = async (
        op: OperationWithDetails,
        updatedSegments: OperationSegmentWithDetails[]
    ) => {
        try {
            // Mettre à jour les segments avec cancel_price
            const now = new Date().toISOString();
            for (const seg of updatedSegments) {
                seg.sync_status = "dirty";
                seg.version = (seg.version ?? 0) + 1;
                seg.updated_at = now;
                await operationSegmentsService.update(seg.id, seg);
            }

            // Annuler l'opération
            await handleCancel(op, updatedSegments);
        } catch (err: any) {
            setAlert({
                type: "error",
                message: err.message || "Erreur lors de l'annulation",
            });
        }
    };

    // ✅ IMPORTANT : on garde les segments !
    const handleValidate = async (
        op: OperationWithDetails | OrtherOperationWithDetails,
        opSegments?: OperationSegmentWithDetails[]
    ) => {
        try {
            if ("partner_id" in op) {
                const { operation, segments: updatedSegments } =
                    await operationWorkflowService.validateOperation(op, opSegments ?? []);

                setOperations(prev => prev.filter(o => o.id !== operation.id));
                setSegments(prev =>
                    prev.map(s => updatedSegments.find(u => u.id === s.id) ?? s)
                );

                setAlert({
                    type: "success",
                    message: `Opération ${op.client_name} validée avec succès !`,
                });
            } else {
                await otherOperationService.update(op.id, { status: "validated" });
                setOrtherOperations(prev => prev.filter(o => o.id !== op.id));

                setAlert({
                    type: "success",
                    message: `Autre opération ${op.client_name} validée !`,
                });
            }
        } catch (error: any) {
            setAlert({
                type: "error",
                message: error.message || "Erreur lors de la validation",
            });
        }
    };

    const handleCancel = async (
        op: OperationWithDetails | OrtherOperationWithDetails,
        segmentsArg?: OperationSegmentWithDetails[]
    ) => {
        try {
            if ("partner_id" in op) {
                const opSegments: OperationSegmentWithDetails[] =
                    segmentsArg && segmentsArg.length
                        ? segmentsArg
                        : await operationSegmentsService.findByOperation(op.id);

                if (!opSegments.length) {
                    setAlert({
                        type: "error",
                        message: `Impossible d'annuler l'opération ${op.client_name} : aucun segment trouvé.`,
                    });
                    return;
                }

                const now = new Date().toISOString();
                for (const seg of opSegments) {
                    seg.sync_status = "dirty";
                    seg.version = (seg.version ?? 0) + 1;
                    seg.updated_at = now;
                    await operationSegmentsService.update(seg.id, seg);
                }

                await operationService.update(op.id, {
                    status: "cancelled",
                    sync_status: "dirty",
                    version: (op.version ?? 0) + 1,
                    updated_at: now
                });

                setOperations(prev => prev.filter(o => o.id !== op.id));
                setSegments(prev => prev.map(s => opSegments.find(u => u.id === s.id) ?? s));
            } else {
                await otherOperationService.update(op.id, { status: "cancelled" });
                setOrtherOperations(prev => prev.filter(o => o.id !== op.id));
            }

            setAlert({
                type: "info",
                message: `Opération ${op.client_name} annulée.`,
            });
        } catch (error: any) {
            setAlert({
                type: "error",
                message: error.message || "Erreur lors de l'annulation",
            });
        }
    };

    // ----------------------------
    // Sous-composant pour la modal
    // ----------------------------
    function CancelOperationForm({
        operation,
        segments,
        onCancelModal,
        onValidateCancel
    }: {
        operation: OperationWithDetails;
        segments: OperationSegmentWithDetails[];
        onCancelModal: () => void;
        onValidateCancel: (
            op: OperationWithDetails,
            updatedSegments: OperationSegmentWithDetails[]
        ) => Promise<void>;
    }) {
        const [prices, setPrices] = useState<Record<string, number>>(
            Object.fromEntries(segments.map(s => [s.id, s.cancel_price ?? 0]))
        );

        const handleChange = (id: string, value: number) => {
            setPrices(prev => ({ ...prev, [id]: value }));
        };

        const handleSubmit = async (e: React.FormEvent) => {
            e.preventDefault();

            const updatedSegments = segments.map(seg => ({
                ...seg,
                cancel_price: prices[seg.id] ?? 0
            }));

            await onValidateCancel(operation, updatedSegments);
            onCancelModal();
        };

        return (
            <form onSubmit={handleSubmit} className="app-form">
                {segments.map(seg => (
                    <div key={seg.id} className="form-row">
                        <div className="form-field">
                            <label>Segment {seg.ticket_number ?? seg.pnr}</label>
                            <input
                                type="number"
                                value={prices[seg.id]}
                                onChange={e => handleChange(seg.id, parseFloat(e.target.value))}
                                required
                            />
                        </div>
                    </div>
                ))}

                <div className="form-actions">
                    <Button label="Fermer" variant="secondary" onClick={onCancelModal} />
                    <Button label="Annuler l'opération" variant="danger" />
                </div>
            </form>
        );
    }

    return (
        <div className="page-container">
            <h1>Validation des opérations</h1>

            {alert && (
                <Alert
                    type={alert.type}
                    message={alert.message}
                    onClose={() => setAlert(null)}
                />
            )}

            {/* Modal pour annulation */}
            {cancelOperation && cancelSegments && (
                <Modal
                    isOpen={isCancelModalOpen}
                    onClose={() => setIsCancelModalOpen(false)}
                    title={`Annuler l'opération ${cancelOperation.client_name}`}
                >
                    <CancelOperationForm
                        operation={cancelOperation}
                        segments={cancelSegments}
                        onCancelModal={() => setIsCancelModalOpen(false)}
                        onValidateCancel={handleValidateCancel}
                    />
                </Modal>
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
                            onCancel={(op) => {
                                if ("partner_id" in op) {
                                    openCancelModal(op);
                                } else {
                                    handleCancel(op);
                                }
                            }}
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