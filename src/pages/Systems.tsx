import { useEffect, useState } from "react";
import { FaPlus, FaEdit, FaTrash } from "react-icons/fa";
import { Button } from "../components/Button";
import { Table, type Column } from "../components/Table";
import { Modal } from "../components/Modal";
import SystemForm from "../components/forms/SystemForm";
import "../styles/pages.css";
import { systemService } from "../services/SystemService";
import type { System } from "../types/systems";
import { ButtonTable } from "../components/ButtonTable";

export default function Systems() {
    const [systems, setSystems] = useState<System[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingSystem, setEditingSystem] = useState<System | null>(null);

    const columns: Column<System>[] = [
        { key: "name", label: "Nom du système" },
        { key: "description", label: "Descrition" },
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

    const loadSystems = async () => {
        const all = await systemService.getAll();
        setSystems(all);
    };

    useEffect(() => {
        loadSystems();
    }, []);

    const handleCreateSystem = async (data: Partial<System>) => {
        if (editingSystem) {
            const updated = await systemService.update(editingSystem.id, data);
            setSystems(prev =>
                prev.map(s => (s.id === updated?.id ? updated : s))
            );
            setEditingSystem(null);
        } else {
            const created = await systemService.create(data);
            setSystems(prev => [...prev, created]);
        }
        setIsModalOpen(false);
    };

    const handleEdit = (system: System) => {
        setEditingSystem(system);
        setIsModalOpen(true);
    };

    const handleDelete = async (id: string) => {
        await systemService.delete(id);
        setSystems(prev => prev.filter(s => s.id !== id));
    };

    return (
        <div className="page-container">
            <div className="page-header">
                <div className="page-header-left">
                    <h1>Gestion des systèmes</h1>
                    <p>Liste complète des systèmes</p>
                </div>
                <div className="page-header-right">
                    <Button
                        label="Créer un système"
                        icon={<FaPlus />}
                        variant="info"
                        onClick={() => {
                            setEditingSystem(null);
                            setIsModalOpen(true);
                        }}
                    />
                </div>
            </div>

                <Table
                    columns={columns}
                    data={systems}
                    actions={(row: System) => (
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

            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={editingSystem ? "Modifier un système" : "Créer un système"}
            >
                <SystemForm
                    onSubmit={handleCreateSystem}
                    onCancel={() => {
                        setEditingSystem(null);
                        setIsModalOpen(false);
                    }}
                    initialData={editingSystem ?? undefined}
                />
            </Modal>
        </div>
    );
}
