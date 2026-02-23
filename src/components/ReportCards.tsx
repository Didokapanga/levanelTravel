type Props = {
    totalSales: number;
    totalAssist: number;
    totalCommission: number;
    count: number;
};

export default function ReportCards({
    totalSales,
    totalAssist,
    totalCommission,
    count
}: Props) {

    return (
        <div className="report-cards">

            <div className="report-card">
                <h3>Total Billetterie</h3>
                <p>{totalSales.toLocaleString()} $</p>
            </div>

            <div className="report-card">
                <h3>Total Assistance</h3>
                <p>{totalAssist.toLocaleString()} $</p>
            </div>

            <div className="report-card">
                <h3>Total Commission</h3>
                <p>{totalCommission.toLocaleString()} $</p>
            </div>

            <div className="report-card">
                <h3>Nombre opérations</h3>
                <p>{count}</p>
            </div>

        </div>
    );
}