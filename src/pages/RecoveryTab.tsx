import { useState, useMemo } from "react";
import { Button } from "../components/Button";
import { ButtonTable } from "../components/ButtonTable";
import { Table, type Column } from "../components/Table";
import { Modal } from "../components/Modal";

import RecoveryForm from "../components/forms/RecoveryForm";

import { FaPlus, FaEdit, FaTrash } from "react-icons/fa";

import { useAuth } from "../auth/AuthContext";
import { canEditOperation } from "../utils/permissions";


import type { RecoveryWithDetails } from "../types/recovery";
import { useRecoveries } from "../hooks/useRecoveries";

export default function RecoveryTab() {

    const { recoveries, createOrUpdate, remove } = useRecoveries();

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingRecovery, setEditingRecovery] = useState<RecoveryWithDetails | null>(null);

    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");

    const { user } = useAuth();
    const isAllowed = canEditOperation(user?.role);

    const filteredRecoveries = useMemo(() => {

        return recoveries.filter(r => {

            if (!r.payment_date) return false;

            const d = new Date(r.payment_date);

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

    }, [recoveries, startDate, endDate]);

    const columns: Column<RecoveryWithDetails>[] = [

        { key: "receipt_reference", label: "Référence" },

        { key: "client_name", label: "Client" },

        {
            key: "amount",
            label: "Montant",
            render: r => r.amount.toFixed(2)
        },

        {
            key: "remaining_amount",
            label: "Reste",
            render: r => r.remaining_amount?.toFixed(2) ?? "0"
        },

        {
            key: "payment_date",
            label: "Date paiement",
            render: r =>
                r.payment_date
                    ? new Date(r.payment_date).toLocaleDateString()
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
        <>

            {/* HEADER */}

            <div style={{ marginBottom: 15, display: "flex", justifyContent: "space-between" }}>

                {isAllowed && (
                    <Button
                        label="Nouveau recouvrement"
                        icon={<FaPlus />}
                        variant="info"
                        onClick={() => {
                            setEditingRecovery(null);
                            setIsModalOpen(true);
                        }}
                    />
                )}

                <div style={{ display: "flex", gap: 10 }}>

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

            {/* TABLE */}

            <Table
                columns={columns}
                data={filteredRecoveries}
                actions={(row) => (
                    isAllowed && (
                        <>
                            <ButtonTable
                                icon={<FaEdit />}
                                variant="secondary"
                                onClick={() => {
                                    setEditingRecovery(row);
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

            {/* MODAL */}

            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={editingRecovery ? "Modifier recouvrement" : "Nouveau recouvrement"}
            >

                <RecoveryForm
                    initialData={editingRecovery ?? undefined}
                    onSubmit={async (data) => {

                        await createOrUpdate(data, editingRecovery);

                        setIsModalOpen(false);
                        setEditingRecovery(null);

                    }}
                    onCancel={() => {

                        setIsModalOpen(false);
                        setEditingRecovery(null);

                    }}
                />

            </Modal>

        </>
    );
}