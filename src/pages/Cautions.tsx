// src/pages/Cautions.tsx

import { useEffect, useState } from "react";
import type { CautionWithDetails } from "../types/caution";
import { cautionService } from "../services/CautionService";

import { Table, type Column } from "../components/Table";
import { Button } from "../components/Button";
import { ButtonTable } from "../components/ButtonTable";
import { Modal } from "../components/Modal";

import { FaPlus, FaEdit, FaTrash } from "react-icons/fa";
import CautionForm from "../components/forms/CautionForm";
import { useAuth } from "../auth/AuthContext";
import { canEditOperation } from "../utils/permissions";

export default function Cautions() {

    const [cautions, setCautions] = useState<CautionWithDetails[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editing, setEditing] = useState<CautionWithDetails | null>(null);

    const { user } = useAuth();
    const isAllowed = canEditOperation(user?.role);

    const loadData = async () => {
        const data = await cautionService.getAllWithDetails();
        setCautions(data);
    };

    useEffect(() => {
        loadData();
    }, []);

    const handleSave = async (data: any) => {

        if (editing) {
            await cautionService.update(editing.id, data);
        } else {
            await cautionService.create(data);
        }

        setIsModalOpen(false);
        setEditing(null);
        loadData();
    };

    const handleDelete = async (id: string) => {
        await cautionService.delete(id);
        loadData();
    };

    const columns: Column<CautionWithDetails>[] = [
        {
            key: "partner_name",
            label: "Partenaire"
        },
        {
            key: "amount_initial",
            label: "Montant initial"
        },
        {
            key: "amount_remaining",
            label: "Montant restant"
        },
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

    return (
        <div className="page-container">

            <div className="page-header">
                <div className="page-header-left">
                    <h1>Gestion des cautions</h1>
                    <p>Liste complète des cautions</p>
                </div>
                <div className="page-header-right">
                    {isAllowed && (
                        <Button
                            label="Nouvelle caution"
                            icon={<FaPlus />}
                            onClick={() => {
                                setEditing(null);
                                setIsModalOpen(true);
                            }}
                        />)}
                </div>
            </div>

            <Table
                columns={columns}
                data={cautions}
                actions={(row) => (
                    isAllowed ? (
                        <>
                            <ButtonTable
                                icon={<FaEdit />}
                                onClick={() => {
                                    setEditing(row);
                                    setIsModalOpen(true);
                                }}
                            />
                            <ButtonTable
                                icon={<FaTrash />}
                                variant="danger"
                                onClick={() => handleDelete(row.id)}
                            />
                        </>) : null
                )}
            />

            <Modal
                isOpen={isModalOpen}
                onClose={() => {
                    setIsModalOpen(false);
                    setEditing(null);
                }}
                title={editing ? "Modifier la caution" : "Créer une caution"}
            >
                <CautionForm
                    initialData={editing ?? undefined}
                    onSubmit={handleSave}
                    onCancel={() => {
                        setIsModalOpen(false);
                        setEditing(null);
                    }}
                />
            </Modal>

        </div>
    );
}
