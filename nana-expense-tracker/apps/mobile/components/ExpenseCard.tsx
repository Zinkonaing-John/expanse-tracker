import { View, Text, TouchableOpacity } from 'react-native';
import type { Expense, Category } from '@/types/expense';

type ExpenseCardProps = {
  expense: Expense;
  category?: Category;
  onPress?: () => void;
};

export function ExpenseCard({ expense, category, onPress }: ExpenseCardProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (dateString === today.toISOString().split('T')[0]) {
      return 'Today';
    }
    if (dateString === yesterday.toISOString().split('T')[0]) {
      return 'Yesterday';
    }
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const inputMethodIcon = {
    voice: '🎤',
    camera: '📷',
    manual: '✏️',
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={!onPress}
      className="flex-row items-center bg-white dark:bg-gray-800 p-4 rounded-xl mb-2"
      activeOpacity={onPress ? 0.7 : 1}
    >
      <View 
        className="w-12 h-12 rounded-full items-center justify-center mr-3"
        style={{ backgroundColor: (category?.color || '#6b7280') + '20' }}
      >
        <Text className="text-2xl">{category?.icon || '📦'}</Text>
      </View>

      <View className="flex-1">
        <View className="flex-row items-center">
          <Text className="text-gray-900 dark:text-white font-medium">
            {category?.name || 'Unknown'}
          </Text>
          <Text className="ml-2 text-xs">{inputMethodIcon[expense.inputMethod]}</Text>
        </View>
        {expense.description ? (
          <Text className="text-gray-500 dark:text-gray-400 text-sm" numberOfLines={1}>
            {expense.description}
          </Text>
        ) : null}
      </View>

      <View className="items-end">
        <Text className="text-gray-900 dark:text-white font-semibold">
          {formatAmount(expense.amount)}
        </Text>
        <Text className="text-gray-400 dark:text-gray-500 text-xs">
          {formatDate(expense.date)}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

type ExpenseListEmptyProps = {
  message?: string;
};

export function ExpenseListEmpty({ message }: ExpenseListEmptyProps) {
  return (
    <View className="flex-1 items-center justify-center py-16">
      <Text className="text-6xl mb-4">📊</Text>
      <Text className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
        No expenses yet
      </Text>
      <Text className="text-gray-500 dark:text-gray-400 text-center px-8">
        {message || 'Start tracking your expenses by tapping the Add tab or using voice commands.'}
      </Text>
    </View>
  );
}
