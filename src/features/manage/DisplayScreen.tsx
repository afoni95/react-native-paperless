import React from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { List, Divider, useTheme, RadioButton } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import { useSettingsStore } from '@/store/settingsStore';
import type { ThemeMode, Language } from '@/types';

export const DisplayScreen: React.FC = () => {
  const theme = useTheme();
  const { t } = useTranslation();
  const { theme: themeMode, language, setTheme, setLanguage } = useSettingsStore();

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <List.Section>
        <List.Subheader>{t('common.language')}</List.Subheader>
        <RadioButton.Group
          onValueChange={(value) => setLanguage(value as Language)}
          value={language}
        >
          <RadioButton.Item label="English" value="en" />
          <RadioButton.Item label="Deutsch" value="de" />
        </RadioButton.Group>
      </List.Section>

      <Divider />

      <List.Section>
        <List.Subheader>{t('common.theme')}</List.Subheader>
        <RadioButton.Group
          onValueChange={(value) => setTheme(value as ThemeMode)}
          value={themeMode}
        >
          <RadioButton.Item label={t('common.light')} value="light" />
          <RadioButton.Item label={t('common.dark')} value="dark" />
          <RadioButton.Item label={t('common.auto')} value="auto" />
        </RadioButton.Group>
      </List.Section>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
