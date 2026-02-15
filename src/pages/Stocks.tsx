// src/pages/Stocks.tsx
import { useEffect, useState } from "react";
import { FaPlus, FaEdit, FaTrash } from "react-icons/fa";
import { Button } from "../components/Button";
import { Table, type Column } from "../components/Table";
import { Modal } from "../components/Modal";
import StockForm from "../components/forms/StockForm";
import "../styles/pages.css";
import type { Stock, StockWithDetails } from "../types/stocks";
import { stockService } from "../services/StockService";
import { ButtonTable } from "../components/ButtonTable";

export default function Stocks() {
    const [stocks, setStocks] = useState<StockWithDetails[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingStock, setEditingStock] = useState<StockWithDetails | null>(null);

    const columns: Column<StockWithDetails>[] = [
        { key: "partner_name", label: "Partenaire" },
        { key: "contract_type", label: "Type de contrat" },
        { key: "amount_initial", label: "Montant initial" },
        { key: "amount_remaining", label: "Montant restant" },
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
        }
    ];

    const loadStocks = async () => {
        const all = await stockService.getAllWithDetails();
        setStocks(all);
    };

    useEffect(() => {
        loadStocks();
    }, []);

    const handleCreateOrUpdateStock = async (data: Partial<Stock>) => {
        if (editingStock) {
            const updated = await stockService.update(editingStock.id, data);
            setStocks(prev =>
                prev.map(s => (s.id === updated?.id ? { ...s, ...updated } : s))
            );
            setEditingStock(null);
        } else {
            const created = await stockService.create(data);
            const full = await stockService.getById(created.id);
            if (full) {
                const enriched = await stockService.getByContractWithDetails(full.contract_id);
                setStocks(prev => [...prev, enriched[0]]);
            }
        }
        setIsModalOpen(false);
    };

    const handleEdit = (stock: StockWithDetails) => {
        setEditingStock(stock);
        setIsModalOpen(true);
    };

    const handleDelete = async (id: string) => {
        await stockService.delete(id);
        setStocks(prev => prev.filter(s => s.id !== id));
    };

    return (
        <div className="page-container">
            <div className="page-header">
                <div className="page-header-left">
                    <h1>Gestion des stocks</h1>
                    <p>Liste complète des stocks</p>
                </div>
                <div className="page-header-right">
                    <Button
                        label="Ajouter un stock"
                        icon={<FaPlus />}
                        variant="info"
                        onClick={() => {
                            setEditingStock(null);
                            setIsModalOpen(true);
                        }}
                    />
                </div>
            </div>

            <div className="page-body">
                <Table
                    columns={columns}
                    data={stocks}
                    actions={(row: StockWithDetails) => (
                        <>
                            <ButtonTable
                                icon={<FaEdit />}
                                variant="secondary"
                                onClick={() => handleEdit(row)}
                                label="Modifier"
                            />
                            <ButtonTable
                                icon={<FaTrash />}
                                variant="danger"
                                onClick={() => handleDelete(row.id)}
                                label="Supprimer"
                            />
                        </>
                    )}
                />
            </div>

            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={editingStock ? "Modifier un stock" : "Ajouter un stock"}
            >
                <StockForm
                    initialData={editingStock ?? undefined}
                    onSubmit={handleCreateOrUpdateStock}
                    onCancel={() => {
                        setEditingStock(null);
                        setIsModalOpen(false);
                    }}
                />
            </Modal>
        </div>
    );
}
