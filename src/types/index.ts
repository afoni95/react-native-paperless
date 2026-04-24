export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export interface TokenResponse {
  token: string;
}

export interface PaperlessApiError {
  non_field_errors?: string[];
  detail?: string;
}

export interface Document {
  id: number;
  correspondent: number | null;
  document_type: number | null;
  storage_path: number | null;
  title: string;
  content: string;
  tags: number[];
  created: string;
  created_date: string;
  modified: string;
  added: string;
  deleted_at: string | null;
  archive_serial_number: number | null;
  original_file_name: string;
  archived_file_name: string | null;
  owner: number | null;
  notes: DocumentNote[];
  custom_fields: DocumentCustomFieldValue[];
  is_shared_by_requester: boolean;
  mime_type: string;
  page_count: number | null;
  user_can_change: boolean;
}

export interface DocumentCustomFieldValue {
  field: number;
  value: string | number | boolean | null | (string | number)[];
}

export interface DocumentUpdatePayload {
  title?: string;
  correspondent?: number | null;
  document_type?: number | null;
  storage_path?: number | null;
  tags?: number[];
  archive_serial_number?: number | null;
  created_date?: string;
  custom_fields?: DocumentCustomFieldValue[];
}

export interface DocumentNote {
  id: number;
  note: string;
  created: string;
  document: number;
  user: number;
}

export interface SearchHit {
  score: number;
  highlights: string;
  rank: number;
}

export interface Tag {
  id: number;
  name: string;
  color: string;
  text_color: string;
  match: string;
  matching_algorithm: number;
  is_insensitive: boolean;
  is_inbox_tag: boolean;
  document_count: number;
  owner: number | null;
  user_can_change: boolean;
  slug: string;
  parent: number | null;
}

export interface TagSearchResult {
  id: number;
  name: string;
  color: string;
  text_color: string;
  match: string;
  matching_algorithm: number;
  is_insensitive: boolean;
  is_inbox_tag: boolean;
  owner: number | null;
  user_can_change: boolean;
  slug: string;
  parent: number | null;
}

export interface Correspondent {
  id: number;
  name: string;
  match: string;
  matching_algorithm: number;
  is_insensitive: boolean;
  document_count: number;
  owner: number | null;
  user_can_change: boolean;
  slug: string;
}

export interface CorrespondentSearchResult {
  id: number;
  name: string;
  match: string;
  matching_algorithm: number;
  is_insensitive: boolean;
  owner: number | null;
  user_can_change: boolean;
  slug: string;
}

export interface DocumentType {
  id: number;
  slug: string;
  name: string;
  match: string;
  matching_algorithm: number;
  is_insensitive: boolean;
  document_count: number;
  owner: number | null;
  user_can_change: boolean;
}

export interface DocumentTypeSearchResult {
  id: number;
  name: string;
  match: string;
  matching_algorithm: number;
  is_insensitive: boolean;
  slug: string;
  user_can_change: boolean;
  owner: number | null;
}

export interface StoragePath {
  id: number;
  name: string;
  path: string;
  match: string;
  matching_algorithm: number;
  is_insensitive: boolean;
  document_count: number;
  owner: number | null;
  user_can_change: boolean;
  slug: string;
}

export interface StoragePathSearchResult {
  id: number;
  name: string;
  path: string;
  match: string;
  matching_algorithm: number;
  is_insensitive: boolean;
  slug: string;
  user_can_change: boolean;
  owner: number | null;
}

export type ImapSecurity = 1 | 2 | 3;

export const IMAP_SECURITY_LABELS: Record<ImapSecurity, string> = {
  1: 'No encryption',
  2: 'SSL',
  3: 'STARTTLS',
};

export interface MailAccount {
  id: number;
  name: string;
  imap_server: string;
  imap_port: number;
  imap_security: ImapSecurity;
  username: string;
  password?: string;
  character_set: string;
  is_token: boolean;
  owner: number | null;
  user_can_change: boolean;
  account_type: number;
  expiration: string | null;
}

export interface MailAccountCreatePayload {
  name: string;
  imap_server: string;
  imap_port: number;
  imap_security: ImapSecurity;
  username: string;
  password: string;
  character_set: string;
  is_token: boolean;
  owner?: number | null;
  user_can_change?: boolean;
  account_type: number;
  expiration?: string | null;
}

export interface MailAccountUpdatePayload {
  name?: string;
  imap_server?: string;
  imap_port?: number;
  imap_security?: ImapSecurity;
  username?: string;
  password?: string;
  character_set?: string;
  is_token?: boolean;
  owner?: number | null;
  user_can_change?: boolean;
  account_type?: number;
  expiration?: string | null;
}

export interface MailRule {
  id: number;
  name: string;
  account: number;
  enabled: boolean;
  folder: string;
  filter_from: string | null;
  filter_to: string | null;
  filter_subject: string | null;
  filter_body: string | null;
  filter_attachment_filename_include: string | null;
  filter_attachment_filename_exclude: string | null;
  maximum_age: number;
  action: number;
  action_parameter: string | null;
  assign_title_from: number;
  assign_tags: number[];
  assign_correspondent_from: number;
  assign_correspondent: number | null;
  assign_document_type: number | null;
  assign_owner_from_rule: boolean;
  order: number;
  attachment_type: number;
  consumption_scope: number;
  pdf_layout: number;
  owner: number | null;
  user_can_change: boolean;
}

export interface MailRuleCreatePayload {
  name: string;
  account: number;
  enabled?: boolean;
  folder?: string;
  filter_from?: string | null;
  filter_to?: string | null;
  filter_subject?: string | null;
  filter_body?: string | null;
  filter_attachment_filename_include?: string | null;
  filter_attachment_filename_exclude?: string | null;
  maximum_age?: number;
  action?: number;
  action_parameter?: string | null;
  assign_title_from?: number;
  assign_tags?: number[];
  assign_correspondent_from?: number;
  assign_correspondent?: number | null;
  assign_document_type?: number | null;
  assign_owner_from_rule?: boolean;
  order?: number;
  attachment_type?: number;
  consumption_scope?: number;
  pdf_layout?: number;
  owner?: number | null;
  user_can_change?: boolean;
}

export interface MailRuleUpdatePayload {
  name?: string;
  account?: number;
  enabled?: boolean;
  folder?: string;
  filter_from?: string | null;
  filter_to?: string | null;
  filter_subject?: string | null;
  filter_body?: string | null;
  filter_attachment_filename_include?: string | null;
  filter_attachment_filename_exclude?: string | null;
  maximum_age?: number;
  action?: number;
  action_parameter?: string | null;
  assign_title_from?: number;
  assign_tags?: number[];
  assign_correspondent_from?: number;
  assign_correspondent?: number | null;
  assign_document_type?: number | null;
  assign_owner_from_rule?: boolean;
  order?: number;
  attachment_type?: number;
  consumption_scope?: number;
  pdf_layout?: number;
  owner?: number | null;
  user_can_change?: boolean;
}

export interface CustomField {
  id: number;
  name: string;
  data_type: CustomFieldDataType;
  extra_data: CustomFieldExtraData | null;
  document_count: number;
}

export interface CustomFieldSelectOption {
  id: string;
  label: string;
}

export interface CustomFieldExtraData {
  select_options: CustomFieldSelectOption[];
  default_currency: string | null;
}

export const CUSTOM_FIELD_DATA_TYPES = {
  string: 'string',
  longtext: 'longtext',
  url: 'url',
  date: 'date',
  boolean: 'boolean',
  integer: 'integer',
  float: 'float',
  monetary: 'monetary',
  documentlink: 'documentlink',
  select: 'select',
} as const;

export type CustomFieldDataType = keyof typeof CUSTOM_FIELD_DATA_TYPES;

export interface Statistics {
  documents_total: number;
  documents_inbox: number;
  inbox_tag: number;
  inbox_tags: number[];
  document_file_type_counts: FileTypeCount[];
  character_count: number;
  tag_count: number;
  correspondent_count: number;
  document_type_count: number;
  storage_path_count: number;
  current_asn: number;
}

export interface FileTypeCount {
  mime_type: string;
  mime_type_count: number;
}

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

export interface DocumentUploadParams {
  document: {
    uri: string;
    name: string;
    type: string;
  };
  title?: string;
  correspondent?: number;
  document_type?: number;
  tags?: number[];
  storage_path?: number;
  custom_fields?: DocumentCustomFieldValue[];
}

export interface DocumentListParams {
  page?: number;
  page_size?: number;
  query?: string;
  id__in?: number[];
  correspondent__id?: number;
  document_type__id?: number;
  tags__id__all?: number[];
  tags__id__in?: number[];
  tags__id__none?: number[];
  is_tagged?: boolean;
  is_in_inbox?: boolean;
  title__icontains?: string;
  content__icontains?: string;
  title_content?: string;
  created__gt?: string;
  created__lt?: string;
  ordering?: string;
  truncate_content?: boolean;
}

export interface AutocompleteResponse {
  suggestions: string[];
}

export interface GlobalSearchResult {
  correspondents: CorrespondentSearchResult[];
  // custom_fields: any[];
  document_types: DocumentTypeSearchResult[];
  documents: Document[];
  // groups: any[];
  // mail_accounts: any[];
  // mail_rules: any[];
  // saved_views: any[];
  // storage_paths: any[];
  tags: TagSearchResult[];
  total: number;
  // users: any[];
  // workflows: any[];
}

export type MatchingAlgorithm = 0 | 1 | 2 | 3 | 4 | 5 | 6;

export const MATCHING_ALGORITHMS: Record<MatchingAlgorithm, string> = {
  0: 'None',
  1: 'Any',
  2: 'All',
  3: 'Literal',
  4: 'Regular Expression',
  5: 'Fuzzy Match',
  6: 'Auto',
};

type ApiStatusStorage = {
  total: number;
  available: number;
};
type ApiStatusDatabase = {
  type: string;
  url: string;
  status: string;
  error: string;
  migration_status: ApiStatusDatabaseMigrationStatus;
};
type ApiStatusDatabaseMigrationStatus = {
  latest_migration: string;
  unapplied_migrations: unknown[];
};

type ApiStatusTasks = {
  redis_url: string;
  redis_status: string;
  redis_error: string;
  celery_url: string;
  celery_error: string;
  index_status: string;
  index_last_modified: string;
  index_error: string;
  classifier_status: string;
  classifier_last_trained: string;
  classifier_error: string;
  sanity_check_status: string;
  sanity_check_last_run: string;
  sanity_check_error: string;
};

export type ApiStatus = {
  pngx_version: string;
  server_os: string;
  install_type: string;
  storage: ApiStatusStorage;
  database: ApiStatusDatabase;
  tasks: ApiStatusTasks;
};

export interface ProcessedMail {
  id: number;
  owner: number | null;
  rule: number | null;
  folder: string;
  uid: string;
  subject: string;
  received: string;
  processed: string;
  status: string;
  error: string | null;
}

export type {
  Workflow,
  WorkflowTrigger,
  WorkflowAction,
  WorkflowCreatePayload,
  WorkflowUpdatePayload,
  TriggerType,
  ActionType,
} from './workflows';
