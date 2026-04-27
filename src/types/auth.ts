export interface User {
  id: number;
  username: string;
  email: string;
  first_name?: string;
  last_name?: string;
  is_active: boolean;
  is_superuser: boolean;
  is_staff: boolean;
  is_mfa_enabled: boolean;
  date_joined: string;
  last_login?: string;
  groups: number[];
  inherited_permissions: string[];
  user_permissions: string[];
  password?: string;
}

export type UserPayload = Omit<
  User,
  'id' | 'date_joined' | 'last_login' | 'inherited_permissions' | 'is_mfa_enabled'
> & {
  password?: string;
};

export interface Group {
  id: number;
  name: string;
  permissions: string[];
}

export interface GroupPayload {
  name: string;
  permissions?: string[];
}

export interface TokenResponse {
  token: string;
}

export interface PaperlessApiError {
  non_field_errors?: string[];
  detail?: string;
}
