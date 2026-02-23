import { useState } from "react";
import { Button } from "../components/Button";
import { ButtonTable } from "../components/ButtonTable";
import { Table, type Column } from "../components/Table";
import { Modal } from "../components/Modal";

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

    const { user } = useAuth();
    const isAllowed = canEditOperation(user?.role);

    const columns: Column<OrtherOperations>[] = [
        { key: "client_name", label: "Client" },
        { key: "service_name", label: "Service" },
        { key: "total_amount", label: "Montant" },
        { key: "service_fee", label: "Frais service" },
        { key: "status", label: "Status" },
        { key: "date_demande", label: "Date demande" }
    ];

    return (
        <>
            <div style={{ marginBottom: 15 }}>
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
            </div>

            <Table
                columns={columns}
                data={assistances}
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