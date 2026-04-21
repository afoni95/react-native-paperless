import apiClient from './client';
import { MailRule, MailRuleCreatePayload, MailRuleUpdatePayload, PaginatedResponse } from '@/types';

export const mailRulesApi = {
  getMailRules: async (params?: {
    page?: number;
    page_size?: number;
  }): Promise<PaginatedResponse<MailRule>> => {
    const response = await apiClient.get<PaginatedResponse<MailRule>>('/api/mail_rules/', {
      params,
    });
    return response.data;
  },

  getAllMailRules: async (): Promise<MailRule[]> => {
    const mailRulesList: MailRule[] = [];
    let page = 1;

    while (true) {
      const resp = await mailRulesApi.getMailRules({ page, page_size: 100 });
      mailRulesList.push(...resp.results);
      if (!resp.next) break;
      page++;
    }

    return mailRulesList;
  },

  getMailRule: async (id: number): Promise<MailRule> => {
    const response = await apiClient.get<MailRule>(`/api/mail_rules/${id}/`);
    return response.data;
  },

  createMailRule: async (data: MailRuleCreatePayload): Promise<MailRule> => {
    const response = await apiClient.post<MailRule>('/api/mail_rules/', data);
    return response.data;
  },

  updateMailRule: async (id: number, data: MailRuleUpdatePayload): Promise<MailRule> => {
    const response = await apiClient.patch<MailRule>(`/api/mail_rules/${id}/`, data);
    return response.data;
  },

  deleteMailRule: async (id: number): Promise<void> => {
    await apiClient.delete(`/api/mail_rules/${id}/`);
  },
};
