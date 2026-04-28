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

export type DocumentTypeSearchResult = Omit<DocumentType, 'document_count'>;
