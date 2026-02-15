// src/db/repositories/PartnerRepository.ts
import { BaseRepository } from '../BaseRepository';
import { db } from '../database';
import type { Partner } from '../../types/partner';

export class PartnerRepository extends BaseRepository<Partner> {
    constructor() {
        super(db.partners);
    }

    // Exemple : trouver tous les partenaires de type 'airline'
    async findAirlines(): Promise<Partner[]> {
        return this.table
            .where('type')
            .equals('airline')
            .and((p) => !p.is_deleted)
            .toArray();
    }
}

export const partnerRepo = new PartnerRepository();
