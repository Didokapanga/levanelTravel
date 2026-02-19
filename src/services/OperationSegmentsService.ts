import { operationSegmentsRepo } from "../db/repositories/OperationSegmentsRepository";
import { db } from "../db/database";

import type {
    OperationSegments,
    OperationSegmentWithDetails
} from "../types/operation_segments";
import { operationService } from "./OperationService";

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

    update(id: string, data: Partial<OperationSegments>) {
        return operationSegmentsRepo.update(id, data);
    }

    delete(id: string) {
        return operationSegmentsRepo.softDelete(id);
    }

    async getTotalServiceFeeValidated(): Promise<number> {

        const validatedOps = await operationService.getValidated();
        const segments = await operationSegmentsRepo.getAll();

        const validatedIds = new Set(validatedOps.map(o => o.id));

        return segments
            .filter(s => validatedIds.has(s.operation_id))
            .reduce((sum, s) => sum + Number(s.service_fee ?? 0), 0);
    }

    /* ============================ */
    /* DTO WITH DETAILS             */
    /* ============================ */

    async getAllWithDetails(): Promise<OperationSegmentWithDetails[]> {

        const segments = await operationSegmentsRepo.getAll();

        return Promise.all(
            segments.map(async (s) => {

                const airline = s.airline_id
                    ? await db.airlines.get(s.airline_id)
                    : undefined;

                const system = s.system_id
                    ? await db.systems.get(s.system_id)
                    : undefined;

                const itineraire = s.itineraire_id
                    ? await db.itineraires.get(s.itineraire_id)
                    : undefined;

                const operation = await db.operations.get(s.operation_id);

                const dto: OperationSegmentWithDetails = {
                    ...s,

                    receipt_reference: operation?.receipt_reference,

                    airline_name: airline?.name,
                    system_name: system?.name,
                    itineraire_code: itineraire?.code,

                    operation_client: operation?.client_name,
                    operation_date: operation?.date_emission
                };

                return dto;
            })
        );
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
