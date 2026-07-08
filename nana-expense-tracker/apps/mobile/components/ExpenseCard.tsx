import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import type { Expense, Category } from '@/types/expense';

type ExpenseCardProps = {
  expense: Expense;
  category?: Category;
  onPress?: () => void;
  isLast?: boolean;
  variant?: 'default' | 'standalone';
};

export function ExpenseCard({ expense, category, onPress, isLast = false, variant = 'default' }: ExpenseCardProps) {
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

  const isStandalone = variant === 'standalone';

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={!onPress}
      className={`flex-row items-center px-4 py-4 ${
        isStandalone 
          ? 'bg-white dark:bg-slate-800 rounded-2xl mb-3' 
          : ''
      }`}
      style={isStandalone ? styles.standaloneCard : undefined}
      activeOpacity={onPress ? 0.6 : 1}
    >
      <View 
        className="w-12 h-12 rounded-2xl items-center justify-center mr-4"
        style={{ backgroundColor: (category?.color || '#64748b') + '15' }}
      >
        <Text className="text-xl">{category?.icon || '📦'}</Text>
      </View>

      <View className="flex-1">
        <View className="flex-row items-center mb-0.5">
          <Text className="text-slate-900 dark:text-white font-semibold text-base">
            {category?.name || 'Unknown'}
          </Text>
          <View className="ml-2 bg-slate-100 dark:bg-slate-700 rounded-full px-1.5 py-0.5">
            <Text className="text-xs">{inputMethodIcon[expense.inputMethod]}</Text>
          </View>
        </View>
        {expense.description ? (
          <Text className="text-slate-400 dark:text-slate-500 text-sm" numberOfLines={1}>
            {expense.description}
          </Text>
        ) : (
          <Text className="text-slate-300 dark:text-slate-600 text-sm">
            {formatDate(expense.date)}
          </Text>
        )}
      </View>

      <View className="items-end">
        <Text className="text-slate-900 dark:text-white font-bold text-base">
          -{formatAmount(expense.amount)}
        </Text>
        {expense.description && (
          <Text className="text-slate-400 dark:text-slate-500 text-xs mt-0.5">
            {formatDate(expense.date)}
          </Text>
        )}
      </View>

      {!isLast && !isStandalone && (
        <View 
          className="absolute bottom-0 left-16 right-4 h-px bg-slate-100 dark:bg-slate-700"
        />
      )}
    </TouchableOpacity>
  );
}

type ExpenseListEmptyProps = {
  message?: string;
};

export function ExpenseListEmpty({ message }: ExpenseListEmptyProps) {
  return (
    <View 
      className="items-center justify-center py-16 bg-white dark:bg-slate-800 rounded-3xl"
      style={styles.emptyContainer}
    >
      <View className="w-24 h-24 rounded-full bg-slate-100 dark:bg-slate-700 items-center justify-center mb-5">
        <Text className="text-5xl">📊</Text>
      </View>
      <Text className="text-xl font-bold text-slate-900 dark:text-white mb-2">
        No expenses yet
      </Text>
      <Text className="text-slate-400 dark:text-slate-500 text-center px-8 leading-5">
        {message || 'Start tracking your expenses by tapping the Add tab or using voice commands.'}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  standaloneCard: {
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  emptyContainer: {
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 4,
  },
});
