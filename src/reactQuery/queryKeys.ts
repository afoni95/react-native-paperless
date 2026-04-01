import { DocumentListParams } from '@/types';

export const tagQueryKeys = {
  all: ['tags-all'] as const,
  detail: (id: number) => ['tag', id] as const,
};

export const correspondentQueryKeys = {
  all: ['correspondents-all'] as const,
  detail: (id: number) => ['correspondent', id] as const,
};

export const documentTypeQueryKeys = {
  all: ['document-types-all'] as const,
  detail: (id: number) => ['document-type', id] as const,
};
export const storagePathQueryKeys = {
  all: ['storage-paths-all'] as const,
  detail: (id: number) => ['storage-path', id] as const,
};
export const customFieldQueryKeys = {
  all: ['custom-fields-all'] as const,
  detail: (id: number) => ['custom-field', id] as const,
};

export const documentQueryKeys = {
  all: (params?: DocumentListParams) => ['documents', params ?? {}] as const,
  detail: (id: number) => ['document', id] as const,
  notes: (id: number) => ['document', id, 'notes'] as const,
  trash: ['trash'] as const,
  globalSearch: (query: string) => ['global-search', query] as const,
  autocomplete: (term: string, limit = 10) => ['autocomplete', term, limit] as const,
};

export const taskQueryKeys = {
  all: ['tasks-all'] as const,
  byTaskId: (taskId: string) => ['task', taskId] as const,
};

export const statisticsQueryKeys = {
  all: ['statistics'] as const,
};

export const logsQueryKeys = {
  all: ['logs-all'] as const,
  detail: (logId: string, limit?: number) => ['log', logId, limit ?? null] as const,
};

export const workflowQueryKeys = {
  all: ['workflows-all'] as const,
  detail: (id: number) => ['workflow', id] as const,
};
