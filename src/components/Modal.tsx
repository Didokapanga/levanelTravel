import React, { type ReactNode } from 'react';
import '../styles/Modal.css';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title?: string;
    children: ReactNode;
}

export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
    if (!isOpen) return null;

    return (
        <>
            {/* Overlay */}
            <div className="modal-overlay" onClick={onClose}></div>

            {/* Modal content */}
            <div className="modal-container">
                <div className="modal-box">
                    <div className="modal-header">
                        {title && <h3 className="modal-title">{title}</h3>}
                        <button className="modal-close" onClick={onClose} aria-label="Close modal">
                            ×
                        </button>
                    </div>
                    <div className="modal-body">{children}</div>
                </div>
            </div>
        </>
    );
};
