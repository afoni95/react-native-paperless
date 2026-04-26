import React from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { TextInput, Button, useTheme, Checkbox, Text, Chip } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import { useNavigation, useRoute, useFocusEffect } from '@react-navigation/native';
import type { RouteProp as NavRouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { ManageStackParamList } from '@/navigation/types';
import { useUser, useUpsertUser, useGroups } from '@/reactQuery';
import type { Group } from '@/api/groups';
import { PermissionMatrix, HasPermission } from '@/components';
import { screenStyles } from '@/theme/commonStyles';

type NavigationProp = NativeStackNavigationProp<ManageStackParamList, 'UserEdit'>;

type RouteProp = NavRouteProp<ManageStackParamList, 'UserEdit'>;

export const UserEditScreen: React.FC = () => {
  const { t } = useTranslation();
  const theme = useTheme();
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RouteProp>();
  const userId = route.params?.userId ?? 0;
  const { data, isLoading, refetch } = useUser(userId);
  const { data: groupsData } = useGroups();
  const upsert = useUpsertUser();

  const [username, setUsername] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [firstName, setFirstName] = React.useState('');
  const [lastName, setLastName] = React.useState('');
  const [isActive, setIsActive] = React.useState(true);
  const [isStaff, setIsStaff] = React.useState(false);
  const [isSuperuser, setIsSuperuser] = React.useState(false);
  const [selectedGroupIds, setSelectedGroupIds] = React.useState<number[]>([]);
  const [permissions, setPermissions] = React.useState<string[]>([]);

  useFocusEffect(
    React.useCallback(() => {
      if (userId) {
        refetch();
      }
    }, [userId, refetch]),
  );

  React.useEffect(() => {
    if (data) {
      setUsername(data.username);
      setEmail(data.email);
      setFirstName(data.first_name || '');
      setLastName(data.last_name || '');
      setIsActive(data.is_active ?? true);
      setIsStaff(data.is_staff ?? false);
      setIsSuperuser(data.is_superuser ?? false);
      setSelectedGroupIds(data.groups || []);
      setPermissions(data.user_permissions || []);
    }
  }, [data]);

  const handleSave = () => {
    upsert.mutate(
      {
        id: userId,
        data: {
          username,
          email,
          password: password || undefined,
          first_name: firstName || undefined,
          last_name: lastName || undefined,
          is_active: isActive,
          is_staff: isStaff,
          is_superuser: isSuperuser,
          groups: selectedGroupIds,
          user_permissions: permissions,
        },
      },
      {
        onSuccess: () => navigation.goBack(),
      },
    );
  };

  const handleGroupToggle = (groupId: number) => {
    if (selectedGroupIds.includes(groupId)) {
      setSelectedGroupIds(selectedGroupIds.filter((id) => id !== groupId));
    } else {
      setSelectedGroupIds([...selectedGroupIds, groupId]);
    }
  };

  const groups: Group[] = groupsData?.results || [];

  return (
    <ScrollView style={[screenStyles.container, { backgroundColor: theme.colors.background }]}>
      <View style={screenStyles.contentWithBottom}>
        <TextInput
          label={t('auth.username')}
          value={username}
          onChangeText={setUsername}
          style={styles.input}
          disabled={isLoading || upsert.isPending}
          mode="outlined"
        />
        <TextInput
          label={t('auth.password')}
          value={password}
          onChangeText={setPassword}
          style={styles.input}
          secureTextEntry
          disabled={isLoading || upsert.isPending}
          mode="outlined"
          placeholder={userId ? t('common.leave') : undefined}
        />
        <TextInput
          label={t('common.email')}
          value={email}
          onChangeText={setEmail}
          style={styles.input}
          keyboardType="email-address"
          disabled={isLoading || upsert.isPending}
          mode="outlined"
        />
        <TextInput
          label={t('manage.firstName')}
          value={firstName}
          onChangeText={setFirstName}
          style={styles.input}
          disabled={isLoading || upsert.isPending}
          mode="outlined"
        />
        <TextInput
          label={t('manage.lastName')}
          value={lastName}
          onChangeText={setLastName}
          style={styles.input}
          disabled={isLoading || upsert.isPending}
          mode="outlined"
        />

        <View style={styles.checkboxContainer}>
          <View style={styles.checkboxRow}>
            <Checkbox
              status={isActive ? 'checked' : 'unchecked'}
              onPress={() => setIsActive(!isActive)}
              disabled={isLoading || upsert.isPending}
            />
            <Text style={styles.checkboxLabel}>{t('manage.active')}</Text>
          </View>
          <View style={styles.checkboxRow}>
            <Checkbox
              status={isStaff ? 'checked' : 'unchecked'}
              onPress={() => setIsStaff(!isStaff)}
              disabled={isLoading || upsert.isPending}
            />
            <Text style={styles.checkboxLabel}>{t('manage.staff')}</Text>
          </View>
          <View style={styles.checkboxRow}>
            <Checkbox
              status={isSuperuser ? 'checked' : 'unchecked'}
              onPress={() => setIsSuperuser(!isSuperuser)}
              disabled={isLoading || upsert.isPending}
            />
            <Text style={styles.checkboxLabel}>{t('manage.superuser')}</Text>
          </View>
        </View>

        {groups.length > 0 && (
          <View style={styles.groupsContainer}>
            <Text variant="labelLarge" style={{ color: theme.colors.onSurface, marginBottom: 8 }}>
              {t('manage.groups')}
            </Text>
            <View style={styles.chipWrap}>
              {groups.map((group) => {
                const isSelected = selectedGroupIds.includes(group.id);
                return (
                  <Chip
                    key={group.id}
                    mode="flat"
                    selected={isSelected}
                    onPress={() => handleGroupToggle(group.id)}
                    disabled={isLoading || upsert.isPending}
                    style={{
                      backgroundColor: isSelected
                        ? theme.colors.primaryContainer
                        : theme.colors.surfaceVariant,
                      marginRight: 4,
                      marginBottom: 4,
                    }}
                    textStyle={{
                      color: isSelected
                        ? theme.colors.onPrimaryContainer
                        : theme.colors.onSurfaceVariant,
                      fontSize: 12,
                    }}
                  >
                    {group.name}
                  </Chip>
                );
              })}
            </View>
          </View>
        )}

        {!isSuperuser && (
          <>
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
          </>
        )}

        <HasPermission action={userId ? 'change' : 'add'} resource="user">
          <Button
            mode="contained"
            style={styles.button}
            onPress={handleSave}
            loading={upsert.isPending}
            disabled={isLoading || upsert.isPending}
          >
            {t('common.save')}
          </Button>
        </HasPermission>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  input: { marginBottom: 16 },
  checkboxContainer: { marginBottom: 16 },
  checkboxRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  checkboxLabel: { marginLeft: 8 },
  groupsContainer: { marginBottom: 16 },
  chipWrap: { flexDirection: 'row', flexWrap: 'wrap' },
  button: { marginTop: 16 },
});
