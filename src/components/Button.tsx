import React, { type ReactNode } from 'react';
import '../styles/Button.css';

interface ButtonProps {
    label: string;
    onClick?: () => void;
    variant?: 'primary' | 'secondary' | 'danger' | 'info';
    icon?: ReactNode; // si tu veux mettre un icône à gauche
    className?: string;
    disabled?: boolean;
    type?: 'button' | 'submit' | 'reset'; // 🔥 ajouter ça
}

export const Button: React.FC<ButtonProps> = ({
    label,
    onClick,
    variant = 'primary',
    icon,
    className = '',
    disabled = false
}) => {
    return (
        <button
            className={`btn btn-${variant} ${className}`}
            onClick={onClick}
            disabled={disabled}
        >
            {icon && <span className="btn-icon">{icon}</span>}
            {label}
        </button>
    );
};
