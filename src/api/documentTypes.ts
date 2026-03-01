import apiClient from './client';
import { DocumentType, PaginatedResponse } from '@/types';

export const documentTypesApi = {
  getDocumentTypes: async (params?: {
    page?: number;
    page_size?: number;
  }): Promise<PaginatedResponse<DocumentType>> => {
    const response = await apiClient.get<PaginatedResponse<DocumentType>>('/api/document_types/', {
      params,
    });
    return response.data;
  },

  getAllDocumentTypes: async (): Promise<DocumentType[]> => {
    const results: DocumentType[] = [];
    let nextPage = 1;
    let hasMore = true;

    while (hasMore) {
      const response = await documentTypesApi.getDocumentTypes({ page: nextPage, page_size: 100 });
      results.push(...response.results);
      hasMore = response.next !== null;
      nextPage++;
    }

    return results;
  },

  getDocumentType: async (id: number): Promise<DocumentType> => {
    const response = await apiClient.get<DocumentType>(`/api/document_types/${id}/`);
    return response.data;
  },

  createDocumentType: async (data: Partial<DocumentType>): Promise<DocumentType> => {
    const response = await apiClient.post<DocumentType>('/api/document_types/', data);
    return response.data;
  },

  updateDocumentType: async (id: number, data: Partial<DocumentType>): Promise<DocumentType> => {
    const response = await apiClient.patch<DocumentType>(`/api/document_types/${id}/`, data);
    return response.data;
  },

  deleteDocumentType: async (id: number): Promise<void> => {
    await apiClient.delete(`/api/document_types/${id}/`);
  },
};
