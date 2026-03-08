import { useState } from "react";
import { Table, type Column } from "../components/Table";
import OperationFilters from "../components/OperationFilters";
import ReportCards from "../components/ReportCards";

import { useOperations } from "../hooks/useOperations";
import { useAssistances } from "../hooks/useAssistances";
import { operationSegmentsService } from "../services/OperationSegmentsService";

export default function ReportTab() {
    const { operations } = useOperations();
    const { assistances } = useAssistances();

    const [reportStart, setReportStart] = useState("");
    const [reportEnd, setReportEnd] = useState("");
    const [reportRef, setReportRef] = useState("");
    const [reportData, setReportData] = useState<any[]>([]);

    const generateReport = async () => {
        const start = reportStart ? new Date(reportStart) : null;
        const end = reportEnd ? new Date(reportEnd) : null;
        const ref = reportRef.trim();

        // Charger tous les segments enrichis
        const allSegments = await operationSegmentsService.getAllWithDetails();

        // Filtrer les opérations
        const filteredOps = operations.filter(o => {
            const d = new Date(o.date_emission || "");
            if (start && d < start) return false;
            if (end && d > end) return false;
            if (ref && o.receipt_reference?.trim() !== ref) return false;
            return true;
        });

        // Construire reportData à partir des segments liés aux opérations
        const opsWithSegments = allSegments
            .filter(s => filteredOps.some(o => o.id === s.operation_id))
            .map(s => ({
                type: "billetterie",
                receipt_reference: s.receipt_reference || s.operation_id,
                client_name: s.operation_client || "",
                service_name: "", // tu peux ajouter si disponible dans operation
                tht: s.tht || 0,
                tax: s.tax || 0,
                total_amount: s.amount_received || 0,
                service_fee: s.service_fee || 0,
                related_costs: s.related_costs || 0,
                commission: s.commission || 0,
                sold_debit: s.sold_debit || 0,
                operation_type: s.operation_type,
                itineraire_id: s.itineraire_id || "",
                status: filteredOps.find(o => o.id === s.operation_id)?.status || "",
                date_emission: s.operation_date || "",
                airline_name: s.airline_name,
                system_name: s.system_name,
                itineraire_code: s.itineraire_code
            }));

        // Filtrer les assistances si pas de référence
        const assists = ref
            ? []
            : assistances.filter(a => {
                const d = new Date(a.date_demande || "");
                if (start && d < start) return false;
                if (end && d > end) return false;
                return true;
            }).map(a => ({ ...a, type: "assistance" }));

        setReportData([...opsWithSegments, ...assists]);
    };

    const totalSales = reportData
        .filter(r => r.type === "billetterie")
        .reduce((s, r) => s + Number(r.total_amount || 0), 0);

    const totalAssist = reportData
        .filter(r => r.type === "assistance")
        .reduce((s, r) => s + Number(r.total_amount || 0), 0);

    const totalCommission = reportData
        .filter(r => r.type === "billetterie")
        .reduce((s, r) => s + Number(r.commission || 0), 0);

    const columns: Column<any>[] = [
        { key: "type", label: "Type" },
        { key: "receipt_reference", label: "Référence" },
        { key: "client_name", label: "Client" },
        { key: "service_name", label: "Service" },
        { key: "tht", label: "THT" },
        { key: "tax", label: "Tax" },
        { key: "service_fee", label: "Frais service" },
        { key: "related_costs", label: "Frais connexe" },
        { key: "commission", label: "Commission" },
        { key: "total_amount", label: "Montant" },
        { key: "sold_debit", label: "Debit partenaire" },
        { key: "operation_type", label: "Sale or change" },
        { key: "itineraire_id", label: "Itineraire" },
        { key: "airline_name", label: "Compagnie" },
        { key: "system_name", label: "System" },
        { key: "itineraire_code", label: "Code itinéraire" },
        { key: "status", label: "Statut" },
        { key: "date_emission", label: "Date" }
    ];

    return (
        <div>
            <OperationFilters
                reportStart={reportStart}
                reportEnd={reportEnd}
                reportRef={reportRef}
                setReportStart={setReportStart}
                setReportEnd={setReportEnd}
                setReportRef={setReportRef}
                onGenerate={generateReport}
            />

            <ReportCards
                totalSales={totalSales}
                totalAssist={totalAssist}
                totalCommission={totalCommission}
                count={reportData.length}
            />

            <Table columns={columns} data={reportData} />
        </div>
    );
}