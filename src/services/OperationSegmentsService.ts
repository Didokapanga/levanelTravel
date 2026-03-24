import { operationSegmentsRepo } from "../db/repositories/OperationSegmentsRepository";
import { db } from "../db/database";

import type {
    OperationSegments,
    OperationSegmentWithDetails
} from "../types/operation_segments";
import { operationService } from "./OperationService";
import { clientRepo } from "../db/repositories/ClientRepository";

class OperationSegmentsService {

    /* ============================ */
    /* UTILS                        */
    /* ============================ */

    private generateSegmentReference(count: number): string {
        const now = new Date();

        const month = String(now.getMonth() + 1).padStart(2, "0");
        const year = now.getFullYear();
        const increment = String(count + 1).padStart(4, "0");

        return `SEG-${month}-${year}-${increment}`;
    }

    async getCountByMonth(month: number, year: number): Promise<number> {
        const segments = await operationSegmentsRepo.getAll();

        return segments.filter(s => {
            const date = new Date(s.created_at);
            return (
                date.getMonth() === month &&
                date.getFullYear() === year
            );
        }).length;
    }

    /* ============================ */
    /* BASIC CRUD (ENTITY)          */
    /* ============================ */

    getAll(): Promise<OperationSegments[]> {
        return operationSegmentsRepo.getAll();
    }

    async create(data: Partial<OperationSegments>) {

        const now = new Date();
        const count = await this.getCountByMonth(
            now.getMonth(),
            now.getFullYear()
        );

        const segment_reference = this.generateSegmentReference(count);

        return operationSegmentsRepo.create({
            ...data,
            segment_reference
        } as OperationSegments);
    }

    async findByOperation(operation_id: string): Promise<OperationSegmentWithDetails[]> {
        return operationSegmentsRepo.findByOperation(operation_id);
    }

    async getEnrichedByOperation(operation_id: string): Promise<OperationSegmentWithDetails[]> {
        const allSegments = await this.getAllWithDetails();
        return allSegments.filter(s => s.operation_id === operation_id);
    }

    update(id: string, data: Partial<OperationSegments>) {
        return operationSegmentsRepo.update(id, data);
    }

    delete(id: string) {
        return operationSegmentsRepo.softDelete(id);
    }

    async getTotalServiceFeeValidated(): Promise<number> {

        const today = new Date().toISOString().slice(0, 10);

        const operations = await operationService.getValidated();
        const segments = await operationSegmentsRepo.getAll();

        const todayOps = operations.filter(o =>
            o.date_demande.startsWith(today)
        );

        const operationIds = new Set(todayOps.map(o => o.id));

        return segments
            .filter(s => operationIds.has(s.operation_id))
            .reduce(
                (sum, s) => sum + Number(s.service_fee ?? 0),
                0
            );
    }

    /* ============================ */
    /* DTO WITH DETAILS             */
    /* ============================ */

    async getAllWithDetails(): Promise<OperationSegmentWithDetails[]> {

        const segments = await operationSegmentsRepo.getAll();

        const airlines = await db.airlines.toArray();
        const systems = await db.systems.toArray();
        const operations = await db.operations.toArray();
        const clients = await clientRepo.getAll();

        const airlineMap = new Map(airlines.map(a => [a.id, a]));
        const systemMap = new Map(systems.map(s => [s.id, s]));
        const operationMap = new Map(operations.map(o => [o.id, o]));
        const clientMap = new Map(clients.map(c => [c.id, c]));

        return segments.map((s) => {

            const airline = s.airline_id
                ? airlineMap.get(s.airline_id)
                : undefined;

            const system = s.system_id
                ? systemMap.get(s.system_id)
                : undefined;

            const operation = operationMap.get(s.operation_id);

            const client = operation?.client_id
                ? clientMap.get(operation.client_id)
                : undefined;

            return {
                ...s,
                receipt_reference: operation?.receipt_reference,
                airline_name: airline?.name,
                system_name: system?.name,
                operation_client: client?.name,
                operation_date: operation?.date_demande
            };
        });
    }

    async getUpdatesOrCancellations(): Promise<OperationSegmentWithDetails[]> {
        const segments = await this.getAllWithDetails();

        return segments.filter(s =>
            (s.update_price && s.update_price > 0) ||
            (s.cancel_price && s.cancel_price > 0)
        );
    }

}

export const operationSegmentsService = new OperationSegmentsService();