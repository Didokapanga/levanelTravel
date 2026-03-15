// src/services/OperationService.ts

import type { Operations, OperationWithDetails } from "../types/operations";

import { operationsRepo } from "../db/repositories/OperationsRepository";
import { partnerRepo } from "../db/repositories/PartnerRepository";
import { contractRepo } from "../db/repositories/ContractRepository";
import { serviceRepo } from "../db/repositories/ServiceRepository";
import { clientRepo } from "../db/repositories/ClientRepository";
import { operationSegmentsRepo } from "../db/repositories/OperationSegmentsRepository";

export class OperationService {

    /* ===================================================== */
    /* CRUD BASIQUE                                          */
    /* ===================================================== */

    async getAll(): Promise<Operations[]> {
        return operationsRepo.getAll();
    }

    async getById(id: string): Promise<Operations | undefined> {
        return operationsRepo.getById(id);
    }

    async create(data: Partial<Operations>): Promise<Operations> {

        /* ---------- Validation métier ---------- */

        if (!data.partner_id) throw new Error("Partenaire requis");
        if (!data.contract_id) throw new Error("Contrat requis");
        if (!data.service_id) throw new Error("Service requis");
        if (!data.client_id) throw new Error("Client requis");
        if (!data.pnr) throw new Error("Pnr requis");
        if (!data.total_amount || data.total_amount <= 0)
            throw new Error("Montant invalide");

        if (!data.date_demande) throw new Error("Date demande requise");
        if (!data.receipt_reference) throw new Error("Référence reçu requise");

        /* ---------- RÈGLE MÉTIER ---------- */
        // Toute nouvelle opération = pending
        return operationsRepo.create({
            ...data,
            status: "pending"
        });
    }

    async update(id: string, updates: Partial<Operations>) {
        return operationsRepo.update(id, updates);
    }

    async delete(id: string) {
        return operationsRepo.softDelete(id);
    }

    async findByPartner(partner_id: string) {
        return operationsRepo.findByPartner(partner_id);
    }

    /* ===================================================== */
    /* WORKFLOW MÉTIER                                       */
    /* ===================================================== */

    async validate(id: string) {
        return operationsRepo.update(id, { status: "validated" });
    }

    async cancel(id: string) {
        return operationsRepo.update(id, { status: "cancelled" });
    }

    async getPending(): Promise<Operations[]> {
        const ops = await operationsRepo.getAll();
        return ops.filter(o => o.status === "pending");
    }

    /* ===================================================== */
    /* ENRICHISSEMENT                                        */
    /* ===================================================== */

    async getAllWithDetails(): Promise<OperationWithDetails[]> {

        const ops = await operationsRepo.getAll();
        const partners = await partnerRepo.getAll();
        const contracts = await contractRepo.getAll();
        const services = await serviceRepo.getAll();
        const clients = await clientRepo.getAll();   // 👈 ajouté

        return ops.map(op => {

            const partner = partners.find(p => p.id === op.partner_id);
            const contract = contracts.find(c => c.id === op.contract_id);
            const service = services.find(s => s.id === op.service_id);
            const client = clients.find(c => c.id === op.client_id); // 👈 ajouté

            return {
                ...op,
                partner_name: partner?.name,
                contract_type: contract?.contract_type,
                service_name: service?.name,
                client_name: client?.name        // 👈 ajouté
            };
        });
    }

    async getByPartnerWithDetails(
        partner_id: string
    ): Promise<OperationWithDetails[]> {

        const ops = await operationsRepo.findByPartner(partner_id);

        const partners = await partnerRepo.getAll();
        const contracts = await contractRepo.getAll();
        const services = await serviceRepo.getAll();
        const clients = await clientRepo.getAll();   // 👈 ajouté

        return ops.map(op => {

            const partner = partners.find(p => p.id === op.partner_id);
            const contract = contracts.find(c => c.id === op.contract_id);
            const service = services.find(s => s.id === op.service_id);
            const client = clients.find(c => c.id === op.client_id); // 👈 ajouté

            return {
                ...op,
                partner_name: partner?.name,
                contract_type: contract?.contract_type,
                service_name: service?.name,
                client_name: client?.name
            };
        });
    }

    async getByDate(date: string): Promise<Operations[]> {
        return operationsRepo.findByDate(date);
    }

    /* ===================================================== */
    /* DASHBOARD STATS                                       */
    /* ===================================================== */

    async getValidatedToday(): Promise<Operations[]> {
        const today = new Date().toISOString().slice(0, 10);
        const ops = await operationsRepo.getAll();

        return ops.filter(o =>
            o.status === "validated" &&
            o.date_demande.startsWith(today)
        );
    }

    async getValidated(): Promise<Operations[]> {
        const ops = await operationsRepo.getAll();
        return ops.filter(o => o.status === "validated");
    }

    async getValidatedCommissionToday(): Promise<number> {

        const today = new Date().toISOString().slice(0, 10);

        const ops = await operationsRepo.getAll();
        const segments = await operationSegmentsRepo.getAll();

        const todayOps = ops.filter(o =>
            o.status === "validated" &&
            o.date_demande.startsWith(today)
        );

        const ids = new Set(todayOps.map(o => o.id));

        return segments
            .filter(s => ids.has(s.operation_id))
            .reduce((sum, s) => sum + Number(s.commission ?? 0), 0);
    }

    async getValidatedTodayWithDetails(): Promise<OperationWithDetails[]> {

        const today = new Date().toISOString().slice(0, 10);

        const ops = await this.getAllWithDetails();

        return ops.filter(o =>
            o.status === "validated" &&
            o.date_demande.startsWith(today)
        );
    }

    async getCancelledToday(): Promise<Operations[]> {
        const today = new Date().toISOString().slice(0, 10);
        const ops = await operationsRepo.getAll();

        return ops.filter(o =>
            o.status === "cancelled" &&
            o.date_demande?.startsWith(today)
        );
    }

}

export const operationService = new OperationService();
