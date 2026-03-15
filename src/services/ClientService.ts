// src/services/ClientService.ts
import { clientRepo } from '../db/repositories/ClientRepository';
import type { Clients } from '../types/clients';

export class ClientService {
    async create(client: Partial<Clients>): Promise<Clients> {
        if (!client.name) throw new Error('Le nom du client est requis');
        if (!client.client_type) throw new Error('Le type de client est requis');
        return clientRepo.create(client);
    }

    async update(id: string, updates: Partial<Clients>): Promise<Clients | undefined> {
        return clientRepo.update(id, updates);
    }

    async delete(id: string): Promise<boolean> {
        return clientRepo.softDelete(id);
    }

    async getAll(includeDeleted = false): Promise<Clients[]> {
        return clientRepo.getAll(includeDeleted);
    }

    async getById(id: string): Promise<Clients | undefined> {
        return clientRepo.getById(id);
    }

    async findByName(name: string): Promise<Clients[]> {
        return clientRepo.findByIndex('name', name);
    }

    async findByEmail(email: string): Promise<Clients[]> {
        return clientRepo.findByIndex('email', email);
    }
}

export const clientService = new ClientService();