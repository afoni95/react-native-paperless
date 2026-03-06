import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { tasksApi } from '@/api';
import { TaskStatus } from '@/types';
import { MutationHookOptions, QueryHookOptions } from '@/utils/reactQueryCommon';

import { taskQueryKeys } from './queryKeys';

export const useAllTasks = (
  isEnabled = true,
  options?: QueryHookOptions<TaskStatus[], typeof taskQueryKeys.all>,
) => {
  return useQuery({
    ...options,
    queryKey: taskQueryKeys.all,
    enabled: isEnabled,
    queryFn: () => tasksApi.getAllTasks(),
  });
};

export const useTaskByTaskId = (
  taskId: string,
  isEnabled = true,
  options?: QueryHookOptions<TaskStatus[], ReturnType<typeof taskQueryKeys.byTaskId>>,
) => {
  return useQuery({
    ...options,
    queryKey: taskQueryKeys.byTaskId(taskId),
    enabled: isEnabled && taskId.trim().length > 0,
    queryFn: () => tasksApi.getTask(taskId),
  });
};

export const useAcknowledgeTasks = (options?: MutationHookOptions<void, number[]>) => {
  const client = useQueryClient();

  return useMutation({
    ...options,
    mutationFn: (taskIds) => tasksApi.acknowledgeTasks(taskIds),
    onSuccess: (_, taskIds, onMutateResult, context) => {
      client.invalidateQueries({ queryKey: taskQueryKeys.all });
      taskIds.forEach((taskId) => {
        client.removeQueries({ queryKey: taskQueryKeys.byTaskId(String(taskId)) });
      });
      options?.onSuccess?.(_, taskIds, onMutateResult, context);
    },
  });
};
