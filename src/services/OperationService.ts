// src/services/OperationService.ts

import type { Operations, OperationWithDetails } from "../types/operations";

import { operationsRepo } from "../db/repositories/OperationsRepository";
import { partnerRepo } from "../db/repositories/PartnerRepository";
import { contractRepo } from "../db/repositories/ContractRepository";
import { serviceRepo } from "../db/repositories/ServiceRepository";

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
        if (!data.client_name) throw new Error("Client requis");
        if (!data.total_amount || data.total_amount <= 0)
            throw new Error("Montant invalide");

        if (!data.date_demande) throw new Error("Date demande requise");
        if (!data.date_emission) throw new Error("Date émission requise");
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

        return ops.map(op => {

            const partner = partners.find(p => p.id === op.partner_id);
            const contract = contracts.find(c => c.id === op.contract_id);
            const service = services.find(s => s.id === op.service_id);

            return {
                ...op,
                partner_name: partner?.name,
                contract_type: contract?.contract_type,
                service_name: service?.name
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

        return ops.map(op => {

            const partner = partners.find(p => p.id === op.partner_id);
            const contract = contracts.find(c => c.id === op.contract_id);
            const service = services.find(s => s.id === op.service_id);

            return {
                ...op,
                partner_name: partner?.name,
                contract_type: contract?.contract_type,
                service_name: service?.name
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

    async getTotalServiceFees(): Promise<number> {
        const validated = await this.getValidated();

        const todayStr = new Date().toISOString().slice(0, 10);

        const todayOps = validated.filter(
            op => op.date_demande.slice(0, 10) === todayStr
        );

        return todayOps.reduce(
            (sum, op) => sum + Number(op.total_commission ?? 0),
            0
        );
    }

    async getValidatedCommissionToday(): Promise<number> {
        const today = new Date().toISOString().slice(0, 10);
        const ops = await this.getAllWithDetails();

        return ops
            .filter(o =>
                o.status === "validated" &&
                o.date_demande.startsWith(today) &&
                o.contract_type !== "agency_service"
            )
            .reduce((sum, o) => sum + (o.total_commission ?? 0), 0);
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
