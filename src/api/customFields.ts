import apiClient from './client';
import { CustomField, PaginatedResponse } from '@/types';

export const customFieldsApi = {
  getCustomFields: async (params?: {
    page?: number;
    page_size?: number;
  }): Promise<PaginatedResponse<CustomField>> => {
    const response = await apiClient.get<PaginatedResponse<CustomField>>('/api/custom_fields/', {
      params,
    });
    return response.data;
  },

  getAllCustomFields: async (): Promise<CustomField[]> => {
    const customFieldsList: CustomField[] = [];
    let page = 1;

    while (true) {
      const resp = await customFieldsApi.getCustomFields({ page, page_size: 100 });
      customFieldsList.push(...resp.results);
      if (!resp.next) break;
      page++;
    }

    return customFieldsList;
  },

  getCustomField: async (id: number): Promise<CustomField> => {
    const response = await apiClient.get<CustomField>(`/api/custom_fields/${id}/`);
    return response.data;
  },

  createCustomField: async (data: Partial<CustomField>): Promise<CustomField> => {
    const response = await apiClient.post<CustomField>('/api/custom_fields/', data);
    return response.data;
  },

  updateCustomField: async (id: number, data: Partial<CustomField>): Promise<CustomField> => {
    const response = await apiClient.patch<CustomField>(`/api/custom_fields/${id}/`, data);
    return response.data;
  },

  deleteCustomField: async (id: number): Promise<void> => {
    await apiClient.delete(`/api/custom_fields/${id}/`);
  },
};
