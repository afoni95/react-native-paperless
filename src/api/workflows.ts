import apiClient from './client';
import { Workflow, WorkflowCreatePayload, WorkflowUpdatePayload, PaginatedResponse } from '@/types';

export const workflowsApi = {
  getWorkflows: async (params?: {
    page?: number;
    page_size?: number;
  }): Promise<PaginatedResponse<Workflow>> => {
    const { data } = await apiClient.get<PaginatedResponse<Workflow>>('/api/workflows/', {
      params,
    });
    return data;
  },

  getAllWorkflows: async (): Promise<Workflow[]> => {
    const workflowsList: Workflow[] = [];
    let page = 1;
    let hasMore = true;

    while (hasMore) {
      const { results, next } = await workflowsApi.getWorkflows({ page, page_size: 100 });
      workflowsList.push(...results);
      hasMore = Boolean(next);
      page += 1;
    }

    return workflowsList;
  },

  getWorkflow: async (id: number): Promise<Workflow> => {
    const { data } = await apiClient.get<Workflow>(`/api/workflows/${id}/`);
    return data;
  },

  createWorkflow: async (data: WorkflowCreatePayload): Promise<Workflow> => {
    const { data: created } = await apiClient.post<Workflow>('/api/workflows/', data);
    return created;
  },

  updateWorkflow: async (id: number, data: WorkflowUpdatePayload): Promise<Workflow> => {
    const { data: updated } = await apiClient.patch<Workflow>(`/api/workflows/${id}/`, data);
    return updated;
  },

  deleteWorkflow: async (id: number): Promise<void> => {
    await apiClient.delete(`/api/workflows/${id}/`);
  },
};
