// src/pages/CashFlow.tsx
import { useEffect, useState } from "react";
import { FaPlus, FaEdit, FaTrash } from "react-icons/fa";
import { Button } from "../components/Button";
import { Table, type Column } from "../components/Table";
import { Modal } from "../components/Modal";
import CashFlowForm from "../components/forms/CashFlowForm";
import { cashFlowService } from "../services/CashFlowService";
import type { CashFlow, CashFlowWithDetails } from "../types/cash_flow";
import { ButtonTable } from "../components/ButtonTable";
import "../styles/pages.css";

export default function CashFlowPage() {
    const [cashFlows, setCashFlows] = useState<CashFlowWithDetails[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCashFlow, setEditingCashFlow] = useState<CashFlow | null>(null);

    // Colonnes du tableau
    const columns: Column<CashFlowWithDetails>[] = [
        { key: "contract_type", label: "Type contrat" },
        { key: "partner_name", label: "Partenaire" },
        { key: "direction", label: "Direction" },
        { key: "amount", label: "Montant" },
        { key: "currency", label: "Devise" },
        { key: "source", label: "Source" },
        { key: "operation_date", label: "Date opération" },
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

    const loadCashFlows = async () => {
        const all = await cashFlowService.getAllWithDetails();
        setCashFlows(all);
    };

    useEffect(() => {
        loadCashFlows();
    }, []);

    const handleCreateCashFlow = async (data: Partial<CashFlow>) => {
        if (editingCashFlow) {
            const updated = await cashFlowService.update(editingCashFlow.id, data);
            setCashFlows(prev =>
                prev.map(cf => (cf.id === updated?.id ? { ...cf, ...updated } : cf))
            );
            setEditingCashFlow(null);
        } else {
            const created = await cashFlowService.create(data);
            setCashFlows(prev => [...prev, created]);
        }
        setIsModalOpen(false);
    };

    const handleEdit = (cashFlow: CashFlowWithDetails) => {
        setEditingCashFlow(cashFlow);
        setIsModalOpen(true);
    };

    const handleDelete = async (id: string) => {
        await cashFlowService.delete(id);
        setCashFlows(prev => prev.filter(cf => cf.id !== id));
    };

    return (
        <div className="page-container">
            <div className="page-header">
                <div className="page-header-left">
                    <h1>Flux de trésorerie</h1>
                    <p>Liste complète des mouvements de caisse</p>
                </div>
                <div className="page-header-right">
                    <Button
                        label="Ajouter un flux"
                        icon={<FaPlus />}
                        variant="info"
                        onClick={() => {
                            setEditingCashFlow(null);
                            setIsModalOpen(true);
                        }}
                    />
                </div>
            </div>

                <Table
                    columns={columns}
                    data={cashFlows}
                    actions={(row: CashFlowWithDetails) => (
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

            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={editingCashFlow ? "Modifier un flux de caisse" : "Ajouter un flux de caisse"}
            >
                <CashFlowForm
                    initialData={editingCashFlow ?? undefined}
                    onSubmit={handleCreateCashFlow}
                    onCancel={() => {
                        setEditingCashFlow(null);
                        setIsModalOpen(false);
                    }}
                />
            </Modal>
        </div>
    );
}
