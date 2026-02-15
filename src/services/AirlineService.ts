// src/services/AirlineService.ts
import { airlineRepo } from '../db/repositories/AirlineRepository';
import type { Airline } from '../types/airline';

export class AirlineService {
    async create(airline: Partial<Airline>): Promise<Airline> {
        if (!airline.code) throw new Error('code est requis');
        return airlineRepo.create(airline);
    }

    async update(id: string, updates: Partial<Airline>): Promise<Airline | undefined> {
        return airlineRepo.update(id, updates);
    }

    async delete(id: string): Promise<boolean> {
        return airlineRepo.softDelete(id);
    }

    async getAll(includeDeleted = false): Promise<Airline[]> {
        return airlineRepo.getAll(includeDeleted);
    }

    async getById(id: string): Promise<Airline | undefined> {
        return airlineRepo.getById(id);
    }
}

export const airlineService = new AirlineService();
