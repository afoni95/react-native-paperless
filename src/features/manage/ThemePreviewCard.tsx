import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, TouchableRipple, useTheme } from 'react-native-paper';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';

interface ThemePreviewCardProps {
  label: string;
  swatches: { primary: string; secondary: string; background: string };
  darkSwatches?: { primary: string; background: string }; // only System card → split preview
  selected: boolean;
  onPress: () => void;
}

export const ThemePreviewCard: React.FC<ThemePreviewCardProps> = ({
  label,
  swatches,
  darkSwatches,
  selected,
  onPress,
}) => {
  const theme = useTheme();

  return (
    <TouchableRipple
      onPress={onPress}
      borderless
      style={[
        styles.card,
        {
          borderColor: selected ? theme.colors.primary : theme.colors.outline,
          borderWidth: selected ? 2 : 1,
        },
      ]}
      accessibilityRole="radio"
      accessibilityState={{ selected }}
      accessibilityLabel={label}
    >
      <View>
        <View style={styles.preview}>
          {darkSwatches ? (
            <View style={styles.splitPreview}>
              <View style={[styles.splitHalf, { backgroundColor: swatches.background }]}>
                <View style={[styles.headerStripe, { backgroundColor: swatches.primary }]} />
                <View style={[styles.chip, { backgroundColor: swatches.secondary }]} />
              </View>
              <View style={[styles.splitHalf, { backgroundColor: darkSwatches.background }]}>
                <View style={[styles.headerStripe, { backgroundColor: darkSwatches.primary }]} />
              </View>
            </View>
          ) : (
            <View style={[styles.previewFill, { backgroundColor: swatches.background }]}>
              <View style={[styles.headerStripe, { backgroundColor: swatches.primary }]} />
              <View style={[styles.chip, { backgroundColor: swatches.secondary }]} />
            </View>
          )}

          {selected && (
            <View style={[styles.checkBadge, { backgroundColor: theme.colors.inverseSurface }]}>
              <MaterialCommunityIcons
                name="check-circle"
                size={22}
                color={theme.colors.inverseOnSurface}
              />
            </View>
          )}
        </View>

        <Text variant="labelLarge" style={styles.label}>
          {label}
        </Text>
      </View>
    </TouchableRipple>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    padding: 8,
    overflow: 'hidden',
  },
  preview: {
    height: 84,
    borderRadius: 10,
    overflow: 'hidden',
    position: 'relative',
  },
  previewFill: {
    flex: 1,
    padding: 8,
  },
  splitPreview: {
    flex: 1,
    flexDirection: 'row',
  },
  splitHalf: {
    flex: 1,
    padding: 8,
  },
  headerStripe: {
    height: 10,
    borderRadius: 5,
  },
  chip: {
    marginTop: 10,
    width: 20,
    height: 20,
    borderRadius: 10,
  },
  checkBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    borderRadius: 11,
  },
  label: {
    marginTop: 8,
    textAlign: 'center',
  },
});
