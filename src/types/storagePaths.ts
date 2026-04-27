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

export type StoragePathSearchResult = Omit<StoragePath, 'document_count'>;
