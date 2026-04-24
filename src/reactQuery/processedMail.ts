import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { processedMailApi } from '@/api';
import { PaginatedResponse, ProcessedMail } from '@/types';
import { MutationHookOptions, QueryHookOptions } from '@/utils/reactQueryCommon';

import { processedMailQueryKeys } from './queryKeys';

export const useProcessedMail = (
  params?: { page?: number; page_size?: number; ordering?: string },
  isEnabled = true,
  options?: QueryHookOptions<
    PaginatedResponse<ProcessedMail>,
    ReturnType<typeof processedMailQueryKeys.list>
  >,
) => {
  return useQuery({
    ...options,
    queryKey: processedMailQueryKeys.list(params),
    enabled: isEnabled,
    queryFn: () => processedMailApi.getProcessedMail(params),
  });
};

export const useDeleteProcessedMail = (
  options?: MutationHookOptions<{ result: string; deleted_mail_ids: number[] }, number[]>,
) => {
  const client = useQueryClient();

  return useMutation({
    ...options,
    mutationFn: (mailIds) => processedMailApi.deleteProcessedMail(mailIds),
    onSuccess: (data, variables, onMutateResult, context) => {
      client.invalidateQueries({ queryKey: processedMailQueryKeys.all });
      options?.onSuccess?.(data, variables, onMutateResult, context);
    },
  });
};
