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


export default function ValidationOperations() {
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

    // ✅ IMPORTANT : on garde les segments !
    const handleValidate = async (
        op: OperationWithDetails | OrtherOperationWithDetails,
        opSegments?: OperationSegmentWithDetails[]
    ) => {
        try {
            if ("partner_id" in op) {
                // Billetterie avec segments
                const { operation, segments: updatedSegments } =
                    await operationWorkflowService.validateOperation(op, opSegments ?? []);

                setOperations(prev => prev.filter(o => o.id !== operation.id));

                // Mise à jour segments
                setSegments(prev =>
                    prev.map(s => updatedSegments.find(u => u.id === s.id) ?? s)
                );

                setAlert({
                    type: "success",
                    message: `Opération ${op.client_name} validée avec succès !`,
                });
            } else {
                // Autre opération
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
                // 🔹 Récupérer les segments si non fournis
                const opSegments: OperationSegmentWithDetails[] =
                    segmentsArg && segmentsArg.length
                        ? segmentsArg
                        : await operationSegmentsService.findByOperation(op.id);

                // 🔹 Vérifier qu’il y a bien au moins un segment
                if (!opSegments.length) {
                    setAlert({
                        type: "error",
                        message: `Impossible d'annuler l'opération ${op.client_name} : aucun segment trouvé.`,
                    });
                    return;
                }

                // 🔹 Marquer chaque segment comme "dirty"
                const now = new Date().toISOString();
                for (const seg of opSegments) {
                    seg.sync_status = "dirty";
                    seg.version = (seg.version ?? 0) + 1;
                    seg.updated_at = now;
                    await operationSegmentsService.update(seg.id, seg);
                }

                // 🔹 Mettre à jour l'opération
                await operationService.update(op.id, {
                    status: "cancelled",
                    sync_status: "dirty",
                    version: (op.version ?? 0) + 1,
                    updated_at: now
                });

                // 🔹 Mettre à jour le state
                setOperations(prev => prev.filter(o => o.id !== op.id));
                setSegments(prev => prev.map(s => opSegments.find(u => u.id === s.id) ?? s));
            } else {
                // 🔹 Autres opérations (pas de segment)
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

            <div className="cards-grid">
                {operations.map(o => {
                    const opSegments = segments.filter(
                        s => s.operation_id === o.id
                    );

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
