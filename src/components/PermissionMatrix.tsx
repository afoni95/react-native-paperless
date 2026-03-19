import React from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { DataTable, Checkbox, Text, useTheme } from 'react-native-paper';
import type { PermissionAction, PermissionResource } from '@/utils/permissions';
import { PERMISSION_ACTIONS, PERMISSION_RESOURCES, buildPermissionName } from '@/utils/permissions';
import { t } from 'i18next';

interface PermissionMatrixProps {
  selectedPermissions: string[];
  onPermissionsChange: (permissions: string[]) => void;
  disabled?: boolean;
}

export const PermissionMatrix: React.FC<PermissionMatrixProps> = ({
  selectedPermissions,
  onPermissionsChange,
  disabled = false,
}) => {
  const theme = useTheme();

  const isPermissionSelected = (
    resource: PermissionResource,
    action: PermissionAction,
  ): boolean => {
    const permissionName = buildPermissionName(action, resource);
    return selectedPermissions.includes(permissionName);
  };

  const handlePermissionToggle = (resource: PermissionResource, action: PermissionAction) => {
    const permissionName = buildPermissionName(action, resource);
    const newPermissions = isPermissionSelected(resource, action)
      ? selectedPermissions.filter((p) => p !== permissionName)
      : [...selectedPermissions, permissionName];
    onPermissionsChange(newPermissions);
  };

  return (
    <ScrollView horizontal style={styles.horizontalScroll}>
      <DataTable style={[styles.table, { backgroundColor: theme.colors.surface }]}>
        <DataTable.Header style={{ backgroundColor: theme.colors.surfaceVariant }}>
          <DataTable.Title style={styles.resourceColumn}>
            <Text
              variant="labelMedium"
              style={{ fontWeight: 'bold' }}
              numberOfLines={2}
              ellipsizeMode="middle"
            >
              {t('permissionMatrix.title')}
            </Text>
          </DataTable.Title>
          {PERMISSION_ACTIONS.map((action) => (
            <DataTable.Title
              key={action}
              style={styles.actionColumn}
              textStyle={{ textAlign: 'center' }}
            >
              <Text variant="labelSmall" style={{ fontWeight: 'bold' }}>
                {t('permissionMatrix.actions.' + action)}
              </Text>
            </DataTable.Title>
          ))}
        </DataTable.Header>

        {PERMISSION_RESOURCES.map((resource) => (
          <DataTable.Row
            key={resource}
            style={{
              backgroundColor: selectedPermissions.some((p) => p.includes(resource))
                ? theme.colors.primaryContainer
                : theme.colors.surface,
            }}
          >
            <DataTable.Cell style={styles.resourceColumn}>
              <Text variant="labelSmall" numberOfLines={2} ellipsizeMode="middle">
                {t(`permissionMatrix.resources.${resource}`)}
              </Text>
            </DataTable.Cell>
            {PERMISSION_ACTIONS.map((action) => (
              <DataTable.Cell
                key={action}
                style={styles.actionColumn}
                textStyle={{ justifyContent: 'center' }}
              >
                <Checkbox
                  status={isPermissionSelected(resource, action) ? 'checked' : 'unchecked'}
                  onPress={() => handlePermissionToggle(resource, action)}
                  disabled={disabled}
                />
              </DataTable.Cell>
            ))}
          </DataTable.Row>
        ))}
      </DataTable>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  horizontalScroll: {
    flexGrow: 0,
  },
  table: {
    marginVertical: 10,
  },
  resourceColumn: {
    width: 90,
    minWidth: 90,
    maxWidth: 90,
    overflow: 'hidden',
  },
  actionColumn: {
    flex: 1,
    minWidth: 70,
    justifyContent: 'center',
  },
});
