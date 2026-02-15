import type { BaseEntity } from './base';

export interface Itineraire extends BaseEntity {
    code?: string;         // code aéroport / destination
    country?: string;
}
