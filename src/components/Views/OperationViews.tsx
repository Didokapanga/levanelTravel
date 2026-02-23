import "../../styles/operationViews.css"
import type { OperationWithDetails } from "../../types/operations";
import type { OperationSegmentWithDetails } from "../../types/operation_segments";
import { Button } from "../Button";
import { FaFileInvoice, FaFileAlt } from "react-icons/fa";
import { invoiceService } from "../../services/InvoiceService";

interface Props {
    operation: OperationWithDetails;
    segments: OperationSegmentWithDetails[];
    onClose: () => void;
}

export default function OperationViews({
    operation,
    segments,
    // onClose
}: Props) {

    return (
        <div className="views-container">

            {/* HEADER */}
            <div className="views-header">
                <div>
                    <h2>📄 Aperçu opération</h2>
                    <span className="views-ref">
                        Réf : {operation.receipt_reference}
                    </span>
                </div>

                <div className="views-actions">
                    <Button
                        label="Pro-forma"
                        variant="info"
                        icon={<FaFileAlt />}
                        onClick={() => invoiceService.generateProforma(operation)}
                    />

                    <Button
                        label="Facture archive"
                        variant="secondary"
                        icon={<FaFileInvoice />}
                        onClick={() => invoiceService.generateArchive(operation)}
                    />

                    {/* <Button
                        label="Fermer"
                        variant="danger"
                        icon={<FaTimes />}
                        onClick={onClose}
                    /> */}
                </div>
            </div>

            {/* BODY */}
            <div className="views-grid">

                {/* LEFT : OPERATION */}
                <div className="views-card">

                    <h3>🧾 Informations Opération</h3>

                    <div className="views-item">
                        <span>Client</span>
                        <b>{operation.client_name}</b>
                    </div>

                    <div className="views-item">
                        <span>Partenaire</span>
                        <b>{operation.partner_name}</b>
                    </div>

                    <div className="views-item">
                        <span>Service</span>
                        <b>{operation.service_name}</b>
                    </div>

                    <div className="views-item">
                        <span>Date demande</span>
                        <b>{operation.date_demande}</b>
                    </div>

                    <div className="views-item">
                        <span>Date émission</span>
                        <b>{operation.date_emission}</b>
                    </div>

                    <div className="views-total">
                        <div>
                            <span>Total TTC</span>
                            <b>{operation.total_amount.toFixed(2)}</b>
                        </div>

                        <div>
                            <span>Commission</span>
                            <b>{operation.total_commission ?? 0}</b>
                        </div>

                        <div>
                            <span>Tax</span>
                            <b>{operation.total_tax ?? 0}</b>
                        </div>
                    </div>

                    {operation.observation && (
                        <div className="views-observation">
                            <span>Observation</span>
                            <p>{operation.observation}</p>
                        </div>
                    )}
                </div>

                {/* RIGHT : SEGMENTS */}
                <div className="views-card">

                    <h3>✈️ Segments</h3>

                    {segments.length === 0 && (
                        <p className="views-empty">
                            Aucun segment trouvé
                        </p>
                    )}

                    {segments.map(seg => (
                        <div key={seg.id} className="segment-card">

                            <div className="segment-header">
                                <b>{seg.airline_name}</b>
                                <span>PNR : {seg.pnr}</span>
                            </div>

                            <div className="segment-grid">

                                <div>
                                    <span>Ticket</span>
                                    <b>{seg.ticket_number}</b>
                                </div>

                                <div>
                                    <span>Itinéraire</span>
                                    <b>{seg.itineraire_code}</b>
                                </div>

                                <div>
                                    <span>THT</span>
                                    <b>{seg.tht ?? 0}</b>
                                </div>

                                <div>
                                    <span>Tax</span>
                                    <b>{seg.tax ?? 0}</b>
                                </div>

                                <div>
                                    <span>Service Fee</span>
                                    <b>{seg.service_fee ?? 0}</b>
                                </div>

                                <div>
                                    <span>Reçu</span>
                                    <b>{seg.amount_received ?? 0}</b>
                                </div>

                                <div>
                                    <span>Reste</span>
                                    <b>{seg.remaining_amount ?? 0}</b>
                                </div>

                            </div>

                        </div>
                    ))}
                </div>

            </div>
        </div>
    );
}