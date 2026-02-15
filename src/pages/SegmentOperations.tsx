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

export default function SegmentOperations() {

    const [segments, setSegments] = useState<OperationSegmentWithDetails[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingSegment, setEditingSegment] = useState<OperationSegments | null>(null);

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

        if (editingSegment) {
            await operationSegmentsService.update(editingSegment.id, data);
        } else {
            await operationSegmentsService.create(data);
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
        { key: "ticket_number", label: "Ticket" },
        { key: "pnr", label: "PNR" },
        { key: "airline_name", label: "Airline" },
        { key: "system_name", label: "System" },
        { key: "itineraire_code", label: "Itinéraire" },
        { key: "tht", label: "THT" },
        { key: "tax", label: "Tax" },
        { key: "commission", label: "Commission" },
        { key: "remaining_amount", label: "Reste" },
        { key: "sold_debit", label: "Débit compte" },
        { key: "operation_date", label: "Date opération" },
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
                    <Button
                        label="Nouveau segment"
                        icon={<FaPlus />}
                        variant="info"
                        onClick={() => {
                            setEditingSegment(null);
                            setIsModalOpen(true);
                        }}
                    />
                </div>
            </div>

            <div className="page-body">

                {/* ===== Table ===== */}
                <Table
                    columns={columns}
                    data={segments}
                    actions={(row: OperationSegmentWithDetails) => (
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

            </div>
        </div>
    );
}
