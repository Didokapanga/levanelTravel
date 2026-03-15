import { useState } from "react";
import Tabs from "../components/Tabs";

import BilletterieTab from "./BilletterieTab";
import AssistanceTab from "./AssistanceTab";
import RecoveryTab from "./RecoveryTab";
import ReportTab from "./RapportTab";

import "../styles/pages.css";

import { useNavigate } from "react-router-dom";

import { useAuth } from "../auth/AuthContext";
import { canManagerRapport } from "../utils/permissions";

export default function OperationsPage() {

    const [activeTab, setActiveTab] = useState("billetterie");

    const navigate = useNavigate();

    const { user } = useAuth();
    const canManager = canManagerRapport(user?.role);

    return (

        <div className="page-container">

            <div className="page-header">

                <div className="page-header-left">
                    <h1>Opérations</h1>
                    <p>Gestion des activités opérationnelles</p>
                </div>

                <div className="page-header-right">
                    <button
                        className="btn btn-info"
                        onClick={() => navigate("/clients" as never)}
                    >
                        Gestion Clients
                    </button>
                </div>

            </div>

            <Tabs
                tabs={[

                    { id: "billetterie", label: "🎫 Billetterie" },

                    { id: "assistance", label: "🛎 Assistance" },

                    { id: "recovery", label: "💰 Recouvrement" },

                    ...(canManager
                        ? [{ id: "rapport", label: "📊 Rapport" }]
                        : [])

                ]}
                defaultTab="billetterie"
                onChange={setActiveTab}
            />

            {activeTab === "billetterie" && <BilletterieTab />}

            {activeTab === "assistance" && <AssistanceTab />}

            {activeTab === "recovery" && <RecoveryTab />}

            {activeTab === "rapport" && canManager && <ReportTab />}

        </div>
    );
}