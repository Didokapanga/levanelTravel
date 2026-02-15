import { useEffect, useState } from "react";
import { FaPlus, FaEdit, FaTrash } from "react-icons/fa";
import { Button } from "../components/Button";
import { Table, type Column } from "../components/Table";
import { Modal } from "../components/Modal";
import ItineraireForm from "../components/forms/ItineraireForm";
import "../styles/pages.css";
import { itineraireService } from "../services/ItineraireService";
import type { Itineraire } from "../types/Itineraire";
import { ButtonTable } from "../components/ButtonTable";

export default function Destination() {
    const [itineraires, setItineraires] = useState<Itineraire[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingItineraire, setEditingItineraire] = useState<Itineraire | null>(null);

    const columns: Column<Itineraire>[] = [
        { key: "code", label: "Code" },
        { key: "country", label: "Pays" },
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

    const loadItineraires = async () => {
        const all = await itineraireService.getAll();
        setItineraires(all);
    };

    useEffect(() => {
        loadItineraires();
    }, []);

    const handleCreateItineraire = async (data: Partial<Itineraire>) => {
        if (editingItineraire) {
            const updated = await itineraireService.update(editingItineraire.id, data);
            setItineraires(prev =>
                prev.map(i => (i.id === updated?.id ? updated : i))
            );
            setEditingItineraire(null);
        } else {
            const created = await itineraireService.create(data);
            setItineraires(prev => [...prev, created]);
        }
        setIsModalOpen(false);
    };

    const handleEdit = (itineraire: Itineraire) => {
        setEditingItineraire(itineraire);
        setIsModalOpen(true);
    };

    const handleDelete = async (id: string) => {
        await itineraireService.delete(id);
        setItineraires(prev => prev.filter(i => i.id !== id));
    };

    return (
        <div className="page-container">
            <div className="page-header">
                <div className="page-header-left">
                    <h1>Gestion des itinéraires</h1>
                    <p>Liste complète des itinéraires</p>
                </div>
                <div className="page-header-right">
                    <Button
                        label="Créer un itinéraire"
                        icon={<FaPlus />}
                        variant="info"
                        onClick={() => {
                            setEditingItineraire(null);
                            setIsModalOpen(true);
                        }}
                    />
                </div>
            </div>

            <div className="page-body">
                <Table
                    columns={columns}
                    data={itineraires}
                    actions={(row: Itineraire) => (
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
                title={editingItineraire ? "Modifier un itinéraire" : "Créer un itinéraire"}
            >
                <ItineraireForm
                    onSubmit={handleCreateItineraire}
                    onCancel={() => {
                        setEditingItineraire(null);
                        setIsModalOpen(false);
                    }}
                    initialData={editingItineraire ?? undefined}
                />
            </Modal>
        </div>
    );
}
