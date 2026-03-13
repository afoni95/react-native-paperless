import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { customFieldsApi } from '@/api';
import { CustomField } from '@/types';
import { MutationHookOptions, QueryHookOptions } from '@/utils/reactQueryCommon';

import { customFieldQueryKeys } from './queryKeys';

type UpsertCustomFieldInput = Partial<CustomField> & { id?: number };

export const useAllCustomFields = (
  isEnabled = true,
  options?: QueryHookOptions<CustomField[], typeof customFieldQueryKeys.all>,
) => {
  return useQuery({
    ...options,
    queryKey: customFieldQueryKeys.all,
    enabled: isEnabled,
    queryFn: () => customFieldsApi.getAllCustomFields(),
  });
};

export const useCustomField = (
  id?: number,
  isEnabled = true,
  options?: QueryHookOptions<CustomField, ReturnType<typeof customFieldQueryKeys.detail>>,
) => {
  return useQuery({
    ...options,
    queryKey: customFieldQueryKeys.detail(id ?? -1),
    enabled: isEnabled && id !== undefined,
    queryFn: () => customFieldsApi.getCustomField(id!),
  });
};

export const useUpsertCustomField = (
  options?: MutationHookOptions<CustomField, UpsertCustomFieldInput>,
) => {
  const client = useQueryClient();

  return useMutation({
    ...options,
    mutationFn: (customField) => {
      if (customField.id) return customFieldsApi.updateCustomField(customField.id, customField);
      return customFieldsApi.createCustomField(customField);
    },
    onSuccess: (customField, variables, onMutateResult, context) => {
      client.invalidateQueries({ queryKey: customFieldQueryKeys.all });
      client.setQueryData(customFieldQueryKeys.detail(customField.id), customField);
      options?.onSuccess?.(customField, variables, onMutateResult, context);
    },
  });
};

export const useDeleteCustomField = (options?: MutationHookOptions<void, number>) => {
  const client = useQueryClient();

  return useMutation({
    ...options,
    mutationFn: (id) => customFieldsApi.deleteCustomField(id),
    onSuccess: (_, id, onMutateResult, context) => {
      client.invalidateQueries({ queryKey: customFieldQueryKeys.all });
      client.removeQueries({ queryKey: customFieldQueryKeys.detail(id) });
      options?.onSuccess?.(_, id, onMutateResult, context);
    },
  });
};
