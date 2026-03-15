import type { BaseEntity } from "./base";

export interface Recovery extends BaseEntity {

    operation_id: string;   // opération concernée
    client_id: string;      // client débiteur

    amount: number;         // montant payé

    payment_date: string;   // date du recouvrement

    reference?: string;     // référence paiement
    observation?: string;   // commentaire
}

export interface RecoveryWithDetails extends Recovery {

    client_name?: string;

    receipt_reference?: string;

    total_amount?: number;
    remaining_amount?: number;

    operation_date?: string;
}