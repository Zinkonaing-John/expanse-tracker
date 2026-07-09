import { View, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import type { Category } from '@/types/expense';

type IconName = keyof typeof MaterialCommunityIcons.glyphMap;

const CATEGORY_ICON_BY_KEY: Record<string, IconName> = {
  food: 'silverware-fork-knife',
  coffee: 'coffee',
  transport: 'car-sports',
  shopping: 'shopping-outline',
  entertainment: 'movie-open-outline',
  bills: 'file-document-outline',
  health: 'heart-pulse',
  other: 'shape-outline',
};

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

export function getCategoryIconName(category?: Pick<Category, 'id' | 'name'>): IconName {
  if (category?.id && CATEGORY_ICON_BY_KEY[category.id]) {
    return CATEGORY_ICON_BY_KEY[category.id];
  }
  if (category?.name && CATEGORY_ICON_MAP[category.name]) {
    return CATEGORY_ICON_MAP[category.name];
  }
  return 'shape-outline';
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
      <MaterialCommunityIcons name={getCategoryIconName(category)} size={size} color={color} />
    </View>
  );
}
