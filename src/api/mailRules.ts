import apiClient from './client';
import { MailRule, MailRuleCreatePayload, MailRuleUpdatePayload, PaginatedResponse } from '@/types';

export const mailRulesApi = {
  getMailRules: async (params?: {
    page?: number;
    page_size?: number;
  }): Promise<PaginatedResponse<MailRule>> => {
    const { data } = await apiClient.get<PaginatedResponse<MailRule>>('/api/mail_rules/', {
      params,
    });
    return data;
  },

  getAllMailRules: async (): Promise<MailRule[]> => {
    const mailRulesList: MailRule[] = [];
    let page = 1;
    let hasMore = true;

    while (hasMore) {
      const { results, next } = await mailRulesApi.getMailRules({ page, page_size: 100 });
      mailRulesList.push(...results);
      hasMore = Boolean(next);
      page += 1;
    }

    return mailRulesList;
  },

  getMailRule: async (id: number): Promise<MailRule> => {
    const { data } = await apiClient.get<MailRule>(`/api/mail_rules/${id}/`);
    return data;
  },

  createMailRule: async (data: MailRuleCreatePayload): Promise<MailRule> => {
    const { data: created } = await apiClient.post<MailRule>('/api/mail_rules/', data);
    return created;
  },

  updateMailRule: async (id: number, data: MailRuleUpdatePayload): Promise<MailRule> => {
    const { data: updated } = await apiClient.patch<MailRule>(`/api/mail_rules/${id}/`, data);
    return updated;
  },

  deleteMailRule: async (id: number): Promise<void> => {
    await apiClient.delete(`/api/mail_rules/${id}/`);
  },
};
