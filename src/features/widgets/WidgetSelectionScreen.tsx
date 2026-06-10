/**
 * Screen to select and add analytics widgets to home screen
 */

import React, { useMemo } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { ActivityIndicator, Button, Card, Paragraph, Text, useTheme } from 'react-native-paper';
import { useQuery } from '@tanstack/react-query';
import { useWidgetManagement } from './useWidgetManagement';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { AnalyticsWidget } from '@/features/analytics/types';

type Props = NativeStackScreenProps<any, 'WidgetSelection'>;

export function WidgetSelectionScreen({ navigation }: Props) {
  const theme = useTheme();
  const { addHomeScreenWidget, widgets } = useWidgetManagement();

  // Fetch analytics widgets from dashboard
  const { data: analyticsWidgets, isLoading } = useQuery<AnalyticsWidget[]>({
    queryKey: ['analyticsWidgets'],
    enabled: true,
  });

  // Filter out widgets already added to home screen
  const availableWidgets = useMemo(() => {
    if (!analyticsWidgets) return [];

    const addedIds = new Set(
      Object.values(widgets).map((w) => w.analyticsWidgetId)
    );

    return analyticsWidgets.filter((w) => !addedIds.has(w.id));
  }, [analyticsWidgets, widgets]);

  const handleAddWidget = async (widget: AnalyticsWidget) => {
    try {
      await addHomeScreenWidget(widget);
      // Show success message
      navigation.goBack();
    } catch (error) {
      console.error('Failed to add widget:', error);
      // Show error message to user
    }
  };

  if (isLoading) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator animating size="large" />
      </View>
    );
  }

  if (availableWidgets.length === 0) {
    return (
      <ScrollView
        style={[styles.container, { backgroundColor: theme.colors.background }]}
        contentContainerStyle={styles.content}
      >
        <Card style={styles.emptyCard}>
          <Card.Content>
            <Text variant="headlineSmall" style={styles.emptyTitle}>
              No widgets available
            </Text>
            <Paragraph>
              Configure analytics widgets in the Dashboard to add them to your home screen.
            </Paragraph>
          </Card.Content>
        </Card>
      </ScrollView>
    );
  }

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      contentContainerStyle={styles.content}
    >
      <Text variant="bodyMedium" style={[styles.sectionTitle, { color: theme.colors.onBackground }]}>
        Select a widget from your analytics dashboard:
      </Text>

      {availableWidgets.map((widget) => (
        <Card key={widget.id} style={styles.widgetCard}>
          <Card.Content>
            <Text variant="titleMedium">{widget.title}</Text>
            <Paragraph style={styles.widgetType}>
              {widget.type === 'line' && '📈 Line Chart'}
              {widget.type === 'pie' && '🥧 Pie Chart'}
              {widget.type === 'infoTile' && '📊 Info Tile'}
            </Paragraph>
            <Paragraph numberOfLines={2} style={styles.widgetDesc}>
              Display analytics data on your home screen
            </Paragraph>
          </Card.Content>
          <Card.Actions>
            <Button mode="contained" onPress={() => handleAddWidget(widget)}>
              Add Widget
            </Button>
          </Card.Actions>
        </Card>
      ))}
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
  sectionTitle: {
    marginBottom: 12,
    fontWeight: '600',
  },
  widgetCard: {
    marginBottom: 12,
  },
  widgetType: {
    marginTop: 4,
    marginBottom: 4,
  },
  widgetDesc: {
    marginTop: 8,
    opacity: 0.7,
  },
  emptyCard: {
    marginTop: 32,
  },
  emptyTitle: {
    marginBottom: 8,
  },
});
