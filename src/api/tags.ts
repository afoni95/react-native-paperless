import apiClient from './client';
import { Tag, PaginatedResponse } from '@/types';

export const tagsApi = {
  getTags: async (params?: { page?: number; page_size?: number }): Promise<PaginatedResponse<Tag>> => {
    const response = await apiClient.get<PaginatedResponse<Tag>>('/api/tags/', { params });
    return response.data;
  },

  getAllTags: async (): Promise<Tag[]> => {
    const tagsList: Tag[] = [];
    let page = 1;

    while (true) {
      const resp = await tagsApi.getTags({ page, page_size: 100 });
      tagsList.push(...resp.results);
      if (!resp.next) break;
      page++;
    }

    return tagsList;
  },

  getTag: async (id: number): Promise<Tag> => {
    const response = await apiClient.get<Tag>(`/api/tags/${id}/`);
    return response.data;
  },

  createTag: async (data: Partial<Tag>): Promise<Tag> => {
    const response = await apiClient.post<Tag>('/api/tags/', data);
    return response.data;
  },

  updateTag: async (id: number, data: Partial<Tag>): Promise<Tag> => {
    const response = await apiClient.patch<Tag>(`/api/tags/${id}/`, data);
    return response.data;
  },

  deleteTag: async (id: number): Promise<void> => {
    await apiClient.delete(`/api/tags/${id}/`);
  },
};
