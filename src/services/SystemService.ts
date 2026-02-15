import { systemRepo } from '../db/repositories/SystemRepository';
import type { System } from '../types/systems';

export class SystemService {
    async create(system: Partial<System>): Promise<System> {
        if (!system.name) throw new Error('Le nom du système est requis');
        return systemRepo.create(system);
    }

    async update(id: string, updates: Partial<System>): Promise<System | undefined> {
        return systemRepo.update(id, updates);
    }

    async delete(id: string): Promise<boolean> {
        return systemRepo.softDelete(id);
    }

    async getAll(includeDeleted = false): Promise<System[]> {
        return systemRepo.getAll(includeDeleted);
    }

    async getById(id: string): Promise<System | undefined> {
        return systemRepo.getById(id);
    }
}

export const systemService = new SystemService();
