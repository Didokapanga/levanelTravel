import type { BaseEntity } from './base';

export type OperationStatusType =
    | 'validated'   // réservation validée
    | 'cancelled'   // annulée
    | 'pending';    // en attente de validation

export interface Operations extends BaseEntity {
    partner_id: string;
    service_id: string;
    contract_id: string;
    client_name: string;

    date_demande: string;
    date_emission: string;

    total_amount: number;      // TTC
    total_commission?: number;
    total_tax?: number;

    receipt_reference: string;
    observation?: string;

    status: OperationStatusType;
}

export interface OperationWithDetails extends Operations {
    partner_name?: string;
    contract_type?: string;
    service_name?: string;
}