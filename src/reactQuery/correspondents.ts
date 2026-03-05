import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { correspondentsApi } from '@/api';
import { Correspondent } from '@/types';
import { MutationHookOptions, QueryHookOptions } from '@/utils/reactQueryCommon';

import { correspondentQueryKeys } from './queryKeys';

type UpsertCorrespondentInput = Partial<Correspondent> & { id?: number };

export const useAllCorrespondents = (
  isEnabled = true,
  options?: QueryHookOptions<Correspondent[], typeof correspondentQueryKeys.all>,
) => {
  return useQuery({
    ...options,
    queryKey: correspondentQueryKeys.all,
    enabled: isEnabled,
    queryFn: () => correspondentsApi.getAllCorrespondents(),
  });
};

export const useCorrespondent = (
  id: number,
  isEnabled = true,
  options?: QueryHookOptions<Correspondent, ReturnType<typeof correspondentQueryKeys.detail>>,
) => {
  return useQuery({
    ...options,
    queryKey: correspondentQueryKeys.detail(id),
    enabled: isEnabled,
    queryFn: () => correspondentsApi.getCorrespondent(id),
  });
};

export const useUpsertCorrespondent = (
  options?: MutationHookOptions<Correspondent, UpsertCorrespondentInput>,
) => {
  const client = useQueryClient();

  return useMutation({
    ...options,
    mutationFn: (correspondent) => {
      if (correspondent.id)
        return correspondentsApi.updateCorrespondent(correspondent.id, correspondent);
      return correspondentsApi.createCorrespondent(correspondent);
    },
    onSuccess: (correspondent, variables, onMutateResult, context) => {
      client.invalidateQueries({ queryKey: correspondentQueryKeys.all });
      client.setQueryData(correspondentQueryKeys.detail(correspondent.id), correspondent);
      options?.onSuccess?.(correspondent, variables, onMutateResult, context);
    },
  });
};

export const useDeleteCorrespondent = (options?: MutationHookOptions<void, number>) => {
  const client = useQueryClient();

  return useMutation({
    ...options,
    mutationFn: (id) => correspondentsApi.deleteCorrespondent(id),
    onSuccess: (_, id, onMutateResult, context) => {
      client.invalidateQueries({ queryKey: correspondentQueryKeys.all });
      client.removeQueries({ queryKey: correspondentQueryKeys.detail(id) });
      options?.onSuccess?.(_, id, onMutateResult, context);
    },
  });
};
