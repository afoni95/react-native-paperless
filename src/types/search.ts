import type { CorrespondentSearchResult } from './correspondents';
import type { CustomField } from './customFields';
import type { DocumentTypeSearchResult } from './documentTypes';
import type { Document } from './documents';
import type { Group, User } from './auth';
import type { MailAccount, MailRule } from './mail';
import type { StoragePath } from './storagePaths';
import type { TagSearchResult } from './tags';
import type { Workflow } from './workflows';

export interface GlobalSearchResult {
  correspondents: CorrespondentSearchResult[];
  custom_fields: CustomField[];
  document_types: DocumentTypeSearchResult[];
  documents: Document[];
  groups: Group[];
  mail_accounts: MailAccount[];
  mail_rules: MailRule[];
  storage_paths: StoragePath[];
  tags: TagSearchResult[];
  total: number;
  users: User[];
  workflows: Workflow[];
}
