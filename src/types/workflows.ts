export enum TriggerType {
  ConsumptionStarted = 1,
  DocumentAdded = 2,
  DocumentUpdated = 3,
  Scheduled = 4,
}

export enum ActionType {
  Assignment = 1,
  Removal = 2,
}

export interface WorkflowTrigger {
  id: number;
  sources: number[];
  type: TriggerType;
  filter_path: string;
  filter_filename: string;
  filter_mailrule: number | null;
  matching_algorithm: number;
  match: string;
  is_insensitive: boolean;
  filter_has_tags: number[];
  filter_has_all_tags: number[];
  filter_has_not_tags: number[];
  filter_custom_field_query: string | null;
  filter_has_not_correspondents: number[];
  filter_has_not_document_types: number[];
  filter_has_not_storage_paths: number[];
  filter_has_correspondent: number | null;
  filter_has_document_type: number | null;
  filter_has_storage_path: number | null;
  schedule_offset_days: number;
  schedule_is_recurring: boolean;
  schedule_recurring_interval_days: number;
  schedule_date_field: 'added' | 'created' | 'modified' | 'custom_field';
  schedule_date_custom_field: number | null;
}

export interface WorkflowAction {
  id: number;
  type: ActionType;
  assign_title: string;
  assign_tags: number[];
  assign_correspondent: number | null;
  assign_document_type: number | null;
  assign_storage_path: number | null;
  assign_owner: number | null;
  assign_view_users: number[];
  assign_view_groups: number[];
  assign_change_users: number[];
  assign_change_groups: number[];
  assign_custom_fields: number[];
  assign_custom_fields_values: Record<number, string | number | boolean | null>;
  remove_all_tags: boolean;
  remove_tags: number[];
  remove_all_correspondents: boolean;
  remove_correspondents: number[];
  remove_all_document_types: boolean;
  remove_document_types: number[];
  remove_all_storage_paths: boolean;
  remove_storage_paths: number[];
  remove_custom_fields: number[];
  remove_all_custom_fields: boolean;
  remove_all_owners: boolean;
  remove_owners: number[];
  remove_all_permissions: boolean;
  remove_view_users: number[];
  remove_view_groups: number[];
  remove_change_users: number[];
  remove_change_groups: number[];
  email: string | null;
  webhook: string | null;
}

export interface Workflow {
  id: number;
  name: string;
  order: number;
  enabled: boolean;
  triggers: WorkflowTrigger[];
  actions: WorkflowAction[];
}

export interface WorkflowCreatePayload {
  name: string;
  order?: number;
  enabled?: boolean;
  triggers?: Omit<WorkflowTrigger, 'id'>[];
  actions?: Omit<WorkflowAction, 'id'>[];
}

export interface WorkflowUpdatePayload {
  name?: string;
  order?: number;
  enabled?: boolean;
  triggers?: Omit<WorkflowTrigger, 'id'>[];
  actions?: Omit<WorkflowAction, 'id'>[];
}
