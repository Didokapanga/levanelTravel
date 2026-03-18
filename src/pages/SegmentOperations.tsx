import { useEffect, useState } from "react";
import { Table, type Column } from "../components/Table";
import { Button } from "../components/Button";
import { ButtonTable } from "../components/ButtonTable";
import { Modal } from "../components/Modal";

import SegmentOperationForm from "../components/forms/SegmentOperationForm";

import { FaPlus, FaEdit, FaTrash } from "react-icons/fa";

import "../styles/pages.css";

import { operationSegmentsService } from "../services/OperationSegmentsService";
import type { OperationSegments } from "../types/operation_segments";
import type { OperationSegmentWithDetails } from "../types/operation_segments";
import { useAuth } from "../auth/AuthContext";
import { canEditOperation } from "../utils/permissions";
import SegmentChangeForm from "../components/forms/SegmentChangeForm";

export default function SegmentOperations() {

    const [segments, setSegments] = useState<OperationSegmentWithDetails[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingSegment, setEditingSegment] = useState<OperationSegments | null>(null);

    const [segmentType, setSegmentType] = useState<"sale" | "change" | "canceled">("sale");

    const { user } = useAuth();
    const isAllowed = canEditOperation(user?.role);

    /* ========================= */
    /* LOAD DATA                 */
    /* ========================= */

    const loadSegments = async () => {
        const data = await operationSegmentsService.getAllWithDetails();
        setSegments(data);
    };

    useEffect(() => {
        loadSegments();
    }, []);

    /* ========================= */
    /* CRUD                      */
    /* ========================= */

    const handleSubmit = async (data: Partial<OperationSegments>) => {

        const payload = {
            ...data,
            operation_type: segmentType
        };

        if (editingSegment) {
            await operationSegmentsService.update(editingSegment.id, payload);
        } else {
            await operationSegmentsService.create(payload);
        }

        setEditingSegment(null);
        setIsModalOpen(false);
        loadSegments();
    };

    const handleEdit = (seg: OperationSegments) => {
        setEditingSegment(seg);
        setIsModalOpen(true);
    };

    const handleDelete = async (id: string) => {
        await operationSegmentsService.delete(id);
        loadSegments();
    };

    /* ========================= */
    /* TABLE COLUMNS             */
    /* ========================= */

    const columns: Column<OperationSegmentWithDetails>[] = [
        { key: "operation_client", label: "Client" },
        { key: "passenger_name", label: "Passager" },
        { key: "travel_class", label: "Travel classe" },
        { key: "ticket_number", label: "N° Ticket" },
        { key: "airline_name", label: "Airline" },
        { key: "system_name", label: "System" },
        { key: "itineraire_code", label: "Itinéraire" },
        {
            key: "operation_type",
            label: "Sale / Change",
            render: (row) => {

                let label = "";
                let className = "";

                switch (row.operation_type) {
                    case "sale":
                        label = "Sale";
                        className = "op-sale";
                        break;

                    case "change":
                        label = "Change";
                        className = "op-change";
                        break;

                    case "canceled":
                        label = "Canceled";
                        className = "op-canceled";
                        break;
                }

                return <span className={className}>{label}</span>;
            }
        },

        {
            key: "tht",
            label: "THT",
            render: (row) => row.tht?.toFixed(2) ?? "0"
        },

        {
            key: "tax",
            label: "Tax",
            render: (row) => row.tax?.toFixed(2) ?? "0"
        },

        {
            key: "commission",
            label: "Commission",
            render: (row) => row.commission?.toFixed(2) ?? "0"
        },

        {
            key: "service_fee",
            label: "Frais services",
            render: (row) => row.service_fee?.toFixed(2) ?? "0"
        },

        {
            key: "related_costs",
            label: "Frais connexe",
            render: (row) => row.related_costs?.toFixed(2) ?? "0"
        },

        {
            key: "sold_debit",
            label: "Débit compte",
            render: (row) => {
                const value = row.sold_debit ?? 0;

                let className = "";

                if (row.operation_type === "sale") className = "amount-sale";
                if (row.operation_type === "change") className = "amount-change";
                if (row.operation_type === "canceled") className = "amount-canceled";

                return <span className={className}>{value.toFixed(2)}</span>;
            }
        },

        {
            key: "update_price",
            label: "Frais de modification",
            render: (row) => {
                const value = row.update_price ?? 0;

                return (
                    <span className={value > 0 ? "amount-change" : ""}>
                        {value.toFixed(2)}
                    </span>
                );
            }
        },
        {
            key: "cancel_price",
            label: "Frais d'annulation",
            render: (row) => {
                const value = row.cancel_price ?? 0;

                return (
                    <span className={value > 0 ? "amount-canceled" : ""}>
                        {value.toFixed(2)}
                    </span>
                );
            }
        },

        {
            key: "operation_date",
            label: "Date opération",
            render: (row) =>
                row.operation_date
                    ? new Date(row.operation_date).toLocaleDateString()
                    : ""
        },

        {
            key: "sync_status",
            label: "Statut sync",
            render: (row) => {

                let badgeClass = "";
                let label = "";

                switch (row.sync_status) {

                    case "clean":
                        badgeClass = "badge-clean";
                        label = "Clean";
                        break;

                    case "dirty":
                        badgeClass = "badge-dirty";
                        label = "Dirty";
                        break;

                    case "conflict":
                        badgeClass = "badge-conflict";
                        label = "Conflict";
                        break;

                }

                return <span className={`badge ${badgeClass}`}>{label}</span>;
            }
        }
    ];

    return (
        <div className="page-container">

            {/* ================= HEADER ================= */}
            <div className="page-header">
                <div className="page-header-left">
                    <h1>Segments Opérations</h1>
                    <p>Détails des billets, taxes et commissions</p>
                </div>

                {/* ===== Bouton ===== */}
                <div style={{ marginBottom: 15 }}>
                    {isAllowed && (
                        <div style={{ display: "flex", gap: 10 }}>

                            <Button
                                label="Nouveau billet"
                                icon={<FaPlus />}
                                variant="info"
                                onClick={() => {
                                    setSegmentType("sale");
                                    setEditingSegment(null);
                                    setIsModalOpen(true);
                                }}
                            />

                            <Button
                                label="Modification"
                                icon={<FaPlus />}
                                variant="secondary"
                                onClick={() => {
                                    setSegmentType("change");
                                    setEditingSegment(null);
                                    setIsModalOpen(true);
                                }}
                            />

                            <Button
                                label="Annulation"
                                icon={<FaPlus />}
                                variant="danger"
                                onClick={() => {
                                    setSegmentType("canceled");
                                    setEditingSegment(null);
                                    setIsModalOpen(true);
                                }}
                            />

                        </div>
                    )}
                </div>
            </div>

            {/* ===== Table ===== */}
            <Table
                columns={columns}
                data={segments}
                actions={(row: OperationSegmentWithDetails) => (
                    isAllowed ? (
                        <>
                            <ButtonTable
                                icon={<FaEdit />}
                                variant="secondary"
                                onClick={() => handleEdit(row)}
                            />
                            <ButtonTable
                                icon={<FaTrash />}
                                variant="danger"
                                onClick={() => handleDelete(row.id)}
                            />
                        </>
                    ) : null
                )}
            />

            {/* ===== Modal ===== */}
            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={editingSegment ? "Modifier segment" : "Créer segment"}
            >
                <SegmentOperationForm
                    initialData={editingSegment ?? undefined}
                    onSubmit={handleSubmit}
                    onCancel={() => {
                        setEditingSegment(null);
                        setIsModalOpen(false);
                    }}
                />
            </Modal>

            {/* ===== Modal ===== */}
            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={
                    editingSegment
                        ? segmentType === "change"
                            ? "Modifier segment"
                            : "Annuler segment"
                        : segmentType === "sale"
                            ? "Créer segment"
                            : segmentType === "change"
                                ? "Modifier segment"
                                : "Annuler segment"
                }
            >
                {segmentType === "sale" ? (
                    <SegmentOperationForm
                        initialData={editingSegment ?? undefined}
                        onSubmit={handleSubmit}
                        onCancel={() => setIsModalOpen(false)}
                    />
                ) : (
                    <SegmentChangeForm
                        segmentType={segmentType} // "change" ou "canceled"
                        initialData={editingSegment ?? undefined}
                        onSubmit={handleSubmit}
                        onCancel={() => setIsModalOpen(false)}
                    />
                )}
            </Modal>

        </div>
    );
}
