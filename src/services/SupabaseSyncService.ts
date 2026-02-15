import { db } from "../db/database";
import type { BaseEntity } from "../types/base";
import { supabase } from "./supabaseClient";

/**
 * Tables synchronisées
 */
const syncTables = [
    "users",
    "systems",
    "services",
    "airlines",
    "partners",
    "itineraires",
    "contracts",
    "cautions",
    "stocks",
    "financial_operations",
    "cash_flows",
    "operations",
    "orther_operations",
    "operation_segments",
    "audit_logs",
    "change_logs",
] as const;

type TableName = (typeof syncTables)[number];

export class SupabaseSyncService {
    /**
     * Sync complète
     */
    async fullSync() {
        for (const table of syncTables) {
            await this.syncTable(table);
        }
    }

    /**
     * Sync d’une table
     */
    async syncTable(tableName: TableName) {
        console.log("🔄 Sync table:", tableName);

        await this.pushLocalChanges(tableName);
        await this.pullRemoteChanges(tableName);
    }

    /**
     * PUSH : local → Supabase
     */
    private async pushLocalChanges(tableName: TableName) {
        const table = (db as any)[tableName];

        const dirtyRows: BaseEntity[] = await table
            .where("sync_status")
            .equals("dirty")
            .toArray();

        if (!dirtyRows.length) return;

        console.log(`⬆️ ${tableName}: push ${dirtyRows.length}`);

        const { error } = await supabase
            .from(tableName)
            .upsert(dirtyRows, { onConflict: "id" });

        if (error) {
            console.error("Supabase push error:", error);
            return;
        }

        const now = new Date().toISOString();

        await Promise.all(
            dirtyRows.map((row) =>
                table.update(row.id, {
                    sync_status: "clean",
                    last_synced_at: now,
                })
            )
        );
    }

    /**
     * PULL : Supabase → local
     */
    private async pullRemoteChanges(tableName: TableName) {
        const table = (db as any)[tableName];

        const lastSync = await this.getLastSyncDate(tableName);

        let query = supabase.from(tableName).select("*");

        if (lastSync) {
            query = query.gt("updated_at", lastSync);
        }

        const { data, error } = await query;

        if (error || !data) {
            console.error("Supabase pull error:", error);
            return;
        }

        console.log(`⬇️ ${tableName}: pull ${data.length}`);

        for (const remote of data as BaseEntity[]) {
            const local = await table.get(remote.id);

            if (!local) {
                await table.add({ ...remote, sync_status: "clean" });
                continue;
            }

            // merge logique version
            if ((remote.version ?? 0) > (local.version ?? 0)) {
                await table.put({ ...remote, sync_status: "clean" });
            }

            // conflit
            if ((remote.version ?? 0) < (local.version ?? 0)) {
                console.warn("⚠️ Conflict detected:", tableName, remote.id);

                await db.change_logs.add({
                    id: crypto.randomUUID(),
                    table_name: tableName,
                    record_id: remote.id,
                    column_name: "conflict",
                    user_id: null,
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString(),
                    version: 1,
                    sync_status: "dirty",
                    is_deleted: false,
                });
            }
        }

        await this.setLastSyncDate(tableName);
    }

    /**
     * Dernière sync stockée
     */
    private async getLastSyncDate(tableName: TableName) {
        const key = `lastSync_${tableName}`;
        return localStorage.getItem(key);
    }

    private async setLastSyncDate(tableName: TableName) {
        const key = `lastSync_${tableName}`;
        localStorage.setItem(key, new Date().toISOString());
    }
}

export const supabaseSyncService = new SupabaseSyncService();
