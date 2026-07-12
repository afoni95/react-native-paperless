import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { List, Divider, useTheme, RadioButton } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import { useSettingsStore } from '@/store/settingsStore';
import { themes, themeOrder } from '@/theme';
import type { Language } from '@/types';
import { ThemePreviewCard } from './ThemePreviewCard';

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
        <View style={styles.grid}>
          <View style={styles.cell}>
            <ThemePreviewCard
              label={t('common.themeSystem')}
              swatches={themes.bright.swatches}
              darkSwatches={{
                primary: themes.dark.swatches.primary,
                background: themes.dark.swatches.background,
              }}
              selected={themeMode === 'auto'}
              onPress={() => setTheme('auto')}
            />
          </View>
          {themeOrder.map((name) => (
            <View key={name} style={styles.cell}>
              <ThemePreviewCard
                label={t(themes[name].labelKey)}
                swatches={themes[name].swatches}
                selected={themeMode === name}
                onPress={() => setTheme(name)}
              />
            </View>
          ))}
        </View>
      </List.Section>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    paddingHorizontal: 16,
  },
  cell: {
    width: '47%',
  },
});
