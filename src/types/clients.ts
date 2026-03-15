import type { BaseEntity } from './base';

export type ClientType =
    | 'individual'
    | 'company';

export interface Clients extends BaseEntity {
    name: string;

    client_type: ClientType;

    phone?: string;
    email?: string;
    address?: string;

    contact_person?: string; // utile pour entreprises
    tax_number?: string; // numéro fiscal ou RCCM
}