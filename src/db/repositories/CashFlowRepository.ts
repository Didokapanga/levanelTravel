// src/db/repositories/CashFlowRepository.ts
import { BaseRepository } from '../BaseRepository';
import { db } from '../database';
import type { CashFlow } from '../../types/cash_flow';

export class CashFlowRepository extends BaseRepository<CashFlow> {
    constructor() {
        super(db.cash_flows);
    }

    async findByContract(contract_id: string): Promise<CashFlow[]> {
        return this.table
            .where('contract_id')
            .equals(contract_id)
            .and(c => !c.is_deleted)
            .toArray();
    }
}

export const cashFlowRepo = new CashFlowRepository();
