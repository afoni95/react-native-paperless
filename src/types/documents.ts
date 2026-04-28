export interface DocumentCustomFieldValue {
  field: number;
  value: string | number | boolean | null | (string | number)[];
}

export interface DocumentNote {
  id: number;
  note: string;
  created: string;
  document: number;
  user: number;
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

export interface SearchHit {
  score: number;
  highlights: string;
  rank: number;
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
