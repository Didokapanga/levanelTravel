import ActivityList from "../components/ActivityList";
import Card from "../components/Card";
import ListSection from "../components/ListSection";
import "../styles/Dashboard.css";

export default function Dashboard() {

    return (
        <div className="dashboard-page">

            <div className="left-section">

                <div className="card-section">

                    <Card
                        label="Réservations"
                        value={16}
                        info="Aujourd'hui"
                        icon="🎫"
                    />

                    <Card
                        label="Cautions"
                        value={5}
                        info="Actives"
                        icon="💰"
                    />

                    <Card
                        label="Stocks"
                        value={32}
                        info="Disponibles"
                        icon="📦"
                    />

                </div>

                <div className="list-section">
                    <ListSection
                        leftTitle="Dernières réservations"
                        rightTitle="Cautions actives"
                        leftItems={[
                            { id: "1", title: "Kinshasa → Paris", subtitle: "Client: Jean", right: "500$" },
                            { id: "2", title: "Lubumbashi → Dubai", subtitle: "Client: Marie", right: "650$" }
                        ]}
                        rightItems={[
                            { id: "3", title: "Air France", subtitle: "Contrat #AF-22", right: "1200$" },
                            { id: "4", title: "Turkish", subtitle: "Contrat #TK-11", right: "800$" }
                        ]}
                    />
                </div>

            </div>

            <div className="right-section">
                <div className="list-up">
                    <ActivityList
                        title="Dernières opérations"
                        items={[
                            {
                                id: "1",
                                title: "Billet Kin → Paris",
                                description: "Client: Jean",
                                value: "650$",
                                badge: "success"
                            },
                            {
                                id: "2",
                                title: "Caution Turkish",
                                description: "Contrat TK-11",
                                value: "800$",
                                badge: "warning"
                            }
                        ]}
                    />
                </div>

                <div className="list-down">
                    <ActivityList
                        title="Alertes"
                        items={[
                            {
                                id: "3",
                                title: "Stock faible",
                                description: "Air France",
                                badge: "danger"
                            }
                        ]}
                    />
                </div>
            </div>

        </div>
    );
}
