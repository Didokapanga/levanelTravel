import type { BaseEntity } from './base';

export type OperationStatusType =
    | 'validated'   // réservation validée
    | 'cancelled'   // annulée
    | 'pending';    // en attente de validation

export interface OrtherOperations extends BaseEntity {
    service_id?: string;
    client_name: string;

    date_demande: string;
    date_emission?: string;

    total_amount?: number;      // TTC
    service_fee: number;

    observation?: string;

    status: OperationStatusType
}

export interface OrtherOperationWithDetails extends OrtherOperations {
    service_name?: string;
}