import apiClient from './client';
import { StoragePath, PaginatedResponse } from '@/types';

export const storagePathsApi = {
  getStoragePaths: async (params?: {
    page?: number;
    page_size?: number;
  }): Promise<PaginatedResponse<StoragePath>> => {
    const response = await apiClient.get<PaginatedResponse<StoragePath>>('/api/storage_paths/', {
      params,
    });
    return response.data;
  },

  getAllStoragePaths: async (): Promise<StoragePath[]> => {
    const storagePathsList: StoragePath[] = [];
    let page = 1;

    while (true) {
      const resp = await storagePathsApi.getStoragePaths({ page, page_size: 100 });
      storagePathsList.push(...resp.results);
      if (!resp.next) break;
      page++;
    }

    return storagePathsList;
  },

  getStoragePath: async (id: number): Promise<StoragePath> => {
    const response = await apiClient.get<StoragePath>(`/api/storage_paths/${id}/`);
    return response.data;
  },

  createStoragePath: async (data: Partial<StoragePath>): Promise<StoragePath> => {
    const response = await apiClient.post<StoragePath>('/api/storage_paths/', data);
    return response.data;
  },

  updateStoragePath: async (id: number, data: Partial<StoragePath>): Promise<StoragePath> => {
    const response = await apiClient.patch<StoragePath>(`/api/storage_paths/${id}/`, data);
    return response.data;
  },

  deleteStoragePath: async (id: number): Promise<void> => {
    await apiClient.delete(`/api/storage_paths/${id}/`);
  },
};
