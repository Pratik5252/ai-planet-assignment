import { useCallback, useEffect, useRef } from 'react';
import type { Node, Edge } from '@xyflow/react';
import { useSaveCanvas } from './useWorkFlowAPI';

interface UseWorkflowPersistenceProps {
    workflowId: number;
    nodes: Node[];
    edges: Edge[];
    enabled?: boolean;
}

export const useWorkflowPersistence = ({
    workflowId,
    nodes,
    edges,
    enabled = true,
}: UseWorkflowPersistenceProps) => {
    const { mutate: saveCanvas, isPending: isSaving } = useSaveCanvas();
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);

    // Debounced auto-save function
    const debouncedSave = useCallback(() => {
        if (!enabled) return;

        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }

        timeoutRef.current = setTimeout(() => {
            // Only skip save if this is the initial load with empty workflow
            // Allow saves when there are nodes, even if no edges yet
            if (nodes.length === 0 && edges.length === 0) {
                return;
            }

            saveCanvas({ id: workflowId, nodes, edges });
        }, 1000); // 1 second delay
    }, [workflowId, nodes, edges, enabled, saveCanvas]);

    // Auto-save when nodes or edges change
    useEffect(() => {
        debouncedSave();

        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
        };
    }, [debouncedSave, enabled, workflowId, nodes.length, edges.length]);

    // Manual save function
    const saveNow = useCallback(() => {
        if (!enabled) return;
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }
        saveCanvas({ id: workflowId, nodes, edges });
    }, [workflowId, nodes, edges, enabled, saveCanvas]);

    return {
        saveNow,
        isSaving: enabled ? isSaving : false,
    };
};
