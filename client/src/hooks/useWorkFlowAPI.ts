import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

export interface Workflow {
    id: number;
    name: string;
    description: string;
    nodes: any[];
    edges: any[];
    is_active: boolean;
    created_at: string;
    updated_at: string;
}

export interface CreateWorkflowData {
    name: string;
    description?: string;
}

export interface UpdateWorkflowData {
    name?: string;
    description?: string;
    nodes?: any[];
    edges?: any[];
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const workflowAPI = {
    //get all workflows
    getWorkflows: async (): Promise<Workflow[]> => {
        const response = await fetch(`${API_BASE_URL}`);
        console.log(response);

        if (!response.ok) {
            throw new Error('Error fetching workflows');
        }
        return response.json();
    },

    //get workflow by id
    getWorkflowById: async (id: number): Promise<Workflow> => {
        const response = await fetch(`${API_BASE_URL}/${id}`);
        if (!response.ok) {
            if (response.status === 404) {
                throw new Error('Workflow not found');
            }
            throw new Error('Error fetching workflow');
        }
        return response.json();
    },

    //Create Workflow
    createWorkflow: async (data: CreateWorkflowData): Promise<Workflow> => {
        const response = await fetch(`${API_BASE_URL}/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Error creating workflow');
        }
        return response.json();
    },

    //Update Workflow
    updateWorkflow: async ({
        id,
        data,
    }: {
        id: number;
        data: UpdateWorkflowData;
    }): Promise<Workflow> => {
        const response = await fetch(`${API_BASE_URL}/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Error updating workflow');
        }
        return response.json();
    },

    saveCanvas: async ({
        id,
        nodes,
        edges,
    }: {
        id: number;
        nodes: any[];
        edges: any[];
    }): Promise<Workflow> => {
        const response = await fetch(`${API_BASE_URL}/${id}/save`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nodes, edges }),
        });
        if (!response.ok) {
            throw new Error('Failed to save workflow canvas');
        }
        return response.json();
    },
};

export const useWorkflows = () => {
    return useQuery({
        queryKey: ['workflows'],
        queryFn: () => workflowAPI.getWorkflows(),
        staleTime: 5 * 60 * 1000,
        gcTime: 10 * 60 * 1000,
    });
};

export const useWorkflow = (id: number) => {
    return useQuery({
        queryKey: ['workflow', id],
        queryFn: () => workflowAPI.getWorkflowById(id),
        enabled: !!id,
        staleTime: 2 * 60 * 1000,
    });
};

// Create Workflow Mutation Hook
export const useCreateWorkflow = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: workflowAPI.createWorkflow,
        onSuccess: (newWorkflow) => {
            queryClient.setQueryData(
                ['workflows', 0, 100],
                (old: Workflow[] | undefined) => {
                    return old ? [newWorkflow, ...old] : [newWorkflow];
                }
            );
            queryClient.invalidateQueries({ queryKey: ['workflows'] });
        },
    });
};

// Update Workflow Mutation Hook
export const useUpdateWorkflow = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: workflowAPI.updateWorkflow,
        onSuccess: (updatedWorkflow) => {
            queryClient.setQueryData(
                ['workflow', updatedWorkflow.id],
                updatedWorkflow
            );
            queryClient.setQueryData(
                ['workflows', 0, 100],
                (old: Workflow[] | undefined) => {
                    return old?.map((workflow) =>
                        workflow.id === updatedWorkflow.id
                            ? updatedWorkflow
                            : workflow
                    );
                }
            );
        },
    });
};

// Save Canvas Mutation Hook
export const useSaveCanvas = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: workflowAPI.saveCanvas,
        onSuccess: (updatedWorkflow) => {
            queryClient.setQueryData(
                ['workflow', updatedWorkflow.id],
                updatedWorkflow
            );
        },
        onError: (error) => {
            console.error('Auto-save failed:', error);
        },
    });
};

export const useOptimisticSaveCanvas = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: workflowAPI.saveCanvas,
        onMutate: async ({ id, nodes, edges }) => {
            await queryClient.cancelQueries({ queryKey: ['workflow', id] });

            const previousWorkflow = queryClient.getQueryData(['workflow', id]);
            queryClient.setQueryData(
                ['workflow', id],
                (old: Workflow | undefined) => {
                    return old
                        ? {
                              ...old,
                              nodes,
                              edges,
                              updated_id: new Date().toISOString(),
                          }
                        : undefined;
                }
            );
            return { previousWorkflow };
        },
        onError: (_, variables, context) => {
            if (context?.previousWorkflow) {
                queryClient.setQueryData(
                    ['workflow', variables.id],
                    context.previousWorkflow
                );
            }
        },
        onSettled: (_, __, variables) => {
            queryClient.invalidateQueries({
                queryKey: ['workflow', variables?.id],
            });
        },
    });
};
