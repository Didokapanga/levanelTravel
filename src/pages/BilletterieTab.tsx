import { useState, useMemo } from "react";
import { Button } from "../components/Button";
import { ButtonTable } from "../components/ButtonTable";
import { Table, type Column } from "../components/Table";
import { Modal } from "../components/Modal";

import OperationForm from "../components/forms/OperationForm";
import OperationViews from "../components/Views/OperationViews";

import { FaPlus, FaEdit, FaTrash, FaEye } from "react-icons/fa";

import { useAuth } from "../auth/AuthContext";
import { canEditOperation } from "../utils/permissions";

import { useOperations } from "../hooks/useOperations";

import type { Operations, OperationWithDetails } from "../types/operations";

export default function BilletterieTab() {

    const {
        operations,
        segments,
        viewOperation,
        setViewOperation,
        openView,
        createOrUpdate,
        remove
    } = useOperations();

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingOperation, setEditingOperation] = useState<Operations | null>(null);

    // 🔹 FILTRE DATE
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");

    const { user } = useAuth();
    const isAllowed = canEditOperation(user?.role);

    // 🔹 FILTRAGE MEMOIZÉ
    const filteredOperations = useMemo(() => {

        return operations.filter(op => {

            if (!op.date_emission) return false;

            const emissionDate = new Date(op.date_emission);

            if (startDate) {
                const start = new Date(startDate);
                if (emissionDate < start) return false;
            }

            if (endDate) {
                const end = new Date(endDate);
                end.setHours(23, 59, 59, 999); // inclure toute la journée
                if (emissionDate > end) return false;
            }

            return true;
        });

    }, [operations, startDate, endDate]);

    const columns: Column<OperationWithDetails>[] = [
        { key: "receipt_reference", label: "Référence reçu" },
        { key: "partner_name", label: "Partenaire" },
        { key: "service_name", label: "Service" },
        { key: "client_name", label: "Client" },
        { key: "total_amount", label: "TTC" },
        { key: "total_commission", label: "Commission" },
        { key: "total_tax", label: "Tax" },
        { key: "status", label: "Status" },
        { key: "date_emission", label: "Date émission" }
    ];

    return (
        <>
            {/* 🔹 BOUTON CREATE */}
            <div style={{ marginBottom: 15, display: "flex", justifyContent: "space-between" }}>
                {isAllowed && (
                    <Button
                        label="Nouvelle opération"
                        icon={<FaPlus />}
                        variant="info"
                        onClick={() => {
                            setEditingOperation(null);
                            setIsModalOpen(true);
                        }}
                    />
                )}

                {/* 🔹 FILTRES DATE */}
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

            {/* 🔹 TABLE */}
            <Table
                columns={columns}
                data={filteredOperations}
                actions={(row) => (
                    isAllowed && (
                        <>
                            <ButtonTable
                                icon={<FaEdit />}
                                variant="secondary"
                                onClick={() => {
                                    setEditingOperation(row);
                                    setIsModalOpen(true);
                                }}
                            />
                            <ButtonTable
                                icon={<FaTrash />}
                                variant="danger"
                                onClick={() => remove(row.id)}
                            />
                            <ButtonTable
                                icon={<FaEye />}
                                variant="info"
                                onClick={() => openView(row)}
                            />
                        </>
                    )
                )}
            />

            {/* 🔹 MODAL FORM */}
            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={editingOperation ? "Modifier opération" : "Créer opération"}
            >
                <OperationForm
                    initialData={editingOperation ?? undefined}
                    onSubmit={async (data) => {
                        await createOrUpdate(data, editingOperation);
                        setIsModalOpen(false);
                        setEditingOperation(null);
                    }}
                    onCancel={() => {
                        setIsModalOpen(false);
                        setEditingOperation(null);
                    }}
                />
            </Modal>

            {/* 🔹 MODAL VIEW */}
            <Modal
                isOpen={!!viewOperation}
                onClose={() => setViewOperation(null)}
                title="Détails opération"
            >
                {viewOperation && (
                    <OperationViews
                        operation={viewOperation}
                        segments={segments}
                        onClose={() => setViewOperation(null)}
                    />
                )}
            </Modal>
        </>
    );
}