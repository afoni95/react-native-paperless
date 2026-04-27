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

export type TagSearchResult = Omit<Tag, 'document_count'>;
