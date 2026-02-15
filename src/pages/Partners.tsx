import { useEffect, useState } from "react";
import { FaPlus } from "react-icons/fa";
import { Button } from "../components/Button";
import { Table, type Column } from "../components/Table";
import { Modal } from "../components/Modal";
import "../styles/pages.css";
import PartnerForm from "../components/forms/PartnerForm";
import { partnerService } from "../services/PartnerService";
import type { Partner } from "../types/partner";

export default function Partners() {
    const [partners, setPartners] = useState<Partner[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);

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

    // Charger tous les partenaires depuis IndexedDB
    const loadPartners = async () => {
        const allPartners = await partnerService.getAll();
        setPartners(allPartners);
    };

    useEffect(() => {
        loadPartners();
    }, []);

    // Création d'un partenaire
    const handleCreatePartner = async (data: Partial<Partner>) => {
        const newPartner = await partnerService.create(data);
        setPartners(prev => [...prev, newPartner]);
        setIsModalOpen(false);
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
                    <Button
                        label="Créer un partenaire"
                        icon={<FaPlus />}
                        variant="info"
                        onClick={() => setIsModalOpen(true)}
                    />
                </div>
            </div>

            {/* BODY */}
            <div className="page-body">
                <Table columns={columns} data={partners} />
            </div>

            {/* MODAL */}
            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title="Créer un partenaire"
            >
                <PartnerForm
                    onCancel={() => setIsModalOpen(false)}
                    onSubmit={handleCreatePartner}
                />
            </Modal>

        </div>
    );
}
