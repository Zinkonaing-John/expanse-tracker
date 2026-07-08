import { useCallback } from 'react';
import { View, Text, ScrollView, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from 'expo-router';
import { ExpenseCard, ExpenseListEmpty } from '@/components/ExpenseCard';
import { useExpenses, useCategories, useDashboardStats } from '@/hooks/useExpenses';

export default function DashboardScreen() {
  const { expenses, loading: expensesLoading, refresh: refreshExpenses } = useExpenses();
  const { categories } = useCategories();
  const { todayTotal, weekTotal, monthTotal, loading: statsLoading, refresh: refreshStats } = useDashboardStats();

  const recentExpenses = expenses.slice(0, 5);

  useFocusEffect(
    useCallback(() => {
      refreshExpenses();
      refreshStats();
    }, [])
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
    await Promise.all([refreshExpenses(), refreshStats()]);
  };

  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-gray-900" edges={['bottom']}>
      <ScrollView 
        className="flex-1 px-4"
        refreshControl={
          <RefreshControl
            refreshing={expensesLoading || statsLoading}
            onRefresh={handleRefresh}
          />
        }
      >
        <View className="py-4">
          <Text className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Welcome to Nana
          </Text>
          <Text className="text-gray-600 dark:text-gray-400">
            Your voice-activated expense tracker
          </Text>
        </View>

        <View className="bg-primary-500 rounded-2xl p-6 mb-6">
          <Text className="text-white text-sm mb-1">Total Spent This Month</Text>
          <Text className="text-white text-4xl font-bold">
            {formatCurrency(monthTotal)}
          </Text>
        </View>

        <View className="flex-row gap-3 mb-6">
          <View className="flex-1 bg-gray-100 dark:bg-gray-800 rounded-xl p-4">
            <Text className="text-gray-500 dark:text-gray-400 text-xs mb-1">Today</Text>
            <Text className="text-gray-900 dark:text-white text-xl font-semibold">
              {formatCurrency(todayTotal)}
            </Text>
          </View>
          <View className="flex-1 bg-gray-100 dark:bg-gray-800 rounded-xl p-4">
            <Text className="text-gray-500 dark:text-gray-400 text-xs mb-1">This Week</Text>
            <Text className="text-gray-900 dark:text-white text-xl font-semibold">
              {formatCurrency(weekTotal)}
            </Text>
          </View>
        </View>

        <View className="mb-6">
          <Text className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
            Recent Transactions
          </Text>
          {recentExpenses.length === 0 ? (
            <View className="bg-gray-50 dark:bg-gray-800 rounded-xl p-8 items-center">
              <Text className="text-5xl mb-3">📝</Text>
              <Text className="text-gray-500 dark:text-gray-400 text-center">
                No transactions yet.{'\n'}Say "Hey Nana" or tap Add to start tracking!
              </Text>
            </View>
          ) : (
            <View>
              {recentExpenses.map((expense) => (
                <ExpenseCard
                  key={expense.id}
                  expense={expense}
                  category={getCategoryById(expense.category)}
                />
              ))}
            </View>
          )}
        </View>

        <View className="bg-accent-100 dark:bg-accent-900/30 rounded-xl p-4 mb-8">
          <View className="flex-row items-center mb-2">
            <Text className="text-2xl mr-2">🎤</Text>
            <Text className="text-accent-700 dark:text-accent-300 font-semibold">
              Voice Command Tip
            </Text>
          </View>
          <Text className="text-accent-600 dark:text-accent-400">
            Say "Hey Nana, lunch is $12.50" to quickly log an expense!
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
