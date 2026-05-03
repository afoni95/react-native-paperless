import { useLayoutEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { useNetworkStore, NetworkStatus } from '@/store/networkStore';
import React from 'react';

export function useOfflineNavigationTitle(title: string) {
  const navigation = useNavigation();
  const { status } = useNetworkStore();
  const theme = useTheme();
  const { t } = useTranslation();

  useLayoutEffect(() => {
    if (status !== NetworkStatus.Online) {
      navigation.setOptions({
        headerTitle: () => (
          <View style={styles.headerContainer}>
            <Text variant="titleMedium" style={{ color: theme.colors.onSurface }}>
              {title}
            </Text>
            <Text
              variant="labelSmall"
              style={{ color: theme.colors.error, fontWeight: '700', letterSpacing: 0.8 }}
            >
              {t('common.offlineMode')}
            </Text>
          </View>
        ),
      });
    } else {
      navigation.setOptions({ headerTitle: title });
    }
  }, [status, title, navigation, theme, t]);
}

const styles = StyleSheet.create({
  headerContainer: {
    alignItems: 'center',
  },
});
