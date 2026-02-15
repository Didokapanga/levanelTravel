import type { BaseEntity } from './base';

export type PartnerType =
    | 'airline'
    | 'agency'
    | 'supplier'
    | 'other';

export interface Partner extends BaseEntity {
    name: string;
    type: PartnerType;
}
