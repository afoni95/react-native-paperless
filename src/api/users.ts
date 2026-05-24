import apiClient from './client';
import type { User, UserPayload } from '@/types';
import type { PaginatedResponse } from '@/types';

export const usersApi = {
  list: async (params?: {
    page?: number;
    page_size?: number;
  }): Promise<PaginatedResponse<User>> => {
    const { data } = await apiClient.get('/api/users/', { params });
    return data;
  },
  retrieve: async (id: number): Promise<User> => {
    const { data } = await apiClient.get(`/api/users/${id}/`);
    return data;
  },
  create: async (payload: UserPayload): Promise<User> => {
    const { data } = await apiClient.post('/api/users/', payload);
    return data;
  },
  update: async (id: number, payload: Partial<UserPayload>): Promise<User> => {
    const { data } = await apiClient.patch(`/api/users/${id}/`, payload);
    return data;
  },
  remove: async (id: number): Promise<void> => {
    await apiClient.delete(`/api/users/${id}/`);
  },
};
