// import { BaseEntity } from './base';
import type { BaseEntity } from './base';

export interface Service extends BaseEntity {
    name: string;
    initial?: string;
}
