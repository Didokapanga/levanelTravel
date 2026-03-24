import type { BaseEntity } from './base';

export type OperationType =
    | 'sale'
    | 'change'
    | 'canceled';

export type TravelClassList =
    | 'economy'
    | 'premium_economy'
    | 'business'
    | 'first';

export interface OperationSegments extends BaseEntity {
    operation_id: string;

    passenger_name: string;
    travel_class?: TravelClassList;

    airline_id?: string;
    system_id?: string;
    // itineraire_id?: string;
    itineraire?: string;

    ticket_number?: string;

    departure_date?: string;

    operation_type: OperationType;
    segment_reference: string;

    tht?: number;
    tax?: number;
    total_amount?: number;

    sold_debit?: number;
    commission?: number;
    service_fee?: number;
    related_costs?: number;

    update_price?: number;
    cancel_price?: number;
}

export interface OperationSegmentWithDetails extends OperationSegments {
    receipt_reference?: string;

    airline_name?: string;
    system_name?: string;

    operation_client?: string;
    operation_date?: string;


}
