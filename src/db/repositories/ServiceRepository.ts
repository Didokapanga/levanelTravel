// src/db/repositories/ServiceRepository.ts
import { BaseRepository } from '../BaseRepository';
import { db } from '../database';
import type { Service } from '../../types/service';

export class ServiceRepository extends BaseRepository<Service> {
    constructor() {
        super(db.services);
    }
}

export const serviceRepo = new ServiceRepository();
