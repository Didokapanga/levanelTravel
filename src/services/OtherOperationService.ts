

import { clientRepo } from "../db/repositories/ClientRepository";
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

        if (!data.client_id)
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

    async getValidatedToday(): Promise<OrtherOperationWithDetails[]> {

        const today = new Date().toISOString().slice(0, 10);

        const ops = await this.getAllWithDetails();

        return ops.filter(op =>
            op.status === "validated" &&
            op.date_demande?.slice(0, 10) === today
        );
    }

    async getTotalServiceFeeValidatedToday(): Promise<number> {

        const today = new Date().toISOString().slice(0, 10);

        const ops = await otherOperationsRepo.getAll();

        return ops
            .filter(op =>
                op.status === "validated" &&
                op.date_demande?.slice(0, 10) === today
            )
            .reduce((sum, op) => sum + Number(op.service_fee ?? 0), 0);
    }


    /* ========================= */
    /* ENRICHISSEMENT            */
    /* ========================= */

    async getAllWithDetails(): Promise<OrtherOperationWithDetails[]> {

        const ops = await otherOperationsRepo.getAll();
        const services = await serviceRepo.getAll();
        const clients = await clientRepo.getAll();   // 👈 ajouté


        return ops.map(op => {

            const service = services.find(s => s.id === op.service_id);
            const client = clients.find(c => c.id === op.client_id); // 👈 ajouté

            return {
                ...op,
                service_name: service?.name,
                client_name: client?.name        // 👈 ajouté
            };
        });
    }

    async getByDate(date: string): Promise<OrtherOperations[]> {

        const ops = await otherOperationsRepo.getAll();

        return ops.filter(op =>
            op.date_demande?.slice(0, 10) === date &&
            !op.is_deleted
        );

    }
}

export const otherOperationService = new OtherOperationService();
