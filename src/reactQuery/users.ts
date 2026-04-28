import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { usersApi } from '@/api';
import type { User, UserPayload, PaginatedResponse } from '@/types';
import { MutationHookOptions, QueryHookOptions } from '@/utils/reactQueryCommon';

import { userQueryKeys } from './queryKeys';

type UpsertUserInput = { id?: number; data: Partial<UserPayload> };

export const useUsers = (
  params?: { page?: number; page_size?: number },
  isEnabled = true,
  options?: QueryHookOptions<PaginatedResponse<User>, ReturnType<typeof userQueryKeys.all>>,
) => {
  return useQuery({
    ...options,
    queryKey: userQueryKeys.all(params),
    enabled: isEnabled,
    queryFn: () => usersApi.list(params),
  });
};

export const useUser = (
  id: number,
  isEnabled = true,
  options?: QueryHookOptions<User, ReturnType<typeof userQueryKeys.detail>>,
) => {
  return useQuery({
    ...options,
    queryKey: userQueryKeys.detail(id),
    enabled: isEnabled && !!id,
    queryFn: () => usersApi.retrieve(id),
  });
};

export const useUpsertUser = (options?: MutationHookOptions<User, UpsertUserInput>) => {
  const client = useQueryClient();

  return useMutation({
    ...options,
    mutationFn: (input) =>
      input.id ? usersApi.update(input.id, input.data) : usersApi.create(input.data as UserPayload),
    onSuccess: (user, variables, onMutateResult, context) => {
      client.invalidateQueries({ queryKey: userQueryKeys.all() });
      client.setQueryData(userQueryKeys.detail(user.id), user);
      options?.onSuccess?.(user, variables, onMutateResult, context);
    },
  });
};

export const useDeleteUser = (options?: MutationHookOptions<void, number>) => {
  const client = useQueryClient();

  return useMutation({
    ...options,
    mutationFn: (id) => usersApi.remove(id),
    onSuccess: (_, id, onMutateResult, context) => {
      client.invalidateQueries({ queryKey: userQueryKeys.all() });
      client.removeQueries({ queryKey: userQueryKeys.detail(id) });
      options?.onSuccess?.(_, id, onMutateResult, context);
    },
  });
};
