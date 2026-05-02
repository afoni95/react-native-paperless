import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { groupsApi } from '@/api';
import type { Group, GroupPayload, PaginatedResponse } from '@/types';
import { MutationHookOptions, QueryHookOptions } from '@/utils/reactQueryCommon';
import { NetworkStatus, useNetworkStore } from '@/store/networkStore';

import { groupQueryKeys } from './queryKeys';

type UpsertGroupInput = { id?: number; data: Partial<GroupPayload> };

export const useGroups = (
  params?: { page?: number; page_size?: number },
  isEnabled = true,
  options?: QueryHookOptions<PaginatedResponse<Group>, ReturnType<typeof groupQueryKeys.all>>,
) => {
  const { status: networkStatus } = useNetworkStore();
  return useQuery({
    ...options,
    queryKey: groupQueryKeys.all(params),
    enabled: isEnabled && networkStatus === NetworkStatus.Online,
    queryFn: () => groupsApi.list(params),
  });
};

export const useGroup = (
  id: number,
  isEnabled = true,
  options?: QueryHookOptions<Group, ReturnType<typeof groupQueryKeys.detail>>,
) => {
  const { status: networkStatus } = useNetworkStore();
  return useQuery({
    ...options,
    queryKey: groupQueryKeys.detail(id),
    enabled: isEnabled && networkStatus === NetworkStatus.Online && !!id,
    queryFn: () => groupsApi.retrieve(id),
  });
};

export const useUpsertGroup = (options?: MutationHookOptions<Group, UpsertGroupInput>) => {
  const client = useQueryClient();

  return useMutation({
    ...options,
    mutationFn: (input) =>
      input.id
        ? groupsApi.update(input.id, input.data)
        : groupsApi.create(input.data as GroupPayload),
    onSuccess: (group, variables, onMutateResult, context) => {
      client.invalidateQueries({ queryKey: groupQueryKeys.all() });
      client.setQueryData(groupQueryKeys.detail(group.id), group);
      options?.onSuccess?.(group, variables, onMutateResult, context);
    },
  });
};

export const useDeleteGroup = (options?: MutationHookOptions<void, number>) => {
  const client = useQueryClient();

  return useMutation({
    ...options,
    mutationFn: (id) => groupsApi.remove(id),
    onSuccess: (_, id, onMutateResult, context) => {
      client.invalidateQueries({ queryKey: groupQueryKeys.all() });
      client.removeQueries({ queryKey: groupQueryKeys.detail(id) });
      options?.onSuccess?.(_, id, onMutateResult, context);
    },
  });
};
