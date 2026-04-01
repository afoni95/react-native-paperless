import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useTranslation } from 'react-i18next';

interface EmptyStateProps {
  message?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ message }) => {
  const theme = useTheme();
  const { t } = useTranslation();

  return (
    <View style={styles.container}>
      <MaterialCommunityIcons
        name="file-document-outline"
        size={64}
        color={theme.colors.onSurfaceVariant}
        style={{ marginBottom: 16 }}
      />
      <Text style={[styles.message, { color: theme.colors.onSurfaceVariant }]}>
        {message || t('common.noResults')}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  message: {
    fontSize: 16,
    textAlign: 'center',
  },
});
