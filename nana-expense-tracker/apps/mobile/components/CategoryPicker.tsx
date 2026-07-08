import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import type { Category } from '@/types/expense';

type CategoryPickerProps = {
  categories: Category[];
  selectedCategoryId: string | null;
  onSelect: (categoryId: string) => void;
};

export function CategoryPicker({ categories, selectedCategoryId, onSelect }: CategoryPickerProps) {
  return (
    <View className="flex-row flex-wrap gap-3">
      {categories.map((category) => {
        const isSelected = selectedCategoryId === category.id;
        return (
          <TouchableOpacity
            key={category.id}
            onPress={() => onSelect(category.id)}
            activeOpacity={0.7}
            className={`flex-row items-center px-4 py-3 rounded-2xl ${
              isSelected
                ? 'bg-primary-500'
                : 'bg-white dark:bg-slate-800'
            }`}
            style={[
              styles.categoryButton,
              isSelected && styles.categoryButtonSelected,
            ]}
          >
            <View 
              className={`w-10 h-10 rounded-xl items-center justify-center mr-3 ${
                isSelected ? 'bg-white/20' : ''
              }`}
              style={!isSelected ? { backgroundColor: (category.color || '#64748b') + '15' } : undefined}
            >
              <Text className="text-lg">{category.icon}</Text>
            </View>
            <Text
              className={`font-semibold ${
                isSelected
                  ? 'text-white'
                  : 'text-slate-700 dark:text-slate-200'
              }`}
            >
              {category.name}
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
  const sizeConfig = {
    sm: { container: 'px-2.5 py-1.5', icon: 'text-xs', text: 'text-xs' },
    md: { container: 'px-3 py-2', icon: 'text-sm', text: 'text-sm' },
    lg: { container: 'px-4 py-2.5', icon: 'text-base', text: 'text-base' },
  };

  const config = sizeConfig[size];

  return (
    <View 
      className={`flex-row items-center rounded-xl ${config.container}`}
      style={{ backgroundColor: (category.color || '#64748b') + '15' }}
    >
      <Text className={config.icon}>{category.icon}</Text>
      <Text 
        className={`ml-1.5 font-semibold ${config.text}`}
        style={{ color: category.color || '#64748b' }}
      >
        {category.name}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  categoryButton: {
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  categoryButtonSelected: {
    shadowColor: '#3398ff',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
});
