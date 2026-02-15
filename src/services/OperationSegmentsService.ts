import { operationSegmentsRepo } from "../db/repositories/OperationSegmentsRepository";
import { db } from "../db/database";

import type {
    OperationSegments,
    OperationSegmentWithDetails
} from "../types/operation_segments";

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
}

export const operationSegmentsService = new OperationSegmentsService();
