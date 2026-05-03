import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { documentsApi } from '@/api';
import {
  Document,
  DocumentUpdatePayload,
  DocumentListParams,
  DocumentNote,
  DocumentUploadParams,
  GlobalSearchResult,
  PaginatedResponse,
} from '@/types';
import { InfiniteData } from '@tanstack/react-query';
import { MutationHookOptions, QueryHookOptions } from '@/utils/reactQueryCommon';
import { NetworkStatus, useNetworkStore } from '@/store/networkStore';

import { documentQueryKeys } from './queryKeys';

type UpdateDocumentInput = {
  id: number;
  data: Partial<DocumentUpdatePayload>;
};

type DeleteDocumentNoteInput = {
  documentId: number;
  noteId: number;
};

export const useInfiniteDocuments = (
  params?: Omit<DocumentListParams, 'page'>,
  isEnabled = true,
) => {
  const { status: networkStatus } = useNetworkStore();
  return useInfiniteQuery<
    PaginatedResponse<Document>,
    Error,
    InfiniteData<PaginatedResponse<Document>>,
    ReturnType<typeof documentQueryKeys.all>,
    number
  >({
    queryKey: documentQueryKeys.all(params),
    enabled: isEnabled && networkStatus === NetworkStatus.Online,
    queryFn: ({ pageParam = 1 }) => documentsApi.getDocuments({ ...params, page: pageParam }),
    getNextPageParam: (lastPage, allPages) => (lastPage.next ? allPages.length + 1 : undefined),
    initialPageParam: 1,
  });
};

export const useDocuments = (
  params?: DocumentListParams,
  isEnabled = true,
  options?: QueryHookOptions<PaginatedResponse<Document>, ReturnType<typeof documentQueryKeys.all>>,
) => {
  const { status: networkStatus } = useNetworkStore();
  return useQuery({
    ...options,
    queryKey: documentQueryKeys.all(params),
    enabled: isEnabled && networkStatus === NetworkStatus.Online,
    queryFn: () => documentsApi.getDocuments(params),
  });
};

export const useDocument = (
  id: number,
  isEnabled = true,
  options?: QueryHookOptions<Document, ReturnType<typeof documentQueryKeys.detail>>,
) => {
  const { status: networkStatus } = useNetworkStore();
  return useQuery({
    ...options,
    queryKey: documentQueryKeys.detail(id),
    enabled: isEnabled && networkStatus === NetworkStatus.Online,
    queryFn: () => documentsApi.getDocument(id),
  });
};

export const useLinkedDocuments = (
  ids: number[],
  isEnabled = true,
  options?: QueryHookOptions<PaginatedResponse<Document>, ReturnType<typeof documentQueryKeys.all>>,
) => {
  const { status: networkStatus } = useNetworkStore();
  return useQuery({
    ...options,
    queryKey: documentQueryKeys.all({ id__in: ids }),
    enabled: isEnabled && networkStatus === NetworkStatus.Online && ids.length > 0,
    queryFn: () => documentsApi.getDocuments({ id__in: ids, page_size: ids.length }),
  });
};

export const useDocumentNotes = (
  documentId: number,
  isEnabled = true,
  options?: QueryHookOptions<DocumentNote[], ReturnType<typeof documentQueryKeys.notes>>,
) => {
  const { status: networkStatus } = useNetworkStore();
  return useQuery({
    ...options,
    queryKey: documentQueryKeys.notes(documentId),
    enabled: isEnabled && networkStatus === NetworkStatus.Online,
    queryFn: () => documentsApi.getNotes(documentId),
  });
};

export const useTrashDocuments = (
  isEnabled = true,
  options?: QueryHookOptions<PaginatedResponse<Document>, typeof documentQueryKeys.trash>,
) => {
  const { status: networkStatus } = useNetworkStore();
  return useQuery({
    ...options,
    queryKey: documentQueryKeys.trash,
    enabled: isEnabled && networkStatus === NetworkStatus.Online,
    queryFn: () => documentsApi.getTrash(),
  });
};

export const useGlobalSearch = (
  query: string,
  isEnabled = true,
  options?: QueryHookOptions<GlobalSearchResult, ReturnType<typeof documentQueryKeys.globalSearch>>,
) => {
  const { status: networkStatus } = useNetworkStore();
  return useQuery({
    ...options,
    queryKey: documentQueryKeys.globalSearch(query),
    enabled: isEnabled && networkStatus === NetworkStatus.Online && query.trim().length > 0,
    queryFn: () => documentsApi.globalSearch(query),
  });
};

export const useSearchAutocomplete = (
  term: string,
  limit = 10,
  isEnabled = true,
  options?: QueryHookOptions<string[], ReturnType<typeof documentQueryKeys.autocomplete>>,
) => {
  const { status: networkStatus } = useNetworkStore();
  return useQuery({
    ...options,
    queryKey: documentQueryKeys.autocomplete(term, limit),
    enabled: isEnabled && networkStatus === NetworkStatus.Online && term.trim().length > 0,
    queryFn: () => documentsApi.searchAutocomplete(term, limit),
  });
};

export const useUpdateDocument = (options?: MutationHookOptions<Document, UpdateDocumentInput>) => {
  const client = useQueryClient();

  return useMutation({
    ...options,
    mutationFn: ({ id, data }) => documentsApi.updateDocument(id, data),
    onSuccess: (document, variables, onMutateResult, context) => {
      client.setQueryData(documentQueryKeys.detail(document.id), document);
      client.invalidateQueries({ queryKey: documentQueryKeys.all() });
      options?.onSuccess?.(document, variables, onMutateResult, context);
    },
  });
};

export const useDeleteDocument = (options?: MutationHookOptions<void, number>) => {
  const client = useQueryClient();

  return useMutation({
    ...options,
    mutationFn: (id) => documentsApi.deleteDocument(id),
    onSuccess: (_, id, onMutateResult, context) => {
      client.removeQueries({ queryKey: documentQueryKeys.detail(id) });
      client.invalidateQueries({ queryKey: documentQueryKeys.all() });
      options?.onSuccess?.(_, id, onMutateResult, context);
    },
  });
};

export const useUploadDocument = (options?: MutationHookOptions<string, DocumentUploadParams>) => {
  const client = useQueryClient();

  return useMutation({
    ...options,
    mutationFn: (params) => documentsApi.uploadDocument(params),
    onSuccess: (result, variables, onMutateResult, context) => {
      client.invalidateQueries({ queryKey: documentQueryKeys.all() });
      client.invalidateQueries({ queryKey: ['tasks-all'] });
      options?.onSuccess?.(result, variables, onMutateResult, context);
    },
  });
};

export const useAddDocumentNote = (
  documentId: number,
  options?: MutationHookOptions<DocumentNote, string>,
) => {
  const client = useQueryClient();

  return useMutation({
    ...options,
    mutationFn: (note) => documentsApi.addNote(documentId, note),
    onSuccess: (note, variables, onMutateResult, context) => {
      client.invalidateQueries({ queryKey: documentQueryKeys.notes(documentId) });
      client.invalidateQueries({ queryKey: documentQueryKeys.detail(documentId) });
      options?.onSuccess?.(note, variables, onMutateResult, context);
    },
  });
};

export const useDeleteDocumentNote = (
  options?: MutationHookOptions<void, DeleteDocumentNoteInput>,
) => {
  const client = useQueryClient();

  return useMutation({
    ...options,
    mutationFn: ({ documentId, noteId }) => documentsApi.deleteNote(documentId, noteId),
    onSuccess: (_, variables, onMutateResult, context) => {
      client.invalidateQueries({ queryKey: documentQueryKeys.notes(variables.documentId) });
      client.invalidateQueries({ queryKey: documentQueryKeys.detail(variables.documentId) });
      options?.onSuccess?.(_, variables, onMutateResult, context);
    },
  });
};

export const useRestoreDocuments = (options?: MutationHookOptions<void, number[]>) => {
  const client = useQueryClient();

  return useMutation({
    ...options,
    mutationFn: (documentIds) => documentsApi.restoreDocuments(documentIds),
    onSuccess: (_, variables, onMutateResult, context) => {
      client.invalidateQueries({ queryKey: documentQueryKeys.trash });
      client.invalidateQueries({ queryKey: documentQueryKeys.all() });
      options?.onSuccess?.(_, variables, onMutateResult, context);
    },
  });
};

export const useEmptyTrash = (options?: MutationHookOptions<void, number[] | undefined>) => {
  const client = useQueryClient();

  return useMutation({
    ...options,
    mutationFn: (documentIds) => documentsApi.emptyTrash(documentIds),
    onSuccess: (_, variables, onMutateResult, context) => {
      client.invalidateQueries({ queryKey: documentQueryKeys.trash });
      client.invalidateQueries({ queryKey: documentQueryKeys.all() });
      options?.onSuccess?.(_, variables, onMutateResult, context);
    },
  });
};

export const useReprocessDocument = (options?: MutationHookOptions<void, number>) => {
  const client = useQueryClient();

  return useMutation({
    ...options,
    mutationFn: (id) => documentsApi.reprocessDocument(id),
    onSuccess: (_, id, onMutateResult, context) => {
      client.invalidateQueries({ queryKey: documentQueryKeys.detail(id) });
      client.invalidateQueries({ queryKey: ['tasks-all'] });
      options?.onSuccess?.(_, id, onMutateResult, context);
    },
  });
};
