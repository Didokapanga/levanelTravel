import { v4 as uuidv4 } from 'uuid';
import type { BaseEntity } from '../types/base';
import type { Table } from 'dexie';

export class BaseRepository<T extends BaseEntity> {
    protected table: Table<T, string>;

    constructor(table: Table<T, string>) {
        this.table = table;
    }

    /** Créer un nouvel enregistrement */
    async create(entity: Partial<T>): Promise<T> {
        const now = new Date().toISOString();
        const newEntity: T = {
            id: entity.id ?? uuidv4(),
            created_at: now,
            updated_at: now,
            version: 1,
            sync_status: 'dirty',
            is_deleted: false,
            ...entity,
        } as T;

        await this.table.add(newEntity);
        return newEntity;
    }

    /** Mettre à jour un enregistrement existant */
    async update(id: string, updates: Partial<T>): Promise<T | undefined> {
        const existing = await this.table.get(id);
        if (!existing || existing.is_deleted) return undefined;

        const now = new Date().toISOString();

        await this.table.update(id, (obj) => {
            if (!obj) return false;
            Object.assign(obj, updates); // applique tous les champs passés
            obj.updated_at = now;
            obj.version = (obj.version ?? 0) + 1;
            obj.sync_status = 'dirty';
        });

        const updated = await this.table.get(id);
        return updated;
    }

    /** Supprimer (soft delete) */
    async softDelete(id: string): Promise<boolean> {
        const existing = await this.table.get(id);
        if (!existing || existing.is_deleted) return false;

        const now = new Date().toISOString();

        await this.table.update(id, (obj) => {
            if (!obj) return false;
            obj.is_deleted = true;
            obj.updated_at = now;
            obj.version = (obj.version ?? 0) + 1;
            obj.sync_status = 'dirty';
        });

        return true;
    }

    /** Récupérer un enregistrement par ID (optionnellement inclure supprimés) */
    async getById(id: string, includeDeleted = false): Promise<T | undefined> {
        const entity = await this.table.get(id);
        if (!entity) return undefined;
        if (!includeDeleted && entity.is_deleted) return undefined;
        return entity;
    }

    /** Récupérer tous les enregistrements (optionnellement inclure supprimés) */
    async getAll(includeDeleted = false): Promise<T[]> {
        let collection = this.table.toCollection();
        if (!includeDeleted) {
            collection = collection.filter((e) => !e.is_deleted);
        }
        return collection.toArray();
    }

    /** Rechercher par un champ indexé */
    async findByIndex<K extends keyof T>(
        index: K,
        value: T[K],
        includeDeleted = false
    ): Promise<T[]> {
        let collection = this.table.where(index as any).equals(value as any);
        if (!includeDeleted) {
            collection = collection.filter((e) => !e.is_deleted);
        }
        return collection.toArray();
    }
}
