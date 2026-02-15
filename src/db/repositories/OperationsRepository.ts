// src/db/repositories/OperationsRepository.ts
import { BaseRepository } from '../BaseRepository';
import { db } from '../database';
import type { Operations } from '../../types/operations';

export class OperationsRepository extends BaseRepository<Operations> {
    constructor() {
        super(db.operations);
    }

    async findByPartner(partner_id: string): Promise<Operations[]> {
        return this.table
            .where('partner_id')
            .equals(partner_id)
            .and(o => !o.is_deleted)
            .toArray();
    }

    async findByContract(contract_id: string) {
        return this.table
            .where("contract_id")
            .equals(contract_id)
            .and(o => !o.is_deleted)
            .toArray();
    }
}

export const operationsRepo = new OperationsRepository();
