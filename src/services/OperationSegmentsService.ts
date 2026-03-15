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
    /* BASIC CRUD (ENTITY)          */
    /* ============================ */

    getAll(): Promise<OperationSegments[]> {
        return operationSegmentsRepo.getAll();
    }

    create(data: Partial<OperationSegments>) {
        return operationSegmentsRepo.create(data as OperationSegments);
    }

    async findByOperation(operation_id: string): Promise<OperationSegmentWithDetails[]> {
        return operationSegmentsRepo.findByOperation(operation_id);
    }

    async getEnrichedByOperation(operation_id: string): Promise<OperationSegmentWithDetails[]> {
        // Récupère tous les segments enrichis
        const allSegments = await this.getAllWithDetails();

        // Filtre uniquement ceux de l'opération demandée
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
        const itineraires = await db.itineraires.toArray();
        const operations = await db.operations.toArray();
        const clients = await clientRepo.getAll();

        const airlineMap = new Map(airlines.map(a => [a.id, a]));
        const systemMap = new Map(systems.map(s => [s.id, s]));
        const itineraireMap = new Map(itineraires.map(i => [i.id, i]));
        const operationMap = new Map(operations.map(o => [o.id, o]));
        const clientMap = new Map(clients.map(c => [c.id, c]));

        return segments.map((s) => {

            const airline = s.airline_id
                ? airlineMap.get(s.airline_id)
                : undefined;

            const system = s.system_id
                ? systemMap.get(s.system_id)
                : undefined;

            const itineraire = s.itineraire_id
                ? itineraireMap.get(s.itineraire_id)
                : undefined;

            const operation = operationMap.get(s.operation_id);

            const client = operation?.client_id
                ? clientMap.get(operation.client_id)
                : undefined;

            const dto: OperationSegmentWithDetails = {
                ...s,

                receipt_reference: operation?.receipt_reference,

                airline_name: airline?.name,
                system_name: system?.name,
                itineraire_code: itineraire?.code,

                operation_client: client?.name,   // ✅ NOM DU CLIENT
                operation_date: operation?.date_demande
            };

            return dto;
        });
    }

    async getUpdatesOrCancellations(): Promise<OperationSegmentWithDetails[]> {
        const segments = await this.getAllWithDetails();

        // Filtre uniquement les segments avec update_price ou cancel_price > 0
        return segments.filter(s =>
            (s.update_price && s.update_price > 0) ||
            (s.cancel_price && s.cancel_price > 0)
        );
    }

}

export const operationSegmentsService = new OperationSegmentsService();
