import apiClient from './client';
import { TaskStatus } from '@/types';

export const tasksApi = {
  getTask: async (taskId: string): Promise<TaskStatus[]> => {
    const { data } = await apiClient.get<TaskStatus[]>('/api/tasks/', {
      params: { task_id: taskId },
    });
    return data;
  },

  getAllTasks: async (): Promise<TaskStatus[]> => {
    const { data } = await apiClient.get<TaskStatus[]>('/api/tasks/');
    return data.filter((task) => task.acknowledged === false);
  },

  acknowledgeTasks: async (taskIds: number[]): Promise<void> => {
    await apiClient.post('/api/tasks/acknowledge/', { tasks: taskIds });
  },
};
