import React from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { TextInput, Button, useTheme, Text } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import { useNavigation, useRoute, useFocusEffect } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import type { ManageStackParamList } from '@/navigation/types';
import { useGroup, useUpsertGroup } from '@/reactQuery';
import { PermissionMatrix } from '@/components';

type NavigationProp = NativeStackNavigationProp<ManageStackParamList, 'GroupEdit'>;

type RouteProp = NativeStackScreenProps<ManageStackParamList, 'GroupEdit'>['route'];

export const GroupEditScreen: React.FC = () => {
  const { t } = useTranslation();
  const theme = useTheme();
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RouteProp>();
  const groupId = route.params?.groupId as number | undefined;
  const { data, isLoading, refetch } = useGroup(groupId ?? 0);
  const upsert = useUpsertGroup();
  const [name, setName] = React.useState('');
  const [permissions, setPermissions] = React.useState<string[]>([]);

  useFocusEffect(
    React.useCallback(() => {
      if (groupId) {
        refetch();
      }
    }, [groupId, refetch]),
  );

  React.useEffect(() => {
    if (data) {
      setName(data.name);
      setPermissions(data.permissions || []);
    }
  }, [data]);

  const handleSave = () => {
    upsert.mutate(
      {
        id: groupId,
        data: { name, permissions },
      },
      {
        onSuccess: () => navigation.goBack(),
      },
    );
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.contentContainer}>
        <TextInput
          label={t('Group Name')}
          value={name}
          onChangeText={setName}
          style={styles.input}
          disabled={isLoading || upsert.isPending}
          mode="outlined"
        />

        <Text
          variant="labelLarge"
          style={{ color: theme.colors.onSurface, marginBottom: 16, marginTop: 16 }}
        >
          {t('manage.permissions') || 'Permissions'}
        </Text>
        <PermissionMatrix
          selectedPermissions={permissions}
          onPermissionsChange={setPermissions}
          disabled={isLoading || upsert.isPending}
        />

        <Button
          mode="contained"
          style={styles.button}
          onPress={handleSave}
          loading={upsert.isPending}
          disabled={isLoading || upsert.isPending}
        >
          {t('common.save')}
        </Button>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  contentContainer: { padding: 16, paddingBottom: 32 },
  input: { marginBottom: 16 },
  button: { marginTop: 16 },
});
