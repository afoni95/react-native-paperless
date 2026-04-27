import React from 'react';
import type { User } from '@/types';
import {
  PERMISSION_ACTIONS,
  PERMISSION_RESOURCES,
  buildPermissionName,
  getResourcePermissions as getResourcePermissionsUtil,
} from '@/utils/permissions';
import type { PermissionAction, PermissionResource } from '@/utils/permissions';
import { useAuthStore } from '@/store/authStore';

const DEMO_PERMISSIONS = PERMISSION_RESOURCES.flatMap((resource) =>
  PERMISSION_ACTIONS.map((action) => buildPermissionName(action, resource)),
);

export type UsePermissionsOptions = {
  user?: User | null;
  permissions?: string[] | null;
};

export function usePermissions(options?: UsePermissionsOptions) {
  const isDemo = useAuthStore((state) => state.isDemo);
  const optPermissions = options?.permissions ?? null;
  const userUp = options?.user?.user_permissions ?? null;
  const userInh = options?.user?.inherited_permissions ?? null;

  const permissions = React.useMemo(() => {
    if (isDemo) return DEMO_PERMISSIONS;
    if (optPermissions) return optPermissions;
    if (userUp || userInh) {
      const up = userUp ?? [];
      const inh = userInh ?? [];
      return Array.from(new Set([...up, ...inh]));
    }
    return [] as string[];
  }, [isDemo, optPermissions, userUp, userInh]);

  const has = React.useCallback(
    (perm: string) => options?.user?.is_superuser || permissions.includes(perm),
    [permissions, options?.user],
  );

  const hasAny = React.useCallback(
    (perms: string[]) => options?.user?.is_superuser || perms.some((p) => permissions.includes(p)),
    [permissions, options?.user],
  );

  const hasAll = React.useCallback(
    (perms: string[]) => options?.user?.is_superuser || perms.every((p) => permissions.includes(p)),
    [permissions, options?.user],
  );

  const can = React.useCallback(
    (action: PermissionAction, resource: PermissionResource) =>
      options?.user?.is_superuser || permissions.includes(buildPermissionName(action, resource)),
    [permissions, options?.user],
  );

  const getResourcePermissions = React.useCallback(
    (resource: PermissionResource) =>
      options?.user?.is_superuser
        ? { add: true, change: true, delete: true, view: true }
        : getResourcePermissionsUtil(permissions, resource),
    [permissions, options?.user],
  );

  return { permissions, has, hasAny, hasAll, can, getResourcePermissions } as const;
}
