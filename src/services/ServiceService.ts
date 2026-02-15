// src/services/ServiceService.ts
import { serviceRepo } from '../db/repositories/ServiceRepository';
import type { Service } from '../types/service';

export class ServiceService {
    async create(service: Partial<Service>): Promise<Service> {
        if (!service.name) throw new Error('Le nom du service est requis');
        return serviceRepo.create(service);
    }

    async update(id: string, updates: Partial<Service>): Promise<Service | undefined> {
        return serviceRepo.update(id, updates);
    }

    async delete(id: string): Promise<boolean> {
        return serviceRepo.softDelete(id);
    }

    async getAll(includeDeleted = false): Promise<Service[]> {
        return serviceRepo.getAll(includeDeleted);
    }

    async getById(id: string): Promise<Service | undefined> {
        return serviceRepo.getById(id);
    }

    async findByName(name: string): Promise<Service[]> {
        return serviceRepo.findByIndex('name', name);
    }
}

export const serviceService = new ServiceService();
