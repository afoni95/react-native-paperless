import apiClient from './client';
import type { PaginatedResponse } from '@/types';

export interface User {
  id: number;
  username: string;
  email: string;
  first_name?: string;
  last_name?: string;
  is_active: boolean;
  is_superuser: boolean;
  is_staff: boolean;
  is_mfa_enabled: boolean;
  date_joined: string;
  last_login?: string;
  groups: number[];
  inherited_permissions: string[];
  user_permissions: string[];
  password?: string;
}

export type UserPayload = Omit<
  User,
  'id' | 'date_joined' | 'last_login' | 'inherited_permissions' | 'is_mfa_enabled'
> & {
  password?: string;
};

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
