import React from 'react';
import type { ReactNode } from 'react';
import type { PermissionAction, PermissionResource } from '@/utils/permissions';
import { usePermissionContext } from '@/hooks/PermissionProvider';

interface HasPermissionProps {
  permission?: string;
  action?: PermissionAction;
  resource?: PermissionResource;
  fallback?: ReactNode;
  children?: ReactNode;
}

export const HasPermission: React.FC<HasPermissionProps> = ({
  permission,
  action,
  resource,
  fallback = null,
  children,
}) => {
  const { has, can } = usePermissionContext();
  let allowed = false;

  if (permission) {
    allowed = has(permission);
  } else if (action && resource) {
    allowed = can(action, resource);
  }

  return <>{allowed ? children : fallback}</>;
};

export default HasPermission;
