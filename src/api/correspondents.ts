import apiClient from './client';
import { Correspondent, PaginatedResponse } from '@/types';

export const correspondentsApi = {
  getCorrespondents: async (params?: {
    page?: number;
    page_size?: number;
  }): Promise<PaginatedResponse<Correspondent>> => {
    const response = await apiClient.get<PaginatedResponse<Correspondent>>('/api/correspondents/', {
      params,
    });
    return response.data;
  },

  getAllCorrespondents: async (): Promise<Correspondent[]> => {
    const results: Correspondent[] = [];
    let page = 1;
    let hasMore = true;

    while (hasMore) {
      const response = await correspondentsApi.getCorrespondents({ page, page_size: 100 });
      results.push(...response.results);
      hasMore = response.next !== null;
      page++;
    }

    return results;
  },

  getCorrespondent: async (id: number): Promise<Correspondent> => {
    const response = await apiClient.get<Correspondent>(`/api/correspondents/${id}/`);
    return response.data;
  },

  createCorrespondent: async (data: Partial<Correspondent>): Promise<Correspondent> => {
    const response = await apiClient.post<Correspondent>('/api/correspondents/', data);
    return response.data;
  },

  updateCorrespondent: async (id: number, data: Partial<Correspondent>): Promise<Correspondent> => {
    const response = await apiClient.patch<Correspondent>(`/api/correspondents/${id}/`, data);
    return response.data;
  },

  deleteCorrespondent: async (id: number): Promise<void> => {
    await apiClient.delete(`/api/correspondents/${id}/`);
  },
};
