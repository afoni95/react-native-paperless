/**
 * Screen to configure widget sync settings
 */

import React, { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import {
  Button,
  Card,
  List,
  RadioButton,
  Switch,
  Text,
  useTheme,
  Divider,
} from 'react-native-paper';
import { useWidgetManagement } from './useWidgetManagement';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

type Props = NativeStackScreenProps<any, 'WidgetSettings'>;

export function WidgetSettingsScreen({ navigation }: Props) {
  const theme = useTheme();
  const { syncConfig, updateSyncSettings } = useWidgetManagement();

  const [autoSyncEnabled, setAutoSyncEnabled] = useState(syncConfig.enabled);
  const [selectedInterval, setSelectedInterval] = useState<number>(syncConfig.intervalMinutes);
  const [wifiOnly, setWifiOnly] = useState(syncConfig.wifiOnly);

  const handleSave = () => {
    updateSyncSettings({
      enabled: autoSyncEnabled,
      intervalMinutes: selectedInterval,
      wifiOnly: wifiOnly,
    });
    navigation.goBack();
  };

  const intervals = [
    { label: '15 minutes', value: 15 },
    { label: '30 minutes', value: 30 },
    { label: '1 hour', value: 60 },
    { label: '4 hours', value: 240 },
    { label: '24 hours', value: 1440 },
  ];

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      contentContainerStyle={styles.content}
    >
      {/* Auto-Sync Toggle */}
      <Card style={styles.card}>
        <Card.Content>
          <View style={styles.switchRow}>
            <View style={styles.switchLabel}>
              <Text variant="titleSmall">Automatic Sync</Text>
              <Text variant="labelSmall" style={styles.description}>
                Automatically refresh widget data in the background
              </Text>
            </View>
            <Switch
              value={autoSyncEnabled}
              onValueChange={setAutoSyncEnabled}
              color={theme.colors.primary}
            />
          </View>
        </Card.Content>
      </Card>

      {/* Sync Interval */}
      {autoSyncEnabled && (
        <Card style={styles.card}>
          <Card.Content>
            <Text variant="labelMedium" style={styles.sectionTitle}>
              Refresh Interval
            </Text>

            <RadioButton.Group value={selectedInterval.toString()} onValueChange={(val) => {
              setSelectedInterval(parseInt(val, 10));
            }}>
              {intervals.map((interval, index) => (
                <View key={interval.value}>
                  <List.Item
                    title={interval.label}
                    left={() => (
                      <RadioButton
                        value={interval.value.toString()}
                        color={theme.colors.primary}
                      />
                    )}
                    style={styles.radioItem}
                    onPress={() => setSelectedInterval(interval.value)}
                  />
                  {index < intervals.length - 1 && <Divider />}
                </View>
              ))}
            </RadioButton.Group>
          </Card.Content>
        </Card>
      )}

      {/* WiFi Only Toggle */}
      {autoSyncEnabled && (
        <Card style={styles.card}>
          <Card.Content>
            <View style={styles.switchRow}>
              <View style={styles.switchLabel}>
                <Text variant="titleSmall">WiFi Only</Text>
                <Text variant="labelSmall" style={styles.description}>
                  Only sync when connected to WiFi to save cellular data
                </Text>
              </View>
              <Switch
                value={wifiOnly}
                onValueChange={setWifiOnly}
                color={theme.colors.primary}
              />
            </View>
          </Card.Content>
        </Card>
      )}

      {/* Info Card */}
      <Card style={[styles.card, styles.infoCard]}>
        <Card.Content>
          <Text variant="labelSmall" style={styles.infoText}>
            💡 Tip: You can always manually refresh widgets from the Active Widgets screen.
          </Text>
        </Card.Content>
      </Card>

      {/* Save Button */}
      <View style={styles.buttonContainer}>
        <Button
          mode="contained"
          onPress={handleSave}
          style={styles.saveButton}
        >
          Save Settings
        </Button>
        <Button
          mode="outlined"
          onPress={() => navigation.goBack()}
          style={styles.cancelButton}
        >
          Cancel
        </Button>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
    flexGrow: 1,
  },
  card: {
    marginBottom: 16,
  },
  sectionTitle: {
    marginBottom: 12,
    fontWeight: '600',
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  switchLabel: {
    flex: 1,
    marginRight: 12,
  },
  description: {
    marginTop: 4,
    opacity: 0.6,
  },
  radioItem: {
    paddingHorizontal: 0,
  },
  infoCard: {
    marginTop: 24,
    backgroundColor: '#E8F5E9',
  },
  infoText: {
    opacity: 0.8,
  },
  buttonContainer: {
    marginTop: 24,
    marginBottom: 16,
    gap: 12,
  },
  saveButton: {
    paddingVertical: 6,
  },
  cancelButton: {
    paddingVertical: 6,
  },
});
