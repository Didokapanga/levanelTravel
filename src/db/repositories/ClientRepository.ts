// src/db/repositories/ClientRepository.ts
import { BaseRepository } from '../BaseRepository';
import { db } from '../database';
import type { Clients } from '../../types/clients';

export class ClientRepository extends BaseRepository<Clients> {
    constructor() {
        super(db.clients);
    }
}

export const clientRepo = new ClientRepository();