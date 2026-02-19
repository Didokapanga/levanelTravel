import { useEffect, useState } from "react";
import Tabs from "../components/Tabs";
import { Button } from "../components/Button";
import { ButtonTable } from "../components/ButtonTable";
import { Table, type Column } from "../components/Table";
import { Modal } from "../components/Modal";

import OperationForm from "../components/forms/OperationForm";

import { FaPlus, FaEdit, FaTrash, FaFileAlt, FaFileInvoice } from "react-icons/fa";

import "../styles/pages.css";

import { operationService } from "../services/OperationService";
import type { Operations } from "../types/operations";
import type { OperationWithDetails } from "../types/operations";
import type { OrtherOperations } from "../types/orther_operations";
import { otherOperationService } from "../services/OtherOperationService";
import OtherOperationForm from "../components/forms/OtherOperationForm";
import { useAuth } from "../auth/AuthContext";
import { canEditOperation } from "../utils/permissions";
import { invoiceService } from "../services/InvoiceService";


export default function OperationsPage() {

    const [activeTab, setActiveTab] = useState("billetterie");

    const [operations, setOperations] = useState<OperationWithDetails[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingOperation, setEditingOperation] = useState<Operations | null>(null);

    const [assistances, setAssistances] = useState<OrtherOperations[]>([]);
    const [isAssistModalOpen, setIsAssistModalOpen] = useState(false);
    const [editingAssist, setEditingAssist] = useState<OrtherOperations | null>(null);

    const { user } = useAuth();
    const isAllowed = canEditOperation(user?.role);

    /* ========================= */
    /* LOAD DATA                 */
    /* ========================= */

    const loadOperations = async () => {
        const data = await operationService.getAllWithDetails();
        setOperations(data);
    };

    useEffect(() => {
        loadOperations();
    }, []);

    /* Assistance*/

    const loadAssistances = async () => {
        const data = await otherOperationService.getAllWithDetails();
        setAssistances(data);
    };

    useEffect(() => {
        loadAssistances();
    }, []);


    /* ========================= */
    /* CRUD                      */
    /* ========================= */

    const handleSubmit = async (data: Partial<Operations>) => {

        if (editingOperation) {
            await operationService.update(editingOperation.id, data);
        } else {
            await operationService.create(data);
        }

        setEditingOperation(null);
        setIsModalOpen(false);
        loadOperations();
    };

    const handleEdit = (op: Operations) => {
        setEditingOperation(op);
        setIsModalOpen(true);
    };

    const handleDelete = async (id: string) => {
        await operationService.delete(id);
        loadOperations();
    };

    /* Assistance */

    const handleAssistSubmit = async (data: Partial<OrtherOperations>) => {

        if (editingAssist) {
            await otherOperationService.update(editingAssist.id, data);
        } else {
            await otherOperationService.create(data);
        }

        setEditingAssist(null);
        setIsAssistModalOpen(false);
        loadAssistances();
    };

    const handleAssistEdit = (op: OrtherOperations) => {
        setEditingAssist(op);
        setIsAssistModalOpen(true);
    };

    const handleAssistDelete = async (id: string) => {
        await otherOperationService.delete(id);
        loadAssistances();
    };

    /* ========================= */
    /* TABLE COLUMNS             */
    /* ========================= */

    const columns: Column<OperationWithDetails>[] = [
        { key: "receipt_reference", label: "Référence reçu" },
        { key: "partner_name", label: "Partenaire" },
        { key: "service_name", label: "Service" },
        { key: "client_name", label: "Client" },
        { key: "total_amount", label: "TTC" },
        { key: "total_commission", label: "Commission" },
        { key: "total_tax", label: "Tax" },
        { key: "status", label: "Status" },
        { key: "date_emission", label: "Date émission" },
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

    /* Assistance */

    const assistColumns: Column<OrtherOperations>[] = [
        { key: "client_name", label: "Client" },
        { key: "service_name", label: "Service" },
        { key: "total_amount", label: "Montant" },
        { key: "service_fee", label: "Frais service" },
        { key: "status", label: "Status" },
        { key: "date_demande", label: "Date demande" },
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
                }

                return <span className={`badge ${badgeClass}`}>{label}</span>;
            }
        }
    ];

    return (
        <div className="page-container">

            <div className="page-header">
                <div className="page-header-left">
                    <h1>Opérations</h1>
                    <p>Gestion des activités opérationnelles</p>
                </div>
            </div>

            <Tabs
                tabs={[
                    { id: "billetterie", label: "🎫 Billetterie" },
                    { id: "assistance", label: "🛎 Assistance" },
                    { id: "rapport", label: "📊 Rapport" }
                ]}
                defaultTab="billetterie"
                onChange={setActiveTab}
            />

            {/* ======================= */}
            {/* BILLETTERIE             */}
            {/* ======================= */}
            {activeTab === "billetterie" && (
                <>
                    <div style={{ marginBottom: 15 }}>
                        {isAllowed && (
                            <Button
                                label="Nouvelle opération"
                                icon={<FaPlus />}
                                variant="info"
                                onClick={() => {
                                    setEditingOperation(null);
                                    setIsModalOpen(true);
                                }}
                            />
                        )}
                    </div>

                    <Table
                        columns={columns}
                        data={operations}
                        actions={(row: OperationWithDetails) => (
                            <>
                                {isAllowed && (
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

                                {/* 🔹 Pro-forma */}
                                <ButtonTable
                                    icon={<FaFileAlt />}
                                    variant="info"
                                    onClick={() => invoiceService.generateProforma(row)}
                                />

                                {/* 🔹 Facture archive */}
                                <ButtonTable
                                    icon={<FaFileInvoice />}
                                    variant="secondary"
                                    onClick={() => invoiceService.generateArchive(row)}
                                />
                            </>
                        )}
                    />

                    <Modal
                        isOpen={isModalOpen}
                        onClose={() => setIsModalOpen(false)}
                        title={editingOperation ? "Modifier opération" : "Créer opération"}
                    >
                        <OperationForm
                            initialData={editingOperation ?? undefined}
                            onSubmit={handleSubmit}
                            onCancel={() => {
                                setEditingOperation(null);
                                setIsModalOpen(false);
                            }}
                        />
                    </Modal>
                </>
            )}

            {/* ======================= */}
            {/* ASSISTANCE              */}
            {/* ======================= */}
            {activeTab === "assistance" && (
                <>
                    <div style={{ marginBottom: 15 }}>
                        {isAllowed && (
                            <Button
                                label="Nouvelle assistance"
                                icon={<FaPlus />}
                                variant="info"
                                onClick={() => {
                                    setEditingAssist(null);
                                    setIsAssistModalOpen(true);
                                }}
                            />
                        )}
                    </div>

                    <Table
                        columns={assistColumns}
                        data={assistances}
                        actions={(row: OrtherOperations) => (
                            isAllowed ? (
                                <>
                                    <ButtonTable
                                        icon={<FaEdit />}
                                        variant="secondary"
                                        onClick={() => handleAssistEdit(row)}
                                    />
                                    <ButtonTable
                                        icon={<FaTrash />}
                                        variant="danger"
                                        onClick={() => handleAssistDelete(row.id)}
                                    />
                                </>
                            ) : null
                        )}
                    />

                    <Modal
                        isOpen={isAssistModalOpen}
                        onClose={() => setIsAssistModalOpen(false)}
                        title={editingAssist ? "Modifier assistance" : "Créer assistance"}
                    >
                        <OtherOperationForm
                            initialData={editingAssist ?? undefined}
                            onSubmit={handleAssistSubmit}
                            onCancel={() => {
                                setEditingAssist(null);
                                setIsAssistModalOpen(false);
                            }}
                        />
                    </Modal>
                </>
            )}

            {/* ======================= */}
            {/* RAPPORT                 */}
            {/* ======================= */}
            {activeTab === "rapport" && (
                <div>
                    <h1>Contenu Rapport</h1>
                    <p>Le module est en maintenance</p>
                </div>
            )}

        </div>
    );
}
