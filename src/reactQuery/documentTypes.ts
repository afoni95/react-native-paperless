import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { documentTypesApi } from '@/api';
import { DocumentType } from '@/types';
import { MutationHookOptions, QueryHookOptions } from '@/utils/reactQueryCommon';
import { NetworkStatus, useNetworkStore } from '@/store/networkStore';

import { documentTypeQueryKeys } from './queryKeys';

type UpsertDocumentTypeInput = Partial<DocumentType> & { id?: number };

export const useAllDocumentTypes = (
  isEnabled = true,
  options?: QueryHookOptions<DocumentType[], typeof documentTypeQueryKeys.all>,
) => {
  const { status: networkStatus } = useNetworkStore();
  return useQuery({
    ...options,
    queryKey: documentTypeQueryKeys.all,
    enabled: isEnabled && networkStatus === NetworkStatus.Online,
    queryFn: () => documentTypesApi.getAllDocumentTypes(),
  });
};

export const useDocumentType = (
  id: number,
  isEnabled = true,
  options?: QueryHookOptions<DocumentType, ReturnType<typeof documentTypeQueryKeys.detail>>,
) => {
  const { status: networkStatus } = useNetworkStore();
  return useQuery({
    ...options,
    queryKey: documentTypeQueryKeys.detail(id),
    enabled: isEnabled && networkStatus === NetworkStatus.Online,
    queryFn: () => documentTypesApi.getDocumentType(id),
  });
};

export const useUpsertDocumentType = (
  options?: MutationHookOptions<DocumentType, UpsertDocumentTypeInput>,
) => {
  const client = useQueryClient();

  return useMutation({
    ...options,
    mutationFn: (documentType) => {
      if (documentType.id)
        return documentTypesApi.updateDocumentType(documentType.id, documentType);
      return documentTypesApi.createDocumentType(documentType);
    },
    onSuccess: (documentType, variables, onMutateResult, context) => {
      client.invalidateQueries({ queryKey: documentTypeQueryKeys.all });
      client.setQueryData(documentTypeQueryKeys.detail(documentType.id), documentType);
      options?.onSuccess?.(documentType, variables, onMutateResult, context);
    },
  });
};

export const useDeleteDocumentType = (options?: MutationHookOptions<void, number>) => {
  const client = useQueryClient();

  return useMutation({
    ...options,
    mutationFn: (id) => documentTypesApi.deleteDocumentType(id),
    onSuccess: (_, id, onMutateResult, context) => {
      client.invalidateQueries({ queryKey: documentTypeQueryKeys.all });
      client.removeQueries({ queryKey: documentTypeQueryKeys.detail(id) });
      options?.onSuccess?.(_, id, onMutateResult, context);
    },
  });
};
