import type { BaseEntity } from './base';

export type ContractType =
    | 'caution_only'
    | 'caution_and_stock'
    | 'agency_service';

export type ContractStatus =
    | 'active'
    | 'inactive'
    | 'expired'
    | 'exhausted';

export interface Contract extends BaseEntity {
    partner_id: string;

    contract_type: ContractType;
    status: ContractStatus;

    start_date: string | null;   // ISO string ou null
    end_date?: string | null;    // ISO string ou null

    description?: string;
}
