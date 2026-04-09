/**
 * Mock data for demo mode.
 * Allows Google Play reviewers (or anyone) to explore the app
 * without needing a real Paperless-ngx server.
 */

import type {
  Correspondent,
  CustomField,
  Document,
  DocumentNote,
  DocumentType,
  PaginatedResponse,
  StoragePath,
  Statistics,
  Tag,
  TaskStatus,
  Workflow,
} from '@/types';
import type { Group } from './groups';
import type { User } from './users';

/* ------------------------------------------------------------------ */
/*  Tags                                                               */
/* ------------------------------------------------------------------ */

export const demoTags: Tag[] = [
  {
    id: 1,
    name: 'Invoice',
    color: '#e74c3c',
    text_color: '#ffffff',
    match: 'invoice',
    matching_algorithm: 3,
    is_insensitive: true,
    is_inbox_tag: false,
    document_count: 5,
    owner: 1,
    user_can_change: true,
    slug: 'invoice',
    parent: null,
  },
  {
    id: 2,
    name: 'Receipt',
    color: '#3498db',
    text_color: '#ffffff',
    match: 'receipt',
    matching_algorithm: 3,
    is_insensitive: true,
    is_inbox_tag: false,
    document_count: 3,
    owner: 1,
    user_can_change: true,
    slug: 'receipt',
    parent: null,
  },
  {
    id: 3,
    name: 'Contract',
    color: '#2ecc71',
    text_color: '#ffffff',
    match: 'contract',
    matching_algorithm: 3,
    is_insensitive: true,
    is_inbox_tag: false,
    document_count: 2,
    owner: 1,
    user_can_change: true,
    slug: 'contract',
    parent: null,
  },
  {
    id: 4,
    name: 'Tax',
    color: '#f39c12',
    text_color: '#ffffff',
    match: 'tax',
    matching_algorithm: 3,
    is_insensitive: true,
    is_inbox_tag: false,
    document_count: 4,
    owner: 1,
    user_can_change: true,
    slug: 'tax',
    parent: null,
  },
  {
    id: 5,
    name: 'Inbox',
    color: '#9b59b6',
    text_color: '#ffffff',
    match: '',
    matching_algorithm: 0,
    is_insensitive: true,
    is_inbox_tag: true,
    document_count: 2,
    owner: 1,
    user_can_change: true,
    slug: 'inbox',
    parent: null,
  },
];

/* ------------------------------------------------------------------ */
/*  Correspondents                                                     */
/* ------------------------------------------------------------------ */

export const demoCorrespondents: Correspondent[] = [
  {
    id: 1,
    name: 'ACME Corp',
    match: 'acme',
    matching_algorithm: 3,
    is_insensitive: true,
    document_count: 4,
    owner: 1,
    user_can_change: true,
    slug: 'acme-corp',
  },
  {
    id: 2,
    name: 'City Power & Gas',
    match: 'city power',
    matching_algorithm: 3,
    is_insensitive: true,
    document_count: 2,
    owner: 1,
    user_can_change: true,
    slug: 'city-power-gas',
  },
  {
    id: 3,
    name: 'Insurance Co',
    match: 'insurance',
    matching_algorithm: 3,
    is_insensitive: true,
    document_count: 3,
    owner: 1,
    user_can_change: true,
    slug: 'insurance-co',
  },
  {
    id: 4,
    name: 'Tax Office',
    match: 'tax office',
    matching_algorithm: 3,
    is_insensitive: true,
    document_count: 2,
    owner: 1,
    user_can_change: true,
    slug: 'tax-office',
  },
];

/* ------------------------------------------------------------------ */
/*  Document Types                                                     */
/* ------------------------------------------------------------------ */

export const demoDocumentTypes: DocumentType[] = [
  {
    id: 1,
    name: 'Invoice',
    match: 'invoice',
    matching_algorithm: 3,
    is_insensitive: true,
    document_count: 5,
    owner: 1,
    slug: 'demo',
    user_can_change: false,
  },
  {
    id: 2,
    name: 'Letter',
    match: 'letter',
    matching_algorithm: 3,
    is_insensitive: true,
    document_count: 3,
    owner: 1,
    slug: 'demo',
    user_can_change: false,
  },
  {
    id: 3,
    name: 'Contract',
    match: 'contract',
    matching_algorithm: 3,
    is_insensitive: true,
    document_count: 2,
    owner: 1,
    slug: 'demo',
    user_can_change: false,
  },
  {
    id: 4,
    name: 'Tax Document',
    match: 'tax',
    matching_algorithm: 3,
    is_insensitive: true,
    document_count: 2,
    owner: 1,
    slug: 'demo',
    user_can_change: false,
  },
];

/* ------------------------------------------------------------------ */
/*  Documents                                                          */
/* ------------------------------------------------------------------ */

const baseDocs: Document[] = [
  {
    id: 1,
    title: 'ACME Corp – Invoice #1042',
    correspondent: 1,
    document_type: 1,
    storage_path: null,
    content:
      'Invoice #1042\nACME Corp\n123 Business Lane\n\nTotal: $1,250.00\nDue Date: 2025-12-01\n\nThank you for your business.',
    tags: [1, 4],
    created: '2025-11-15T09:00:00Z',
    created_date: '2025-11-15',
    modified: '2025-11-15T09:00:00Z',
    added: '2025-11-16T08:00:00Z',
    archive_serial_number: 1001,
    original_file_name: 'acme_invoice_1042.pdf',
    archived_file_name: 'acme_invoice_1042_archived.pdf',
    owner: 1,
    notes: [],
    deleted_at: null,
    is_shared_by_requester: false,
    mime_type: 'application/pdf',
    page_count: 1,
    user_can_change: true,
    custom_fields: [],
  },
  {
    id: 2,
    title: 'Electricity Bill – November 2025',
    correspondent: 2,
    document_type: 1,
    storage_path: null,
    content:
      'City Power & Gas\nMonthly Statement\n\nBilling Period: Nov 1 – Nov 30, 2025\nUsage: 420 kWh\nAmount Due: $78.50',
    tags: [1, 2],
    created: '2025-12-01T12:00:00Z',
    created_date: '2025-12-01',
    modified: '2025-12-01T12:00:00Z',
    added: '2025-12-02T07:30:00Z',
    archive_serial_number: 1002,
    original_file_name: 'electricity_nov_2025.pdf',
    archived_file_name: null,
    owner: 1,
    notes: [],
    deleted_at: null,
    is_shared_by_requester: false,
    mime_type: 'application/pdf',
    page_count: 1,
    user_can_change: true,
    custom_fields: [],
  },
  {
    id: 3,
    title: 'Home Insurance Policy Renewal',
    correspondent: 3,
    document_type: 3,
    storage_path: null,
    content:
      'Insurance Co – Policy Renewal\nPolicy #HI-29384\nCoverage: $500,000\nPremium: $1,200/year\nEffective: 2026-01-01',
    tags: [3],
    created: '2025-10-05T09:15:00Z',
    created_date: '2025-10-05',
    modified: '2025-10-05T09:15:00Z',
    added: '2025-10-06T10:00:00Z',
    archive_serial_number: 1003,
    original_file_name: 'insurance_renewal_2026.pdf',
    archived_file_name: 'insurance_renewal_2026_archived.pdf',
    owner: 1,
    notes: [],
    deleted_at: null,
    is_shared_by_requester: false,
    mime_type: 'application/pdf',
    page_count: 2,
    user_can_change: true,
    custom_fields: [],
  },
  {
    id: 4,
    title: 'Tax Return 2024',
    correspondent: 4,
    document_type: 4,
    storage_path: null,
    content:
      'Federal Tax Return – Tax Year 2024\nFiling Status: Single\nAdjusted Gross Income: $72,500\nTotal Tax: $12,350\nRefund: $1,450',
    tags: [4],
    created: '2025-04-10T11:00:00Z',
    created_date: '2025-04-10',
    modified: '2025-04-10T11:00:00Z',
    added: '2025-04-12T14:00:00Z',
    archive_serial_number: 1004,
    original_file_name: 'tax_return_2024.pdf',
    archived_file_name: null,
    owner: 1,
    notes: [],
    deleted_at: null,
    is_shared_by_requester: false,
    mime_type: 'application/pdf',
    page_count: 3,
    user_can_change: true,
    custom_fields: [],
  },
  {
    id: 5,
    title: 'ACME Corp – Service Agreement',
    correspondent: 1,
    document_type: 3,
    storage_path: null,
    content:
      'Service Agreement between You and ACME Corp.\nDuration: 12 months\nMonthly fee: $99.00\nStart date: 2025-06-01',
    tags: [3],
    created: '2025-05-20T15:30:00Z',
    created_date: '2025-05-20',
    modified: '2025-05-20T15:30:00Z',
    added: '2025-05-21T08:00:00Z',
    archive_serial_number: 1005,
    original_file_name: 'acme_service_agreement.pdf',
    archived_file_name: null,
    owner: 1,
    notes: [],
    deleted_at: null,
    is_shared_by_requester: false,
    mime_type: 'application/pdf',
    page_count: 2,
    user_can_change: true,
    custom_fields: [],
  },
  {
    id: 6,
    title: 'Grocery Receipt – 2025-11-28',
    correspondent: null,
    document_type: null,
    storage_path: null,
    content: 'SuperMart Receipt\nDate: 2025-11-28\nItems: 12\nTotal: $87.32',
    tags: [2, 5],
    created: '2025-11-28T18:00:00Z',
    created_date: '2025-11-28',
    modified: '2025-11-28T18:00:00Z',
    added: '2025-11-29T09:00:00Z',
    archive_serial_number: null,
    original_file_name: 'grocery_receipt.jpg',
    archived_file_name: null,
    owner: 1,
    notes: [],
    deleted_at: null,
    is_shared_by_requester: false,
    mime_type: 'image/jpeg',
    page_count: 1,
    user_can_change: true,
    custom_fields: [],
  },
  {
    id: 7,
    title: 'ACME Corp – Invoice #1098',
    correspondent: 1,
    document_type: 1,
    storage_path: null,
    content:
      'Invoice #1098\nACME Corp\n\nConsulting Services – December 2025\nTotal: $3,400.00\nPayment Terms: Net 30',
    tags: [1],
    created: '2025-12-20T10:00:00Z',
    created_date: '2025-12-20',
    modified: '2025-12-20T10:00:00Z',
    added: '2025-12-21T07:00:00Z',
    archive_serial_number: 1006,
    original_file_name: 'acme_invoice_1098.pdf',
    archived_file_name: null,
    owner: 1,
    notes: [],
    deleted_at: null,
    is_shared_by_requester: false,
    mime_type: 'application/pdf',
    page_count: 1,
    user_can_change: true,
    custom_fields: [],
  },
  {
    id: 8,
    title: 'Car Insurance – Semi-Annual Statement',
    correspondent: 3,
    document_type: 2,
    storage_path: null,
    content:
      'Insurance Co – Auto Policy\nVehicle: 2022 Sedan\nPremium: $640 / 6 months\nCoverage: Comprehensive',
    tags: [3],
    created: '2025-07-01T14:00:00Z',
    created_date: '2025-07-01',
    modified: '2025-07-01T14:00:00Z',
    added: '2025-07-02T08:00:00Z',
    archive_serial_number: 1007,
    original_file_name: 'car_insurance_statement.pdf',
    archived_file_name: null,
    owner: 1,
    notes: [],
    deleted_at: null,
    is_shared_by_requester: false,
    mime_type: 'application/pdf',
    page_count: 2,
    user_can_change: true,
    custom_fields: [],
  },
  {
    id: 9,
    title: 'Property Tax Notice 2025',
    correspondent: 4,
    document_type: 4,
    storage_path: null,
    content:
      'Property Tax Assessment\nTax Year: 2025\nAssessed Value: $320,000\nAnnual Tax: $4,160\nDue: 2025-12-31',
    tags: [4],
    created: '2025-09-01T08:00:00Z',
    created_date: '2025-09-01',
    modified: '2025-09-01T08:00:00Z',
    added: '2025-09-02T10:00:00Z',
    archive_serial_number: 1008,
    original_file_name: 'property_tax_2025.pdf',
    archived_file_name: null,
    owner: 1,
    notes: [],
    deleted_at: null,
    is_shared_by_requester: false,
    mime_type: 'application/pdf',
    page_count: 1,
    user_can_change: true,
    custom_fields: [],
  },
  {
    id: 10,
    title: 'Internet Bill – December 2025',
    correspondent: null,
    document_type: 1,
    storage_path: null,
    content: 'FastNet ISP\nMonthly Invoice\nPlan: 500 Mbps\nPeriod: Dec 2025\nAmount: $59.99',
    tags: [1, 5],
    created: '2025-12-05T11:00:00Z',
    created_date: '2025-12-05',
    modified: '2025-12-05T11:00:00Z',
    added: '2025-12-06T09:00:00Z',
    archive_serial_number: null,
    original_file_name: 'internet_bill_dec_2025.pdf',
    archived_file_name: null,
    owner: 1,
    notes: [],
    deleted_at: '2026-01-01T09:00:00Z',
    is_shared_by_requester: false,
    mime_type: 'application/pdf',
    page_count: 1,
    user_can_change: true,
    custom_fields: [],
  },
];

const demoNotes: Record<number, DocumentNote[]> = {
  1: [
    {
      id: 1,
      note: 'Paid on 2025-11-25 via bank transfer.',
      created: '2025-11-25T16:00:00Z',
      document: 1,
      user: 1,
    },
  ],
  4: [
    {
      id: 2,
      note: 'Confirmed refund received on 2025-06-12.',
      created: '2025-06-12T10:00:00Z',
      document: 4,
      user: 1,
    },
  ],
};

/* ------------------------------------------------------------------ */
/*  Users / Groups                                                     */
/* ------------------------------------------------------------------ */

export const demoGroups: Group[] = [
  {
    id: 1,
    name: 'Administrators',
    permissions: [
      'view_document',
      'change_document',
      'delete_document',
      'add_document',
      'view_workflow',
      'change_workflow',
      'delete_workflow',
      'add_workflow',
      'view_user',
      'change_user',
      'add_user',
      'delete_user',
      'view_group',
      'change_group',
      'add_group',
      'delete_group',
    ],
  },
  {
    id: 2,
    name: 'Accounting',
    permissions: ['view_document', 'change_document', 'add_document', 'view_tag', 'view_workflow'],
  },
  {
    id: 3,
    name: 'Read Only',
    permissions: ['view_document', 'view_tag', 'view_correspondent', 'view_documenttype'],
  },
];

export const demoUsers: User[] = [
  {
    id: 1,
    username: 'demo',
    email: 'demo@paperless.example',
    first_name: 'Demo',
    last_name: 'User',
    is_active: true,
    is_superuser: true,
    is_staff: true,
    is_mfa_enabled: false,
    date_joined: '2025-01-01T08:00:00Z',
    last_login: '2026-04-01T12:00:00Z',
    groups: [1],
    inherited_permissions: demoGroups[0].permissions,
    user_permissions: [],
  },
  {
    id: 2,
    username: 'jane.manager',
    email: 'jane.manager@paperless.example',
    first_name: 'Jane',
    last_name: 'Manager',
    is_active: true,
    is_superuser: false,
    is_staff: true,
    is_mfa_enabled: true,
    date_joined: '2025-06-10T09:30:00Z',
    last_login: '2026-03-30T09:15:00Z',
    groups: [2],
    inherited_permissions: demoGroups[1].permissions,
    user_permissions: ['change_workflow'],
  },
  {
    id: 3,
    username: 'viewer',
    email: 'viewer@paperless.example',
    first_name: 'Read',
    last_name: 'Only',
    is_active: true,
    is_superuser: false,
    is_staff: false,
    is_mfa_enabled: false,
    date_joined: '2025-10-05T14:20:00Z',
    last_login: '2026-03-28T16:00:00Z',
    groups: [3],
    inherited_permissions: demoGroups[2].permissions,
    user_permissions: [],
  },
];

/* ------------------------------------------------------------------ */
/*  Storage Paths / Custom Fields                                      */
/* ------------------------------------------------------------------ */

export const demoStoragePaths: StoragePath[] = [
  {
    id: 1,
    name: 'Finance/Invoices',
    path: 'consume/finance/invoices',
    match: 'invoice',
    matching_algorithm: 3,
    is_insensitive: true,
    document_count: 4,
    owner: 1,
    user_can_change: true,
    slug: 'finance-invoices',
  },
  {
    id: 2,
    name: 'Insurance',
    path: 'consume/insurance',
    match: 'insurance',
    matching_algorithm: 3,
    is_insensitive: true,
    document_count: 2,
    owner: 1,
    user_can_change: true,
    slug: 'insurance',
  },
  {
    id: 3,
    name: 'Utilities',
    path: 'consume/utilities',
    match: 'bill',
    matching_algorithm: 5,
    is_insensitive: true,
    document_count: 2,
    owner: 1,
    user_can_change: true,
    slug: 'utilities',
  },
];

export const demoCustomFields: CustomField[] = [
  {
    id: 1,
    name: 'Invoice Number',
    data_type: 'string',
    extra_data: null,
    document_count: 3,
  },
  {
    id: 2,
    name: 'Due Date',
    data_type: 'date',
    extra_data: null,
    document_count: 2,
  },
  {
    id: 3,
    name: 'Payment Status',
    data_type: 'select',
    extra_data: {
      select_options: [
        { id: 'pending', label: 'Pending' },
        { id: 'paid', label: 'Paid' },
        { id: 'overdue', label: 'Overdue' },
      ],
      default_currency: null,
    },
    document_count: 4,
  },
];

/* ------------------------------------------------------------------ */
/*  Workflows                                                          */
/* ------------------------------------------------------------------ */

export const demoWorkflows: Workflow[] = [
  {
    id: 1,
    name: 'Auto Tag Invoices',
    order: 10,
    enabled: true,
    triggers: [
      {
        id: 11,
        sources: [],
        type: 2,
        filter_path: '*',
        filter_filename: '*invoice*',
        filter_mailrule: null,
        matching_algorithm: 3,
        match: 'invoice',
        is_insensitive: true,
        filter_has_tags: [],
        filter_has_all_tags: [],
        filter_has_not_tags: [],
        filter_custom_field_query: null,
        filter_has_not_correspondents: [],
        filter_has_not_document_types: [],
        filter_has_not_storage_paths: [],
        filter_has_correspondent: null,
        filter_has_document_type: 1,
        filter_has_storage_path: 1,
        schedule_offset_days: 0,
        schedule_is_recurring: false,
        schedule_recurring_interval_days: 1,
        schedule_date_field: 'added',
        schedule_date_custom_field: null,
      },
    ],
    actions: [
      {
        id: 101,
        type: 1,
        assign_title: '{{correspondent}} - {{created_year}} Invoice',
        assign_tags: [1],
        assign_correspondent: 1,
        assign_document_type: 1,
        assign_storage_path: 1,
        assign_owner: 1,
        assign_view_users: [],
        assign_view_groups: [2],
        assign_change_users: [1],
        assign_change_groups: [],
        assign_custom_fields: [1, 2],
        assign_custom_fields_values: {
          1: 'AUTO',
        },
        remove_all_tags: false,
        remove_tags: [],
        remove_all_correspondents: false,
        remove_correspondents: [],
        remove_all_document_types: false,
        remove_document_types: [],
        remove_all_storage_paths: false,
        remove_storage_paths: [],
        remove_custom_fields: [],
        remove_all_custom_fields: false,
        remove_all_owners: false,
        remove_owners: [],
        remove_all_permissions: false,
        remove_view_users: [],
        remove_view_groups: [],
        remove_change_users: [],
        remove_change_groups: [],
        email: null,
        webhook: null,
      },
    ],
  },
  {
    id: 2,
    name: 'Cleanup Inbox Tags',
    order: 20,
    enabled: true,
    triggers: [
      {
        id: 12,
        sources: [],
        type: 4,
        filter_path: '*',
        filter_filename: '',
        filter_mailrule: null,
        matching_algorithm: 0,
        match: '',
        is_insensitive: true,
        filter_has_tags: [5],
        filter_has_all_tags: [],
        filter_has_not_tags: [],
        filter_custom_field_query: null,
        filter_has_not_correspondents: [],
        filter_has_not_document_types: [],
        filter_has_not_storage_paths: [],
        filter_has_correspondent: null,
        filter_has_document_type: null,
        filter_has_storage_path: null,
        schedule_offset_days: 7,
        schedule_is_recurring: true,
        schedule_recurring_interval_days: 7,
        schedule_date_field: 'added',
        schedule_date_custom_field: null,
      },
    ],
    actions: [
      {
        id: 102,
        type: 2,
        assign_title: '',
        assign_tags: [],
        assign_correspondent: null,
        assign_document_type: null,
        assign_storage_path: null,
        assign_owner: null,
        assign_view_users: [],
        assign_view_groups: [],
        assign_change_users: [],
        assign_change_groups: [],
        assign_custom_fields: [],
        assign_custom_fields_values: {},
        remove_all_tags: false,
        remove_tags: [5],
        remove_all_correspondents: false,
        remove_correspondents: [],
        remove_all_document_types: false,
        remove_document_types: [],
        remove_all_storage_paths: false,
        remove_storage_paths: [],
        remove_custom_fields: [],
        remove_all_custom_fields: false,
        remove_all_owners: false,
        remove_owners: [],
        remove_all_permissions: false,
        remove_view_users: [],
        remove_view_groups: [],
        remove_change_users: [],
        remove_change_groups: [],
        email: null,
        webhook: null,
      },
    ],
  },
];

/* ------------------------------------------------------------------ */
/*  Statistics                                                         */
/* ------------------------------------------------------------------ */

export const demoStatistics: Statistics = {
  documents_total: baseDocs.length,
  documents_inbox: baseDocs.filter((d) => d.tags.includes(5)).length,
  inbox_tags: [5],
  document_file_type_counts: [
    { mime_type: 'application/pdf', mime_type_count: 8 },
    { mime_type: 'image/jpeg', mime_type_count: 2 },
  ],
  character_count: baseDocs.reduce((sum, d) => sum + d.content.length, 0),
  tag_count: demoTags.length,
  correspondent_count: demoCorrespondents.length,
  document_type_count: demoDocumentTypes.length,
  current_asn: 1009,
  inbox_tag: 2,
  storage_path_count: demoStoragePaths.length,
};

export const demoLogs: Record<string, string[]> = {
  paperless: [
    '[2026-04-09 08:00:01] [INFO] Starting paperless-ngx services',
    '[2026-04-09 08:00:03] [INFO] Connected to PostgreSQL database',
    '[2026-04-09 08:00:04] [INFO] Loaded 2 workflow definitions',
    '[2026-04-09 08:00:08] [INFO] Consumer queue is ready',
    '[2026-04-09 08:02:17] [INFO] Processed document 1007: car_insurance_statement.pdf',
    '[2026-04-09 08:02:18] [INFO] OCR completed in 1.9s for document 1007',
    '[2026-04-09 08:05:42] [WARNING] Tag matcher fallback used for document 1008',
    '[2026-04-09 08:06:10] [INFO] Scheduled task cleanup_inbox_tags queued',
  ],
  worker: [
    '[2026-04-09 08:00:02] [INFO] Celery worker ready: concurrency=4',
    '[2026-04-09 08:01:11] [INFO] Received task: documents.tasks.consume_file',
    '[2026-04-09 08:01:14] [INFO] Task succeeded: documents.tasks.consume_file (2.7s)',
    '[2026-04-09 08:03:55] [INFO] Received task: documents.tasks.index_document',
    '[2026-04-09 08:03:56] [INFO] Task succeeded: documents.tasks.index_document (0.9s)',
    '[2026-04-09 08:07:20] [WARNING] Retry requested for task workflows.tasks.run',
    '[2026-04-09 08:07:23] [INFO] Task succeeded: workflows.tasks.run (2.1s)',
  ],
  audit: [
    '[2026-04-09 08:00:10] [INFO] User demo authenticated from 127.0.0.1',
    '[2026-04-09 08:02:24] [INFO] User demo viewed document 1004',
    '[2026-04-09 08:04:49] [INFO] User demo updated tags for document 1002',
    '[2026-04-09 08:06:55] [INFO] User demo opened manage/logs screen',
  ],
};

/* ------------------------------------------------------------------ */
/*  Helper: paginate an array                                          */
/* ------------------------------------------------------------------ */

function paginate<T>(items: T[], page: number, pageSize: number): PaginatedResponse<T> {
  const start = (page - 1) * pageSize;
  const results = items.slice(start, start + pageSize);
  return {
    count: items.length,
    next: start + pageSize < items.length ? 'next' : null,
    previous: page > 1 ? 'prev' : null,
    results,
  };
}

/* ------------------------------------------------------------------ */
/*  Route matcher                                                      */
/* ------------------------------------------------------------------ */

export interface DemoResponse {
  status: number;
  data: unknown;
}

/**
 * Given a request config (method + url + params), return a mock response
 * or `null` if the route is not handled.
 */
export function matchDemoRoute(
  method: string,
  url: string,
  params?: Record<string, unknown>,
): DemoResponse | null {
  const m = method.toUpperCase();
  const path = url.replace(/^https?:\/\/[^/]+/, ''); // strip origin

  /* ---- Token / Auth ---- */
  if (path === '/api/token/' && m === 'POST') {
    return { status: 200, data: { token: 'demo-token' } };
  }

  /* ---- Statistics ---- */
  if (path === '/api/statistics/' && m === 'GET') {
    return { status: 200, data: demoStatistics };
  }

  /* ---- Documents list ---- */
  if (path === '/api/documents/' && m === 'GET') {
    const page = Number(params?.page ?? 1);
    const pageSize = Number(params?.page_size ?? 25);
    let docs = [...baseDocs];

    // simple search filter
    const query = (params?.query as string) ?? '';
    if (query) {
      const q = query.toLowerCase();
      docs = docs.filter(
        (d) => d.title.toLowerCase().includes(q) || d.content.toLowerCase().includes(q),
      );
    }

    // correspondent filter
    if (params?.correspondent__id) {
      const cid = Number(params.correspondent__id);
      docs = docs.filter((d) => d.correspondent === cid);
    }

    // document type filter
    if (params?.document_type__id) {
      const dtid = Number(params.document_type__id);
      docs = docs.filter((d) => d.document_type === dtid);
    }

    // tags filter
    if (params?.tags__id__all) {
      const tagIds = String(params.tags__id__all).split(',').map(Number);
      docs = docs.filter((d) => tagIds.every((tid) => d.tags.includes(tid)));
    }

    // inbox filter
    if (params?.is_in_inbox === true || params?.is_in_inbox === 'true') {
      docs = docs.filter((d) => d.tags.includes(5));
    }

    // ordering
    const ordering = (params?.ordering as string) ?? '-created';
    const desc = ordering.startsWith('-');
    const field = ordering.replace(/^-/, '');
    docs.sort((a, b) => {
      const av = (a as unknown as Record<string, unknown>)[field] ?? '';
      const bv = (b as unknown as Record<string, unknown>)[field] ?? '';
      const cmp = String(av).localeCompare(String(bv));
      return desc ? -cmp : cmp;
    });

    return { status: 200, data: paginate(docs, page, pageSize) };
  }

  /* ---- Single document ---- */
  const docMatch = path.match(/^\/api\/documents\/(\d+)\/$/);
  if (docMatch && m === 'GET') {
    const doc = baseDocs.find((d) => d.id === Number(docMatch[1]));
    return doc ? { status: 200, data: doc } : { status: 404, data: { detail: 'Not found.' } };
  }

  /* ---- Document notes ---- */
  const notesMatch = path.match(/^\/api\/documents\/(\d+)\/notes\/$/);
  if (notesMatch && m === 'GET') {
    return { status: 200, data: demoNotes[Number(notesMatch[1])] ?? [] };
  }
  if (notesMatch && m === 'POST') {
    const newNote: DocumentNote = {
      id: Date.now(),
      note: 'Demo note (not persisted)',
      created: new Date().toISOString(),
      document: Number(notesMatch[1]),
      user: 1,
    };
    return { status: 201, data: newNote };
  }

  /* ---- Document metadata / suggestions ---- */
  const metaMatch = path.match(/^\/api\/documents\/(\d+)\/metadata\/$/);
  if (metaMatch && m === 'GET') {
    return {
      status: 200,
      data: {
        original_checksum: 'abc123demo',
        original_size: 204800,
        original_mime_type: 'application/pdf',
        media_filename: `document_${metaMatch[1]}.pdf`,
        has_archive_version: false,
        original_metadata: [],
        archive_metadata: [],
      },
    };
  }

  const suggestMatch = path.match(/^\/api\/documents\/(\d+)\/suggestions\/$/);
  if (suggestMatch && m === 'GET') {
    return {
      status: 200,
      data: {
        correspondents: [1],
        tags: [1, 2],
        document_types: [1],
      },
    };
  }

  /* ---- Document thumb / preview / download → small placeholder ---- */
  const thumbMatch = path.match(/^\/api\/documents\/\d+\/thumb\/$/);
  if (thumbMatch && m === 'GET') {
    // Return a tiny 1×1 grey PNG as a placeholder
    return { status: 200, data: PLACEHOLDER_PNG_BYTES };
  }

  const previewMatch = path.match(/^\/api\/documents\/\d+\/(preview|download)\/$/);
  if (previewMatch && m === 'GET') {
    // Return minimal placeholder for preview
    return { status: 200, data: PLACEHOLDER_PNG_BYTES };
  }

  /* ---- Document update (PATCH) ---- */
  const patchDocMatch = path.match(/^\/api\/documents\/(\d+)\/$/);
  if (patchDocMatch && m === 'PATCH') {
    const doc = baseDocs.find((d) => d.id === Number(patchDocMatch[1]));
    return doc ? { status: 200, data: doc } : { status: 404, data: { detail: 'Not found.' } };
  }

  /* ---- Document delete ---- */
  const delDocMatch = path.match(/^\/api\/documents\/(\d+)\/$/);
  if (delDocMatch && m === 'DELETE') {
    return { status: 204, data: null };
  }

  /* ---- Upload ---- */
  if (path === '/api/documents/post_document/' && m === 'POST') {
    return { status: 200, data: 'demo-task-id' };
  }

  /* ---- Next ASN ---- */
  if (path === '/api/documents/next_asn/' && m === 'GET') {
    return { status: 200, data: demoStatistics.current_asn };
  }

  /* ---- Search autocomplete ---- */
  if (path === '/api/search/autocomplete/' && m === 'GET') {
    return { status: 200, data: ['invoice', 'insurance', 'internet'] };
  }

  /* ---- Logs ---- */
  if (path === '/api/logs/' && m === 'GET') {
    return { status: 200, data: Object.keys(demoLogs) };
  }

  const logMatch = path.match(/^\/api\/logs\/([^/]+)\/$/);
  if (logMatch && m === 'GET') {
    const logId = decodeURIComponent(logMatch[1]);
    const logLines = demoLogs[logId];
    if (!logLines) {
      return { status: 404, data: { detail: 'Not found.' } };
    }

    const limit = Number(params?.limit ?? 0);
    if (Number.isFinite(limit) && limit > 0) {
      return { status: 200, data: logLines.slice(-limit) };
    }

    return { status: 200, data: logLines };
  }

  /* ---- Tags ---- */
  if (path === '/api/tags/' && m === 'GET') {
    const page = Number(params?.page ?? 1);
    const pageSize = Number(params?.page_size ?? 100);
    return { status: 200, data: paginate(demoTags, page, pageSize) };
  }
  if (path === '/api/tags/' && m === 'POST') {
    return { status: 201, data: { ...demoTags[0], id: Date.now(), name: 'New Tag' } };
  }
  const tagMatch = path.match(/^\/api\/tags\/(\d+)\/$/);
  if (tagMatch && m === 'GET') {
    const tag = demoTags.find((t) => t.id === Number(tagMatch[1]));
    return tag ? { status: 200, data: tag } : { status: 404, data: { detail: 'Not found.' } };
  }
  if (tagMatch && m === 'PATCH') {
    const tag = demoTags.find((t) => t.id === Number(tagMatch[1]));
    return tag ? { status: 200, data: tag } : { status: 404, data: { detail: 'Not found.' } };
  }
  if (tagMatch && m === 'DELETE') {
    return { status: 204, data: null };
  }

  /* ---- Correspondents ---- */
  if (path === '/api/correspondents/' && m === 'GET') {
    const page = Number(params?.page ?? 1);
    const pageSize = Number(params?.page_size ?? 100);
    return { status: 200, data: paginate(demoCorrespondents, page, pageSize) };
  }
  if (path === '/api/correspondents/' && m === 'POST') {
    return {
      status: 201,
      data: { ...demoCorrespondents[0], id: Date.now(), name: 'New Correspondent' },
    };
  }
  const corrMatch = path.match(/^\/api\/correspondents\/(\d+)\/$/);
  if (corrMatch && m === 'GET') {
    const c = demoCorrespondents.find((c) => c.id === Number(corrMatch[1]));
    return c ? { status: 200, data: c } : { status: 404, data: { detail: 'Not found.' } };
  }
  if (corrMatch && m === 'PATCH') {
    const c = demoCorrespondents.find((c) => c.id === Number(corrMatch[1]));
    return c ? { status: 200, data: c } : { status: 404, data: { detail: 'Not found.' } };
  }
  if (corrMatch && m === 'DELETE') {
    return { status: 204, data: null };
  }

  /* ---- Document Types ---- */
  if (path === '/api/document_types/' && m === 'GET') {
    const page = Number(params?.page ?? 1);
    const pageSize = Number(params?.page_size ?? 100);
    return { status: 200, data: paginate(demoDocumentTypes, page, pageSize) };
  }
  if (path === '/api/document_types/' && m === 'POST') {
    return {
      status: 201,
      data: { ...demoDocumentTypes[0], id: Date.now(), name: 'New Type' },
    };
  }
  const dtMatch = path.match(/^\/api\/document_types\/(\d+)\/$/);
  if (dtMatch && m === 'GET') {
    const dt = demoDocumentTypes.find((d) => d.id === Number(dtMatch[1]));
    return dt ? { status: 200, data: dt } : { status: 404, data: { detail: 'Not found.' } };
  }
  if (dtMatch && m === 'PATCH') {
    const dt = demoDocumentTypes.find((d) => d.id === Number(dtMatch[1]));
    return dt ? { status: 200, data: dt } : { status: 404, data: { detail: 'Not found.' } };
  }
  if (dtMatch && m === 'DELETE') {
    return { status: 204, data: null };
  }

  /* ---- Users ---- */
  if (path === '/api/users/' && m === 'GET') {
    const page = Number(params?.page ?? 1);
    const pageSize = Number(params?.page_size ?? 100);
    const usernameQuery = String(params?.username ?? '')
      .trim()
      .toLowerCase();
    const users = usernameQuery
      ? demoUsers.filter((u) => u.username.toLowerCase() === usernameQuery)
      : demoUsers;
    return { status: 200, data: paginate(users, page, pageSize) };
  }
  if (path === '/api/users/' && m === 'POST') {
    return { status: 201, data: { ...demoUsers[0], id: Date.now(), username: 'new-user' } };
  }
  const userMatch = path.match(/^\/api\/users\/(\d+)\/$/);
  if (userMatch && m === 'GET') {
    const user = demoUsers.find((u) => u.id === Number(userMatch[1]));
    return user ? { status: 200, data: user } : { status: 404, data: { detail: 'Not found.' } };
  }
  if (userMatch && m === 'PATCH') {
    const user = demoUsers.find((u) => u.id === Number(userMatch[1]));
    return user ? { status: 200, data: user } : { status: 404, data: { detail: 'Not found.' } };
  }
  if (userMatch && m === 'DELETE') {
    return { status: 204, data: null };
  }

  /* ---- Groups ---- */
  if (path === '/api/groups/' && m === 'GET') {
    const page = Number(params?.page ?? 1);
    const pageSize = Number(params?.page_size ?? 100);
    return { status: 200, data: paginate(demoGroups, page, pageSize) };
  }
  if (path === '/api/groups/' && m === 'POST') {
    return { status: 201, data: { ...demoGroups[0], id: Date.now(), name: 'New Group' } };
  }
  const groupMatch = path.match(/^\/api\/groups\/(\d+)\/$/);
  if (groupMatch && m === 'GET') {
    const group = demoGroups.find((g) => g.id === Number(groupMatch[1]));
    return group ? { status: 200, data: group } : { status: 404, data: { detail: 'Not found.' } };
  }
  if (groupMatch && m === 'PATCH') {
    const group = demoGroups.find((g) => g.id === Number(groupMatch[1]));
    return group ? { status: 200, data: group } : { status: 404, data: { detail: 'Not found.' } };
  }
  if (groupMatch && m === 'DELETE') {
    return { status: 204, data: null };
  }

  /* ---- Storage Paths ---- */
  if (path === '/api/storage_paths/' && m === 'GET') {
    const page = Number(params?.page ?? 1);
    const pageSize = Number(params?.page_size ?? 100);
    return { status: 200, data: paginate(demoStoragePaths, page, pageSize) };
  }
  if (path === '/api/storage_paths/' && m === 'POST') {
    return {
      status: 201,
      data: {
        ...demoStoragePaths[0],
        id: Date.now(),
        name: 'New Storage Path',
        path: 'consume/new-path',
        slug: 'new-storage-path',
      },
    };
  }
  const storagePathMatch = path.match(/^\/api\/storage_paths\/(\d+)\/$/);
  if (storagePathMatch && m === 'GET') {
    const sp = demoStoragePaths.find((s) => s.id === Number(storagePathMatch[1]));
    return sp ? { status: 200, data: sp } : { status: 404, data: { detail: 'Not found.' } };
  }
  if (storagePathMatch && m === 'PATCH') {
    const sp = demoStoragePaths.find((s) => s.id === Number(storagePathMatch[1]));
    return sp ? { status: 200, data: sp } : { status: 404, data: { detail: 'Not found.' } };
  }
  if (storagePathMatch && m === 'DELETE') {
    return { status: 204, data: null };
  }

  /* ---- Custom Fields ---- */
  if (path === '/api/custom_fields/' && m === 'GET') {
    const page = Number(params?.page ?? 1);
    const pageSize = Number(params?.page_size ?? 100);
    return { status: 200, data: paginate(demoCustomFields, page, pageSize) };
  }
  if (path === '/api/custom_fields/' && m === 'POST') {
    return {
      status: 201,
      data: {
        ...demoCustomFields[0],
        id: Date.now(),
        name: 'New Custom Field',
      },
    };
  }
  const customFieldMatch = path.match(/^\/api\/custom_fields\/(\d+)\/$/);
  if (customFieldMatch && m === 'GET') {
    const cf = demoCustomFields.find((c) => c.id === Number(customFieldMatch[1]));
    return cf ? { status: 200, data: cf } : { status: 404, data: { detail: 'Not found.' } };
  }
  if (customFieldMatch && m === 'PATCH') {
    const cf = demoCustomFields.find((c) => c.id === Number(customFieldMatch[1]));
    return cf ? { status: 200, data: cf } : { status: 404, data: { detail: 'Not found.' } };
  }
  if (customFieldMatch && m === 'DELETE') {
    return { status: 204, data: null };
  }

  /* ---- Workflows ---- */
  if (path === '/api/workflows/' && m === 'GET') {
    const page = Number(params?.page ?? 1);
    const pageSize = Number(params?.page_size ?? 100);
    return { status: 200, data: paginate(demoWorkflows, page, pageSize) };
  }
  if (path === '/api/workflows/' && m === 'POST') {
    return {
      status: 201,
      data: {
        ...demoWorkflows[0],
        id: Date.now(),
        name: 'New Workflow',
      },
    };
  }
  const workflowMatch = path.match(/^\/api\/workflows\/(\d+)\/$/);
  if (workflowMatch && m === 'GET') {
    const workflow = demoWorkflows.find((w) => w.id === Number(workflowMatch[1]));
    return workflow
      ? { status: 200, data: workflow }
      : { status: 404, data: { detail: 'Not found.' } };
  }
  if (workflowMatch && m === 'PATCH') {
    const workflow = demoWorkflows.find((w) => w.id === Number(workflowMatch[1]));
    return workflow
      ? { status: 200, data: workflow }
      : { status: 404, data: { detail: 'Not found.' } };
  }
  if (workflowMatch && m === 'DELETE') {
    return { status: 204, data: null };
  }

  /* ---- Trash Bin ---- */
  if (path === '/api/trash/' && m === 'GET') {
    const trashedDocs = baseDocs.filter((d) => !!d.deleted_at);
    const page = Number(params?.page ?? 1);
    const pageSize = Number(params?.page_size ?? 100);
    return { status: 200, data: paginate(trashedDocs, page, pageSize) };
  }
  if (path === '/api/trash/' && m === 'POST') {
    return { status: 200, data: null };
  }

  const reprocessDocMatch = path.match(/^\/api\/documents\/(\d+)\/reprocess\/$/);
  if (reprocessDocMatch && m === 'POST') {
    return { status: 200, data: 'demo-reprocess-task-id' };
  }

  /* ---- Tasks ---- */
  if (path === '/api/tasks/' && m === 'GET') {
    const tasks: TaskStatus[] = [];
    return { status: 200, data: tasks };
  }
  if (path === '/api/tasks/acknowledge/' && m === 'POST') {
    return { status: 200, data: null };
  }

  return null;
}

/** A 1×1 transparent PNG as a Uint8Array – used as image placeholder. */
const PLACEHOLDER_PNG_BYTES = new Uint8Array([
  0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00, 0x00, 0x00, 0x0d, 0x49, 0x48, 0x44, 0x52,
  0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01, 0x08, 0x02, 0x00, 0x00, 0x00, 0x90, 0x77, 0x53,
  0xde, 0x00, 0x00, 0x00, 0x0c, 0x49, 0x44, 0x41, 0x54, 0x08, 0xd7, 0x63, 0xd8, 0xd8, 0xd8, 0x00,
  0x00, 0x00, 0x04, 0x00, 0x01, 0xf6, 0x17, 0x8e, 0x4b, 0x00, 0x00, 0x00, 0x00, 0x49, 0x45, 0x4e,
  0x44, 0xae, 0x42, 0x60, 0x82,
]);
