import { useEffect, useState } from "react";
import { FaPlus, FaEdit, FaTrash } from "react-icons/fa";
import { Button } from "../components/Button";
import { Table, type Column } from "../components/Table";
import { Modal } from "../components/Modal";
import UserForm from "../components/forms/UserForm";
import { userService } from "../services/UserService";
import type { User } from "../types/users";
import "../styles/pages.css";
import { useAuth } from "../auth/AuthContext";
import { canManagerOperation } from "../utils/permissions";
import { ButtonTable } from "../components/ButtonTable";

export default function Users() {
    const [users, setUsers] = useState<User[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<User | null>(null);

    const { user } = useAuth();
    const isAllowed = canManagerOperation(user?.role);

    const columns: Column<User>[] = [
        { key: "username", label: "Nom" },
        { key: "email", label: "Email" },
        { key: "role", label: "Rôle" },
        {
            key: "created_at",
            label: "Date de création",
            render: (row) =>
                row.created_at
                    ? row.created_at.split("T")[0]
                    : ""
        },
        {
            key: "sync_status",
            label: "Statut sync",
            render: (row) => {
                let badgeClass = "";
                let label = "";

                switch (row.sync_status) {
                    case "clean":
                        badgeClass = "badge-clean";
                        label = "Clean";
                        break;
                    case "dirty":
                        badgeClass = "badge-dirty";
                        label = "Dirty";
                        break;
                    case "conflict":
                        badgeClass = "badge-conflict";
                        label = "Conflict";
                        break;
                    default:
                        badgeClass = "";
                        label = row.sync_status || "";
                        break;
                }

                return <span className={`badge ${badgeClass}`}>{label}</span>;
            },
        },
    ];

    const loadUsers = async () => {
        const allUsers = await userService.getAll();
        setUsers(allUsers);
    };

    useEffect(() => {
        loadUsers();
    }, []);

    const handleSubmitUser = async (data: Partial<User>) => {
        try {
            if (editingUser) {
                const updatedUser = await userService.update(editingUser.id, data);

                setUsers((prev) =>
                    prev.map((u) => (u.id === updatedUser?.id ? updatedUser : u))
                );

                setEditingUser(null);
            } else {
                const createdUser = await userService.create(data);
                setUsers((prev) => [...prev, createdUser]);
            }

            setIsModalOpen(false);
        } catch (err: any) {
            console.error(err);
            alert(err.message);
        }
    };

    const handleEdit = (user: User) => {
        setEditingUser(user);
        setIsModalOpen(true);
    };

    const handleDelete = async (id: string) => {
        try {
            await userService.delete(id);
            setUsers((prev) => prev.filter((u) => u.id !== id));
        } catch (err: any) {
            console.error(err);
            alert(err.message);
        }
    };

    return (
        <div className="page-container">
            <div className="page-header">
                <div className="page-header-left">
                    <h1>Gestion des utilisateurs</h1>
                    <p>Liste complète des comptes utilisateurs</p>
                </div>

                <div className="page-header-right">
                    {isAllowed && (
                        <Button
                            label="Créer un utilisateur"
                            icon={<FaPlus />}
                            variant="info"
                            onClick={() => {
                                setEditingUser(null);
                                setIsModalOpen(true);
                            }}
                        />
                    )}
                </div>
            </div>

            <Table
                columns={columns}
                data={users}
                actions={(row: User) =>
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

            <Modal
                isOpen={isModalOpen}
                onClose={() => {
                    setEditingUser(null);
                    setIsModalOpen(false);
                }}
                title={editingUser ? "Modifier un utilisateur" : "Créer un utilisateur"}
            >
                <UserForm
                    onSubmit={handleSubmitUser}
                    onCancel={() => {
                        setEditingUser(null);
                        setIsModalOpen(false);
                    }}
                    initialData={editingUser ?? undefined}
                />
            </Modal>
        </div>
    );
}