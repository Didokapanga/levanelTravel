// src/services/FinancialOperationService.ts
import type { FinancialOperation, FinancialOperationWithDetails } from "../types/fiancial_operation";
import { financialOperationRepo } from "../db/repositories/FinancialOperationRepository";
import { contractRepo } from "../db/repositories/ContractRepository";
import { partnerRepo } from "../db/repositories/PartnerRepository";

export class FinancialOperationService {

    /* ========================= */
    /* CRUD BASIQUE              */
    /* ========================= */

    async getAll(): Promise<FinancialOperation[]> {
        return financialOperationRepo.getAll();
    }

    async getById(id: string): Promise<FinancialOperation | undefined> {
        return financialOperationRepo.getById(id);
    }

    async create(data: Partial<FinancialOperation>): Promise<FinancialOperation> {
        return financialOperationRepo.create(data);
    }

    async update(id: string, updates: Partial<FinancialOperation>) {
        return financialOperationRepo.update(id, updates);
    }

    async delete(id: string) {
        return financialOperationRepo.softDelete(id);
    }

    /* ========================= */
    /* LOGIQUE MÉTIER ENRICHIE   */
    /* ========================= */

    /**
     * Récupère toutes les opérations financières avec les détails enrichis
     * : nom du partenaire et type de contrat
     */
    async getAllWithDetails(): Promise<FinancialOperationWithDetails[]> {
        const operations = await financialOperationRepo.getAll();
        const contracts = await contractRepo.getAll();
        const partners = await partnerRepo.getAll();

        return operations.map(op => {
            const contract = contracts.find(c => c.id === op.contract_id);
            const partner = partners.find(p => p.id === contract?.partner_id);

            return {
                ...op,
                partner_name: partner?.name,
                contract_type: contract?.contract_type,
            };
        });
    }

    /**
     * Récupère toutes les opérations pour un contrat spécifique avec détails
     */
    async getByContractWithDetails(contract_id: string): Promise<FinancialOperationWithDetails[]> {
        const operations = await financialOperationRepo.findByContract(contract_id);
        const contract = await contractRepo.getById(contract_id);
        const partner = contract ? await partnerRepo.getById(contract.partner_id) : undefined;

        return operations.map(op => ({
            ...op,
            partner_name: partner?.name,
            contract_type: contract?.contract_type,
        }));
    }

    /**
     * Récupère toutes les opérations pour une réservation spécifique
     */
    async getByReservation(reservation_id: string): Promise<FinancialOperationWithDetails[]> {
        const operations = await financialOperationRepo.findByReservation(reservation_id);

        // Si les opérations sont liées à un contrat, enrichir les infos
        const contracts = await contractRepo.getAll();
        const partners = await partnerRepo.getAll();

        return operations.map(op => {
            const contract = contracts.find(c => c.id === op.contract_id);
            const partner = partners.find(p => p.id === contract?.partner_id);

            return {
                ...op,
                partner_name: partner?.name,
                contract_type: contract?.contract_type,
            };
        });
    }
}

export const financialOperationService = new FinancialOperationService();
