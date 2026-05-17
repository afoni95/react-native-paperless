import apiClient from './client';
import { CustomField, PaginatedResponse } from '@/types';

export const customFieldsApi = {
  getCustomFields: async (params?: {
    page?: number;
    page_size?: number;
  }): Promise<PaginatedResponse<CustomField>> => {
    const { data } = await apiClient.get<PaginatedResponse<CustomField>>('/api/custom_fields/', {
      params,
    });
    return data;
  },

  getAllCustomFields: async (): Promise<CustomField[]> => {
    const customFieldsList: CustomField[] = [];
    let page = 1;
    let hasMore = true;

    while (hasMore) {
      const { results, next } = await customFieldsApi.getCustomFields({ page, page_size: 100 });
      customFieldsList.push(...results);
      hasMore = Boolean(next);
      page += 1;
    }

    return customFieldsList;
  },

  getCustomField: async (id: number): Promise<CustomField> => {
    const { data } = await apiClient.get<CustomField>(`/api/custom_fields/${id}/`);
    return data;
  },

  createCustomField: async (data: Partial<CustomField>): Promise<CustomField> => {
    const { data: created } = await apiClient.post<CustomField>('/api/custom_fields/', data);
    return created;
  },

  updateCustomField: async (id: number, data: Partial<CustomField>): Promise<CustomField> => {
    const { data: updated } = await apiClient.patch<CustomField>(`/api/custom_fields/${id}/`, data);
    return updated;
  },

  deleteCustomField: async (id: number): Promise<void> => {
    await apiClient.delete(`/api/custom_fields/${id}/`);
  },
};
