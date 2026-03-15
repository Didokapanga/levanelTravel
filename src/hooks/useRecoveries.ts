// src/hooks/useRecoveries.ts
import { useEffect, useState } from "react";
import { recoveryService } from "../services/RecoveryService";

import type { RecoveryWithDetails, Recovery } from "../types/recovery";

export function useRecoveries() {

    const [recoveries, setRecoveries] = useState<RecoveryWithDetails[]>([]);

    const loadRecoveries = async () => {
        const data = await recoveryService.getAllWithDetails();
        setRecoveries(data);
    };

    const createOrUpdate = async (
        data: Partial<Recovery>,
        editing?: RecoveryWithDetails | null
    ) => {

        if (editing) {
            await recoveryService.update(editing.id, data);
        } else {
            // si tu utilises la logique métier qui met aussi à jour l'opération
            await recoveryService.createRecovery(data as Recovery);
            // sinon : await recoveryService.create(data);
        }

        await loadRecoveries();
    };

    const remove = async (id: string) => {
        await recoveryService.delete(id);
        await loadRecoveries();
    };

    useEffect(() => {
        loadRecoveries();
    }, []);

    return {
        recoveries,
        loadRecoveries,
        createOrUpdate,
        remove
    };
}