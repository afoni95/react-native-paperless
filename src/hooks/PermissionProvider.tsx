import React from 'react';
import type { ReactNode } from 'react';
import type { User } from '@/types';
import type { PermissionAction, PermissionResource } from '@/utils/permissions';
import { usePermissions } from './usePermissions';

export type PermissionContextValue = {
  permissions: string[];
  has: (perm: string) => boolean;
  hasAny: (perms: string[]) => boolean;
  hasAll: (perms: string[]) => boolean;
  can: (action: PermissionAction, resource: PermissionResource) => boolean;
  getResourcePermissions: (resource: PermissionResource) => Record<PermissionAction, boolean>;
  ready: boolean;
};

const PermissionContext = React.createContext<PermissionContextValue | undefined>(undefined);

export const PermissionProvider: React.FC<{
  user?: User | null;
  permissions?: string[];
  children?: ReactNode;
}> = ({ user, permissions, children }) => {
  const grantAll = !user;

  const allGranted = React.useMemo<PermissionContextValue>(
    () => ({
      permissions: [],
      has: () => true,
      hasAny: () => true,
      hasAll: () => true,
      can: () => true,
      getResourcePermissions: () => ({ add: true, change: true, delete: true, view: true }),
      ready: true,
    }),
    [],
  );

  const perms = usePermissions(user ? { user } : permissions ? { permissions } : undefined);
  const value = React.useMemo(() => ({ ...perms, ready: true }), [perms]);

  return (
    <PermissionContext.Provider value={grantAll ? allGranted : value}>
      {children}
    </PermissionContext.Provider>
  );
};

export function usePermissionContext(): PermissionContextValue {
  const ctx = React.useContext(PermissionContext);
  if (!ctx) {
    return {
      permissions: [],
      has: () => false,
      hasAny: () => false,
      hasAll: () => false,
      can: () => false,
      getResourcePermissions: () => ({ add: false, change: false, delete: false, view: false }),
      ready: false,
    };
  }
  return ctx;
}
