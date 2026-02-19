import { useEffect, useState } from "react";
import { FaPlus, FaEdit, FaTrash } from "react-icons/fa";
import { Button } from "../components/Button";
import { Table, type Column } from "../components/Table";
import { Modal } from "../components/Modal";
import "../styles/pages.css";
import ServiceForm from "../components/forms/ServiceForm";
import type { Service } from "../types/service";
import { serviceService } from "../services/ServiceService";
import { ButtonTable } from "../components/ButtonTable";
import { useAuth } from "../auth/AuthContext";
import { canEditOperation } from "../utils/permissions";

export default function ServicesPage() {
    const [services, setServices] = useState<Service[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingService, setEditingService] = useState<Service | null>(null);

    const { user } = useAuth();
    const isAllowed = canEditOperation(user?.role);

    const columns: Column<Service>[] = [
        { key: "name", label: "Nom du service" },
        { key: "initial", label: "Initial" },
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

    // Chargement depuis IndexedDB
    const loadServices = async () => {
        const allServices = await serviceService.getAll();
        setServices(allServices);
    };

    useEffect(() => {
        loadServices();
    }, []);

    // Création ou mise à jour
    const handleSubmit = async (data: Partial<Service>) => {
        if (editingService) {
            const updated = await serviceService.update(editingService.id, data);
            if (updated) {
                setServices(prev =>
                    prev.map(s => (s.id === updated.id ? updated : s))
                );
            }
            setEditingService(null);
        } else {
            const created = await serviceService.create(data);
            setServices(prev => [...prev, created]);
        }
        setIsModalOpen(false);
    };

    const handleEdit = (service: Service) => {
        setEditingService(service);
        setIsModalOpen(true);
    };

    const handleDelete = async (id: string) => {
        await serviceService.delete(id);
        setServices(prev => prev.filter(s => s.id !== id));
    };

    return (
        <div className="page-container">

            {/* HEADER */}
            <div className="page-header">
                <div className="page-header-left">
                    <h1>Gestion des services</h1>
                    <p>Liste complète des services disponibles</p>
                </div>
                <div className="page-header-right">
                    {isAllowed && (
                        <Button
                            label="Créer un service"
                            icon={<FaPlus />}
                            variant="info"
                            onClick={() => {
                                setEditingService(null);
                                setIsModalOpen(true);
                            }}
                        />
                    )}
                </div>
            </div>

            {/* TABLEAU */}
            <Table
                columns={columns}
                data={services}
                actions={(row: Service) =>
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
                }
            />

            {/* MODAL */}
            <Modal
                isOpen={isModalOpen}
                onClose={() => {
                    setEditingService(null);
                    setIsModalOpen(false);
                }}
                title={editingService ? "Modifier un service" : "Créer un service"}
            >
                <ServiceForm
                    initialData={editingService ?? undefined}
                    onSubmit={handleSubmit}
                    onCancel={() => {
                        setEditingService(null);
                        setIsModalOpen(false);
                    }}
                />
            </Modal>
        </div>
    );
}
