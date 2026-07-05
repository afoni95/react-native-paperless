/**
 * Screen to manage active home screen widgets
 */

import React from 'react';
import { ScrollView, StyleSheet, View, RefreshControl } from 'react-native';
import {
  ActivityIndicator,
  Button,
  Card,
  List,
  Paragraph,
  Text,
  useTheme,
  Divider,
  Chip,
} from 'react-native-paper';
import { useWidgetManagement } from './useWidgetManagement';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

type Props = NativeStackScreenProps<any, 'ActiveWidgets'>;

export function ActiveWidgetsScreen({ navigation }: Props) {
  const theme = useTheme();
  const {
    widgets,
    widgetOrder,
    removeHomeScreenWidget,
    syncAllWidgets,
    syncSingleWidget,
    syncStatus,
    isSyncing,
    getWidgetCachedData,
  } = useWidgetManagement();

  const activeWidgets = widgetOrder.map((id) => widgets[id]).filter(Boolean);

  const handleRemoveWidget = async (widgetId: string) => {
    try {
      await removeHomeScreenWidget(widgetId);
    } catch (error) {
      console.error('Failed to remove widget:', error);
    }
  };

  const handleSyncAll = async () => {
    try {
      await syncAllWidgets();
    } catch (error) {
      console.error('Failed to sync widgets:', error);
    }
  };

  const handleSyncWidget = async (widgetId: string) => {
    try {
      await syncSingleWidget(widgetId);
    } catch (error) {
      console.error('Failed to sync widget:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'syncing':
        return theme.colors.primary;
      case 'error':
        return theme.colors.error;
      case 'idle':
      default:
        return theme.colors.primary;
    }
  };

  if (activeWidgets.length === 0) {
    return (
      <ScrollView
        style={[styles.container, { backgroundColor: theme.colors.background }]}
        contentContainerStyle={styles.emptyContent}
      >
        <Card style={styles.emptyCard}>
          <Card.Content>
            <Text variant="headlineSmall" style={styles.emptyTitle}>
              No widgets added
            </Text>
            <Paragraph>
              Add your first analytics widget to display data on your home screen.
            </Paragraph>
          </Card.Content>
          <Card.Actions>
            <Button mode="contained" onPress={() => navigation.navigate('WidgetSelection')}>
              Add Widget
            </Button>
          </Card.Actions>
        </Card>
      </ScrollView>
    );
  }

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl
          refreshing={isSyncing}
          onRefresh={handleSyncAll}
          colors={[theme.colors.primary]}
        />
      }
    >
      {/* Sync Status */}
      <View style={styles.statusSection}>
        <View style={styles.statusRow}>
          <Text variant="labelSmall" style={styles.statusLabel}>
            Sync Status:
          </Text>
          <Chip
            style={{ backgroundColor: getStatusColor(syncStatus) }}
            textStyle={{ color: 'white' }}
            avatar={
              syncStatus === 'syncing' ? <ActivityIndicator size={16} color="white" /> : undefined
            }
          >
            {syncStatus === 'syncing' && 'Syncing...'}
            {syncStatus === 'error' && 'Error'}
            {syncStatus === 'idle' && 'Up to date'}
          </Chip>
        </View>
        <Button
          mode="elevated"
          onPress={handleSyncAll}
          loading={isSyncing}
          disabled={isSyncing}
          style={styles.syncButton}
        >
          Sync All Now
        </Button>
      </View>

      <Divider style={styles.divider} />

      {/* Active Widgets List */}
      <Text variant="labelLarge" style={styles.sectionTitle}>
        Active Widgets ({activeWidgets.length})
      </Text>

      {activeWidgets.map((widget) => {
        const cachedData = getWidgetCachedData(widget.id);
        const isStale = !cachedData || Date.now() - cachedData.timestamp > 15 * 60 * 1000;

        return (
          <Card key={widget.id} style={styles.widgetCard}>
            <Card.Content style={styles.widgetContent}>
              <View style={styles.widgetHeader}>
                <View style={styles.widgetInfo}>
                  <Text variant="titleSmall">{widget.title}</Text>
                  <Text variant="labelSmall" style={styles.widgetMeta}>
                    {widget.type === 'line' && '📈 Line Chart'}
                    {widget.type === 'pie' && '🥧 Pie Chart'}
                    {widget.type === 'infoTile' && '📊 Info Tile'}
                  </Text>
                </View>
                <Chip
                  icon={isStale ? '🔄' : '✓'}
                  style={{
                    backgroundColor: isStale
                      ? theme.colors.errorContainer
                      : theme.colors.primaryContainer,
                  }}
                  textStyle={{
                    color: isStale ? theme.colors.errorContainer : theme.colors.onPrimaryContainer,
                  }}
                >
                  {isStale ? 'Stale' : 'Fresh'}
                </Chip>
              </View>

              {cachedData && (
                <Text variant="labelSmall" style={styles.lastSyncTime}>
                  Last updated: {new Date(cachedData.timestamp).toLocaleString()}
                </Text>
              )}
            </Card.Content>

            <Card.Actions style={styles.cardActions}>
              <Button
                onPress={() => handleSyncWidget(widget.id)}
                loading={widget.syncStatus === 'syncing'}
                disabled={widget.syncStatus === 'syncing' || isSyncing}
              >
                Refresh
              </Button>
              <Button textColor={theme.colors.error} onPress={() => handleRemoveWidget(widget.id)}>
                Remove
              </Button>
            </Card.Actions>

            {widget.syncError && (
              <Card.Content>
                <Text
                  variant="labelSmall"
                  style={[styles.errorText, { color: theme.colors.error }]}
                >
                  Error: {widget.syncError}
                </Text>
              </Card.Content>
            )}
          </Card>
        );
      })}

      <Button
        mode="outlined"
        onPress={() => navigation.navigate('WidgetSelection')}
        style={styles.addMoreButton}
      >
        Add Another Widget
      </Button>
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
  emptyContent: {
    padding: 16,
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusSection: {
    marginBottom: 16,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  statusLabel: {
    fontWeight: '600',
  },
  syncButton: {
    marginTop: 12,
  },
  divider: {
    marginVertical: 16,
  },
  sectionTitle: {
    marginBottom: 12,
    fontWeight: '600',
  },
  widgetCard: {
    marginBottom: 12,
  },
  widgetContent: {
    paddingVertical: 12,
  },
  widgetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  widgetInfo: {
    flex: 1,
    marginRight: 8,
  },
  widgetMeta: {
    marginTop: 4,
    opacity: 0.7,
  },
  lastSyncTime: {
    marginTop: 8,
    opacity: 0.6,
  },
  cardActions: {
    justifyContent: 'space-between',
    paddingHorizontal: 0,
  },
  errorText: {
    fontStyle: 'italic',
  },
  emptyCard: {
    width: '100%',
  },
  emptyTitle: {
    marginBottom: 8,
  },
  addMoreButton: {
    marginTop: 16,
    marginBottom: 16,
  },
});
