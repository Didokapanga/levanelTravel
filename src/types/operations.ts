import type { BaseEntity } from './base';

export type OperationStatusType =
    | 'validated'   // réservation validée
    | 'cancelled'   // annulée
    | 'pending';    // en attente de validation

export interface Operations extends BaseEntity {
    partner_id: string;
    service_id: string;
    contract_id: string;

    client_id: string;

    pnr?: string;

    date_demande: string;

    receipt_reference: string;
    observation?: string;

    status: OperationStatusType;

    total_amount?: number;
    amount_received?: number;
    remaining_amount?: number;
}

export interface OperationWithDetails extends Operations {
    partner_name?: string;
    contract_type?: string;
    service_name?: string;
    client_name?: string;
}