import { useEffect, useState } from "react";
import { FaPlus } from "react-icons/fa";
import { Button } from "../components/Button";
import { Table, type Column } from "../components/Table";
import { Modal } from "../components/Modal";
import UserForm from "../components/forms/UserForm";
import { userService } from "../services/UserService";
import type { User } from "../types/users";
import "../styles/pages.css";

export default function Users() {

    const [users, setUsers] = useState<User[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const columns: Column<User>[] = [
        { key: "username", label: "Nom" },
        { key: "email", label: "Email" },
        { key: "role", label: "Rôle" },
        { key: "created_at", label: "Date de création" },
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

    const handleCreateUser = async (data: any) => {
        try {
            const createdUser = await userService.create(data);

            setUsers(prev => [...prev, createdUser]);
            setIsModalOpen(false);

        } catch (err: any) {
            console.error(err);
            alert(err.message);
        }
    };

    useEffect(() => {
        const loadUsers = async () => {
            const allUsers = await userService.getAll();
            setUsers(allUsers);
        };

        loadUsers();
    }, []);

    return (
        <div className="page-container">

            <div className="page-header">
                <div className="page-header-left">
                    <h1>Gestion des utilisateurs</h1>
                    <p>Liste complète des comptes utilisateurs</p>
                </div>

                <div className="page-header-right">
                    <Button
                        label="Créer un utilisateur"
                        icon={<FaPlus />}
                        variant="info"
                        onClick={() => setIsModalOpen(true)}
                    />
                </div>
            </div>

            <div className="page-body">
                <Table columns={columns} data={users} />
            </div>

            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title="Créer un utilisateur"
            >
                <UserForm
                    onSubmit={handleCreateUser}
                    onCancel={() => setIsModalOpen(false)}
                />
            </Modal>

        </div>
    );
}
