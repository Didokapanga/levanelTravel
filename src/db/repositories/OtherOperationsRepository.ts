import type { OrtherOperations } from "../../types/orther_operations";
import { BaseRepository } from "../BaseRepository";
import { db } from "../database";

export class OtherOperationsRepository extends BaseRepository<OrtherOperations> {

    constructor() {
        super(db.orther_operations); // ⚠️ table Dexie à créer si pas encore
    }

    async findByService(service_id: string) {
        return this.table
            .where("service_id")
            .equals(service_id)
            .and(o => !o.is_deleted)
            .toArray();
    }
}

export const otherOperationsRepo = new OtherOperationsRepository();
