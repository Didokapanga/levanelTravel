// src/db/repositories/ItineraireRepository.ts
import { BaseRepository } from '../BaseRepository';
import { db } from '../database';
import type { Itineraire } from '../../types/Itineraire';

export class ItineraireRepository extends BaseRepository<Itineraire> {
    constructor() {
        super(db.itineraires);
    }
}

export const itineraireRepo = new ItineraireRepository();
