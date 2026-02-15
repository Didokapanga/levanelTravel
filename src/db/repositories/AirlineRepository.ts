// src/db/repositories/AirlineRepository.ts
import { BaseRepository } from '../BaseRepository';
import { db } from '../database';
import type { Airline } from '../../types/airline';

export class AirlineRepository extends BaseRepository<Airline> {
    constructor() {
        super(db.airlines);
    }
}

export const airlineRepo = new AirlineRepository();
