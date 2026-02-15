// src/services/CashFlowService.ts
import type { CashFlow } from "../types/cash_flow";
import type { CashFlowWithDetails } from "../types/cash_flow";
import { cashFlowRepo } from "../db/repositories/CashFlowRepository";
import { contractRepo } from "../db/repositories/ContractRepository";
import { partnerRepo } from "../db/repositories/PartnerRepository";

export class CashFlowService {

    /* ========================= */
    /* CRUD BASIQUE              */
    /* ========================= */

    async getAll(): Promise<CashFlow[]> {
        return cashFlowRepo.getAll();
    }

    async getById(id: string): Promise<CashFlow | undefined> {
        return cashFlowRepo.getById(id);
    }

    async create(data: Partial<CashFlow>): Promise<CashFlow> {
        return cashFlowRepo.create(data);
    }

    async update(id: string, updates: Partial<CashFlow>) {
        return cashFlowRepo.update(id, updates);
    }

    async delete(id: string) {
        return cashFlowRepo.softDelete(id);
    }

    /* ========================= */
    /* LOGIQUE MÉTIER ENRICHIE   */
    /* ========================= */

    async getAllWithDetails(): Promise<CashFlowWithDetails[]> {
        const cashFlows = await cashFlowRepo.getAll();
        const contracts = await contractRepo.getAll();
        const partners = await partnerRepo.getAll();

        return cashFlows.map(cf => {
            const contract = cf.contract_id
                ? contracts.find(c => c.id === cf.contract_id)
                : undefined;

            const partner = cf.partner_id
                ? partners.find(p => p.id === cf.partner_id)
                : undefined;

            return {
                ...cf,
                contract_type: contract?.contract_type,
                partner_name: partner?.name
            };
        });
    }

    async getByContractWithDetails(contract_id: string): Promise<CashFlowWithDetails[]> {
        const cashFlows = await cashFlowRepo.findByContract(contract_id);
        const contract = await contractRepo.getById(contract_id);
        let partnerName: string | undefined;

        if (contract && contract.partner_id) {
            const partner = await partnerRepo.getById(contract.partner_id);
            partnerName = partner?.name;
        }

        return cashFlows.map(cf => ({
            ...cf,
            contract_type: contract?.contract_type,
            partner_name: partnerName
        }));
    }
}

export const cashFlowService = new CashFlowService();
