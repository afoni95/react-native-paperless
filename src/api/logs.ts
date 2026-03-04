import client from './client';

export async function listLogs(): Promise<string[]> {
  const response = await client.get<string[]>('/api/logs/');
  return response.data.reverse();
}

export async function getLog(logId: string, limit?: number): Promise<string[]> {
  const response = await client.get<string[]>(`/api/logs/${logId}/`, {
    params: limit ? { limit } : undefined,
  });
  return response.data.reverse();
}
