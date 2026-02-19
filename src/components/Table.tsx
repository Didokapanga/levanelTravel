import { useState, useMemo, type ReactNode } from 'react';
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
    actions?: (row: T) => ReactNode;
    pageSize?: number; // 👈 nouveau
}

export function Table<T>({
    columns,
    data,
    className,
    actions,
    pageSize = 8 // 👈 10 lignes par défaut
}: TableProps<T>) {

    const [currentPage, setCurrentPage] = useState(1);

    const totalPages = Math.ceil(data.length / pageSize);

    const paginatedData = useMemo(() => {
        const start = (currentPage - 1) * pageSize;
        return data.slice(start, start + pageSize);
    }, [data, currentPage, pageSize]);

    const colSpanCount = columns.length + (actions ? 1 : 0);

    const goToPage = (page: number) => {
        if (page < 1 || page > totalPages) return;
        setCurrentPage(page);
    };

    return (
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
                    {paginatedData.length === 0 ? (
                        <tr>
                            <td colSpan={colSpanCount} className="no-data">
                                Aucun résultat
                            </td>
                        </tr>
                    ) : (
                        paginatedData.map((row, idx) => (
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

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="pagination">
                    <button onClick={() => goToPage(currentPage - 1)} disabled={currentPage === 1}>
                        Précédent
                    </button>

                    <span>
                        Page {currentPage} / {totalPages}
                    </span>

                    <button onClick={() => goToPage(currentPage + 1)} disabled={currentPage === totalPages}>
                        Suivant
                    </button>
                </div>
            )}
        </div>
    );
}
