import apiClient from './client';
import type { User, UserPayload } from '@/types';
import type { PaginatedResponse } from '@/types';

export const usersApi = {
  async list(params?: { page?: number; page_size?: number }): Promise<PaginatedResponse<User>> {
    const { data } = await apiClient.get('/api/users/', { params });
    return data;
  },
  async retrieve(id: number): Promise<User> {
    const { data } = await apiClient.get(`/api/users/${id}/`);
    return data;
  },
  async create(payload: UserPayload): Promise<User> {
    const { data } = await apiClient.post('/api/users/', payload);
    return data;
  },
  async update(id: number, payload: Partial<UserPayload>): Promise<User> {
    const { data } = await apiClient.patch(`/api/users/${id}/`, payload);
    return data;
  },
  async remove(id: number): Promise<void> {
    await apiClient.delete(`/api/users/${id}/`);
  },
};
