// src/db/repositories/AuditLogRepository.ts
import { BaseRepository } from '../BaseRepository';
import { db } from '../database';
import type { AuditLog } from '../../types/auditLog';

export class AuditLogRepository extends BaseRepository<AuditLog> {
    constructor() {
        super(db.audit_logs);
    }

    async findByEntity(entity_name: string, entity_id: string): Promise<AuditLog[]> {
        return this.table
            .where('entity_name')
            .equals(entity_name)
            .and(a => a.entity_id === entity_id)
            .toArray();
    }
}

export const auditLogRepo = new AuditLogRepository();
