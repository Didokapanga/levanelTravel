export interface BaseEntity {
    id: string; // UUID

    created_at: string; // ISO date
    updated_at: string; // ISO date

    version: number;

    sync_status: 'dirty' | 'clean' | 'conflict';
    last_synced_at?: string | null;

    created_by?: string | null;
    updated_by?: string | null;

    is_deleted: boolean;
}
