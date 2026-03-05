import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { tagsApi } from '@/api';
import { Tag } from '@/types';
import { MutationHookOptions, QueryHookOptions } from '@/utils/reactQueryCommon';

import { tagQueryKeys } from './queryKeys';

type UpsertTagInput = Partial<Tag> & { id?: number };

export const useAllTags = (
  isEnabled = true,
  options?: QueryHookOptions<Tag[], typeof tagQueryKeys.all>,
) => {
  return useQuery({
    ...options,
    queryKey: tagQueryKeys.all,
    enabled: isEnabled,
    queryFn: () => tagsApi.getAllTags(),
  });
};

export const useTag = (
  id: number,
  isEnabled = true,
  options?: QueryHookOptions<Tag, ReturnType<typeof tagQueryKeys.detail>>,
) => {
  return useQuery({
    ...options,
    queryKey: tagQueryKeys.detail(id),
    enabled: isEnabled,
    queryFn: () => tagsApi.getTag(id),
  });
};

export const useUpsertTag = (options?: MutationHookOptions<Tag, UpsertTagInput>) => {
  const client = useQueryClient();

  return useMutation({
    ...options,
    mutationFn: (tag) => {
      if (tag.id) return tagsApi.updateTag(tag.id, tag);
      return tagsApi.createTag(tag);
    },
    onSuccess: (tag, variables, onMutateResult, context) => {
      client.invalidateQueries({ queryKey: tagQueryKeys.all });
      client.setQueryData(tagQueryKeys.detail(tag.id), tag);
      options?.onSuccess?.(tag, variables, onMutateResult, context);
    },
  });
};

export const useDeleteTag = (options?: MutationHookOptions<void, number>) => {
  const client = useQueryClient();

  return useMutation({
    ...options,
    mutationFn: (id) => tagsApi.deleteTag(id),
    onSuccess: (_, id, onMutateResult, context) => {
      client.invalidateQueries({ queryKey: tagQueryKeys.all });
      client.removeQueries({ queryKey: tagQueryKeys.detail(id) });
      options?.onSuccess?.(_, id, onMutateResult, context);
    },
  });
};
