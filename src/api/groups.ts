import apiClient from './client';
import type { Group, GroupPayload } from '@/types';
import type { PaginatedResponse } from '@/types';

export const groupsApi = {
  async list(params?: { page?: number; page_size?: number }): Promise<PaginatedResponse<Group>> {
    const { data } = await apiClient.get('/api/groups/', { params });
    return data;
  },
  async retrieve(id: number): Promise<Group> {
    const { data } = await apiClient.get(`/api/groups/${id}/`);
    return data;
  },
  async create(payload: GroupPayload): Promise<Group> {
    const { data } = await apiClient.post('/api/groups/', payload);
    return data;
  },
  async update(id: number, payload: Partial<GroupPayload>): Promise<Group> {
    const { data } = await apiClient.patch(`/api/groups/${id}/`, payload);
    return data;
  },
  async remove(id: number): Promise<void> {
    await apiClient.delete(`/api/groups/${id}/`);
  },
};
