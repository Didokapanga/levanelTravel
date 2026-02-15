import { useEffect, useState } from "react";
import { FaPlus, FaEdit, FaTrash } from "react-icons/fa";
import { Button } from "../components/Button";
import { Table, type Column } from "../components/Table";
import { Modal } from "../components/Modal";
import AirlineForm from "../components/forms/AirlineForm";
import "../styles/pages.css";
import { airlineService } from "../services/AirlineService";
import type { Airline } from "../types/airline";
import { ButtonTable } from "../components/ButtonTable";

export default function Airlines() {
    const [airlines, setAirlines] = useState<Airline[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingAirline, setEditingAirline] = useState<Airline | null>(null);

    const columns: Column<Airline>[] = [
        { key: "code", label: "Code" },
        { key: "name", label: "Nom complet" },
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

    const loadAirlines = async () => {
        const all = await airlineService.getAll();
        setAirlines(all);
    };

    useEffect(() => {
        loadAirlines();
    }, []);

    const handleCreateAirline = async (data: Partial<Airline>) => {
        if (editingAirline) {
            const updated = await airlineService.update(editingAirline.id, data);
            setAirlines(prev =>
                prev.map(a => (a.id === updated?.id ? updated : a))
            );
            setEditingAirline(null);
        } else {
            const created = await airlineService.create(data);
            setAirlines(prev => [...prev, created]);
        }
        setIsModalOpen(false);
    };

    const handleEdit = (airline: Airline) => {
        setEditingAirline(airline);
        setIsModalOpen(true);
    };

    const handleDelete = async (id: string) => {
        await airlineService.delete(id);
        setAirlines(prev => prev.filter(a => a.id !== id));
    };

    return (
        <div className="page-container">
            <div className="page-header">
                <div className="page-header-left">
                    <h1>Gestion des compagnies aériennes</h1>
                    <p>Liste complète des airlines</p>
                </div>
                <div className="page-header-right">
                    <Button
                        label="Créer une compagnie"
                        icon={<FaPlus />}
                        variant="info"
                        onClick={() => {
                            setEditingAirline(null);
                            setIsModalOpen(true);
                        }}
                    />
                </div>
            </div>

            <div className="page-body">
                <Table
                    columns={columns}
                    data={airlines}
                    actions={(row: Airline) => (
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
            </div>

            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={editingAirline ? "Modifier une compagnie" : "Créer une compagnie"}
            >
                <AirlineForm
                    onSubmit={handleCreateAirline}
                    onCancel={() => {
                        setEditingAirline(null);
                        setIsModalOpen(false);
                    }}
                    initialData={editingAirline ?? undefined}
                />
            </Modal>
        </div>
    );
}
