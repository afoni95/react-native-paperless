import React from 'react';
import { View } from 'react-native';
import { Card, Text, useTheme } from 'react-native-paper';
import type { AnalyticsInfoTileResult } from './types';

interface InfoTileViewProps {
  result: AnalyticsInfoTileResult;
}

export const InfoTileView: React.FC<InfoTileViewProps> = ({ result }) => {
  const theme = useTheme();
  const formatValue = (value: number) => (Number.isInteger(value) ? `${value}` : value.toFixed(2));

  return (
    <View style={{ gap: 8 }}>
      {result.values.map((value) => (
        <Card
          key={value.id}
          mode="contained"
          style={{ backgroundColor: theme.colors.elevation.level2 }}
        >
          <Card.Content>
            <Text variant="labelLarge" style={{ color: theme.colors.onSurfaceVariant }}>
              {value.label}
            </Text>
            <Text
              variant="headlineSmall"
              style={{ color: theme.colors.primary, fontWeight: '700' }}
            >
              {formatValue(value.value)}
            </Text>
          </Card.Content>
        </Card>
      ))}
    </View>
  );
};
