import { View, Text, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { getCategoryIconName } from '@/components/CategoryIcon';
import { useColorScheme } from '@/components/useColorScheme';
import { useLocale } from '@/i18n/LocaleContext';
import { getCategoryDisplayName } from '@/services/categoryDisplay';
import Colors from '@/constants/Colors';
import type { Category } from '@/types/expense';

type CategoryPickerProps = {
  categories: Category[];
  selectedCategoryId: string | null;
  onSelect: (categoryId: string) => void;
};

export function CategoryPicker({ categories, selectedCategoryId, onSelect }: CategoryPickerProps) {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];
  const { categoryLabel } = useLocale();

  return (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
      {categories.map((category) => {
        const isSelected = selectedCategoryId === category.id;
        const color = category.color || '#64748b';
        const displayName = getCategoryDisplayName(category, categoryLabel);

        return (
          <TouchableOpacity
            key={category.id}
            onPress={() => onSelect(category.id)}
            activeOpacity={0.7}
            style={[
              {
                flexDirection: 'row',
                alignItems: 'center',
                paddingHorizontal: 14,
                paddingVertical: 10,
                borderRadius: 16,
                borderWidth: 1.5,
              },
              isSelected
                ? {
                    backgroundColor: color + '1F',
                    borderColor: color,
                    shadowColor: color,
                    shadowOffset: { width: 0, height: 0 },
                    shadowOpacity: 0.45,
                    shadowRadius: 8,
                    elevation: 5,
                  }
                : {
                    backgroundColor: theme.surface,
                    borderColor: theme.border,
                  },
            ]}
          >
            <MaterialCommunityIcons
              name={getCategoryIconName(category)}
              size={18}
              color={isSelected ? color : theme.textSecondary}
              style={{ marginRight: 8 }}
            />
            <Text
              style={{
                fontWeight: '700',
                fontSize: 14,
                color: isSelected ? color : theme.textSecondary,
              }}
            >
              {displayName}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

type CategoryChipProps = {
  category: Category;
  size?: 'sm' | 'md' | 'lg';
};

export function CategoryChip({ category, size = 'md' }: CategoryChipProps) {
  const { categoryLabel } = useLocale();
  const sizeConfig = {
    sm: { paddingH: 8, paddingV: 4, icon: 12, text: 11 },
    md: { paddingH: 10, paddingV: 6, icon: 14, text: 13 },
    lg: { paddingH: 14, paddingV: 8, icon: 16, text: 15 },
  };

  const config = sizeConfig[size];
  const color = category.color || '#64748b';
  const displayName = getCategoryDisplayName(category, categoryLabel);

  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: 12,
        paddingHorizontal: config.paddingH,
        paddingVertical: config.paddingV,
        backgroundColor: color + '1A',
        borderWidth: 1,
        borderColor: color + '40',
      }}
    >
      <MaterialCommunityIcons name={getCategoryIconName(category)} size={config.icon} color={color} />
      <Text style={{ marginLeft: 6, fontWeight: '700', fontSize: config.text, color }}>
        {displayName}
      </Text>
    </View>
  );
}
