import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { tasksApi } from '@/api';
import { TaskStatus } from '@/types';
import { MutationHookOptions, QueryHookOptions } from '@/utils/reactQueryCommon';
import { NetworkStatus, useNetworkStore } from '@/store/networkStore';

import { taskQueryKeys } from './queryKeys';

export const useAllTasks = (
  isEnabled = true,
  options?: QueryHookOptions<TaskStatus[], typeof taskQueryKeys.all>,
) => {
  const { status: networkStatus } = useNetworkStore();
  return useQuery({
    ...options,
    queryKey: taskQueryKeys.all,
    enabled: isEnabled && networkStatus === NetworkStatus.Online,
    queryFn: () => tasksApi.getAllTasks(),
  });
};

export const useTaskByTaskId = (
  taskId: string,
  isEnabled = true,
  options?: QueryHookOptions<TaskStatus[], ReturnType<typeof taskQueryKeys.byTaskId>>,
) => {
  const { status: networkStatus } = useNetworkStore();
  return useQuery({
    ...options,
    queryKey: taskQueryKeys.byTaskId(taskId),
    enabled: isEnabled && networkStatus === NetworkStatus.Online && taskId.trim().length > 0,
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
