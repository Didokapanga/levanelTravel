// src/db/repositories/OrtherOperationsRepository.ts
import type { OrtherOperations } from '../types/orther_operations';
import { BaseRepository } from './BaseRepository';
import { db } from './database';

export class OrtherOperationsRepository extends BaseRepository<OrtherOperations> {
    constructor() {
        super(db.orther_operations); // ⚠️ Assure-toi que ta table Dexie s'appelle bien "other_operations"
    }

    // Exemple : récupérer toutes les opérations pour un service spécifique
    async findByService(service_id: string): Promise<OrtherOperations[]> {
        return this.table
            .where('service_id')
            .equals(service_id)
            .and(o => !o.is_deleted)
            .toArray();
    }

    // Exemple : récupérer toutes les opérations non supprimées
    async getAllActive(): Promise<OrtherOperations[]> {
        return this.table
            .filter(o => !o.is_deleted)
            .toArray();
    }
}

export const ortherOperationsRepo = new OrtherOperationsRepository();
