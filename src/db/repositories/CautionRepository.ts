import { BaseRepository } from '../BaseRepository';
import { db } from '../database';
import type { Caution } from '../../types/caution';

export class CautionRepository extends BaseRepository<Caution> {

    constructor() {
        super(db.cautions);
    }

    /**
     * Récupérer toutes les cautions d’un contrat
     * (exclut les soft-deleted par défaut)
     */
    async findByContract(
        contract_id: string,
        includeDeleted = false
    ): Promise<Caution[]> {
        return this.findByIndex('contract_id', contract_id, includeDeleted);
    }

    /**
     * Récupérer uniquement les cautions avec un montant restant > 0
     * (utile si tu veux afficher uniquement les cautions actives)
     */
    async findActiveByContract(
        contract_id: string
    ): Promise<Caution[]> {

        const cautions = await this.findByContract(contract_id);

        return cautions.filter(
            c => c.amount_remaining > 0
        );
    }

    /**
     * Calculer le total restant pour un contrat
     */
    async getTotalRemainingByContract(
        contract_id: string
    ): Promise<number> {

        const cautions = await this.findByContract(contract_id);

        return cautions.reduce(
            (total, c) => total + c.amount_remaining,
            0
        );
    }
}

export const cautionRepo = new CautionRepository();
