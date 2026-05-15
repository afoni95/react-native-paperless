import apiClient from './client';
import { PaginatedResponse, ShareLink, ShareLinkCreatePayload } from '@/types';

export const shareLinksApi = {
  getShareLinks: async (params?: {
    page?: number;
    page_size?: number;
  }): Promise<PaginatedResponse<ShareLink>> => {
    const { data } = await apiClient.get<PaginatedResponse<ShareLink>>('/api/share_links/', {
      params,
    });
    return data;
  },

  getAllShareLinks: async (): Promise<ShareLink[]> => {
    const linksList: ShareLink[] = [];
    let page = 1;
    let hasMore = true;

    while (hasMore) {
      const { results, next } = await shareLinksApi.getShareLinks({ page, page_size: 100 });
      linksList.push(...results);
      hasMore = Boolean(next);
      page += 1;
    }

    return linksList;
  },

  createShareLink: async (data: ShareLinkCreatePayload): Promise<ShareLink> => {
    const { data: created } = await apiClient.post<ShareLink>('/api/share_links/', data);
    return created;
  },

  deleteShareLink: async (id: number): Promise<void> => {
    await apiClient.delete(`/api/share_links/${id}/`);
  },
};
