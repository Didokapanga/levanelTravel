// src/db/repositories/SystemRepository.ts
import { BaseRepository } from '../BaseRepository';
import { db } from '../database';
import type { System } from '../../types/systems';

export class SystemRepository extends BaseRepository<System> {
    constructor() {
        super(db.systems);
    }
}

export const systemRepo = new SystemRepository();
