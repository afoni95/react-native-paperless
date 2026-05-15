// Permission matrix for user/group management
// All permissions follow the pattern: action_resource

export const PERMISSION_RESOURCES = [
  'logentry',
  'group',
  'user',
  'correspondent',
  'customfield',
  'document',
  'documenttype',
  'note',
  'paperlesstask',
  'savedview',
  'sharelink',
  'storagepath',
  'tag',
  'uisettings',
  'workflow',
  'applicationconfiguration',
  'mailaccount',
  'mailrule',
  'processedmail',
] as const;

export type PermissionResource = (typeof PERMISSION_RESOURCES)[number];

export const PERMISSION_ACTIONS = ['add', 'change', 'delete', 'view'] as const;

export type PermissionAction = (typeof PERMISSION_ACTIONS)[number];

export const buildPermissionName = (
  action: PermissionAction,
  resource: PermissionResource,
): string => `${action}_${resource}`;

export const parsePermission = (
  permission: string,
): {
  action: PermissionAction;
  resource: PermissionResource;
} | null => {
  const parts = permission.split('_');
  if (parts.length < 2) return null;

  const action = parts[0];
  const resource = parts.slice(1).join('_');

  if (!PERMISSION_ACTIONS.includes(action as PermissionAction)) return null;
  if (!PERMISSION_RESOURCES.includes(resource as PermissionResource)) return null;

  return {
    action: action as PermissionAction,
    resource: resource as PermissionResource,
  };
};

export const getResourcePermissions = (
  permissions: string[],
  resource: PermissionResource,
): Record<PermissionAction, boolean> => ({
  add: permissions.includes(buildPermissionName('add', resource)),
  change: permissions.includes(buildPermissionName('change', resource)),
  delete: permissions.includes(buildPermissionName('delete', resource)),
  view: permissions.includes(buildPermissionName('view', resource)),
});
