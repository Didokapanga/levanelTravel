import { useEffect, useState } from "react";
import { FaPlus } from "react-icons/fa";
import { Button } from "../components/Button";
import { Table, type Column } from "../components/Table";
import { Modal } from "../components/Modal";
import "../styles/pages.css";
import ServiceForm from "../components/forms/ServiceForm";
import type { Service } from "../types/service";
import { serviceService } from "../services/ServiceService";

export default function Services() {
    const [services, setServices] = useState<Service[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);

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

    // Création d'un service
    const handleCreateService = async (data: Partial<Service>) => {
        const newService = await serviceService.create(data);
        setServices(prev => [...prev, newService]);
        setIsModalOpen(false);
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
                    <Button
                        label="Créer un service"
                        icon={<FaPlus />}
                        variant="info"
                        onClick={() => setIsModalOpen(true)}
                    />
                </div>
            </div>

            {/* BODY */}
            <Table columns={columns} data={services} />

            {/* MODAL */}
            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title="Créer un service"
            >
                <ServiceForm
                    onCancel={() => setIsModalOpen(false)}
                    onSubmit={handleCreateService}
                />
            </Modal>
        </div>
    );
}
