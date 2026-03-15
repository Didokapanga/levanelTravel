// src/pages/Clients.tsx
import { useEffect, useState } from "react";
import { FaPlus, FaEdit, FaTrash } from "react-icons/fa";
import { Button } from "../components/Button";
import { Table, type Column } from "../components/Table";
import { Modal } from "../components/Modal";
import "../styles/pages.css";
import { clientService } from "../services/ClientService";
import type { Clients } from "../types/clients";
import { ButtonTable } from "../components/ButtonTable";
import { useAuth } from "../auth/AuthContext";
import { canEditOperation } from "../utils/permissions";
import ClientForm from "../components/forms/ClientForm";

export default function ClientsPage() {
    const [clients, setClients] = useState<Clients[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingClient, setEditingClient] = useState<Clients | null>(null);

    const { user } = useAuth();
    const isAllowed = canEditOperation(user?.role);

    const columns: Column<Clients>[] = [
        { key: "name", label: "Nom" },
        { key: "client_type", label: "Type" },
        { key: "phone", label: "Téléphone" },
        { key: "contact_person", label: "Personne a contacter" },
        { key: "email", label: "Email" },
        { key: "tax_number", label: "N° Impot / RCCM" },
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

    const loadClients = async () => {
        const all = await clientService.getAll();
        setClients(all);
    };

    useEffect(() => {
        loadClients();
    }, []);

    const handleCreateClient = async (data: Partial<Clients>) => {
        if (editingClient) {
            const updated = await clientService.update(editingClient.id, data);
            setClients(prev =>
                prev.map(c => (c.id === updated?.id ? updated : c))
            );
            setEditingClient(null);
        } else {
            const created = await clientService.create(data);
            setClients(prev => [...prev, created]);
        }
        setIsModalOpen(false);
    };

    const handleEdit = (client: Clients) => {
        setEditingClient(client);
        setIsModalOpen(true);
    };

    const handleDelete = async (id: string) => {
        await clientService.delete(id);
        setClients(prev => prev.filter(c => c.id !== id));
    };

    return (
        <div className="page-container">
            <div className="page-header">
                <div className="page-header-left">
                    <h1>Gestion des clients</h1>
                    <p>Liste complète des clients</p>
                </div>
                <div className="page-header-right">
                    {isAllowed && (
                        <Button
                            label="Créer un client"
                            icon={<FaPlus />}
                            variant="info"
                            onClick={() => {
                                setEditingClient(null);
                                setIsModalOpen(true);
                            }}
                        />
                    )}
                </div>
            </div>

            <Table
                columns={columns}
                data={clients}
                actions={(row: Clients) => (
                    isAllowed ? (
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
                    ) : null
                )}
            />

            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={editingClient ? "Modifier un client" : "Créer un client"}
            >
                <ClientForm
                    onSubmit={handleCreateClient}
                    onCancel={() => {
                        setEditingClient(null);
                        setIsModalOpen(false);
                    }}
                    initialData={editingClient ?? undefined}
                />
            </Modal>
        </div>
    );
}