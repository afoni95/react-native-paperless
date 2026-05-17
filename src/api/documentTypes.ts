import apiClient from './client';
import { DocumentType, PaginatedResponse } from '@/types';

export const documentTypesApi = {
  getDocumentTypes: async (params?: {
    page?: number;
    page_size?: number;
  }): Promise<PaginatedResponse<DocumentType>> => {
    const { data } = await apiClient.get<PaginatedResponse<DocumentType>>('/api/document_types/', {
      params,
    });
    return data;
  },

  getAllDocumentTypes: async (): Promise<DocumentType[]> => {
    const results: DocumentType[] = [];
    let nextPage = 1;
    let hasMore = true;

    while (hasMore) {
      const { results: pageResults, next } = await documentTypesApi.getDocumentTypes({
        page: nextPage,
        page_size: 100,
      });
      results.push(...pageResults);
      hasMore = next !== null;
      nextPage += 1;
    }

    return results;
  },

  getDocumentType: async (id: number): Promise<DocumentType> => {
    const { data } = await apiClient.get<DocumentType>(`/api/document_types/${id}/`);
    return data;
  },

  createDocumentType: async (data: Partial<DocumentType>): Promise<DocumentType> => {
    const { data: created } = await apiClient.post<DocumentType>('/api/document_types/', data);
    return created;
  },

  updateDocumentType: async (id: number, data: Partial<DocumentType>): Promise<DocumentType> => {
    const { data: updated } = await apiClient.patch<DocumentType>(
      `/api/document_types/${id}/`,
      data,
    );
    return updated;
  },

  deleteDocumentType: async (id: number): Promise<void> => {
    await apiClient.delete(`/api/document_types/${id}/`);
  },
};
