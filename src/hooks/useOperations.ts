import { useEffect, useState } from "react";
import { operationService } from "../services/OperationService";
import { operationSegmentsService } from "../services/OperationSegmentsService";

import type { Operations, OperationWithDetails } from "../types/operations";
import type { OperationSegmentWithDetails } from "../types/operation_segments";

export function useOperations() {

    const [operations, setOperations] = useState<OperationWithDetails[]>([]);
    const [segments, setSegments] = useState<OperationSegmentWithDetails[]>([]);
    const [viewOperation, setViewOperation] = useState<OperationWithDetails | null>(null);

    const loadOperations = async () => {
        const data = await operationService.getAllWithDetails();
        setOperations(data);
    };

    const openView = async (op: OperationWithDetails) => {
        const segs = await operationSegmentsService.getEnrichedByOperation(op.id);
        setSegments(segs);
        setViewOperation(op);
    };

    const createOrUpdate = async (
        data: Partial<Operations>,
        editing?: Operations | null
    ) => {
        if (editing) {
            await operationService.update(editing.id, data);
        } else {
            await operationService.create(data);
        }
        await loadOperations();
    };

    const remove = async (id: string) => {
        await operationService.delete(id);
        await loadOperations();
    };

    useEffect(() => {
        loadOperations();
    }, []);

    return {
        operations,
        segments,
        viewOperation,
        setViewOperation,
        loadOperations,
        openView,
        createOrUpdate,
        remove
    };
}