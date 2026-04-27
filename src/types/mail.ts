export type ImapSecurity = 1 | 2 | 3;

export const IMAP_SECURITY_LABELS: Record<ImapSecurity, string> = {
  1: 'No encryption',
  2: 'SSL',
  3: 'STARTTLS',
};

export interface MailAccount {
  id: number;
  name: string;
  imap_server: string;
  imap_port: number;
  imap_security: ImapSecurity;
  username: string;
  password?: string;
  character_set: string;
  is_token: boolean;
  owner: number | null;
  user_can_change: boolean;
  account_type: number;
  expiration: string | null;
}

export interface MailAccountCreatePayload {
  name: string;
  imap_server: string;
  imap_port: number;
  imap_security: ImapSecurity;
  username: string;
  password: string;
  character_set: string;
  is_token: boolean;
  owner?: number | null;
  user_can_change?: boolean;
  account_type: number;
  expiration?: string | null;
}

export interface MailAccountUpdatePayload {
  name?: string;
  imap_server?: string;
  imap_port?: number;
  imap_security?: ImapSecurity;
  username?: string;
  password?: string;
  character_set?: string;
  is_token?: boolean;
  owner?: number | null;
  user_can_change?: boolean;
  account_type?: number;
  expiration?: string | null;
}

export interface MailRule {
  id: number;
  name: string;
  account: number;
  enabled: boolean;
  folder: string;
  filter_from: string | null;
  filter_to: string | null;
  filter_subject: string | null;
  filter_body: string | null;
  filter_attachment_filename_include: string | null;
  filter_attachment_filename_exclude: string | null;
  maximum_age: number;
  action: number;
  action_parameter: string | null;
  assign_title_from: number;
  assign_tags: number[];
  assign_correspondent_from: number;
  assign_correspondent: number | null;
  assign_document_type: number | null;
  assign_owner_from_rule: boolean;
  order: number;
  attachment_type: number;
  consumption_scope: number;
  pdf_layout: number;
  owner: number | null;
  user_can_change: boolean;
}

export interface MailRuleCreatePayload {
  name: string;
  account: number;
  enabled?: boolean;
  folder?: string;
  filter_from?: string | null;
  filter_to?: string | null;
  filter_subject?: string | null;
  filter_body?: string | null;
  filter_attachment_filename_include?: string | null;
  filter_attachment_filename_exclude?: string | null;
  maximum_age?: number;
  action?: number;
  action_parameter?: string | null;
  assign_title_from?: number;
  assign_tags?: number[];
  assign_correspondent_from?: number;
  assign_correspondent?: number | null;
  assign_document_type?: number | null;
  assign_owner_from_rule?: boolean;
  order?: number;
  attachment_type?: number;
  consumption_scope?: number;
  pdf_layout?: number;
  owner?: number | null;
  user_can_change?: boolean;
}

export interface MailRuleUpdatePayload {
  name?: string;
  account?: number;
  enabled?: boolean;
  folder?: string;
  filter_from?: string | null;
  filter_to?: string | null;
  filter_subject?: string | null;
  filter_body?: string | null;
  filter_attachment_filename_include?: string | null;
  filter_attachment_filename_exclude?: string | null;
  maximum_age?: number;
  action?: number;
  action_parameter?: string | null;
  assign_title_from?: number;
  assign_tags?: number[];
  assign_correspondent_from?: number;
  assign_correspondent?: number | null;
  assign_document_type?: number | null;
  assign_owner_from_rule?: boolean;
  order?: number;
  attachment_type?: number;
  consumption_scope?: number;
  pdf_layout?: number;
  owner?: number | null;
  user_can_change?: boolean;
}

export interface ProcessedMail {
  id: number;
  owner: number | null;
  rule: number | null;
  folder: string;
  uid: string;
  subject: string;
  received: string;
  processed: string;
  status: string;
  error: string | null;
}
