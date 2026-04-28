export interface TaskStatus {
  id: number;
  task_id: string;
  task_name: string;
  task_file_name: string;
  status: 'PENDING' | 'STARTED' | 'SUCCESS' | 'FAILURE';
  result: string | null;
  date_created: string;
  date_done: string | null;
  acknowledged: boolean;
  type: string;
  related_document: string | null;
  owner: number | null;
}
