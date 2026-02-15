import type { BaseEntity } from './base';

export interface System extends BaseEntity {
    name: string;        // ex: Amadeus, Sabre, Galileo
    description?: string;
}
