// src/pages/FinancialOperations.tsx
import { useEffect, useState } from "react";
import { Table, type Column } from "../components/Table";
import "../styles/pages.css";
import { financialOperationService } from "../services/FinancialOperationService";
import type { FinancialOperationWithDetails } from "../types/fiancial_operation";

import { FaEdit, FaTrash } from "react-icons/fa";
import { ButtonTable } from "../components/ButtonTable";
import { useAuth } from "../auth/AuthContext";
import { canEditOperation } from "../utils/permissions";
import { Modal } from "../components/Modal";
import FinancialOperationForm from "../components/forms/FinancialOperationForm";

export default function FinancialOperationsPage() {
    const [operations, setOperations] = useState<FinancialOperationWithDetails[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingOperation, setEditingOperation] = useState<FinancialOperationWithDetails | null>(null);
    const { user } = useAuth();
    const isAllowed = canEditOperation(user?.role);

    // Colonnes du tableau
    const columns: Column<FinancialOperationWithDetails>[] = [
        {
            key: "receipt_reference",
            label: "Référence Reçu",
            render: row => row.receipt_reference ?? "-"
        },
        { key: "contract_type", label: "Type contrat" },
        { key: "partner_name", label: "Partenaire" },
        { key: "source", label: "Source" },
        { key: "type", label: "Type opération" },
        { key: "amount", label: "Montant" },
        {
            key: 'sync_status',
            label: 'Statut sync',
            render: (row) => {
                let badgeClass = '';
                let label = '';
                switch (row.sync_status) {
                    case 'clean':
                        badgeClass = 'badge-clean';
                        label = 'Clean';
                        break;
                    case 'dirty':
                        badgeClass = 'badge-dirty';
                        label = 'Dirty';
                        break;
                    case 'conflict':
                        badgeClass = 'badge-conflict';
                        label = 'Conflict';
                        break;
                }
                return <span className={`badge ${badgeClass}`}>{label}</span>;
            }
        },
        { key: "description", label: "Description" },
    ];

    const handleUpdateOperation = async (data: Partial<FinancialOperationWithDetails>) => {

        if (!editingOperation) return;

        const updated = await financialOperationService.update(editingOperation.id, data);

        setOperations(prev =>
            prev.map(op => op.id === updated?.id ? { ...op, ...updated } : op)
        );

        setEditingOperation(null);
        setIsModalOpen(false);
    };

    const loadOperations = async () => {
        const all = await financialOperationService.getAllWithDetails();
        setOperations(all);
    };

    const handleEdit = (operation: FinancialOperationWithDetails) => {
        setEditingOperation(operation);
        setIsModalOpen(true);
    };

    const handleDelete = async (id: string) => {
        await financialOperationService.delete(id);
        setOperations(prev => prev.filter(op => op.id !== id));
    };

    useEffect(() => {
        loadOperations();
    }, []);

    return (
        <div className="page-container">
            <div className="page-header">
                <div className="page-header-left">
                    <h1>Opérations financières</h1>
                    <p>Liste complète des opérations automatiques</p>
                </div>
            </div>

            <Table
                columns={columns}
                data={operations}
                actions={(row: FinancialOperationWithDetails) =>
                    isAllowed && (
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
                    )
                }
            />

            <Modal
                isOpen={isModalOpen}
                onClose={() => {
                    setEditingOperation(null);
                    setIsModalOpen(false);
                }}
                title="Modifier opération financière"
            >
                <FinancialOperationForm
                    initialData={editingOperation ?? undefined}
                    onSubmit={handleUpdateOperation}
                    onCancel={() => {
                        setEditingOperation(null);
                        setIsModalOpen(false);
                    }}
                />
            </Modal>
        </div>
    );
}
