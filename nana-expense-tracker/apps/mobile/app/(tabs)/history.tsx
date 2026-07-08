import { useState, useCallback, useMemo } from 'react';
import { View, Text, ScrollView, TouchableOpacity, FlatList, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from 'expo-router';
import { ExpenseCard, ExpenseListEmpty } from '@/components/ExpenseCard';
import { useExpenses, useCategories, useExpenseSummary } from '@/hooks/useExpenses';

type Period = 'day' | 'week' | 'month' | 'year';

const PERIODS: { key: Period; label: string }[] = [
  { key: 'day', label: 'Today' },
  { key: 'week', label: 'Week' },
  { key: 'month', label: 'Month' },
  { key: 'year', label: 'Year' },
];

function getDateRange(period: Period): { startDate: string; endDate: string } {
  const today = new Date();
  const endDate = today.toISOString().split('T')[0];
  let startDate: string;

  switch (period) {
    case 'day':
      startDate = endDate;
      break;
    case 'week':
      const weekStart = new Date(today);
      weekStart.setDate(today.getDate() - today.getDay());
      startDate = weekStart.toISOString().split('T')[0];
      break;
    case 'month':
      const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
      startDate = monthStart.toISOString().split('T')[0];
      break;
    case 'year':
      const yearStart = new Date(today.getFullYear(), 0, 1);
      startDate = yearStart.toISOString().split('T')[0];
      break;
  }

  return { startDate, endDate };
}

export default function HistoryScreen() {
  const [selectedPeriod, setSelectedPeriod] = useState<Period>('month');
  const { categories } = useCategories();
  
  const { startDate, endDate } = useMemo(() => getDateRange(selectedPeriod), [selectedPeriod]);
  
  const { expenses, loading, refresh } = useExpenses({ startDate, endDate });
  const { summary, refresh: refreshSummary } = useExpenseSummary(startDate, endDate);

  useFocusEffect(
    useCallback(() => {
      refresh();
      refreshSummary();
    }, [startDate, endDate])
  );

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const getCategoryById = (categoryId: string) => {
    return categories.find(c => c.id === categoryId);
  };

  const handleRefresh = async () => {
    await Promise.all([refresh(), refreshSummary()]);
  };

  const handlePeriodChange = (period: Period) => {
    setSelectedPeriod(period);
  };

  const groupExpensesByDate = () => {
    const groups: Record<string, typeof expenses> = {};
    for (const expense of expenses) {
      if (!groups[expense.date]) {
        groups[expense.date] = [];
      }
      groups[expense.date].push(expense);
    }
    return Object.entries(groups).sort((a, b) => b[0].localeCompare(a[0]));
  };

  const formatDateHeader = (dateString: string) => {
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
    return date.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });
  };

  const groupedExpenses = groupExpensesByDate();

  return (
    <SafeAreaView className="flex-1 bg-gray-50 dark:bg-gray-900" edges={['bottom']}>
      <View className="px-4 py-3">
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-4">
          <View className="flex-row gap-2">
            {PERIODS.map((period) => (
              <TouchableOpacity
                key={period.key}
                onPress={() => handlePeriodChange(period.key)}
                className={`px-5 py-2 rounded-full ${
                  selectedPeriod === period.key
                    ? 'bg-primary-500'
                    : 'bg-white dark:bg-gray-800'
                }`}
              >
                <Text
                  className={`font-medium ${
                    selectedPeriod === period.key
                      ? 'text-white'
                      : 'text-gray-700 dark:text-gray-300'
                  }`}
                >
                  {period.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>

        <View className="bg-white dark:bg-gray-800 rounded-xl p-4 mb-4">
          <View className="flex-row justify-between items-center">
            <View>
              <Text className="text-gray-500 dark:text-gray-400 text-sm mb-1">
                Total for {PERIODS.find(p => p.key === selectedPeriod)?.label.toLowerCase()}
              </Text>
              <Text className="text-3xl font-bold text-gray-900 dark:text-white">
                {formatCurrency(summary.total)}
              </Text>
            </View>
            <View className="items-end">
              <Text className="text-gray-500 dark:text-gray-400 text-sm">
                {summary.count} {summary.count === 1 ? 'expense' : 'expenses'}
              </Text>
            </View>
          </View>
        </View>
      </View>

      <ScrollView
        className="flex-1 px-4"
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={handleRefresh} />
        }
      >
        <Text className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
          Transactions
        </Text>
        
        {expenses.length === 0 ? (
          <ExpenseListEmpty 
            message={`No expenses for this ${selectedPeriod}. Start tracking to see your spending here.`}
          />
        ) : (
          <View className="pb-8">
            {groupedExpenses.map(([date, dateExpenses]) => (
              <View key={date} className="mb-4">
                <Text className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                  {formatDateHeader(date)}
                </Text>
                {dateExpenses.map((expense) => (
                  <ExpenseCard
                    key={expense.id}
                    expense={expense}
                    category={getCategoryById(expense.category)}
                  />
                ))}
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
