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
     * @returns L'opération et ses segments mis à jour
     * @throws Erreur si le stock ou la caution est insuffisant
     */
    async validateOperation(operation: OperationWithDetails) {
        if (!operation.partner_id || !operation.contract_id) {
            throw new Error("Opération sans partenaire ou contrat");
        }

        const now = new Date().toISOString();

        // 1️⃣ Récupérer le contrat actif du partenaire
        const contracts: Contract[] = await contractService.getByPartner(operation.partner_id);
        const activeContract = contracts.find(c => c.status === "active");
        const contractType = activeContract?.contract_type ?? "agency_service";

        // 2️⃣ Récupérer tous les segments liés à cette opération
        const segments: OperationSegmentWithDetails[] =
            await operationSegmentsService.findByOperation(operation.id);

        // 3️⃣ Déductions selon le type de contrat
        for (const seg of segments) {
            const valueToDeduct = seg.sold_debit ?? 0;

            try {
                if (contractType === "caution_and_stock") {
                    // Déduction progressive sur toutes les lignes de stock du contrat
                    await stockService.deductStock(operation.contract_id, valueToDeduct);
                } else if (contractType === "caution_only") {
                    // Déduction progressive sur toutes les lignes de caution du contrat
                    await cautionService.deductCaution(operation.contract_id, valueToDeduct);
                }
                // agency_service → rien
            } catch (err: any) {
                // On stoppe le workflow et on renvoie l'erreur pour afficher l'alerte
                throw new Error(`Impossible de valider l'opération : ${err.message}`);
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
                reservation_id: operation.id, // lien avec l'opération
                contract_id: operation.contract_id,
                source: contractType === "caution_only" ? "caution" : "stock",
                type: "deduction",
                amount: operation.total_amount,
                description: `Déduction ${contractType} pour l'opération client ${operation.client_name}`
            });
        }

        return { operation, segments };
    }
}

export const operationWorkflowService = new OperationWorkflowService();
