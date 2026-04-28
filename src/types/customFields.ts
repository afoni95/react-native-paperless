export interface CustomFieldSelectOption {
  id: string;
  label: string;
}

export interface CustomFieldExtraData {
  select_options: CustomFieldSelectOption[];
  default_currency: string | null;
}

export const CUSTOM_FIELD_DATA_TYPES = {
  string: 'string',
  longtext: 'longtext',
  url: 'url',
  date: 'date',
  boolean: 'boolean',
  integer: 'integer',
  float: 'float',
  monetary: 'monetary',
  documentlink: 'documentlink',
  select: 'select',
} as const;

export type CustomFieldDataType = keyof typeof CUSTOM_FIELD_DATA_TYPES;

export interface CustomField {
  id: number;
  name: string;
  data_type: CustomFieldDataType;
  extra_data: CustomFieldExtraData | null;
  document_count: number;
}
