import type { BaseEntity } from './base';

export interface OperationSegments extends BaseEntity {
    operation_id: string;
    airline_id?: string;
    system_id?: string;
    itineraire_id?: string;
    ticket_number?: string;
    pnr?: string;
    tht?: number;
    tax?: number;
    related_costs?: number;
    service_fee?: number;
    commission?: number;
    sold_debit?: number;
    amount_received?: number;
    remaining_amount?: number;
    update_price?: number;
    cancel_price?: number;
}

export interface OperationSegmentWithDetails extends OperationSegments {
    receipt_reference?: string;

    airline_name?: string;
    system_name?: string;
    itineraire_code?: string;

    operation_client?: string;
    operation_date?: string;
}
