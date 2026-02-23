import { Button } from "../components/Button";

type Props = {
    reportStart: string;
    reportEnd: string;
    reportRef: string;
    setReportStart: (v: string) => void;
    setReportEnd: (v: string) => void;
    setReportRef: (v: string) => void;
    onGenerate: () => void;
};

export default function OperationFilters({
    reportStart,
    reportEnd,
    reportRef,
    setReportStart,
    setReportEnd,
    setReportRef,
    onGenerate
}: Props) {

    return (
        <div className="report-filters">

            <input
                type="date"
                value={reportStart}
                onChange={e => setReportStart(e.target.value)}
            />

            <input
                type="date"
                value={reportEnd}
                onChange={e => setReportEnd(e.target.value)}
            />

            <input
                type="text"
                placeholder="Référence dossier"
                value={reportRef}
                onChange={e => setReportRef(e.target.value)}
            />

            <Button label="Générer" variant="info" onClick={onGenerate} />
        </div>
    );
}