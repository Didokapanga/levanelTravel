import type { BaseEntity } from './base';

export interface Stock extends BaseEntity {
    contract_id: string;        // lien vers le contrat
    amount_initial: number;     // montant de stock acheté
    amount_remaining: number;   // montant encore disponible
}

export interface StockWithDetails extends Stock {
    contract_number?: string;
    partner_name?: string;
}
