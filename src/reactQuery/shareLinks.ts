import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { shareLinksApi } from '@/api';
import { ShareLink, ShareLinkCreatePayload } from '@/types';
import { MutationHookOptions, QueryHookOptions } from '@/utils/reactQueryCommon';
import { NetworkStatus, useNetworkStore } from '@/store/networkStore';

import { shareLinkQueryKeys } from './queryKeys';

export const useAllShareLinks = (
  isEnabled = true,
  options?: QueryHookOptions<ShareLink[], typeof shareLinkQueryKeys.all>,
) => {
  const { status: networkStatus } = useNetworkStore();
  return useQuery({
    ...options,
    queryKey: shareLinkQueryKeys.all,
    enabled: isEnabled && networkStatus === NetworkStatus.Online,
    queryFn: () => shareLinksApi.getAllShareLinks(),
  });
};

export const useCreateShareLink = (
  options?: MutationHookOptions<ShareLink, ShareLinkCreatePayload>,
) => {
  const client = useQueryClient();

  return useMutation({
    ...options,
    mutationFn: (data) => shareLinksApi.createShareLink(data),
    onSuccess: (shareLink, variables, onMutateResult, context) => {
      client.invalidateQueries({ queryKey: shareLinkQueryKeys.all });
      options?.onSuccess?.(shareLink, variables, onMutateResult, context);
    },
  });
};

export const useDeleteShareLink = (options?: MutationHookOptions<void, number>) => {
  const client = useQueryClient();

  return useMutation({
    ...options,
    mutationFn: (id) => shareLinksApi.deleteShareLink(id),
    onSuccess: (_, id, onMutateResult, context) => {
      client.invalidateQueries({ queryKey: shareLinkQueryKeys.all });
      options?.onSuccess?.(_, id, onMutateResult, context);
    },
  });
};
