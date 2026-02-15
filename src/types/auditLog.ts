import type { BaseEntity } from './base';

export interface AuditLog extends BaseEntity {
    entity_name: string;          // table/entité affectée
    entity_id: string;            // id de l'entité
    action: string;               // 'create', 'update', 'delete', 'validate', etc.
    user_id: string;              // qui a effectué l'action
    timestamp: string;            // ISO date
    details?: string;             // JSON ou texte descriptif
}
