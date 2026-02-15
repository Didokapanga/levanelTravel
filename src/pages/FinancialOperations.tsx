// src/pages/FinancialOperations.tsx
import { useEffect, useState } from "react";
import { Table, type Column } from "../components/Table";
import "../styles/pages.css";
import { financialOperationService } from "../services/FinancialOperationService";
import type { FinancialOperationWithDetails } from "../types/fiancial_operation";

export default function FinancialOperationsPage() {
    const [operations, setOperations] = useState<FinancialOperationWithDetails[]>([]);

    // Colonnes du tableau
    const columns: Column<FinancialOperationWithDetails>[] = [
        { key: "reservation_id", label: "Réservation" },
        { key: "contract_type", label: "Type contrat" },
        { key: "partner_name", label: "Partenaire" },
        { key: "source", label: "Source" },
        { key: "type", label: "Type opération" },
        { key: "amount", label: "Montant" },
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
        { key: "description", label: "Description" },
    ];

    const loadOperations = async () => {
        const all = await financialOperationService.getAllWithDetails();
        setOperations(all);
    };

    useEffect(() => {
        loadOperations();
    }, []);

    return (
        <div className="page-container">
            <div className="page-header">
                <div className="page-header-left">
                    <h1>Opérations financières</h1>
                    <p>Liste complète des opérations automatiques</p>
                </div>
            </div>

            <div className="page-body">
                <Table
                    columns={columns}
                    data={operations}
                />
            </div>
        </div>
    );
}
