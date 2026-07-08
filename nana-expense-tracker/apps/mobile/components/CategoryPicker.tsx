import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import type { Category } from '@/types/expense';

type CategoryPickerProps = {
  categories: Category[];
  selectedCategoryId: string | null;
  onSelect: (categoryId: string) => void;
};

export function CategoryPicker({ categories, selectedCategoryId, onSelect }: CategoryPickerProps) {
  return (
    <View className="flex-row flex-wrap gap-2">
      {categories.map((category) => {
        const isSelected = selectedCategoryId === category.id;
        return (
          <TouchableOpacity
            key={category.id}
            onPress={() => onSelect(category.id)}
            className={`flex-row items-center px-4 py-3 rounded-xl border-2 ${
              isSelected
                ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/30'
                : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800'
            }`}
          >
            <Text className="text-xl mr-2">{category.icon}</Text>
            <Text
              className={`font-medium ${
                isSelected
                  ? 'text-primary-600 dark:text-primary-400'
                  : 'text-gray-700 dark:text-gray-300'
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
  const sizeStyles = {
    sm: 'px-2 py-1',
    md: 'px-3 py-1.5',
    lg: 'px-4 py-2',
  };

  const iconSize = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
  };

  const textSize = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
  };

  return (
    <View 
      className={`flex-row items-center rounded-full ${sizeStyles[size]}`}
      style={{ backgroundColor: category.color + '20' }}
    >
      <Text className={iconSize[size]}>{category.icon}</Text>
      <Text 
        className={`ml-1 font-medium ${textSize[size]}`}
        style={{ color: category.color }}
      >
        {category.name}
      </Text>
    </View>
  );
}
