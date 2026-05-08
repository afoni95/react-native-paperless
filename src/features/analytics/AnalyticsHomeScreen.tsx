import React, { useMemo, useState } from 'react';
import { ScrollView, View } from 'react-native';
import { Button, Divider, SegmentedButtons, Text, useTheme, Banner } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import { ConfirmDialog, LoadingScreen } from '@/components';
import { useAnalyticsDashboardStore } from '@/store/analyticsDashboardStore';
import { useNetworkStore, NetworkStatus } from '@/store/networkStore';
import { AnalyticsWidgetCard } from './AnalyticsWidgetCard';
import { useAnalyticsSource } from './useAnalyticsSource';
import type { AnalyticsStackParamList } from '@/navigation/types';

type NavigationProp = NativeStackNavigationProp<AnalyticsStackParamList, 'AnalyticsHome'>;

export const AnalyticsHomeScreen: React.FC = () => {
  const theme = useTheme();
  const { t } = useTranslation();
  const navigation = useNavigation<NavigationProp>();
  const source = useAnalyticsSource();
  const { status } = useNetworkStore();

  const {
    widgetOrder,
    widgets,
    isHydrated,
    hydrate,
    editMode,
    setEditMode,
    moveWidgetDown,
    moveWidgetUp,
    removeWidget,
  } = useAnalyticsDashboardStore();

  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

  React.useEffect(() => {
    if (!isHydrated) {
      hydrate();
    }
  }, [hydrate, isHydrated]);

  const orderedWidgets = useMemo(
    () => widgetOrder.map((id) => widgets[id]).filter(Boolean),
    [widgetOrder, widgets],
  );

  if (!isHydrated) {
    return <LoadingScreen message={t('analytics.states.loading')} />;
  }

  if (status === NetworkStatus.Offline) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 }}>
        <Text variant="titleMedium">{t('analytics.states.unavailableOffline')}</Text>
      </View>
    );
  }

  return (
    <>
      {status === NetworkStatus.Disconnected ? (
        <Banner
          visible
          icon="alert-outline"
          style={{ backgroundColor: theme.colors.tertiaryContainer }}
        >
          {t('analytics.warnings.staleData')}
        </Banner>
      ) : null}

      <ScrollView
        style={{ flex: 1, backgroundColor: theme.colors.background }}
        contentContainerStyle={{ padding: 12, gap: 10, paddingBottom: 24 }}
      >
        <SegmentedButtons
          value={editMode ? 'edit' : 'view'}
          onValueChange={(value) => setEditMode(value === 'edit')}
          buttons={[
            { value: 'view', label: t('analytics.actions.viewMode') },
            { value: 'edit', label: t('analytics.actions.editMode') },
          ]}
        />

        {orderedWidgets.length === 0 ? (
          <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
            {t('analytics.states.emptyDashboard')}
          </Text>
        ) : null}

        {orderedWidgets.map((widget, index) => (
          <AnalyticsWidgetCard
            key={widget.id}
            widget={widget}
            source={source}
            editMode={editMode}
            isFirst={index === 0}
            isLast={index === orderedWidgets.length - 1}
            onMoveUp={() => moveWidgetUp(widget.id)}
            onMoveDown={() => moveWidgetDown(widget.id)}
            onEdit={() => navigation.navigate('AnalyticsWidgetEditor', { widgetId: widget.id })}
            onDelete={() => setDeleteTargetId(widget.id)}
          />
        ))}

        {orderedWidgets.length === 0 || editMode ? (
          <>
            <Divider />

            <Text variant="titleSmall">{t('analytics.actions.addWidget')}</Text>
            <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap' }}>
              <Button
                mode="contained-tonal"
                onPress={() => navigation.navigate('AnalyticsWidgetEditor', { widgetType: 'line' })}
              >
                {t('analytics.widget.line')}
              </Button>
              <Button
                mode="contained-tonal"
                onPress={() => navigation.navigate('AnalyticsWidgetEditor', { widgetType: 'pie' })}
              >
                {t('analytics.widget.pie')}
              </Button>
              <Button
                mode="contained-tonal"
                onPress={() =>
                  navigation.navigate('AnalyticsWidgetEditor', { widgetType: 'infoTile' })
                }
              >
                {t('analytics.widget.infoTile')}
              </Button>
            </View>
          </>
        ) : null}
      </ScrollView>

      <ConfirmDialog
        visible={!!deleteTargetId}
        title={t('analytics.actions.deleteWidget')}
        message={t('analytics.confirm.deleteWidget')}
        destructive
        onCancel={() => setDeleteTargetId(null)}
        onConfirm={() => {
          if (deleteTargetId) removeWidget(deleteTargetId);
          setDeleteTargetId(null);
        }}
      />
    </>
  );
};
