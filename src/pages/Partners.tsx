import { useEffect, useState } from "react";
import { FaPlus, FaEdit, FaTrash } from "react-icons/fa";
import { Button } from "../components/Button";
import { Table, type Column } from "../components/Table";
import { Modal } from "../components/Modal";
import PartnerForm from "../components/forms/PartnerForm";
import "../styles/pages.css";
import { partnerService } from "../services/PartnerService";
import type { Partner } from "../types/partner";
import { ButtonTable } from "../components/ButtonTable";
import { useAuth } from "../auth/AuthContext";
import { canEditOperation } from "../utils/permissions";

export default function PartnersPage() {
    const [partners, setPartners] = useState<Partner[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingPartner, setEditingPartner] = useState<Partner | null>(null);

    const { user } = useAuth();
    const isAllowed = canEditOperation(user?.role);

    // Colonnes du tableau
    const columns: Column<Partner>[] = [
        { key: "name", label: "Nom du partenaire" },
        { key: "type", label: "Type" },
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

    // Charger tous les partenaires
    const loadPartners = async () => {
        const allPartners = await partnerService.getAll();
        setPartners(allPartners);
    };

    useEffect(() => {
        loadPartners();
    }, []);

    // Création ou mise à jour d'un partenaire
    const handleSubmit = async (data: Partial<Partner>) => {
        if (editingPartner) {
            // Mise à jour
            const updated = await partnerService.update(editingPartner.id, data);
            if (updated) {
                setPartners(prev =>
                    prev.map(p => (p.id === updated.id ? updated : p))
                );
            }
            setEditingPartner(null);
        } else {
            // Création
            const created = await partnerService.create(data);
            setPartners(prev => [...prev, created]);
        }
        setIsModalOpen(false);
    };

    // Éditer un partenaire
    const handleEdit = (partner: Partner) => {
        setEditingPartner(partner);
        setIsModalOpen(true);
    };

    // Supprimer un partenaire
    const handleDelete = async (id: string) => {
        await partnerService.delete(id);
        setPartners(prev => prev.filter(p => p.id !== id));
    };

    return (
        <div className="page-container">
            {/* HEADER */}
            <div className="page-header">
                <div className="page-header-left">
                    <h1>Gestion des partenaires</h1>
                    <p>Liste complète des partenaires</p>
                </div>
                <div className="page-header-right">
                    {isAllowed && (
                        <Button
                            label="Créer un partenaire"
                            icon={<FaPlus />}
                            variant="info"
                            onClick={() => {
                                setEditingPartner(null);
                                setIsModalOpen(true);
                            }}
                        />
                    )}
                </div>
            </div>

            {/* TABLEAU */}
            <Table
                columns={columns}
                data={partners}
                actions={(row: Partner) => (
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
                        </>
                    ) : null
                )}
            />

            {/* MODAL */}
            <Modal
                isOpen={isModalOpen}
                onClose={() => {
                    setEditingPartner(null);
                    setIsModalOpen(false);
                }}
                title={editingPartner ? "Modifier un partenaire" : "Créer un partenaire"}
            >
                <PartnerForm
                    initialData={editingPartner ?? undefined}
                    onSubmit={handleSubmit}
                    onCancel={() => {
                        setEditingPartner(null);
                        setIsModalOpen(false);
                    }}
                />
            </Modal>
        </div>
    );
}
