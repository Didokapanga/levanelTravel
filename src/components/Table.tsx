import { type ReactNode } from 'react';
import '../styles/Table.css';

export interface Column<T> {
    key: string;
    label: string;
    render?: (row: T) => ReactNode;
}

interface TableProps<T> {
    columns: Column<T>[];
    data: T[];
    className?: string;
    actions?: (row: T) => ReactNode; // boutons/actions par ligne
}

export function Table<T>({ columns, data, className, actions }: TableProps<T>) {
    const colSpanCount = columns.length + (actions ? 1 : 0);

    return (
        // conteneur avec scroll horizontal si besoin
        <div className={`table-container ${className || ''}`} style={{ overflowX: 'auto' }}>
            <table className="custom-table">
                <thead>
                    <tr>
                        {columns.map((col) => (
                            <th key={col.key}>{col.label}</th>
                        ))}
                        {actions && <th>Actions</th>}
                    </tr>
                </thead>
                <tbody>
                    {data.length === 0 ? (
                        <tr>
                            <td colSpan={colSpanCount} className="no-data">
                                Aucun résultat
                            </td>
                        </tr>
                    ) : (
                        data.map((row, idx) => (
                            <tr key={idx} className={idx % 2 === 0 ? 'even' : 'odd'}>
                                {columns.map((col) => (
                                    <td key={col.key}>
                                        {col.render ? col.render(row) : (row as any)[col.key]}
                                    </td>
                                ))}
                                {actions && <td>{actions(row)}</td>}
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
    );
}
