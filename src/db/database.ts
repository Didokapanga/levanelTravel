// src/db/database.ts
import Dexie, { type Table } from 'dexie';

import type { User } from '../types/users';
import type { System } from '../types/systems';
import type { Service } from '../types/service';
import type { Partner } from '../types/partner';
import type { Itineraire } from '../types/Itineraire';
import type { Contract } from '../types/contract';
import type { Caution } from '../types/caution';
import type { Stock } from '../types/stocks';
import type { FinancialOperation } from '../types/fiancial_operation';
import type { CashFlow } from '../types/cash_flow';
import type { Operations } from '../types/operations';
import type { OperationSegments } from '../types/operation_segments';
import type { AuditLog } from '../types/auditLog';
import type { ChangeLog } from '../types/changeLog';
import type { Airline } from '../types/airline';
import type { OrtherOperations } from '../types/orther_operations';

// ⚡ Fonction utilitaire pour supprimer une base IndexedDB
async function clearOldDatabase(oldDbName: string) {
  return new Promise<void>((resolve, reject) => {
    const request = indexedDB.deleteDatabase(oldDbName);
    request.onsuccess = () => {
      console.log(`Ancienne base "${oldDbName}" supprimée.`);
      resolve();
    };
    request.onerror = (event) => {
      console.error(`Erreur lors de la suppression de la base "${oldDbName}"`, event);
      reject(event);
    };
    request.onblocked = () => {
      console.warn(`Suppression de la base "${oldDbName}" bloquée (fermez les onglets ouverts).`);
    };
  });
}

// ⚡ Supprimer l’ancienne base si nécessaire
await clearOldDatabase('travel_agency_db'); // <-- remplace par le nom exact de l'ancienne base

// Maintenant on crée la nouvelle base
export class AppDatabase extends Dexie {
  users!: Table<User, string>;
  systems!: Table<System, string>;
  services!: Table<Service, string>;
  airlines!: Table<Airline, string>;
  partners!: Table<Partner, string>;
  itineraires!: Table<Itineraire, string>;
  contracts!: Table<Contract, string>;
  cautions!: Table<Caution, string>;
  stocks!: Table<Stock, string>;
  financial_operations!: Table<FinancialOperation, string>;
  cash_flows!: Table<CashFlow, string>;
  operations!: Table<Operations, string>;
  orther_operations!: Table<OrtherOperations, string>;
  operation_segments!: Table<OperationSegments, string>;
  audit_logs!: Table<AuditLog, string>;
  change_logs!: Table<ChangeLog, string>;

  constructor() {
    super('app_database');

    this.version(10).stores({
      users: `&id,&username,email,role,password,is_active,sync_status,is_deleted,updated_at`,
      systems: `&id,name,sync_status,is_deleted`,
      airlines: `&id,code,name,sync_status,is_deleted,updated_at`,
      services: `&id,name,initial,sync_status,is_deleted`,
      partners: `&id,name,type,sync_status,is_deleted`,
      itineraires: `&id,code,country,sync_status,is_deleted`,
      contracts: `&id,partner_id,contract_type,status,start_date,end_date,sync_status,is_deleted`,
      cautions: `&id,contract_id,sync_status,is_deleted,updated_at`,
      stocks: `&id,contract_id,sync_status,is_deleted,updated_at`,
      financial_operations: `&id,operation_id,contract_id,source,type,sync_status,is_deleted,created_at`,
      cash_flows: `&id,direction,source,currency,contract_id,partner_id,operation_date,sync_status,is_deleted`,
      operations: `&id,partner_id,service_id,contract_id,date_demande,date_emission,total_amount,total_commission,total_tax,status,receipt_reference,sync_status,is_deleted,updated_at`,
      orther_operations: `&id,service_id,client_name,date_demande,date_emission,total_amount,service_fee,status,observation,sync_status,is_deleted,updated_at`,
      operation_segments: `&id,operation_id,airline_id,system_id,itineraire_id,ticket_number,pnr,sync_status,is_deleted,updated_at`,
      audit_logs: `&id,entity_name,entity_id,action,user_id,timestamp,sync_status`,
      change_logs: `&id,table_name,record_id,column_name,updated_at,user_id,sync_status`
    });
  }
}

export const db = new AppDatabase();
