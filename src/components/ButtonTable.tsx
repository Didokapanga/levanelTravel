// src/components/ButtonTable.tsx
import { type ReactNode } from "react";
import "../styles/buttonTable.css";

interface ButtonTableProps {
    icon: ReactNode;
    onClick: () => void | Promise<void>;
    label?: string; // optionnel pour l'accessibilité
    variant?: "primary" | "secondary" | "danger" | "info";
}

export function ButtonTable({ icon, onClick, label, variant = "primary" }: ButtonTableProps) {
    return (
        <button className={`btn-table btn-${variant}`} onClick={onClick} title={label}>
            {icon}
        </button>
    );
}
