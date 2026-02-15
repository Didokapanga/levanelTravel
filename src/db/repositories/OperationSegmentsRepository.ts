import { BaseRepository } from "../BaseRepository";
import { db } from "../database";
import type { OperationSegments } from "../../types/operation_segments";

export class OperationSegmentsRepository extends BaseRepository<OperationSegments> {

    constructor() {
        super(db.operation_segments);
    }

    async findByOperation(operation_id: string) {
        return this.table
            .where("operation_id")
            .equals(operation_id)
            .and(s => !s.is_deleted)
            .toArray();
    }

    async findByTicket(ticket_number: string) {
        return this.table
            .where("ticket_number")
            .equals(ticket_number)
            .and(s => !s.is_deleted)
            .toArray();
    }
}

export const operationSegmentsRepo = new OperationSegmentsRepository();
