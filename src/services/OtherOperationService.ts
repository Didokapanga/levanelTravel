

import { otherOperationsRepo } from "../db/repositories/OtherOperationsRepository";
import { serviceRepo } from "../db/repositories/ServiceRepository";
import type { OrtherOperations, OrtherOperationWithDetails } from "../types/orther_operations";

export class OtherOperationService {

    async getAll(): Promise<OrtherOperations[]> {
        return otherOperationsRepo.getAll();
    }

    async getById(id: string) {
        return otherOperationsRepo.getById(id);
    }

    async create(data: Partial<OrtherOperations>) {

        if (!data.client_name)
            throw new Error("client requis");

        if (!data.service_fee)
            throw new Error("frais service requis");

        return otherOperationsRepo.create({
            ...data,
            status: "pending" // 🔴 obligatoire comme Billetterie
        });
    }

    async update(id: string, updates: Partial<OrtherOperations>) {
        return otherOperationsRepo.update(id, updates);
    }

    async delete(id: string) {
        return otherOperationsRepo.softDelete(id);
    }

    /* ========================= */
    /* ENRICHISSEMENT            */
    /* ========================= */

    async getAllWithDetails(): Promise<OrtherOperationWithDetails[]> {

        const ops = await otherOperationsRepo.getAll();
        const services = await serviceRepo.getAll();

        return ops.map(op => {

            const service = services.find(s => s.id === op.service_id);

            return {
                ...op,
                service_name: service?.name
            };
        });
    }
}

export const otherOperationService = new OtherOperationService();
