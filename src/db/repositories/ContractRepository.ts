// src/db/repositories/ContractRepository.ts
import { BaseRepository } from '../BaseRepository';
import { db } from '../database';
import type { Contract } from '../../types/contract';

export class ContractRepository extends BaseRepository<Contract> {
    constructor() {
        super(db.contracts);
    }

    // Trouver tous les contrats actifs
    async findActive(): Promise<Contract[]> {
        return this.table
            .where('status')
            .equals('active')
            .and(c => !c.is_deleted)
            .toArray();
    }

    findByPartner(partner_id: string): Promise<Contract[]> {
        return this.table
            .where("partner_id")
            .equals(partner_id)
            .and(c => !c.is_deleted)
            .toArray();
    }
}

export const contractRepo = new ContractRepository();
