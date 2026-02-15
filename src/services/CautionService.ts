import type { Caution } from '../types/caution';
import type { CautionWithDetails } from '../types/caution';

import { cautionRepo } from '../db/repositories/CautionRepository';
import { contractRepo } from '../db/repositories/ContractRepository';
import { partnerRepo } from '../db/repositories/PartnerRepository';

export class CautionService {

    /* ========================= */
    /* CRUD BASIQUE              */
    /* ========================= */

    async getAll(): Promise<Caution[]> {
        return cautionRepo.getAll();
    }

    async getById(id: string): Promise<Caution | undefined> {
        return cautionRepo.getById(id);
    }

    async create(data: Partial<Caution>): Promise<Caution> {
        return cautionRepo.create(data);
    }

    async update(id: string, updates: Partial<Caution>) {
        return cautionRepo.update(id, updates);
    }

    async delete(id: string) {
        return cautionRepo.softDelete(id);
    }

    /* ========================= */
    /* LOGIQUE MÉTIER ENRICHIE   */
    /* ========================= */

    async getAllWithDetails(): Promise<CautionWithDetails[]> {

        const cautions = await cautionRepo.getAll();
        const contracts = await contractRepo.getAll();
        const partners = await partnerRepo.getAll();

        return cautions.map((caution) => {

            const contract = contracts.find(
                c => c.id === caution.contract_id
            );

            const partner = partners.find(
                p => p.id === contract?.partner_id
            );

            return {
                ...caution,
                partner_name: partner?.name
            };
        });
    }

    async getByContractWithDetails(
        contract_id: string
    ): Promise<CautionWithDetails[]> {

        const cautions = await cautionRepo.findByContract(contract_id);

        const contract = await contractRepo.getById(contract_id);

        let partnerName: string | undefined;

        if (contract) {
            const partner = await partnerRepo.getById(contract.partner_id);
            partnerName = partner?.name;
        }

        return cautions.map(caution => ({
            ...caution,
            partner_name: partnerName
        }));
    }

    async getTotalRemainingByContract(
        contract_id: string
    ): Promise<number> {
        return cautionRepo.getTotalRemainingByContract(contract_id);
    }

    /**
     * Déduit un montant d'une caution pour un segment donné
     */
    async deductCaution(contract_id: string, amount: number) {
        const cautions = await this.getByContractWithDetails(contract_id);
        if (!cautions.length) throw new Error("Caution introuvable pour ce contrat");

        let remainingToDeduct = amount;

        for (const caution of cautions) {
            const available = caution.amount_remaining ?? 0;
            if (available <= 0) continue;

            const deduction = Math.min(available, remainingToDeduct);
            caution.amount_remaining = available - deduction;
            caution.sync_status = "dirty";
            caution.version = (caution.version ?? 0) + 1;
            caution.updated_at = new Date().toISOString();

            await this.update(caution.id, caution);

            remainingToDeduct -= deduction;
            if (remainingToDeduct <= 0) break;
        }

        if (remainingToDeduct > 0) {
            throw new Error(`Caution insuffisante pour le contrat. Il manque ${remainingToDeduct}.`);
        }
    }
}

export const cautionService = new CautionService();
