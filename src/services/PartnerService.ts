// src/services/PartnerService.ts
import { partnerRepo } from '../db/repositories/PartnerRepository';
import { contractRepo } from '../db/repositories/ContractRepository';
import type { Partner } from '../types/partner';

export class PartnerService {
    constructor() { }

    async create(partner: Partial<Partner>): Promise<Partner> {
        if (!partner.name || !partner.type) {
            throw new Error('name et type sont requis');
        }
        return partnerRepo.create(partner);
    }

    async update(id: string, updates: Partial<Partner>): Promise<Partner | undefined> {
        return partnerRepo.update(id, updates);
    }

    async delete(id: string): Promise<boolean> {
        return partnerRepo.softDelete(id);
    }

    async getById(id: string): Promise<Partner | undefined> {
        return partnerRepo.getById(id);
    }

    async getAll(includeDeleted = false): Promise<Partner[]> {
        return partnerRepo.getAll(includeDeleted);
    }

    /** Récupérer tous les partenaires avec leurs contrats actifs */
    async getWithActiveContracts(): Promise<(Partner & { contracts: string[] })[]> {
        const partners = await partnerRepo.getAll();
        return Promise.all(
            partners.map(async (p) => {
                const contracts = await contractRepo.findActive();
                const partnerContracts = contracts
                    .filter(c => c.partner_id === p.id)
                    .map(c => c.id);
                return { ...p, contracts: partnerContracts };
            })
        );
    }
}

export const partnerService = new PartnerService();
