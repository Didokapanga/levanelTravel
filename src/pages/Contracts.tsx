import React, { useEffect, useState } from "react";
import { FaPlus, FaEdit, FaTrash } from "react-icons/fa";
import { Button } from "../components/Button";
import { Table, type Column } from "../components/Table";
import { Modal } from "../components/Modal";
import "../styles/pages.css";
import { contractService } from "../services/ContractService";
import { partnerService } from "../services/PartnerService"; // <- service partenaires
import type { Contract } from "../types/contract";
import type { Partner } from "../types/partner";
import { ButtonTable } from "../components/ButtonTable";
import ContractForm from "../components/forms/ContractForm";
import { useAuth } from "../auth/AuthContext";
import { canEditOperation } from "../utils/permissions";

export default function Contracts() {
    const [contracts, setContracts] = useState<Contract[]>([]);
    const [partners, setPartners] = useState<Partner[]>([]); // <- nouvel état
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingContract, setEditingContract] = useState<Contract | null>(null);

    const { user } = useAuth();
    const isAllowed = canEditOperation(user?.role);

    const partnerMap = React.useMemo(() => {
        return Object.fromEntries(
            partners.map(p => [p.id, p.name])
        );
    }, [partners]);

    const columns: Column<Contract>[] = [
        {
            key: 'partner_id', label: 'Partenaire',
            render: (row) => partnerMap[row.partner_id] ?? '—'
        },
        { key: "contract_type", label: "Type" },
        { key: "status", label: "Status" },
        { key: "start_date", label: "Début" },
        { key: "end_date", label: "Fin" },
        { key: "description", label: "Description" },
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
    ];

    const loadContracts = async () => {
        const all = await contractService.getAll();
        setContracts(all);
    };

    const loadPartners = async () => {
        const all = await partnerService.getAll(); // récupérer tous les partenaires
        setPartners(all);
    };

    useEffect(() => {
        loadContracts();
        loadPartners(); // charger partenaires
    }, []);

    const handleCreateContract = async (data: Partial<Contract>) => {
        if (editingContract) {
            const updated = await contractService.update(editingContract.id, data);
            setContracts(prev =>
                prev.map(c => (c.id === updated?.id ? updated : c))
            );
            setEditingContract(null);
        } else {
            const created = await contractService.create(data);
            setContracts(prev => [...prev, created]);
        }
        setIsModalOpen(false);
    };

    const handleEdit = (contract: Contract) => {
        setEditingContract(contract);
        setIsModalOpen(true);
    };

    const handleDelete = async (id: string) => {
        await contractService.delete(id);
        setContracts(prev => prev.filter(c => c.id !== id));
    };

    return (
        <div className="page-container">
            <div className="page-header">
                <div className="page-header-left">
                    <h1>Gestion des contrats</h1>
                    <p>Liste complète des contrats</p>
                </div>
                <div className="page-header-right">
                    {isAllowed && (
                        <Button
                            label="Créer un contrat"
                            icon={<FaPlus />}
                            variant="info"
                            onClick={() => {
                                setEditingContract(null);
                                setIsModalOpen(true);
                            }}
                        />)}
                </div>
            </div>

            <Table
                columns={columns}
                data={contracts}
                actions={(row: Contract) => (
                    isAllowed ? (
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
                        </>) : null
                )}
            />

            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={editingContract ? "Modifier un contrat" : "Créer un contrat"}
            >
                <ContractForm
                    onSubmit={handleCreateContract}
                    onCancel={() => {
                        setEditingContract(null);
                        setIsModalOpen(false);
                    }}
                    initialData={editingContract ?? undefined}
                    partners={partners} // <-- ajouté ici
                />
            </Modal>
        </div>
    );
}
