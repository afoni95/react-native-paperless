import apiClient from './client';
import { StoragePath, PaginatedResponse } from '@/types';

export const storagePathsApi = {
  getStoragePaths: async (params?: {
    page?: number;
    page_size?: number;
  }): Promise<PaginatedResponse<StoragePath>> => {
    const { data } = await apiClient.get<PaginatedResponse<StoragePath>>('/api/storage_paths/', {
      params,
    });
    return data;
  },

  getAllStoragePaths: async (): Promise<StoragePath[]> => {
    const storagePathsList: StoragePath[] = [];
    let page = 1;
    let hasMore = true;

    while (hasMore) {
      const { results, next } = await storagePathsApi.getStoragePaths({ page, page_size: 100 });
      storagePathsList.push(...results);
      hasMore = Boolean(next);
      page += 1;
    }

    return storagePathsList;
  },

  getStoragePath: async (id: number): Promise<StoragePath> => {
    const { data } = await apiClient.get<StoragePath>(`/api/storage_paths/${id}/`);
    return data;
  },

  createStoragePath: async (data: Partial<StoragePath>): Promise<StoragePath> => {
    const { data: created } = await apiClient.post<StoragePath>('/api/storage_paths/', data);
    return created;
  },

  updateStoragePath: async (id: number, data: Partial<StoragePath>): Promise<StoragePath> => {
    const { data: updated } = await apiClient.patch<StoragePath>(`/api/storage_paths/${id}/`, data);
    return updated;
  },

  deleteStoragePath: async (id: number): Promise<void> => {
    await apiClient.delete(`/api/storage_paths/${id}/`);
  },
};
