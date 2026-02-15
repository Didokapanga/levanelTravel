import "../styles/Cards.css";

interface CardProps {
    label?: string;
    value?: number | string;
    info?: string;
    icon?: React.ReactNode;
}

export default function Card({
    label = "Label",
    value = 0,
    info = "Description",
    icon
}: CardProps) {

    return (
        <div className="card-components">

            <div className="section-up">
                <div className="card-label">{label}</div>
                <div className="card-icon">
                    {icon || "📊"}
                </div>
            </div>

            <div className="section-down">
                <div className="card-number">{value}</div>
                <div className="card-info">{info}</div>
            </div>

        </div>
    );
}
