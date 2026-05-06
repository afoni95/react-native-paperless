export interface ShareLink {
  id: number;
  slug: string;
  document: number;
  expiration: string | null;
}

export interface ShareLinkCreatePayload {
  document: number;
  expiration?: string | null;
}
