import React from 'react';
import { ScrollView, View } from 'react-native';
import {
  Button,
  HelperText,
  SegmentedButtons,
  Text,
  TextInput,
  useTheme,
} from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { AnalyticsStackParamList } from '@/navigation/types';
import { SearchableDropdown } from '@/components';
import { useDocumentMetadata } from '@/hooks';
import { useAnalyticsDashboardStore } from '@/store/analyticsDashboardStore';
import { analyticsWidgetRegistry } from './registry';
import type {
  AnalyticsFilter,
  AnalyticsAggregation,
  AnalyticsDateBucket,
  AnalyticsInfoTileWidgetConfig,
  AnalyticsMetric,
  AnalyticsWidgetConfig,
  AnalyticsWidgetType,
} from './types';
import { useAnalyticsSource } from './useAnalyticsSource';
import { defaultFilter } from './utils';
import { AnalyticsFilterSheet } from './AnalyticsFilterSheet';

type Route = RouteProp<AnalyticsStackParamList, 'AnalyticsWidgetEditor'>;
type Navigation = NativeStackNavigationProp<AnalyticsStackParamList, 'AnalyticsWidgetEditor'>;

const metricDraft = (metric?: AnalyticsMetric): AnalyticsMetric =>
  metric ?? { mode: 'count', aggregation: 'count' };

export const AnalyticsWidgetEditorScreen: React.FC = () => {
  const theme = useTheme();
  const { t } = useTranslation();
  const navigation = useNavigation<Navigation>();
  const route = useRoute<Route>();
  const source = useAnalyticsSource();
  const metadata = useDocumentMetadata();

  const { widgetId, widgetType: widgetTypeFromRoute } = route.params ?? {};
  const store = useAnalyticsDashboardStore();
  const existingWidget = widgetId ? store.widgets[widgetId] : undefined;

  const initialType = (existingWidget?.type ??
    widgetTypeFromRoute ??
    'line') as AnalyticsWidgetType;

  const [widgetType, setWidgetType] = React.useState<AnalyticsWidgetType>(initialType);
  const [title, setTitle] = React.useState(existingWidget?.title ?? '');
  const [config, setConfig] = React.useState<AnalyticsWidgetConfig>(() => {
    if (existingWidget) return existingWidget.config;
    return analyticsWidgetRegistry.get(initialType).createDefaultConfig();
  });
  const [activeFilterEditor, setActiveFilterEditor] = React.useState<
    { kind: 'widget' } | { kind: 'metric'; index: number } | null
  >(null);

  const validationErrors = analyticsWidgetRegistry
    .get(widgetType)
    .validate(config as never, source);

  React.useEffect(() => {
    if (existingWidget) return;
    setConfig(analyticsWidgetRegistry.get(widgetType).createDefaultConfig());
  }, [existingWidget, widgetType]);

  const save = () => {
    if (validationErrors.length > 0) return;
    if (existingWidget) {
      store.updateWidget(existingWidget.id, { title, config });
      navigation.goBack();
      return;
    }

    const newId = store.addWidget(widgetType);
    store.updateWidget(newId, { title, config });
    navigation.goBack();
  };

  const setMetric = (next: Partial<AnalyticsMetric>) => {
    if (config.type === 'line') {
      setConfig({ ...config, metric: { ...metricDraft(config.metric), ...next } });
      return;
    }
    if (config.type === 'pie') {
      setConfig({ ...config, metric: { ...metricDraft(config.metric), ...next } });
      return;
    }
    if (config.type === 'infoTile') {
      const metrics = config.metrics.slice(0, 1);
      const first = metrics[0] ?? {
        id: 'metric-1',
        label: 'KPI 1',
        filters: defaultFilter(),
        metric: { mode: 'count' as const, aggregation: 'count' as const },
      };
      metrics[0] = { ...first, metric: { ...first.metric, ...next } };
      setConfig({ ...config, metrics });
    }
  };

  const updateFilter = (filter: AnalyticsFilter) => {
    if (!activeFilterEditor) return;

    if (activeFilterEditor.kind === 'widget' && (config.type === 'line' || config.type === 'pie')) {
      setConfig({ ...config, filters: filter });
      setActiveFilterEditor(null);
      return;
    }

    if (activeFilterEditor.kind === 'metric' && config.type === 'infoTile') {
      const nextMetrics = [...config.metrics];
      const target = nextMetrics[activeFilterEditor.index];
      if (!target) return;
      nextMetrics[activeFilterEditor.index] = { ...target, filters: filter };
      setConfig({ ...config, metrics: nextMetrics });
      setActiveFilterEditor(null);
    }
  };

  const numericCustomFieldItems = (metadata.allCustomFields ?? [])
    .filter((field) => ['integer', 'float', 'monetary'].includes(field.data_type))
    .map((field) => ({ id: field.id, name: field.name }));

  const allCustomFieldItems = (metadata.allCustomFields ?? []).map((field) => ({
    id: field.id,
    name: field.name,
  }));

  const groupByOptions = [
    { id: 1, value: 'correspondent', name: t('analytics.dimension.correspondent') },
    { id: 2, value: 'documentType', name: t('analytics.dimension.documentType') },
    { id: 3, value: 'tag', name: t('analytics.dimension.tag') },
    { id: 4, value: 'customField', name: t('analytics.dimension.customField') },
  ] as const;

  const pieDimensionOptions = [
    { id: 1, value: 'correspondent', name: t('analytics.dimension.correspondent') },
    { id: 2, value: 'documentType', name: t('analytics.dimension.documentType') },
    { id: 3, value: 'tag', name: t('analytics.dimension.tag') },
    { id: 4, value: 'dateQuarter', name: t('analytics.dimension.dateQuarter') },
    { id: 5, value: 'dateMonth', name: t('analytics.dimension.dateMonth') },
    { id: 6, value: 'dateYear', name: t('analytics.dimension.dateYear') },
    { id: 7, value: 'customField', name: t('analytics.dimension.customField') },
  ] as const;

  const dateBucketOptions = [
    { id: 1, value: 'day', name: t('analytics.bucket.day') },
    { id: 2, value: 'week', name: t('analytics.bucket.week') },
    { id: 3, value: 'month', name: t('analytics.bucket.month') },
    { id: 4, value: 'quarter', name: t('analytics.bucket.quarter') },
    { id: 5, value: 'year', name: t('analytics.bucket.year') },
  ] as const;

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: theme.colors.background }}
      contentContainerStyle={{ padding: 12, gap: 10, paddingBottom: 28 }}
    >
      {!existingWidget ? (
        <SegmentedButtons
          value={widgetType}
          onValueChange={(value) => setWidgetType(value as AnalyticsWidgetType)}
          buttons={[
            { value: 'line', label: t('analytics.widget.line') },
            { value: 'pie', label: t('analytics.widget.pie') },
            { value: 'infoTile', label: t('analytics.widget.infoTile') },
          ]}
        />
      ) : null}

      <TextInput
        label={t('analytics.editor.title')}
        value={title}
        onChangeText={setTitle}
        mode="outlined"
      />

      {(config.type === 'line' || config.type === 'pie') && (
        <>
          <Text variant="labelLarge">{t('analytics.editor.metricSource')}</Text>
          <SegmentedButtons
            value={config.metric.mode}
            onValueChange={(value) => setMetric({ mode: value as 'count' | 'customField' })}
            buttons={[
              { value: 'count', label: t('analytics.editor.count') },
              { value: 'customField', label: t('analytics.editor.customField') },
            ]}
          />

          {config.metric.mode === 'customField' ? (
            <SearchableDropdown
              items={numericCustomFieldItems}
              selectedId={config.metric.customFieldId ?? null}
              onSelect={(id) => setMetric({ customFieldId: id ?? undefined })}
              label={t('analytics.editor.metricFieldId')}
              placeholder={t('common.none')}
              canClear={false}
            />
          ) : null}

          <SegmentedButtons
            value={config.metric.aggregation}
            onValueChange={(value) => setMetric({ aggregation: value as AnalyticsAggregation })}
            buttons={[
              { value: 'count', label: t('analytics.aggregation.count') },
              { value: 'sum', label: t('analytics.aggregation.sum') },
              { value: 'avg', label: t('analytics.aggregation.avg') },
              { value: 'min', label: t('analytics.aggregation.min') },
              { value: 'max', label: t('analytics.aggregation.max') },
            ]}
          />
          <Button mode="outlined" onPress={() => setActiveFilterEditor({ kind: 'widget' })}>
            {t('analytics.editor.editFilters')}
          </Button>
        </>
      )}

      {config.type === 'line' ? (
        <>
          <Text variant="labelLarge">{t('analytics.editor.groupBy')}</Text>
          <SearchableDropdown
            items={groupByOptions.map((item) => ({ id: item.id, name: item.name }))}
            selectedId={groupByOptions.find((item) => item.value === config.groupBy)?.id ?? null}
            onSelect={(id) => {
              const selected = groupByOptions.find((item) => item.id === id);
              if (!selected) return;
              setConfig({
                ...config,
                groupBy: selected.value,
                groupByCustomFieldId: undefined,
              });
            }}
            label={t('analytics.editor.groupBy')}
            placeholder={t('common.none')}
            canClear={false}
            searchable={false}
          />

          {config.groupBy === 'customField' ? (
            <SearchableDropdown
              items={allCustomFieldItems}
              selectedId={config.groupByCustomFieldId ?? null}
              onSelect={(id) => setConfig({ ...config, groupByCustomFieldId: id ?? undefined })}
              label={t('analytics.editor.groupByCustomFieldId')}
              placeholder={t('common.none')}
              canClear={false}
            />
          ) : null}

          <Text variant="labelLarge">{t('analytics.editor.dateBucket')}</Text>
          <SearchableDropdown
            items={dateBucketOptions.map((item) => ({ id: item.id, name: item.name }))}
            selectedId={
              dateBucketOptions.find((item) => item.value === config.dateBucket)?.id ?? null
            }
            onSelect={(id) => {
              const selected = dateBucketOptions.find((item) => item.id === id);
              if (!selected) return;
              setConfig({ ...config, dateBucket: selected.value as AnalyticsDateBucket });
            }}
            label={t('analytics.editor.dateBucket')}
            placeholder={t('common.none')}
            canClear={false}
            searchable={false}
          />
        </>
      ) : null}

      {config.type === 'pie' ? (
        <>
          <Text variant="labelLarge">{t('analytics.editor.dimension')}</Text>
          <SearchableDropdown
            items={pieDimensionOptions.map((item) => ({ id: item.id, name: item.name }))}
            selectedId={
              pieDimensionOptions.find((item) => item.value === config.dimension)?.id ?? null
            }
            onSelect={(id) => {
              const selected = pieDimensionOptions.find((item) => item.id === id);
              if (!selected) return;
              setConfig({
                ...config,
                dimension: selected.value,
                dimensionCustomFieldId: undefined,
              });
            }}
            label={t('analytics.editor.dimension')}
            placeholder={t('common.none')}
            canClear={false}
          />

          {config.dimension === 'customField' ? (
            <SearchableDropdown
              items={allCustomFieldItems}
              selectedId={config.dimensionCustomFieldId ?? null}
              onSelect={(id) => setConfig({ ...config, dimensionCustomFieldId: id ?? undefined })}
              label={t('analytics.editor.dimensionCustomFieldId')}
              placeholder={t('common.none')}
              canClear={false}
            />
          ) : null}
        </>
      ) : null}

      {config.type === 'infoTile' ? (
        <InfoTileConfigSection
          config={config}
          setConfig={setConfig}
          numericCustomFieldItems={numericCustomFieldItems}
          onEditFilter={(index) => setActiveFilterEditor({ kind: 'metric', index })}
        />
      ) : null}

      {validationErrors.map((errorKey) => (
        <HelperText key={errorKey} type="error" visible>
          {t(errorKey)}
        </HelperText>
      ))}

      <View style={{ flexDirection: 'row', gap: 8 }}>
        <Button mode="outlined" onPress={() => navigation.goBack()}>
          {t('common.cancel')}
        </Button>
        <Button mode="contained" onPress={save} disabled={validationErrors.length > 0}>
          {t('common.save')}
        </Button>
      </View>

      <AnalyticsFilterSheet
        visible={!!activeFilterEditor}
        onDismiss={() => setActiveFilterEditor(null)}
        value={
          activeFilterEditor?.kind === 'widget' && (config.type === 'line' || config.type === 'pie')
            ? config.filters
            : activeFilterEditor?.kind === 'metric' && config.type === 'infoTile'
              ? (config.metrics[activeFilterEditor.index]?.filters ?? defaultFilter())
              : defaultFilter()
        }
        onApply={updateFilter}
        correspondents={metadata.allCorrespondents ?? []}
        documentTypes={metadata.allDocTypes ?? []}
        tags={metadata.allTags ?? []}
      />
    </ScrollView>
  );
};

interface InfoTileConfigSectionProps {
  config: AnalyticsInfoTileWidgetConfig;
  setConfig: (config: AnalyticsInfoTileWidgetConfig) => void;
  numericCustomFieldItems: { id: number; name: string }[];
  onEditFilter: (index: number) => void;
}

const InfoTileConfigSection: React.FC<InfoTileConfigSectionProps> = ({
  config,
  setConfig,
  numericCustomFieldItems,
  onEditFilter,
}) => {
  const { t } = useTranslation();

  const metrics = config.metrics;

  const updateMetric = (
    index: number,
    patch: Partial<AnalyticsInfoTileWidgetConfig['metrics'][number]>,
  ) => {
    const next = [...metrics];
    next[index] = { ...next[index], ...patch };
    setConfig({ ...config, metrics: next });
  };

  return (
    <View style={{ gap: 10 }}>
      <Text variant="labelLarge">{t('analytics.editor.metrics')}</Text>
      {metrics.map((metric, index) => (
        <View key={metric.id} style={{ gap: 8 }}>
          <TextInput
            mode="outlined"
            label={t('analytics.editor.metricLabel')}
            value={metric.label}
            onChangeText={(value) => updateMetric(index, { label: value })}
          />
          <SegmentedButtons
            value={metric.metric.mode}
            onValueChange={(value) =>
              updateMetric(index, {
                metric: {
                  ...metric.metric,
                  mode: value as 'count' | 'customField',
                  customFieldId: value === 'count' ? undefined : metric.metric.customFieldId,
                },
              })
            }
            buttons={[
              { value: 'count', label: t('analytics.editor.count') },
              { value: 'customField', label: t('analytics.editor.customField') },
            ]}
          />

          {metric.metric.mode === 'customField' ? (
            <SearchableDropdown
              items={numericCustomFieldItems}
              selectedId={metric.metric.customFieldId ?? null}
              onSelect={(id) =>
                updateMetric(index, {
                  metric: { ...metric.metric, customFieldId: id ?? undefined },
                })
              }
              label={t('analytics.editor.metricFieldId')}
              placeholder={t('common.none')}
              canClear={false}
            />
          ) : null}

          <SegmentedButtons
            value={metric.metric.aggregation}
            onValueChange={(value) =>
              updateMetric(index, {
                metric: { ...metric.metric, aggregation: value as AnalyticsAggregation },
              })
            }
            buttons={[
              { value: 'count', label: t('analytics.aggregation.count') },
              { value: 'sum', label: t('analytics.aggregation.sum') },
              { value: 'avg', label: t('analytics.aggregation.avg') },
              { value: 'min', label: t('analytics.aggregation.min') },
              { value: 'max', label: t('analytics.aggregation.max') },
            ]}
          />

          <Button mode="outlined" onPress={() => onEditFilter(index)}>
            {t('analytics.editor.editFilters')}
          </Button>
        </View>
      ))}

      <View style={{ flexDirection: 'row', gap: 8 }}>
        <Button
          mode="outlined"
          disabled={metrics.length >= 4}
          onPress={() => {
            setConfig({
              ...config,
              metrics: [
                ...metrics,
                {
                  id: `metric-${Date.now()}`,
                  label: `KPI ${metrics.length + 1}`,
                  metric: { mode: 'count', aggregation: 'count' },
                  filters: defaultFilter(),
                },
              ],
            });
          }}
        >
          {t('analytics.actions.addMetric')}
        </Button>
        <Button
          mode="outlined"
          disabled={metrics.length <= 1}
          onPress={() => setConfig({ ...config, metrics: metrics.slice(0, -1) })}
        >
          {t('analytics.actions.removeMetric')}
        </Button>
      </View>
    </View>
  );
};
