import "../styles/ActivityList.css";

interface ActivityItem {
    id: string;
    title: string;
    description?: string;
    value?: string | number;
    badge?: "success" | "Modifier" | "Annuler" | "info";
}

interface Props {
    title: string;
    items: ActivityItem[];
}

export default function ActivityList({ title, items }: Props) {

    return (
        <div className="activity-card">

            <div className="activity-header">
                <h3>{title}</h3>
            </div>

            <div className="activity-body">
                {items.length === 0 && (
                    <div className="activity-empty">Aucune activité</div>
                )}

                {items.map(item => (
                    <div key={item.id} className="activity-item">

                        <div className="activity-left">
                            <div className="activity-title">
                                {item.title}
                            </div>

                            {item.description && (
                                <div className="activity-desc">
                                    {item.description}
                                </div>
                            )}
                        </div>

                        <div className="activity-right">
                            {item.value && (
                                <div className="activity-value">
                                    {item.value}
                                </div>
                            )}

                            {item.badge && (
                                <span className={`activity-badge ${item.badge}`}>
                                    {item.badge}
                                </span>
                            )}
                        </div>

                    </div>
                ))}
            </div>

        </div>
    );
}
