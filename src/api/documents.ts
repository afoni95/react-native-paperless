import apiClient from './client';
import {
  Document,
  DocumentUpdatePayload,
  DocumentListParams,
  DocumentNote,
  DocumentUploadParams,
  GlobalSearchResult,
  PaginatedResponse,
} from '@/types';

export const documentsApi = {
  getDocuments: async (params?: DocumentListParams): Promise<PaginatedResponse<Document>> => {
    const queryParams: Record<string, string | number | boolean> = {};

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          if (Array.isArray(value)) {
            queryParams[key] = value.join(',');
          } else {
            queryParams[key] = value;
          }
        }
      });
    }

    const response = await apiClient.get<PaginatedResponse<Document>>('/api/documents/', {
      params: queryParams,
    });
    return response.data;
  },

  getDocument: async (id: number): Promise<Document> => {
    const response = await apiClient.get<Document>(`/api/documents/${id}/`);
    return response.data;
  },

  updateDocument: async (id: number, data: Partial<DocumentUpdatePayload>): Promise<Document> => {
    const response = await apiClient.patch<Document>(`/api/documents/${id}/`, data);
    return response.data;
  },

  deleteDocument: async (id: number): Promise<void> => {
    await apiClient.delete(`/api/documents/${id}/`);
  },

  getDocumentPreviewUrl: (id: number): string => {
    return `/api/documents/${id}/preview/`;
  },

  getDocumentDownloadUrl: (id: number): string => {
    return `/api/documents/${id}/download/`;
  },

  getDocumentThumbUrl: (id: number): string => {
    return `/api/documents/${id}/thumb/`;
  },

  getDocumentMetadata: async (id: number) => {
    const response = await apiClient.get(`/api/documents/${id}/metadata/`);
    return response.data;
  },

  getDocumentSuggestions: async (id: number) => {
    const response = await apiClient.get(`/api/documents/${id}/suggestions/`);
    return response.data;
  },

  getNotes: async (id: number): Promise<DocumentNote[]> => {
    const response = await apiClient.get<DocumentNote[]>(`/api/documents/${id}/notes/`);
    return response.data;
  },

  addNote: async (id: number, note: string): Promise<DocumentNote> => {
    const response = await apiClient.post<DocumentNote>(`/api/documents/${id}/notes/`, { note });
    return response.data;
  },

  deleteNote: async (documentId: number, noteId: number): Promise<void> => {
    await apiClient.delete(`/api/documents/${documentId}/notes/`, {
      data: { note: noteId },
    });
  },

  uploadDocument: async (params: DocumentUploadParams): Promise<string> => {
    const formData = new FormData();

    formData.append('document', {
      uri: params.document.uri,
      name: params.document.name,
      type: params.document.type,
    } as unknown as Blob);

    if (params.title) formData.append('title', params.title);
    if (params.correspondent) formData.append('correspondent', String(params.correspondent));
    if (params.document_type) formData.append('document_type', String(params.document_type));
    if (params.storage_path) formData.append('storage_path', String(params.storage_path));
    if (params.tags) {
      params.tags.forEach((tag) => formData.append('tags', String(tag)));
    }
    if (params.custom_fields) {
      params.custom_fields.forEach((field) => {
        if (Array.isArray(field.value)) {
          field.value.forEach((v) => {
            formData.append(`custom_fields[${field.field}]`, String(v));
          });
        } else {
          formData.append(`custom_fields[${field.field}]`, String(field.value ?? ''));
        }
      });
    }

    const response = await apiClient.post('/api/documents/post_document/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  getNextAsn: async (): Promise<number> => {
    const response = await apiClient.get<number>('/api/documents/next_asn/');
    return response.data;
  },

  searchAutocomplete: async (term: string, limit = 10): Promise<string[]> => {
    const response = await apiClient.get('/api/search/autocomplete/', {
      params: { term, limit },
    });
    return response.data;
  },

  globalSearch: async (query: string): Promise<GlobalSearchResult> => {
    const response = await apiClient.get<GlobalSearchResult>('/api/search/', {
      params: { query },
    });
    return response.data;
  },

  getTrash: async (): Promise<PaginatedResponse<Document>> => {
    const response = await apiClient.get<PaginatedResponse<Document>>('/api/trash/', {
      params: { page_size: 100 },
    });
    return response.data;
  },

  restoreDocuments: async (documentIds: number[]): Promise<void> => {
    await apiClient.post('/api/trash/', {
      action: 'restore',
      documents: documentIds,
    });
  },

  emptyTrash: async (documentIds?: number[]): Promise<void> => {
    const payload: { action: string; documents?: number[] } = { action: 'empty' };
    if (documentIds) payload.documents = documentIds;
    await apiClient.post('/api/trash/', payload);
  },

  reprocessDocument: async (id: number): Promise<void> => {
    await apiClient.post(`/api/documents/${id}/reprocess/`);
  },
};
