import React from 'react';
import { Chip } from 'react-native-paper';
import { getContrastTextColor, sanitizeColor } from '@/utils';

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
  const safeColor = sanitizeColor(color);
  const computedTextColor = textColor || getContrastTextColor(safeColor);
  const chipStyle = {
    backgroundColor: safeColor,
    marginRight: 4,
    marginBottom: 4,
    height: 21,
    paddingVertical: 0,
    paddingHorizontal: 1,
  };
  const chipTextStyle = {
    color: computedTextColor,
    fontSize: compact ? 11 : 13,
    marginVertical: 0,
    marginHorizontal: 0,
  };

  return (
    <Chip
      mode="flat"
      compact={compact}
      selected={selected}
      onPress={onPress}
      onClose={onClose}
      style={chipStyle}
      textStyle={chipTextStyle}
    >
      {name}
    </Chip>
  );
};
