import type { BaseEntity } from './base';

export type OperationType = 'deduction' | 'refund' | 'payment';
export type OperationSource = 'caution' | 'stock' | 'cash_register';

export interface FinancialOperation extends BaseEntity {
    operation_id?: string;   // déclencheur
    contract_id?: string;      // lien vers le contrat
    source: OperationSource;
    type: OperationType;
    amount: number;
    description?: string;      // ex: "Déduction caution pour réservation"
}

export interface FinancialOperationWithDetails extends FinancialOperation {
    partner_name?: string;
    contract_type?: string;
}
