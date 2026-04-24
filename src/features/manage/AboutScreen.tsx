import React from 'react';
import { ScrollView, StyleSheet, Linking } from 'react-native';
import { List, Divider, useTheme } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import Constants from 'expo-constants';

export const AboutScreen: React.FC = () => {
  const theme = useTheme();
  const { t } = useTranslation();

  const version = Constants.expoConfig?.version ?? '—';
  const buildNumber =
    (Constants.expoConfig?.android?.versionCode as number | undefined)?.toString() ?? '—';

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <List.Section>
        <List.Item
          title={t('about.version')}
          description={`${version} (Build ${buildNumber})`}
          left={(props) => <List.Icon {...props} icon="information-outline" />}
        />
        <Divider />
        <List.Item
          title={t('about.sourcecode')}
          description="github.com/afoni95/react-native-paperless"
          left={(props) => <List.Icon {...props} icon="github" />}
          onPress={() => Linking.openURL('https://github.com/afoni95/react-native-paperless')}
        />
        <Divider />
        <List.Item
          title={t('about.license')}
          description="GPL-3.0 license"
          left={(props) => <List.Icon {...props} icon="scale-balance" />}
        />
        <Divider />
        <List.Item
          title={t('about.privacyPolicy')}
          left={(props) => <List.Icon {...props} icon="shield-account-outline" />}
          onPress={() =>
            Linking.openURL('https://afoni95.github.io/react-native-paperless/PRIVACY_POLICY')
          }
        />
      </List.Section>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
