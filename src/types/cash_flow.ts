import type { BaseEntity } from './base';

export type CashDirection =
    | 'in'      // entrée de caisse
    | 'out';    // sortie de caisse

export type CashSource =
    | 'reservation'   // paiement d’une réservation
    | 'refund'        // remboursement
    | 'expense'       // dépense interne
    | 'service'       // autre service vendu
    | 'adjustment';   // correction / régularisation

export interface CashFlow extends BaseEntity {
    direction: CashDirection;   // in / out

    amount: number;             // montant du mouvement
    currency: string;           // 'USD', 'CDF', etc.

    source: CashSource;         // origine métier du mouvement
    reference_id?: string;      // reservation_id, segment_id, expense_id, etc.

    contract_id?: string;       // si lié à un contrat
    partner_id?: string;        // si lié à un partenaire

    description?: string;       // motif lisible (ex: "Paiement billet Kin–Lub")

    operation_date: string;     // date réelle de l’opération (ISO)
}

// src/types/cash_flow.ts
export interface CashFlowWithDetails extends CashFlow {
    contract_type?: string;
    partner_name?: string;
}

