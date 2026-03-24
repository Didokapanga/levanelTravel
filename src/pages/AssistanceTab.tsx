import { useState, useMemo } from "react";
import { Button } from "../components/Button";
import { ButtonTable } from "../components/ButtonTable";
import { Table, type Column } from "../components/Table";
import { Modal } from "../components/Modal";

import "../styles/pages.css";

import OtherOperationForm from "../components/forms/OtherOperationForm";

import { FaPlus, FaEdit, FaTrash } from "react-icons/fa";

import { useAuth } from "../auth/AuthContext";
import { canEditOperation } from "../utils/permissions";

import { useAssistances } from "../hooks/useAssistances";

import type { OrtherOperations } from "../types/orther_operations";

export default function AssistanceTab() {

    const { assistances, createOrUpdate, remove } = useAssistances();

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingAssist, setEditingAssist] = useState<OrtherOperations | null>(null);

    // 🔹 FILTRE DATE
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");

    const { user } = useAuth();
    const isAllowed = canEditOperation(user?.role);

    // 🔹 FILTRAGE
    const filteredAssistances = useMemo(() => {

        return assistances.filter(a => {

            if (!a.date_demande) return false;

            const d = new Date(a.date_demande);

            if (startDate) {
                const start = new Date(startDate);
                if (d < start) return false;
            }

            if (endDate) {
                const end = new Date(endDate);
                end.setHours(23, 59, 59, 999);
                if (d > end) return false;
            }

            return true;
        });

    }, [assistances, startDate, endDate]);

    const columns: Column<OrtherOperations>[] = [
        { key: "receipt_reference", label: "Référence reçu" },
        { key: "client_name", label: "Client" },
        { key: "service_name", label: "Service" },
        { key: "total_amount", label: "Montant" },
        { key: "service_fee", label: "Frais service" },
        {
            key: "status",
            label: "Status",
            render: (row) => {

                let label = "";
                let className = "";

                switch (row.status) {
                    case "pending":
                        label = "En attente";
                        className = "status-pending";
                        break;

                    case "validated":
                        label = "Validé";
                        className = "status-validated";
                        break;

                    case "cancelled":
                        label = "Annulé";
                        className = "status-canceled";
                        break;

                    default:
                        label = row.status;
                }

                return <span className={className}>{label}</span>;
            }
        },
        { key: "date_demande", label: "Date demande" },
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
        <>
            {/* 🔹 HEADER + FILTRE */}
            <div style={{ marginBottom: 15, display: "flex", justifyContent: "space-between" }}>
                {isAllowed && (
                    <Button
                        label="Nouvelle assistance"
                        icon={<FaPlus />}
                        variant="info"
                        onClick={() => {
                            setEditingAssist(null);
                            setIsModalOpen(true);
                        }}
                    />
                )}

                <div className="filtre-section">
                    <input
                        type="date"
                        value={startDate}
                        onChange={e => setStartDate(e.target.value)}
                    />
                    <input
                        type="date"
                        value={endDate}
                        onChange={e => setEndDate(e.target.value)}
                    />
                    <Button
                        label="Reset"
                        variant="secondary"
                        onClick={() => {
                            setStartDate("");
                            setEndDate("");
                        }}
                    />
                </div>
            </div>

            {/* 🔹 TABLE */}
            <Table
                columns={columns}
                data={filteredAssistances}
                actions={(row) => (
                    isAllowed && (
                        <>
                            <ButtonTable
                                icon={<FaEdit />}
                                variant="secondary"
                                onClick={() => {
                                    setEditingAssist(row);
                                    setIsModalOpen(true);
                                }}
                            />
                            <ButtonTable
                                icon={<FaTrash />}
                                variant="danger"
                                onClick={() => remove(row.id)}
                            />
                        </>
                    )
                )}
            />

            {/* 🔹 MODAL */}
            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={editingAssist ? "Modifier assistance" : "Créer assistance"}
            >
                <OtherOperationForm
                    initialData={editingAssist ?? undefined}
                    onSubmit={async (data) => {
                        await createOrUpdate(data, editingAssist);
                        setIsModalOpen(false);
                        setEditingAssist(null);
                    }}
                    onCancel={() => {
                        setIsModalOpen(false);
                        setEditingAssist(null);
                    }}
                />
            </Modal>
        </>
    );
}