import apiClient from './client';
import { Correspondent, PaginatedResponse } from '@/types';

export const correspondentsApi = {
  getCorrespondents: async (params?: {
    page?: number;
    page_size?: number;
  }): Promise<PaginatedResponse<Correspondent>> => {
    const { data } = await apiClient.get<PaginatedResponse<Correspondent>>('/api/correspondents/', {
      params,
    });
    return data;
  },

  getAllCorrespondents: async (): Promise<Correspondent[]> => {
    const results: Correspondent[] = [];
    let page = 1;
    let hasMore = true;

    while (hasMore) {
      const { results: pageResults, next } = await correspondentsApi.getCorrespondents({
        page,
        page_size: 100,
      });
      results.push(...pageResults);
      hasMore = next !== null;
      page++;
    }

    return results;
  },

  getCorrespondent: async (id: number): Promise<Correspondent> => {
    const { data } = await apiClient.get<Correspondent>(`/api/correspondents/${id}/`);
    return data;
  },

  createCorrespondent: async (data: Partial<Correspondent>): Promise<Correspondent> => {
    const { data: created } = await apiClient.post<Correspondent>('/api/correspondents/', data);
    return created;
  },

  updateCorrespondent: async (id: number, data: Partial<Correspondent>): Promise<Correspondent> => {
    const { data: updated } = await apiClient.patch<Correspondent>(
      `/api/correspondents/${id}/`,
      data,
    );
    return updated;
  },

  deleteCorrespondent: async (id: number): Promise<void> => {
    await apiClient.delete(`/api/correspondents/${id}/`);
  },
};
