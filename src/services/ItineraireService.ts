import { itineraireRepo } from '../db/repositories/ItineraireRepository';
import type { Itineraire } from '../types/Itineraire';

export class ItineraireService {
    async create(itineraire: Partial<Itineraire>): Promise<Itineraire> {
        if (!itineraire.code) {
            throw new Error('aumoins le code est requis');
        }
        return itineraireRepo.create(itineraire);
    }

    async update(id: string, updates: Partial<Itineraire>): Promise<Itineraire | undefined> {
        return itineraireRepo.update(id, updates);
    }

    async delete(id: string): Promise<boolean> {
        return itineraireRepo.softDelete(id);
    }

    async getAll(includeDeleted = false): Promise<Itineraire[]> {
        return itineraireRepo.getAll(includeDeleted);
    }

    async getById(id: string): Promise<Itineraire | undefined> {
        return itineraireRepo.getById(id);
    }
}

export const itineraireService = new ItineraireService();
