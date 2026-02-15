
interface Props {
    label: string;
    name: string;
    value?: number; // stored in cents
    onChange: (name: string, value: number) => void;
    required?: boolean;
}

function toCents(value: string): number {
    const normalized = value.replace(",", ".");
    const parsed = parseFloat(normalized || "0");
    if (isNaN(parsed)) return 0;
    return Math.round(parsed * 100);
}

function fromCents(value?: number): string {
    if (!value) return "";
    return (value / 100).toFixed(2);
}

export default function MoneyInput({
    label,
    name,
    value,
    onChange,
    required
}: Props) {
    return (
        <div className="form-field">
            <label>{label}</label>
            <input
                type="number"
                step="0.01"
                inputMode="decimal"
                value={fromCents(value)}
                required={required}
                onChange={(e) => onChange(name, toCents(e.target.value))}
            />
        </div>
    );
}