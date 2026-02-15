// src/services/StockService.ts
import type { Stock, StockWithDetails } from '../types/stocks';
import { stockRepo } from '../db/repositories/StockRepository';
import { contractRepo } from '../db/repositories/ContractRepository';
import { partnerRepo } from '../db/repositories/PartnerRepository';

export class StockService {

    /* CRUD BASIQUE */
    async getAll(): Promise<Stock[]> {
        return stockRepo.getAll();
    }

    async getById(id: string): Promise<Stock | undefined> {
        return stockRepo.getById(id);
    }

    async create(data: Partial<Stock>): Promise<Stock> {
        return stockRepo.create(data);
    }

    async update(id: string, updates: Partial<Stock>) {
        return stockRepo.update(id, updates);
    }

    async delete(id: string) {
        return stockRepo.softDelete(id);
    }

    /* LOGIQUE MÉTIER ENRICHIE */
    async getAllWithDetails(): Promise<StockWithDetails[]> {
        const stocks = await stockRepo.getAll();
        const contracts = await contractRepo.getAll();
        const partners = await partnerRepo.getAll();

        return stocks.map(stock => {
            const contract = contracts.find(c => c.id === stock.contract_id);
            const partner = partners.find(p => p.id === contract?.partner_id);

            return {
                ...stock,
                contract_type: contract?.contract_type,
                partner_name: partner?.name
            };
        });
    }

    async getByContractWithDetails(contract_id: string): Promise<StockWithDetails[]> {
        const stocks = await stockRepo.findByContract(contract_id);
        const contract = await contractRepo.getById(contract_id);
        const partner = contract ? await partnerRepo.getById(contract.partner_id) : undefined;

        return stocks.map(stock => ({
            ...stock,
            contract_type: contract?.contract_type,
            partner_name: partner?.name
        }));
    }

    /**
     * Déduit un montant d'un stock pour un segment donné
     */
    async deductStock(contract_id: string, amount: number) {
        const stocks = await this.getByContractWithDetails(contract_id);
        if (!stocks.length) throw new Error("Stock introuvable pour ce contrat");

        let remainingToDeduct = amount;

        for (const stock of stocks) {
            const available = stock.amount_remaining ?? 0;
            if (available <= 0) continue;

            const deduction = Math.min(available, remainingToDeduct);
            stock.amount_remaining = available - deduction;
            stock.sync_status = "dirty";
            stock.version = (stock.version ?? 0) + 1;
            stock.updated_at = new Date().toISOString();

            await this.update(stock.id, stock);

            remainingToDeduct -= deduction;
            if (remainingToDeduct <= 0) break;
        }

        if (remainingToDeduct > 0) {
            // 💡 Tu peux remplacer ce throw par un state Alert dans React si besoin
            throw new Error(`Stock insuffisant pour le contrat. Il manque ${remainingToDeduct}.`);
        }
    }
}

export const stockService = new StockService();
