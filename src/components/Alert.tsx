/* src/components/Alert.tsx */


type AlertType = 'success' | 'error' | 'warning' | 'info';

interface AlertProps {
    type?: AlertType;
    message: string;
    onClose?: () => void;
}

export default function Alert({ type = 'info', message, onClose }: AlertProps) {
    const colors: Record<AlertType, { bg: string; text: string; border: string }> = {
        success: { bg: '#d1fae5', text: '#065f46', border: '#10b981' },
        error: { bg: '#fee2e2', text: '#991b1b', border: '#ef4444' },
        warning: { bg: '#fef3c7', text: '#78350f', border: '#f59e0b' },
        info: { bg: '#e0f2fe', text: '#0369a1', border: '#0ea5e9' },
    };

    const color = colors[type];

    return (
        <div
            style={{
                backgroundColor: color.bg,
                color: color.text,
                borderLeft: `4px solid ${color.border}`,
                padding: '12px 16px',
                borderRadius: '6px',
                marginBottom: '12px',
                position: 'relative',
                boxShadow: '0 2px 6px rgba(0,0,0,0.05)',
            }}
        >
            {message}

            {onClose && (
                <button
                    onClick={onClose}
                    style={{
                        position: 'absolute',
                        top: '8px',
                        right: '8px',
                        border: 'none',
                        background: 'transparent',
                        cursor: 'pointer',
                        fontWeight: 'bold',
                        fontSize: '14px',
                        color: color.text,
                    }}
                >
                    ×
                </button>
            )}
        </div>
    );
}
