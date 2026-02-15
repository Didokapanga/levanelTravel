import type { BaseEntity } from './base';

export interface User extends BaseEntity {
    username: string;
    full_name: string;
    email: string;
    password: string; // Hasher ou Crypter
    role: 'agent' | 'manager' | 'comptable' | 'admin';

    is_active: boolean;
}
