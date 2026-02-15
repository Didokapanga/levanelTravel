// src/db/repositories/UserRepository.ts
import { BaseRepository } from '../BaseRepository';
import { db } from '../database';
import type { User } from '../../types/users';

export class UserRepository extends BaseRepository<User> {
    constructor() {
        super(db.users);
    }

    // Exemple de méthode spécifique : trouver tous les agents actifs
    async findActiveAgents(): Promise<User[]> {
        return this.table
            .where('role')
            .equals('agent')
            .and((u) => u.is_active && !u.is_deleted)
            .toArray();
    }

    async findByEmail(email: string): Promise<User | undefined> {
        const users = await this.getAll(true);
        return users.find(u => u.email === email && !u.is_deleted);
    }


}

export const userRepo = new UserRepository();
