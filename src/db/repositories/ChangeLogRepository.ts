// src/db/repositories/ChangeLogRepository.ts
import { BaseRepository } from '../BaseRepository';
import { db } from '../database';
import type { ChangeLog } from '../../types/changeLog';

export class ChangeLogRepository extends BaseRepository<ChangeLog> {
    constructor() {
        super(db.change_logs);
    }

    async findByRecord(table_name: string, record_id: string): Promise<ChangeLog[]> {
        return this.table
            .where('table_name')
            .equals(table_name)
            .and(c => c.record_id === record_id)
            .toArray();
    }
}

export const changeLogRepo = new ChangeLogRepository();
