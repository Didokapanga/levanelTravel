import type { BaseEntity } from './base';

export interface Caution extends BaseEntity {
    contract_id: string;       // lien vers le contrat
    amount_initial: number;    // montant initial déposé
    amount_remaining: number;  // montant disponible
}

export interface CautionWithDetails extends Caution {
    contract_number?: string;
    partner_name?: string;
}
