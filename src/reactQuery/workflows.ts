import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { workflowsApi } from '@/api';
import { Workflow, WorkflowCreatePayload, WorkflowUpdatePayload } from '@/types/workflows';
import { MutationHookOptions, QueryHookOptions } from '@/utils/reactQueryCommon';

import { workflowQueryKeys } from './queryKeys';

type UpsertWorkflowInput = (WorkflowCreatePayload | WorkflowUpdatePayload) & { id?: number };

export const useAllWorkflows = (
  isEnabled = true,
  options?: QueryHookOptions<Workflow[], typeof workflowQueryKeys.all>,
) => {
  return useQuery({
    ...options,
    queryKey: workflowQueryKeys.all,
    enabled: isEnabled,
    queryFn: () => workflowsApi.getAllWorkflows(),
  });
};

export const useWorkflow = (
  id: number,
  isEnabled = true,
  options?: QueryHookOptions<Workflow, ReturnType<typeof workflowQueryKeys.detail>>,
) => {
  return useQuery({
    ...options,
    queryKey: workflowQueryKeys.detail(id),
    enabled: isEnabled,
    queryFn: () => workflowsApi.getWorkflow(id),
  });
};

export const useUpsertWorkflow = (options?: MutationHookOptions<Workflow, UpsertWorkflowInput>) => {
  const client = useQueryClient();

  return useMutation({
    ...options,
    mutationFn: (input) => {
      if (input.id) {
        const { id, ...data } = input;
        return workflowsApi.updateWorkflow(id, data as WorkflowUpdatePayload);
      }
      return workflowsApi.createWorkflow(input as WorkflowCreatePayload);
    },
    onSuccess: (workflow, variables, onMutateResult, context) => {
      client.invalidateQueries({ queryKey: workflowQueryKeys.all });
      client.setQueryData(workflowQueryKeys.detail(workflow.id), workflow);
      options?.onSuccess?.(workflow, variables, onMutateResult, context);
    },
  });
};

export const useDeleteWorkflow = (options?: MutationHookOptions<void, number>) => {
  const client = useQueryClient();

  return useMutation({
    ...options,
    mutationFn: (id) => workflowsApi.deleteWorkflow(id),
    onSuccess: (_, id, onMutateResult, context) => {
      client.invalidateQueries({ queryKey: workflowQueryKeys.all });
      client.removeQueries({ queryKey: workflowQueryKeys.detail(id) });
      options?.onSuccess?.(_, id, onMutateResult, context);
    },
  });
};
