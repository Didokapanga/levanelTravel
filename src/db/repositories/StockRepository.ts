// src/db/repositories/StockRepository.ts
import { BaseRepository } from '../BaseRepository';
import { db } from '../database';
import type { Stock } from '../../types/stocks';

export class StockRepository extends BaseRepository<Stock> {
    constructor() {
        super(db.stocks);
    }

    async findByContract(contract_id: string): Promise<Stock[]> {
        return this.table
            .where('contract_id')
            .equals(contract_id)
            .and(s => !s.is_deleted)
            .toArray();
    }
}

export const stockRepo = new StockRepository();
