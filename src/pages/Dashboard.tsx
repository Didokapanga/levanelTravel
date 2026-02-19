// src/pages/Dashboard.tsx
import { useEffect, useState } from "react";
import ActivityList from "../components/ActivityList";
import Card from "../components/Card";
import ListSection from "../components/ListSection";
import "../styles/Dashboard.css";
import type { OperationWithDetails } from "../types/operations";
import { operationService } from "../services/OperationService";
import { operationSegmentsService } from "../services/OperationSegmentsService";
import type { OrtherOperationWithDetails } from "../types/orther_operations";
import { otherOperationService } from "../services/OtherOperationService";
import type { OperationSegmentWithDetails } from "../types/operation_segments";
import { useAuth } from "../auth/AuthContext";

export default function Dashboard() {

    const { isManager } = useAuth(); // 🔹 récupération du rôle

    const [todayCount, setTodayCount] = useState(0);
    const [totalFees, setTotalFees] = useState(0);
    const [totalServiceFee, setTotalServiceFee] = useState(0);
    const [otherOpsToday, setOtherOpsToday] = useState<OrtherOperationWithDetails[]>([]);
    const [otherServiceFee, setOtherServiceFee] = useState(0);
    const [cancelledCount, setCancelledCount] = useState(0);
    const [updatesOrCancellations, setUpdatesOrCancellations] = useState<OperationSegmentWithDetails[]>([]);
    const [validatedOps, setValidatedOps] = useState<OperationWithDetails[]>([]);

    useEffect(() => {
        loadData();
    }, []);

    async function loadData() {
        const today = await operationService.getValidatedToday();
        const fees = await operationService.getTotalServiceFees();
        const cancelledToday = await operationService.getCancelledToday();
        const opsToday = await operationService.getValidatedTodayWithDetails();
        const otherToday = await otherOperationService.getValidatedToday();
        const serviceFee = await operationSegmentsService.getTotalServiceFeeValidated();
        setTotalServiceFee(serviceFee);
        const otherFee = await otherOperationService.getTotalServiceFeeValidatedToday();
        const updatesCancels = await operationSegmentsService.getUpdatesOrCancellations();

        setTodayCount(today.length);
        setTotalFees(fees);
        setValidatedOps(opsToday.slice(0, 10));
        setOtherOpsToday(otherToday);
        setOtherServiceFee(otherFee);
        setCancelledCount(cancelledToday.length);
        setUpdatesOrCancellations(updatesCancels);
    }

    // 🔹 Restriction d'accès si ce n'est pas un manager
    if (!isManager()) {
        return (
            <div className="alert-page">
                <h2>❌ Accès réservé aux managers</h2>
                <p>les accès sont restreint pour la visualisation de certains contenu.</p>
            </div>
        );
    }

    return (
        <div className="dashboard-page">
            {/* LEFT SECTION */}
            <div className="left-section">
                {/* CARDS */}
                <div className="card-section">
                    <Card
                        label="Réservations"
                        value={todayCount}
                        info="Aujourd'hui"
                        icon="🎫"
                    />
                    <Card
                        label="Annulation"
                        value={cancelledCount}
                        info="Réservations"
                        icon="🛑"
                    />
                    <Card
                        label="Commission"
                        value={`${totalFees.toLocaleString()} $`}
                        info="Réservations validées"
                        icon="📈"
                    />
                </div>

                {/* LISTS */}
                <div className="list-section">
                    <div className="list-left">
                        <ListSection
                            leftTitle="Réservations validées"
                            leftItems={validatedOps.map(op => ({
                                id: op.id!,
                                title: op.service_name ?? "Service",
                                subtitle: `Client: ${op.client_name}`,
                                right: `${op.total_amount.toLocaleString()} $`
                            }))}
                        />
                    </div>
                    <div className="list-right">
                        <ListSection
                            leftTitle="Autres opérations"
                            leftItems={otherOpsToday.map(op => ({
                                id: op.id!,
                                title: op.service_name ?? "Autre service",
                                subtitle: `Client: ${op.client_name}`,
                                right: `${(op.total_amount ?? op.service_fee).toLocaleString()} $`
                            }))}
                        />
                    </div>
                </div>
            </div>

            {/* RIGHT SECTION */}
            <div className="right-section">
                <div className="list-up">
                    <Card
                        label="Frais service"
                        value={`${totalServiceFee.toLocaleString()} $`}
                        info="Réservations validées"
                        icon="💰"
                    />
                    <Card
                        label="Frais service"
                        value={`${otherServiceFee.toLocaleString()} $`}
                        info="Autres opérations validées"
                        icon="💰"
                    />
                </div>

                <div className="list-down">
                    <ActivityList
                        title="Annulation et Modification"
                        items={updatesOrCancellations.map((op) => ({
                            id: op.id!,
                            title: op.receipt_reference ?? "Réf inconnue",
                            description: op.operation_client ?? "Client inconnu",
                            value: `${op.update_price && op.update_price > 0
                                ? op.update_price.toLocaleString()
                                : op.cancel_price?.toLocaleString() ?? 0
                                } $`,
                            badge: op.cancel_price && op.cancel_price > 0 ? "Modifier" : "Annuler"
                        }))}
                    />
                </div>
            </div>
        </div>
    );
}
