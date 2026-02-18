// src/services/OperationWorkflowService.ts
import { operationService } from "./OperationService";
import { operationSegmentsService } from "./OperationSegmentsService";
import { contractService } from "./ContractService";
import { stockService } from "./StockService";
import { cautionService } from "./CautionService";
import { financialOperationService } from "./FinancialOperationService";

import type { OperationWithDetails } from "../types/operations";
import type { OperationSegmentWithDetails } from "../types/operation_segments";
import type { Contract } from "../types/contract";

export class OperationWorkflowService {

    /**
     * Valide une opération billetterie et applique les déductions
     * @param operation Opération à valider
     * @param segments Segments optionnels fournis depuis le front
     * @returns L'opération et ses segments mis à jour
     * @throws Erreur si le stock ou la caution est insuffisant ou utilisateur non manager
     */
    async validateOperation(
        operation: OperationWithDetails,
        segments?: OperationSegmentWithDetails[]
    ) {

        // --------------------------------------------------
        // 0️⃣ Vérification authentification + rôle manager
        // --------------------------------------------------
        const stored = localStorage.getItem("auth_user");

        if (!stored) {
            throw new Error("Utilisateur non connecté");
        }

        const currentUser = JSON.parse(stored);

        if (currentUser.role !== "manager") {
            throw new Error("Seul un manager peut valider une opération");
        }

        if (!operation.partner_id || !operation.contract_id) {
            throw new Error("Opération sans partenaire ou contrat");
        }

        if (operation.status === "validated") {
            throw new Error("Opération déjà validée");
        }

        const now = new Date().toISOString();

        // 1️⃣ Récupérer le contrat actif du partenaire
        const contracts: Contract[] =
            await contractService.getByPartner(operation.partner_id);

        const activeContract = contracts.find(c => c.status === "active");

        if (!activeContract) {
            throw new Error("Aucun contrat actif pour ce partenaire");
        }

        const contractType = activeContract.contract_type ?? "agency_service";

        // 2️⃣ Récupérer tous les segments liés à cette opération si non fournis
        const segmentsToUse: OperationSegmentWithDetails[] =
            segments && segments.length
                ? segments
                : await operationSegmentsService.findByOperation(operation.id);

        if (!segmentsToUse.length) {
            throw new Error("Aucun segment trouvé pour cette opération");
        }

        // 3️⃣ Déductions selon le type de contrat
        for (const seg of segmentsToUse) {

            const valueToDeduct = seg.sold_debit ?? 0;

            if (valueToDeduct <= 0) continue;

            try {

                if (contractType === "caution_and_stock") {
                    await stockService.deductStock(
                        operation.contract_id,
                        valueToDeduct
                    );
                }

                else if (contractType === "caution_only") {
                    await cautionService.deductCaution(
                        operation.contract_id,
                        valueToDeduct
                    );
                }

                // agency_service → aucune déduction

            } catch (err: any) {
                throw new Error(
                    `Impossible de valider l'opération : ${err.message}`
                );
            }

            // 4️⃣ Marquer le segment pour synchronisation
            seg.sync_status = "dirty";
            seg.version = (seg.version ?? 0) + 1;
            seg.updated_at = now;

            // 5️⃣ Sauvegarder le segment
            await operationSegmentsService.update(seg.id, seg);
        }

        // 6️⃣ Marquer l'opération comme validée
        await operationService.update(operation.id, {
            status: "validated",
            sync_status: "dirty",
            version: (operation.version ?? 0) + 1,
            updated_at: now
        });

        // 7️⃣ Créer l'opération financière pour la Billetterie
        if (contractType !== "agency_service") {

            await financialOperationService.create({
                operation_id: operation.id,
                contract_id: operation.contract_id,
                source: contractType === "caution_only"
                    ? "caution"
                    : "stock",
                type: "deduction",
                amount: operation.total_amount,
                description:
                    `Déduction ${contractType} pour l'opération client ${operation.client_name}`,
                sync_status: "dirty"
            });
        }

        return { operation, segments: segmentsToUse };
    }
}

export const operationWorkflowService = new OperationWorkflowService();
