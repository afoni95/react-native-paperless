import apiClient from './client';
import { Tag, PaginatedResponse } from '@/types';

export const tagsApi = {
  getTags: async (params?: {
    page?: number;
    page_size?: number;
  }): Promise<PaginatedResponse<Tag>> => {
    const { data } = await apiClient.get<PaginatedResponse<Tag>>('/api/tags/', { params });
    return data;
  },

  getAllTags: async (): Promise<Tag[]> => {
    const tagsList: Tag[] = [];
    let page = 1;
    let hasMore = true;

    while (hasMore) {
      const { results, next } = await tagsApi.getTags({ page, page_size: 100 });
      tagsList.push(...results);
      hasMore = Boolean(next);
      page += 1;
    }

    return tagsList;
  },

  getTag: async (id: number): Promise<Tag> => {
    const { data } = await apiClient.get<Tag>(`/api/tags/${id}/`);
    return data;
  },

  createTag: async (data: Partial<Tag>): Promise<Tag> => {
    const { data: created } = await apiClient.post<Tag>('/api/tags/', data);
    return created;
  },

  updateTag: async (id: number, data: Partial<Tag>): Promise<Tag> => {
    const { data: updated } = await apiClient.patch<Tag>(`/api/tags/${id}/`, data);
    return updated;
  },

  deleteTag: async (id: number): Promise<void> => {
    await apiClient.delete(`/api/tags/${id}/`);
  },
};
