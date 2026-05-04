import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { TextInput, Button, Text, useTheme, Snackbar } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import { useOfflineQueueStore } from '@/store/offlineQueueStore';

const TAG_COLORS = [
  '#e57373',
  '#f06292',
  '#ba68c8',
  '#7986cb',
  '#64b5f6',
  '#4dd0e1',
  '#81c784',
  '#dce775',
  '#ffb74d',
  '#a1887f',
];

export const OfflineTagCreateScreen: React.FC = () => {
  const theme = useTheme();
  const { t } = useTranslation();
  const navigation = useNavigation();
  const { addItem } = useOfflineQueueStore();

  const [name, setName] = useState('');
  const [color, setColor] = useState(TAG_COLORS[0]);
  const [snackbar, setSnackbar] = useState('');

  const handleSave = () => {
    if (!name.trim()) return;
    addItem({ type: 'tag', data: { name: name.trim(), color } });
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
        label={t('common.name')}
        value={name}
        onChangeText={setName}
        mode="outlined"
        style={styles.input}
        autoFocus
      />

      <Text variant="bodyMedium" style={styles.colorLabel}>
        {t('tags.color')}
      </Text>
      <View style={styles.colorRow}>
        {TAG_COLORS.map((c) => (
          <Button
            key={c}
            onPress={() => setColor(c)}
            style={[
              styles.colorSwatch,
              {
                backgroundColor: c,
                borderWidth: color === c ? 3 : 0,
                borderColor: theme.colors.primary,
              },
            ]}
            compact
          >
            {''}
          </Button>
        ))}
      </View>

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
  colorLabel: { marginBottom: 8 },
  colorRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 24 },
  colorSwatch: { width: 36, height: 36, borderRadius: 18, minWidth: 0, padding: 0 },
  button: { marginTop: 8 },
});
