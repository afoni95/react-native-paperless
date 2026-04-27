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

export type CorrespondentSearchResult = Omit<Correspondent, 'document_count'>;
