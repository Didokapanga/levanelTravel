import type { BaseEntity } from './base';

export interface Airline extends BaseEntity {
    code: string;      // ex: AF, SN, ET
    name?: string;     // nom complet

}
