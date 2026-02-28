import React from 'react';
import { Chip } from 'react-native-paper';
import { getContrastTextColor } from '@/utils';

interface TagChipProps {
  name: string;
  color: string;
  textColor?: string;
  onPress?: () => void;
  onClose?: () => void;
  selected?: boolean;
  compact?: boolean;
}

export const TagChip: React.FC<TagChipProps> = ({
  name,
  color,
  textColor,
  onPress,
  onClose,
  selected,
  compact = true,
}) => {
  const computedTextColor = textColor || getContrastTextColor(color);

  return (
    <Chip
      mode="flat"
      compact={compact}
      selected={selected}
      onPress={onPress}
      onClose={onClose}
      style={{
        backgroundColor: color || '#e0e0e0',
        marginRight: 4,
        marginBottom: 4,
      }}
      textStyle={{
        color: computedTextColor,
        fontSize: compact ? 11 : 13,
      }}
    >
      {name}
    </Chip>
  );
};
