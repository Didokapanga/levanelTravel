import { contractRepo } from '../db/repositories/ContractRepository';
import type { Contract } from '../types/contract';

export class ContractService {
    async create(contract: Partial<Contract>): Promise<Contract> {
        if (!contract.partner_id || !contract.contract_type || !contract.status || !contract.start_date) {
            throw new Error('partner_id, contract_type, status et start_date sont requis');
        }
        return contractRepo.create(contract);
    }

    async getByPartner(partner_id: string): Promise<Contract[]> {
        return contractRepo.findByPartner(partner_id);
    }

    async update(id: string, updates: Partial<Contract>): Promise<Contract | undefined> {
        return contractRepo.update(id, updates);
    }

    async delete(id: string): Promise<boolean> {
        return contractRepo.softDelete(id);
    }

    async getAll(includeDeleted = false): Promise<Contract[]> {
        return contractRepo.getAll(includeDeleted);
    }

    async getById(id: string): Promise<Contract | undefined> {
        return contractRepo.getById(id);
    }

    async getActiveContracts(): Promise<Contract[]> {
        return contractRepo.findByIndex('status', 'active');
    }
}

export const contractService = new ContractService();
