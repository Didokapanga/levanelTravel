import type { BaseEntity } from './base';

export interface ChangeLog extends BaseEntity {
    table_name: string;
    record_id: string;
    column_name: string;

    old_value?: string | null;
    new_value?: string | null;

    user_id?: string | null;
}

