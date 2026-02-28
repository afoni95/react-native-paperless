export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export interface TokenResponse {
  token: string;
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
  archive_serial_number: number | null;
  original_file_name: string;
  archived_file_name: string | null;
  owner: number | null;
  notes: DocumentNote[];
  __search_hit__?: SearchHit;
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
}

export interface Correspondent {
  id: number;
  name: string;
  match: string;
  matching_algorithm: number;
  is_insensitive: boolean;
  document_count: number;
  last_correspondence: string | null;
  owner: number | null;
}

export interface DocumentType {
  id: number;
  name: string;
  match: string;
  matching_algorithm: number;
  is_insensitive: boolean;
  document_count: number;
  owner: number | null;
}

export interface Statistics {
  documents_total: number;
  documents_inbox: number;
  inbox_tags: number[];
  document_file_type_counts: FileTypeCount[];
  character_count: number;
  tag_count: number;
  correspondent_count: number;
  document_type_count: number;
  current_asn: number;
}

export interface FileTypeCount {
  mime_type: string;
  mime_type_count: number;
}

export interface TaskStatus {
  id: number;
  task_id: string;
  task_file_name: string;
  status: 'PENDING' | 'STARTED' | 'SUCCESS' | 'FAILURE';
  result: string | null;
  date_created: string;
  date_done: string | null;
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
}

export interface DocumentListParams {
  page?: number;
  page_size?: number;
  query?: string;
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
