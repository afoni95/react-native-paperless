import React from 'react';
import { View } from 'react-native';
import { Card, IconButton, Text, useTheme } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import { analyticsWidgetRegistry } from './registry';
import { useWidgetResult } from './useWidgetResult';
import { LineChartView } from './LineChartView';
import { PieChartView } from './PieChartView';
import { InfoTileView } from './InfoTileView';
import { filtersSummary } from './utils';
import type { AnalyticsDataSource, AnalyticsWidget } from './types';

interface AnalyticsWidgetCardProps {
  widget: AnalyticsWidget;
  source: AnalyticsDataSource;
  editMode: boolean;
  onEdit: () => void;
  onDelete: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  isFirst: boolean;
  isLast: boolean;
}

export const AnalyticsWidgetCard: React.FC<AnalyticsWidgetCardProps> = ({
  widget,
  source,
  editMode,
  onEdit,
  onDelete,
  onMoveUp,
  onMoveDown,
  isFirst,
  isLast,
}) => {
  const theme = useTheme();
  const { t } = useTranslation();
  const definition = analyticsWidgetRegistry.get(widget.type);
  const { result, validationErrors } = useWidgetResult(widget, source);

  return (
    <Card mode="contained" style={{ backgroundColor: theme.colors.elevation.level1 }}>
      <Card.Title
        title={widget.title || t(definition.titleKey)}
        subtitle={`${t(`analytics.widgetKind.${widget.type}`)} · ${filtersSummary(widget.config)}`}
        right={() =>
          editMode ? (
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <IconButton icon="arrow-up" onPress={onMoveUp} disabled={isFirst} />
              <IconButton icon="arrow-down" onPress={onMoveDown} disabled={isLast} />
              <IconButton icon="pencil" onPress={onEdit} />
              <IconButton icon="delete" onPress={onDelete} />
            </View>
          ) : null
        }
      />
      <Card.Content>
        {validationErrors.length > 0 ? (
          <Text variant="bodySmall" style={{ color: theme.colors.error }}>
            {validationErrors.map((errorKey) => t(errorKey)).join(' ')}
          </Text>
        ) : null}

        {!result ? (
          <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
            {t('analytics.states.invalidConfiguration')}
          </Text>
        ) : result.kind === 'line' ? (
          result.series.length ? (
            <LineChartView result={result} />
          ) : (
            <Text variant="bodySmall">{t('analytics.states.empty')}</Text>
          )
        ) : result.kind === 'pie' ? (
          result.slices.length ? (
            <PieChartView result={result} />
          ) : (
            <Text variant="bodySmall">{t('analytics.states.empty')}</Text>
          )
        ) : (
          <InfoTileView result={result} />
        )}
      </Card.Content>
    </Card>
  );
};
