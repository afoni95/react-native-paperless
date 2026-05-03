import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { TextInput, Button, Text, useTheme, Snackbar } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import { useOfflineQueueStore } from '@/store/offlineQueueStore';

export const OfflineDocTypeCreateScreen: React.FC = () => {
  const theme = useTheme();
  const { t } = useTranslation();
  const navigation = useNavigation();
  const { addItem } = useOfflineQueueStore();

  const [name, setName] = useState('');
  const [snackbar, setSnackbar] = useState('');

  const handleSave = () => {
    if (!name.trim()) return;
    addItem({ type: 'documentType', data: { name: name.trim() } });
    setSnackbar(t('offline.createOffline'));
    setName('');
    setTimeout(() => navigation.goBack(), 1200);
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Text variant="bodySmall" style={[styles.badge, { color: theme.colors.error }]}>
        {t('common.offlineMode')}
      </Text>

      <TextInput
        label={t('documentTypes.name')}
        value={name}
        onChangeText={setName}
        mode="outlined"
        style={styles.input}
        autoFocus
      />

      <Button mode="contained" onPress={handleSave} disabled={!name.trim()} style={styles.button}>
        {t('offline.createOffline')}
      </Button>

      <Snackbar visible={!!snackbar} onDismiss={() => setSnackbar('')} duration={1000}>
        {snackbar}
      </Snackbar>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  badge: { fontWeight: '700', letterSpacing: 1, textAlign: 'center', marginBottom: 16 },
  input: { marginBottom: 16 },
  button: { marginTop: 8 },
});
