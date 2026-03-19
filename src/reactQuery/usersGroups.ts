import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { usersApi, groupsApi } from '@/api';
import type { User, UserPayload } from '@/api/users';
import type { Group, GroupPayload } from '@/api/groups';
import type { PaginatedResponse } from '@/types';

export const userQueryKeys = {
  all: (params?: object) => ['users', params],
  detail: (id: number) => ['users', id],
};

export const groupQueryKeys = {
  all: (params?: object) => ['groups', params],
  detail: (id: number) => ['groups', id],
};

export function useUsers(params?: { page?: number; page_size?: number }) {
  return useQuery<PaginatedResponse<User>>({
    queryKey: userQueryKeys.all(params),
    queryFn: () => usersApi.list(params),
  });
}

export function useUser(id: number) {
  return useQuery<User>({
    queryKey: userQueryKeys.detail(id),
    queryFn: () => usersApi.retrieve(id),
    enabled: !!id,
    refetchOnMount: 'always',
  });
}

export function useUpsertUser() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (input: { id?: number; data: UserPayload }) =>
      input.id ? usersApi.update(input.id, input.data) : usersApi.create(input.data),
    onSuccess: (data) => {
      client.invalidateQueries({ queryKey: userQueryKeys.detail(data.id) });
      client.invalidateQueries({ queryKey: userQueryKeys.all() });
    },
  });
}

export function useDeleteUser() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => usersApi.remove(id),
    onSuccess: () => client.invalidateQueries({ queryKey: userQueryKeys.all() }),
  });
}

export function useGroups(params?: { page?: number; page_size?: number }) {
  return useQuery<PaginatedResponse<Group>>({
    queryKey: groupQueryKeys.all(params),
    queryFn: () => groupsApi.list(params),
  });
}

export function useGroup(id: number) {
  return useQuery<Group>({
    queryKey: groupQueryKeys.detail(id),
    queryFn: () => groupsApi.retrieve(id),
    enabled: !!id,
    refetchOnMount: 'always',
  });
}

export function useUpsertGroup() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (input: { id?: number; data: GroupPayload }) =>
      input.id ? groupsApi.update(input.id, input.data) : groupsApi.create(input.data),
    onSuccess: (data) => {
      client.invalidateQueries({ queryKey: groupQueryKeys.detail(data.id) });
      client.invalidateQueries({ queryKey: groupQueryKeys.all() });
    },
  });
}

export function useDeleteGroup() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => groupsApi.remove(id),
    onSuccess: () => client.invalidateQueries({ queryKey: groupQueryKeys.all() }),
  });
}
