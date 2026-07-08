import { useState, useCallback, useMemo } from 'react';
import { View, Text, ScrollView, TouchableOpacity, FlatList, RefreshControl, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from 'expo-router';
import { ExpenseCard, ExpenseListEmpty } from '@/components/ExpenseCard';
import { useExpenses, useCategories, useExpenseSummary } from '@/hooks/useExpenses';
import { useColorScheme } from '@/components/useColorScheme';

type Period = 'day' | 'week' | 'month' | 'year';

const PERIODS: { key: Period; label: string; shortLabel: string }[] = [
  { key: 'day', label: 'Today', shortLabel: 'Today' },
  { key: 'week', label: 'This Week', shortLabel: 'Week' },
  { key: 'month', label: 'This Month', shortLabel: 'Month' },
  { key: 'year', label: 'This Year', shortLabel: 'Year' },
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
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
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
    <SafeAreaView className="flex-1 bg-slate-50 dark:bg-slate-900" edges={['bottom']}>
      <View className="px-5 pt-2 pb-4">
        <View 
          className="bg-white dark:bg-slate-800 rounded-2xl p-1.5 mb-5"
          style={styles.periodSelector}
        >
          <View className="flex-row">
            {PERIODS.map((period) => {
              const isSelected = selectedPeriod === period.key;
              return (
                <TouchableOpacity
                  key={period.key}
                  onPress={() => handlePeriodChange(period.key)}
                  activeOpacity={0.7}
                  style={{ flex: 1 }}
                >
                  <View style={[
                    styles.periodButton,
                    isSelected && { backgroundColor: '#3398ff' }
                  ]}>
                    <Text style={{ 
                      color: isSelected ? '#ffffff' : (isDark ? '#94a3b8' : '#64748b'), 
                      fontWeight: '600', 
                      fontSize: 14 
                    }}>
                      {period.shortLabel}
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        <View 
          className="bg-white dark:bg-slate-800 rounded-3xl p-5"
          style={styles.summaryCard}
        >
          <View className="flex-row justify-between items-start">
            <View className="flex-1">
              <Text className="text-slate-400 dark:text-slate-500 text-sm font-medium mb-1">
                {PERIODS.find(p => p.key === selectedPeriod)?.label}
              </Text>
              <Text className="text-slate-900 dark:text-white text-4xl font-bold tracking-tight">
                {formatCurrency(summary.total)}
              </Text>
            </View>
            <View 
              className="bg-slate-100 dark:bg-slate-700 rounded-2xl px-4 py-2 items-center"
            >
              <Text className="text-slate-900 dark:text-white text-xl font-bold">
                {summary.count}
              </Text>
              <Text className="text-slate-400 dark:text-slate-500 text-xs font-medium">
                {summary.count === 1 ? 'expense' : 'expenses'}
              </Text>
            </View>
          </View>
        </View>
      </View>

      <ScrollView
        className="flex-1 px-5"
        contentContainerStyle={{ paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl 
            refreshing={loading} 
            onRefresh={handleRefresh}
            tintColor={isDark ? '#59b8ff' : '#3398ff'}
          />
        }
      >
        <View className="flex-row items-center justify-between mb-4">
          <Text className="text-lg font-bold text-slate-900 dark:text-white">
            Transactions
          </Text>
        </View>
        
        {expenses.length === 0 ? (
          <ExpenseListEmpty 
            message={`No expenses for this period.\nStart tracking to see your spending here.`}
          />
        ) : (
          <View>
            {groupedExpenses.map(([date, dateExpenses]) => (
              <View key={date} className="mb-5">
                <View className="flex-row items-center mb-3">
                  <View className="w-2 h-2 rounded-full bg-primary-500 mr-2" />
                  <Text className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    {formatDateHeader(date)}
                  </Text>
                </View>
                <View 
                  className="bg-white dark:bg-slate-800 rounded-2xl overflow-hidden"
                  style={styles.transactionGroup}
                >
                  {dateExpenses.map((expense, index) => (
                    <ExpenseCard
                      key={expense.id}
                      expense={expense}
                      category={getCategoryById(expense.category)}
                      isLast={index === dateExpenses.length - 1}
                    />
                  ))}
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  periodSelector: {
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  periodButton: {
    paddingVertical: 10,
    paddingHorizontal: 4,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
  },
  summaryCard: {
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 4,
  },
  transactionGroup: {
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
});
