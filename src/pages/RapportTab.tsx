import { useState } from "react";
import { Table, type Column } from "../components/Table";
import OperationFilters from "../components/OperationFilters";
import ReportCards from "../components/ReportCards";

import { useOperations } from "../hooks/useOperations";
import { useAssistances } from "../hooks/useAssistances";

export default function ReportTab() {

    const { operations } = useOperations();
    const { assistances } = useAssistances();

    const [reportStart, setReportStart] = useState("");
    const [reportEnd, setReportEnd] = useState("");
    const [reportRef, setReportRef] = useState("");
    const [reportData, setReportData] = useState<any[]>([]);

    const generateReport = () => {

        const start = reportStart ? new Date(reportStart) : null;
        const end = reportEnd ? new Date(reportEnd) : null;
        const ref = reportRef.trim();

        const ops = operations
            .filter(o => {
                const d = new Date(o.date_emission || "");
                if (start && d < start) return false;
                if (end && d > end) return false;
                if (ref && o.receipt_reference?.trim() !== ref) return false;
                return true;
            })
            .map(o => ({ ...o, type: "billetterie" }));

        const assists = ref
            ? []
            : assistances
                .filter(a => {
                    const d = new Date(a.date_demande || "");
                    if (start && d < start) return false;
                    if (end && d > end) return false;
                    return true;
                })
                .map(a => ({ ...a, type: "assistance" }));

        setReportData([...ops, ...assists]);
    };

    const totalSales = reportData
        .filter(r => r.type === "billetterie")
        .reduce((s, r) => s + Number(r.total_amount || 0), 0);

    const totalAssist = reportData
        .filter(r => r.type === "assistance")
        .reduce((s, r) => s + Number(r.total_amount || 0), 0);

    const totalCommission = reportData
        .filter(r => r.type === "billetterie")
        .reduce((s, r) => s + Number(r.total_commission || 0), 0);

    const columns: Column<any>[] = [
        { key: "type", label: "Type" },
        { key: "receipt_reference", label: "Référence" },
        { key: "client_name", label: "Client" },
        { key: "service_name", label: "Service" },
        { key: "total_amount", label: "Montant" },
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