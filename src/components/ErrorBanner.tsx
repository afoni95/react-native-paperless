import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Button, useTheme } from 'react-native-paper';
import { useTranslation } from 'react-i18next';

interface ErrorBannerProps {
  message?: string;
  onRetry?: () => void;
}

export const ErrorBanner: React.FC<ErrorBannerProps> = ({ message, onRetry }) => {
  const theme = useTheme();
  const { t } = useTranslation();
  const resolvedMessage = message || t('common.error');

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.errorContainer }]}>
      <Text style={[styles.message, { color: theme.colors.onErrorContainer }]}>
        {resolvedMessage}
      </Text>
      {onRetry ? (
        <Button mode="text" onPress={onRetry} textColor={theme.colors.error}>
          {t('common.retry')}
        </Button>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  message: {
    flex: 1,
    fontSize: 14,
  },
});
