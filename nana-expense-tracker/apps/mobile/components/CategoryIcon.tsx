import { View, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import type { Category } from '@/types/expense';

type IconName = keyof typeof MaterialCommunityIcons.glyphMap;

// The database stores emoji icons; map category names to Material icons instead.
const CATEGORY_ICON_MAP: Record<string, IconName> = {
  Food: 'silverware-fork-knife',
  Coffee: 'coffee',
  Transport: 'car-sports',
  Shopping: 'shopping-outline',
  Entertainment: 'movie-open-outline',
  Bills: 'file-document-outline',
  Health: 'heart-pulse',
  Other: 'shape-outline',
};

export const INPUT_METHOD_ICONS: Record<string, IconName> = {
  voice: 'microphone',
  camera: 'camera-outline',
  manual: 'pencil-outline',
};

export function getCategoryIconName(categoryName?: string): IconName {
  return (categoryName && CATEGORY_ICON_MAP[categoryName]) || 'shape-outline';
}

type CategoryIconProps = {
  category?: Category;
  size?: number;
  containerSize?: number;
  glow?: boolean;
};

export function CategoryIcon({ category, size = 22, containerSize = 46, glow = false }: CategoryIconProps) {
  const color = category?.color || '#64748b';

  return (
    <View
      style={[
        {
          width: containerSize,
          height: containerSize,
          borderRadius: containerSize / 3,
          backgroundColor: color + '1A',
          borderWidth: 1,
          borderColor: color + '33',
          alignItems: 'center',
          justifyContent: 'center',
        },
        glow && {
          shadowColor: color,
          shadowOffset: { width: 0, height: 0 },
          shadowOpacity: 0.5,
          shadowRadius: 8,
          elevation: 4,
        },
      ]}
    >
      <MaterialCommunityIcons name={getCategoryIconName(category?.name)} size={size} color={color} />
    </View>
  );
}
