export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
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
