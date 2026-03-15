// src/services/RecoveryService.ts

import { recoveryRepo } from "../db/repositories/RecoveryRepository";
import { db } from "../db/database";

import type {
    Recovery,
    RecoveryWithDetails
} from "../types/recovery";

class RecoveryService {

    /* ============================ */
    /* BASIC CRUD                   */
    /* ============================ */

    getAll(): Promise<Recovery[]> {
        return recoveryRepo.getAll();
    }

    create(data: Partial<Recovery>) {
        return recoveryRepo.create(data as Recovery);
    }

    update(id: string, data: Partial<Recovery>) {
        return recoveryRepo.update(id, data);
    }

    delete(id: string) {
        return recoveryRepo.softDelete(id);
    }

    findByOperation(operation_id: string) {
        return recoveryRepo.findByOperation(operation_id);
    }

    findByClient(client_id: string) {
        return recoveryRepo.findByClient(client_id);
    }

    /* ============================ */
    /* OPERATIONS ELIGIBLES         */
    /* ============================ */

    async getEligibleOperations() {

        const operations = await db.operations.toArray();

        return operations.filter(op =>
            op.status === "validated" &&
            (op.remaining_amount ?? 0) > 0 &&
            !op.is_deleted
        );
    }

    /* ============================ */
    /* CREATE RECOVERY              */
    /* ============================ */

    async createRecovery(data: Recovery) {

        const operation = await db.operations.get(data.operation_id);

        if (!operation) {
            throw new Error("Opération introuvable");
        }

        if (operation.status !== "validated") {
            throw new Error("L'opération doit être validée");
        }

        const remaining = operation.remaining_amount ?? 0;

        if (data.amount > remaining) {
            throw new Error("Le montant dépasse le restant");
        }

        await recoveryRepo.create(data);

        const newReceived =
            (operation.amount_received ?? 0) + data.amount;

        const newRemaining =
            (operation.total_amount ?? 0) - newReceived;

        await db.operations.update(operation.id!, {
            amount_received: newReceived,
            remaining_amount: newRemaining,
            updated_at: new Date().toISOString(),
            sync_status: "dirty"
        });
    }

    /* ============================ */
    /* DTO WITH DETAILS             */
    /* ============================ */

    async getAllWithDetails(): Promise<RecoveryWithDetails[]> {

        const recoveries = await recoveryRepo.getAll();

        const operations = await db.operations.toArray();
        const clients = await db.clients.toArray();

        const operationMap = new Map(
            operations.map(o => [o.id, o])
        );

        const clientMap = new Map(
            clients.map(c => [c.id, c])
        );

        return recoveries.map(r => {

            const operation = operationMap.get(r.operation_id);
            const client = clientMap.get(r.client_id);

            const dto: RecoveryWithDetails = {

                ...r,

                client_name: client?.name,

                receipt_reference: operation?.receipt_reference,
                total_amount: operation?.total_amount,
                remaining_amount: operation?.remaining_amount,
                operation_date: operation?.date_demande
            };

            return dto;
        });
    }

}

export const recoveryService = new RecoveryService();