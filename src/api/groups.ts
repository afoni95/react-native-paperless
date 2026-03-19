import apiClient from './client';

export interface Group {
  id: number;
  name: string;
  permissions: string[];
}

export interface GroupPayload {
  name: string;
  permissions?: string[];
}

export const groupsApi = {
  async list(params?: { page?: number; page_size?: number }) {
    const { data } = await apiClient.get('/api/groups/', { params });
    return data;
  },
  async retrieve(id: number) {
    const { data } = await apiClient.get(`/api/groups/${id}/`);
    return data;
  },
  async create(payload: GroupPayload) {
    const { data } = await apiClient.post('/api/groups/', payload);
    return data;
  },
  async update(id: number, payload: Partial<GroupPayload>) {
    const { data } = await apiClient.patch(`/api/groups/${id}/`, payload);
    return data;
  },
  async remove(id: number) {
    await apiClient.delete(`/api/groups/${id}/`);
  },
};
