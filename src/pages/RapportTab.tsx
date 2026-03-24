import { useState } from "react";
import { Table, type Column } from "../components/Table";
import OperationFilters from "../components/OperationFilters";
import ReportCards from "../components/ReportCards";

import { useOperations } from "../hooks/useOperations";
import { operationSegmentsService } from "../services/OperationSegmentsService";
import { serviceService } from "../services/ServiceService";
import { otherOperationService } from "../services/OtherOperationService";

export default function ReportTab() {

    const { operations } = useOperations();

    const [reportStart, setReportStart] = useState("");
    const [reportEnd, setReportEnd] = useState("");
    const [reportRef, setReportRef] = useState("");
    const [reportData, setReportData] = useState<any[]>([]);

    const generateReport = async () => {

        const start = reportStart ? new Date(reportStart) : null;
        const end = reportEnd ? new Date(reportEnd) : null;
        const ref = reportRef.trim();
        const otherOps = await otherOperationService.getAllWithDetails();

        // Filtrer les opérations
        const filteredOps = operations.filter(o => {
            const d = new Date(o.date_demande || "");
            if (start && d < start) return false;
            if (end && d > end) return false;
            if (ref && o.receipt_reference?.trim() !== ref) return false;
            return true;
        });

        // Map pour accès rapide aux opérations
        const operationMap = new Map(filteredOps.map(o => [o.id, o]));

        // Charger tous les segments enrichis
        const allSegments = await operationSegmentsService.getAllWithDetails();
        // Charger tous les services
        const allServices = await serviceService.getAll();
        const serviceMap = new Map(allServices.map(s => [s.id, s]));

        // Construire reportData à partir des segments
        const opsWithSegments = allSegments
            .filter(s => operationMap.has(s.operation_id))
            .map(s => {

                const operation = operationMap.get(s.operation_id);

                const service = serviceMap.get(operation?.service_id || "");

                return {
                    type: "billetterie",

                    receipt_reference: operation?.receipt_reference || "",
                    client_name: s.operation_client || "",

                    service_name: service?.name || "",

                    tht: s.tht || 0,
                    tax: s.tax || 0,

                    total_amount: operation?.amount_received || 0,

                    service_fee: s.service_fee || 0,
                    related_costs: s.related_costs || 0,
                    commission: s.commission || 0,
                    sold_debit: s.sold_debit || 0,

                    update_price: s.update_price || 0,
                    cancel_price: s.cancel_price || 0,

                    operation_type: s.operation_type,
                    itineraire: s.itineraire || "",

                    status: operation?.status || "",

                    date_demande: s.operation_date || "",

                    airline_name: s.airline_name,
                    system_name: s.system_name,
                };
            });

        const others = ref
            ? []
            : otherOps
                .filter(o => {
                    const d = new Date(o.date_demande || "");

                    if (start && d < start) return false;
                    if (end && d > end) return false;

                    return true;
                })
                .map(o => ({

                    type: "assistance",

                    receipt_reference: o.receipt_reference || "",
                    client_name: o.client_name || "",
                    service_name: o.service_name || "",

                    tht: "",
                    tax: "",

                    service_fee: o.service_fee || 0,
                    related_costs: 0,
                    commission: 0,

                    total_amount: o.total_amount || 0,

                    sold_debit: "",

                    operation_type: "",
                    itineraire: "",

                    airline_name: "",
                    system_name: "",
                    itineraire_code: "",

                    status: o.status,
                    date_demande: o.date_demande
                }));

        setReportData([...opsWithSegments, ...others]);
    };

    /* ========================= */
    /* STATISTIQUES              */
    /* ========================= */

    // Pour total ventes, on prend chaque opération unique (par receipt_reference)
    const uniqueOperations = Array.from(
        new Map(
            reportData
                .filter(r => r.type === "billetterie")
                .map(r => [r.receipt_reference, r])
        ).values()
    );

    const totalSales = uniqueOperations
        .filter(r => r.status !== "cancelled")
        .reduce(
            (sum, r) => sum + Number(r.total_amount || 0),
            0
        );

    const totalCommission = reportData
        .filter(r => r.type === "billetterie")
        .reduce((sum, r) => sum + Number(r.commission || 0), 0);

    const totalAssist = reportData
        .filter(r => r.type === "assistance")
        .reduce((sum, r) => sum + Number(r.total_amount || 0), 0);

    /* ========================= */
    /* TABLE                     */
    /* ========================= */

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
        {
            key: "update_price",
            label: "Frais de modification",
            render: (row) => {
                const value = Number(row.update_price ?? 0);
                return (
                    <span className={value > 0 ? "amount-change" : ""}>
                        {value.toFixed(2)}
                    </span>
                );
            }
        },
        {
            key: "cancel_price",
            label: "Frais d'annulation",
            render: (row) => {
                const value = Number(row.cancel_price ?? 0);
                return (
                    <span className={value > 0 ? "amount-canceled" : ""}>
                        {value.toFixed(2)}
                    </span>
                );
            }
        },
        { key: "total_amount", label: "Montant" },
        {
            key: "sold_debit",
            label: "Débit partenaire",
            render: (row) => {
                const value = Number(row.sold_debit ?? 0);

                let className = "";
                if (row.operation_type === "sale") className = "amount-sale";
                if (row.operation_type === "change") className = "amount-change";
                if (row.operation_type === "canceled") className = "amount-canceled";

                return <span className={className}>{value.toFixed(2)}</span>;
            }
        },
        {
            key: "operation_type",
            label: "Sale / Change",
            render: (row) => {

                let label = "";
                let className = "";

                switch (row.operation_type) {
                    case "sale":
                        label = "Sale";
                        className = "op-sale";
                        break;

                    case "change":
                        label = "Change";
                        className = "op-change";
                        break;

                    case "canceled":
                        label = "Canceled";
                        className = "op-canceled";
                        break;
                }

                return <span className={className}>{label}</span>;
            }
        },
        { key: "airline_name", label: "Compagnie" },
        { key: "system_name", label: "System" },
        { key: "itineraire", label: "Code itinéraire" },
        { key: "status", label: "Statut" },
        {
            key: "date_demande",
            label: "Date",
            render: (row) =>
                row.date_demande
                    ? row.date_demande.split("T")[0]
                    : ""
        }
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