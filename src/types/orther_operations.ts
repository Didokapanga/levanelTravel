import type { BaseEntity } from './base';

export type OperationStatusType =
    | 'validated'
    | 'cancelled'
    | 'pending';

export interface OrtherOperations extends BaseEntity {
    service_id?: string;

    client_id: string;

    receipt_reference?: string;

    date_demande: string;

    total_amount?: number;   // montant total de la prestation
    service_fee: number;

    observation?: string;

    status: OperationStatusType;
}

export interface OrtherOperationWithDetails extends OrtherOperations {
    service_name?: string;
    client_name?: string;
}