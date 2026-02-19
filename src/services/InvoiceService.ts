import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import type { OperationWithDetails } from "../types/operations";
import type { OperationSegmentWithDetails } from "../types/operation_segments";
import { operationSegmentsService } from "./OperationSegmentsService";
import { db } from "../db/database"; // si tu as Dexie, sinon adapter

export class InvoiceService {

    /**
     * Récupère tous les segments enrichis pour une opération
     */
    private async fetchSegments(operationId: string): Promise<OperationSegmentWithDetails[]> {
        // 🔹 Récupère tous les segments pour cette opération
        const segments = await operationSegmentsService.findByOperation(operationId);

        // 🔹 Enrichissement manuel avec les noms de compagnies et itinéraires si manquant
        const enriched: OperationSegmentWithDetails[] = await Promise.all(
            segments.map(async s => {
                const airline = s.airline_id ? await db.airlines.get(s.airline_id) : undefined;
                const itineraire = s.itineraire_id ? await db.itineraires.get(s.itineraire_id) : undefined;

                return {
                    ...s,
                    airline_name: airline?.name,
                    itineraire_code: itineraire?.code
                };
            })
        );

        return enriched;
    }

    /**
     * Génère le fichier Pro-forma
     */
    async generateProforma(operation: OperationWithDetails) {
        const segments = await this.fetchSegments(operation.id);

        const airlineName = segments.map(s => s.airline_name).filter(Boolean).join(", ");
        const itineraireCode = segments.map(s => s.itineraire_code).filter(Boolean).join(", ");

        const res = await fetch("/templates/proforma.xlsx");
        const buffer = await res.arrayBuffer();
        const wb = XLSX.read(buffer);
        const ws = wb.Sheets[wb.SheetNames[0]];

        ws["B2"] = { v: operation.receipt_reference, t: "s" };
        ws["B3"] = { v: operation.client_name, t: "s" };
        ws["B4"] = { v: operation.date_emission, t: "s" };
        ws["B5"] = { v: airlineName || "", t: "s" };
        ws["B6"] = { v: itineraireCode || "", t: "s" };

        const file = XLSX.write(wb, { type: "array", bookType: "xlsx" });
        saveAs(new Blob([file]), `Proforma_${operation.receipt_reference}.xlsx`);
    }

    /**
     * Génère le fichier Archive avec toutes les informations financières
     */
    async generateArchive(operation: OperationWithDetails) {
        const segments = await this.fetchSegments(operation.id);

        const airlineName = segments.map(s => s.airline_name).filter(Boolean).join(", ");
        const itineraireCode = segments.map(s => s.itineraire_code).filter(Boolean).join(", ");

        const tht = segments.reduce((sum, s) => sum + (s.tht ?? 0), 0);
        const tax = segments.reduce((sum, s) => sum + (s.tax ?? 0), 0);
        const serviceFee = segments.reduce((sum, s) => sum + (s.service_fee ?? 0), 0);
        const commission = segments.reduce((sum, s) => sum + (s.commission ?? 0), 0);

        const res = await fetch("/templates/archive.xlsx");
        const buffer = await res.arrayBuffer();
        const wb = XLSX.read(buffer);
        const ws = wb.Sheets[wb.SheetNames[0]];

        ws["B2"] = { v: operation.receipt_reference, t: "s" };
        ws["B3"] = { v: operation.client_name, t: "s" };
        ws["B4"] = { v: operation.date_emission, t: "s" };
        ws["B5"] = { v: airlineName || "", t: "s" };
        ws["B6"] = { v: itineraireCode || "", t: "s" };

        ws["B10"] = { v: tht, t: "n" };
        ws["B11"] = { v: tax, t: "n" };
        ws["B12"] = { v: serviceFee, t: "n" };
        ws["B13"] = { v: commission, t: "n" };
        ws["B14"] = { v: operation.total_amount ?? 0, t: "n" };

        const file = XLSX.write(wb, { type: "array", bookType: "xlsx" });
        saveAs(new Blob([file]), `Facture_${operation.receipt_reference}.xlsx`);
    }
}

export const invoiceService = new InvoiceService();
