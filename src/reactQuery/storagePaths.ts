import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { storagePathsApi } from '@/api';
import { StoragePath } from '@/types';
import { MutationHookOptions, QueryHookOptions } from '@/utils/reactQueryCommon';
import { NetworkStatus, useNetworkStore } from '@/store/networkStore';

import { storagePathQueryKeys } from './queryKeys';

type UpsertStoragePathInput = Partial<StoragePath> & { id?: number };

export const useAllStoragePaths = (
  isEnabled = true,
  options?: QueryHookOptions<StoragePath[], typeof storagePathQueryKeys.all>,
) => {
  const { status: networkStatus } = useNetworkStore();
  return useQuery({
    ...options,
    queryKey: storagePathQueryKeys.all,
    enabled: isEnabled && networkStatus === NetworkStatus.Online,
    queryFn: () => storagePathsApi.getAllStoragePaths(),
  });
};

export const useStoragePath = (
  id: number,
  isEnabled = true,
  options?: QueryHookOptions<StoragePath, ReturnType<typeof storagePathQueryKeys.detail>>,
) => {
  const { status: networkStatus } = useNetworkStore();
  return useQuery({
    ...options,
    queryKey: storagePathQueryKeys.detail(id),
    enabled: isEnabled && networkStatus === NetworkStatus.Online,
    queryFn: () => storagePathsApi.getStoragePath(id),
  });
};

export const useUpsertStoragePath = (
  options?: MutationHookOptions<StoragePath, UpsertStoragePathInput>,
) => {
  const client = useQueryClient();

  return useMutation({
    ...options,
    mutationFn: (storagePath) => {
      if (storagePath.id) return storagePathsApi.updateStoragePath(storagePath.id, storagePath);
      return storagePathsApi.createStoragePath(storagePath);
    },
    onSuccess: (storagePath, variables, onMutateResult, context) => {
      client.invalidateQueries({ queryKey: storagePathQueryKeys.all });
      client.setQueryData(storagePathQueryKeys.detail(storagePath.id), storagePath);
      options?.onSuccess?.(storagePath, variables, onMutateResult, context);
    },
  });
};

export const useDeleteStoragePath = (options?: MutationHookOptions<void, number>) => {
  const client = useQueryClient();

  return useMutation({
    ...options,
    mutationFn: (id) => storagePathsApi.deleteStoragePath(id),
    onSuccess: (_, id, onMutateResult, context) => {
      client.invalidateQueries({ queryKey: storagePathQueryKeys.all });
      client.removeQueries({ queryKey: storagePathQueryKeys.detail(id) });
      options?.onSuccess?.(_, id, onMutateResult, context);
    },
  });
};
