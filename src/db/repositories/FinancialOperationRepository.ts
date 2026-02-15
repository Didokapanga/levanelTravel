// src/db/repositories/FinancialOperationRepository.ts
import { BaseRepository } from '../BaseRepository';
import { db } from '../database';
import type { FinancialOperation } from '../../types/fiancial_operation';

export class FinancialOperationRepository extends BaseRepository<FinancialOperation> {
    constructor() {
        super(db.financial_operations);
    }

    async findByContract(contract_id: string): Promise<FinancialOperation[]> {
        return this.table
            .where('contract_id')
            .equals(contract_id)
            .and(f => !f.is_deleted)
            .toArray();
    }

    async findByReservation(reservation_id: string): Promise<FinancialOperation[]> {
        return this.table
            .where('reservation_id')
            .equals(reservation_id)
            .and(f => !f.is_deleted)
            .toArray();
    }
}

export const financialOperationRepo = new FinancialOperationRepository();
