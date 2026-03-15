// src/db/repositories/RecoveryRepository.ts

import { BaseRepository } from "../BaseRepository";
import { db } from "../database";

import type { Recovery } from "../../types/recovery";

export class RecoveryRepository extends BaseRepository<Recovery> {

    constructor() {
        super(db.recoveries);
    }

    async findByOperation(operation_id: string): Promise<Recovery[]> {

        return this.table
            .where("operation_id")
            .equals(operation_id)
            .and(r => !r.is_deleted)
            .toArray();
    }

    async findByClient(client_id: string): Promise<Recovery[]> {

        return this.table
            .where("client_id")
            .equals(client_id)
            .and(r => !r.is_deleted)
            .toArray();
    }

    async findByDate(date: string): Promise<Recovery[]> {

        return this.table
            .where("payment_date")
            .equals(date)
            .and(r => !r.is_deleted)
            .toArray();
    }

}

export const recoveryRepo = new RecoveryRepository();