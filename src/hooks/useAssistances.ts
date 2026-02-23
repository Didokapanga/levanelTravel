import { useEffect, useState } from "react";
import { otherOperationService } from "../services/OtherOperationService";

import type { OrtherOperations } from "../types/orther_operations";

export function useAssistances() {

    const [assistances, setAssistances] = useState<OrtherOperations[]>([]);

    const loadAssistances = async () => {
        const data = await otherOperationService.getAllWithDetails();
        setAssistances(data);
    };

    const createOrUpdate = async (
        data: Partial<OrtherOperations>,
        editing?: OrtherOperations | null
    ) => {
        if (editing) {
            await otherOperationService.update(editing.id, data);
        } else {
            await otherOperationService.create(data);
        }
        await loadAssistances();
    };

    const remove = async (id: string) => {
        await otherOperationService.delete(id);
        await loadAssistances();
    };

    useEffect(() => {
        loadAssistances();
    }, []);

    return {
        assistances,
        loadAssistances,
        createOrUpdate,
        remove
    };
}