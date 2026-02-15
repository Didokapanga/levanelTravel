// src/services/UserService.ts
import bcrypt from 'bcryptjs';
import { userRepo } from '../db/repositories/UserRepository';
import type { User } from '../types/users';

export class UserService {
    constructor() { }

    /** Créer un utilisateur */
    async create(user: Partial<User>): Promise<User> {
        if (!user.username || !user.email || !user.password) {
            throw new Error('username, email et password sont requis');
        }

        // hash du mot de passe côté client (si nécessaire)
        const hashedPassword = bcrypt.hashSync(user.password!, 10);
        user.password = hashedPassword;

        return userRepo.create(user);
    }

    /** Mettre à jour un utilisateur */
    async update(id: string, updates: Partial<User>): Promise<User | undefined> {
        return userRepo.update(id, updates);
    }

    async findByUsername(username: string): Promise<User[]> {
        return userRepo.findByIndex('username', username);
    }

    /** Activer / désactiver un utilisateur */
    async toggleActive(id: string): Promise<User | undefined> {
        const user = await userRepo.getById(id);
        if (!user) return undefined;
        return userRepo.update(id, { is_active: !user.is_active });
    }

    /** Supprimer un utilisateur (soft delete) */
    async delete(id: string): Promise<boolean> {
        return userRepo.softDelete(id);
    }

    /** Récupérer tous les utilisateurs */
    async getAll(includeDeleted = false): Promise<User[]> {
        return userRepo.getAll(includeDeleted);
    }

    /** Récupérer un utilisateur par ID */
    async getById(id: string, includeDeleted = false): Promise<User | undefined> {
        return userRepo.getById(id, includeDeleted);
    }
}

export const userService = new UserService();
