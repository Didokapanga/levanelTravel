import "../styles/ListSection.css";

interface ListItem {
    id: string;
    title: string;
    subtitle?: string;
    right?: string | number;
}

interface Props {
    leftTitle: string;
    leftItems: ListItem[];
}

export default function ListSection({
    leftTitle,
    leftItems,
}: Props) {

    const renderList = (items: ListItem[]) => (
        <div className="list-body">
            {items.length === 0 && (
                <div className="list-empty">Aucune donnée</div>
            )}

            {items.map(item => (
                <div key={item.id} className="list-item">
                    <div>
                        <div className="list-title">{item.title}</div>
                        {item.subtitle && (
                            <div className="list-subtitle">{item.subtitle}</div>
                        )}
                    </div>

                    {item.right && (
                        <div className="list-right">{item.right}</div>
                    )}
                </div>
            ))}
        </div>
    );

    return (
        <div className="list-section-container">

            <div className="list-column">
                <div className="list-header">{leftTitle}</div>
                {renderList(leftItems)}
            </div>
        </div>
    );
}
