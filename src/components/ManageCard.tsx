import React from 'react';
import { View, StyleSheet, StyleProp, TextStyle } from 'react-native';
import { Surface, TouchableRipple, Text, useTheme } from 'react-native-paper';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';

interface ManageCardProps {
  icon: string;
  title: string;
  subtitle?: string;
  subtitleStyle?: StyleProp<TextStyle>;
  onPress: () => void;
}

export const ManageCard: React.FC<ManageCardProps> = ({
  icon,
  title,
  subtitle,
  subtitleStyle,
  onPress,
}) => {
  const theme = useTheme();
  return (
    <Surface
      style={[styles.surface, { backgroundColor: theme.colors.elevation.level2 }]}
      elevation={1}
    >
      <TouchableRipple onPress={onPress} style={styles.ripple} borderless>
        <View style={styles.content}>
          <View style={[styles.iconCircle, { backgroundColor: theme.colors.primary }]}>
            <MaterialCommunityIcons
              name={icon as React.ComponentProps<typeof MaterialCommunityIcons>['name']}
              size={22}
              color={theme.colors.onPrimary}
            />
          </View>
          <View style={styles.textContainer}>
            <Text variant="bodyLarge" style={{ color: theme.colors.onSurface }}>
              {title}
            </Text>
            {subtitle ? (
              <Text
                variant="bodySmall"
                style={[{ color: theme.colors.onSurfaceVariant }, subtitleStyle]}
              >
                {subtitle}
              </Text>
            ) : null}
          </View>
          <MaterialCommunityIcons
            name="chevron-right"
            size={22}
            color={theme.colors.onSurfaceVariant}
          />
        </View>
      </TouchableRipple>
    </Surface>
  );
};

const styles = StyleSheet.create({
  surface: {
    marginHorizontal: 12,
    marginBottom: 8,
    borderRadius: 12,
    overflow: 'hidden',
  },
  ripple: {
    borderRadius: 12,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    gap: 14,
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textContainer: {
    flex: 1,
  },
});
