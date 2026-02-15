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

    start_date: string;     // ISO
    end_date?: string;      // ISO

    description?: string;
}
