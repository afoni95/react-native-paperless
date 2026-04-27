export interface FileTypeCount {
  mime_type: string;
  mime_type_count: number;
}

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
