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
  const allowed = permission ? has(permission) : action && resource ? can(action, resource) : false;

  return <>{allowed ? children : fallback}</>;
};

export default HasPermission;
