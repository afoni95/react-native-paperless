import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import type { WidgetConfigurationScreenProps } from 'react-native-android-widget';
import type { AnalyticsWidget, AnalyticsDashboardStateShape } from '@/features/analytics/types';
import { ANALYTICS_DASHBOARD_KEY } from '@/store/constants';
import { AnalyticsWidgetView } from './AnalyticsWidgetView';
import { saveWidgetConfiguration } from './widgetStorage';

interface WidgetListItem extends AnalyticsWidget {
  displayTitle: string;
}

function formatType(type: AnalyticsWidget['type']): string {
  if (type === 'line') return 'Line chart';
  if (type === 'pie') return 'Pie chart';
  return 'Info tile';
}

export function WidgetConfigurationScreen({
  widgetInfo,
  renderWidget,
  setResult,
}: WidgetConfigurationScreenProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [items, setItems] = useState<WidgetListItem[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    async function loadWidgets() {
      try {
        const raw = await AsyncStorage.getItem(ANALYTICS_DASHBOARD_KEY);
        if (!raw) {
          if (mounted) {
            setItems([]);
          }
          return;
        }

        const parsed = JSON.parse(raw) as AnalyticsDashboardStateShape;
        const list = (parsed.widgetOrder ?? [])
          .map((id) => parsed.widgets?.[id])
          .filter((widget): widget is AnalyticsWidget => Boolean(widget))
          .map((widget) => ({
            ...widget,
            displayTitle: widget.title?.trim() || 'Untitled analytics widget',
          }));

        if (mounted) {
          setItems(list);
          setSelectedId(list[0]?.id ?? null);
        }
      } catch {
        if (mounted) {
          setItems([]);
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    }

    loadWidgets();

    return () => {
      mounted = false;
    };
  }, []);

  const selectedItem = useMemo(
    () => items.find((item) => item.id === selectedId) ?? null,
    [items, selectedId],
  );

  const handleCancel = useCallback(() => {
    setResult('cancel');
  }, [setResult]);

  const handleConfirm = useCallback(async () => {
    if (!selectedItem) {
      setResult('cancel');
      return;
    }

    await saveWidgetConfiguration(widgetInfo.widgetId, {
      analyticsWidgetId: selectedItem.id,
      title: selectedItem.displayTitle,
      type: selectedItem.type,
      configuredAt: Date.now(),
    });

    renderWidget(
      <AnalyticsWidgetView
        data={null}
        error={`Configured: ${selectedItem.displayTitle}. Data will refresh automatically.`}
        updatedAt={Date.now()}
      />,
    );

    setResult('ok');
  }, [renderWidget, selectedItem, setResult, widgetInfo.widgetId]);

  if (isLoading) {
    return (
      <View style={styles.screen}>
        <View style={styles.container}>
          <Text style={styles.title}>Loading analytics widgets...</Text>
        </View>
      </View>
    );
  }

  if (items.length === 0) {
    return (
      <View style={styles.screen}>
        <View style={styles.container}>
          <Text style={styles.title}>No analytics widgets available</Text>
          <Text style={styles.subtitle}>
            Create one in the Analytics dashboard first, then configure this widget again.
          </Text>
          <Pressable style={styles.secondaryButton} onPress={handleCancel}>
            <Text style={styles.secondaryButtonText}>Close</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <View style={styles.container}>
        <Text style={styles.title}>Configure Home Widget</Text>
        <Text style={styles.subtitle}>Choose which analytics widget to display.</Text>

        <FlatList
          data={items}
          keyExtractor={(item) => item.id}
          style={styles.list}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => {
            const isSelected = item.id === selectedId;
            return (
              <Pressable
                onPress={() => setSelectedId(item.id)}
                style={[styles.itemCard, isSelected ? styles.itemCardSelected : null]}
              >
                <Text style={styles.itemTitle}>{item.displayTitle}</Text>
                <Text style={styles.itemMeta}>{formatType(item.type)}</Text>
              </Pressable>
            );
          }}
        />

        <View style={styles.actions}>
          <Pressable style={styles.secondaryButton} onPress={handleCancel}>
            <Text style={styles.secondaryButtonText}>Cancel</Text>
          </Pressable>
          <Pressable style={styles.primaryButton} onPress={handleConfirm}>
            <Text style={styles.primaryButtonText}>Save</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#e2e8f0',
    paddingTop: 25,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 14,
    padding: 14,
    paddingTop: 20,
    paddingBottom: 26,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#475569',
    marginBottom: 12,
  },
  list: {
    flex: 1,
  },
  listContent: {
    paddingBottom: 8,
  },
  itemCard: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 10,
    padding: 12,
    marginBottom: 10,
  },
  itemCardSelected: {
    borderColor: '#17541f',
    backgroundColor: '#eff9ef',
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0f172a',
  },
  itemMeta: {
    marginTop: 4,
    fontSize: 12,
    color: '#64748b',
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
    gap: 12,
  },
  primaryButton: {
    flex: 1,
    backgroundColor: '#17541f',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#ffffff',
    fontWeight: '700',
  },
  secondaryButton: {
    flex: 1,
    backgroundColor: '#e2e8f0',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: '#1e293b',
    fontWeight: '600',
  },
});
