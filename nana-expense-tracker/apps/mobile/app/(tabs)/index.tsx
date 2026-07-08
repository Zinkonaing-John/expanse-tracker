import { useCallback } from 'react';
import { View, Text, ScrollView, RefreshControl, StyleSheet, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { ExpenseCard, ExpenseListEmpty } from '@/components/ExpenseCard';
import { useExpenses, useCategories, useDashboardStats } from '@/hooks/useExpenses';
import { useColorScheme } from '@/components/useColorScheme';

const { width } = Dimensions.get('window');

export default function DashboardScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
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
    <SafeAreaView className="flex-1 bg-slate-50 dark:bg-slate-900" edges={['bottom']}>
      <ScrollView 
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={expensesLoading || statsLoading}
            onRefresh={handleRefresh}
            tintColor={isDark ? '#59b8ff' : '#3398ff'}
          />
        }
      >
        <View className="px-5 pt-2 pb-4">
          <Text className="text-sm font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">
            Welcome back
          </Text>
          <Text className="text-3xl font-bold text-slate-900 dark:text-white">
            Nana
          </Text>
        </View>

        <View className="px-5 mb-6">
          <LinearGradient
            colors={isDark ? ['#1464e1', '#7c3aed'] : ['#3398ff', '#a855f7']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.mainCard}
          >
            <View style={styles.mainCardContent}>
              <View style={styles.cardDecoration} />
              <View style={styles.cardDecorationSmall} />
              <Text className="text-white/80 text-sm font-medium mb-1">
                Total Spent This Month
              </Text>
              <Text className="text-white text-5xl font-bold tracking-tight">
                {formatCurrency(monthTotal)}
              </Text>
              <View className="flex-row items-center mt-3">
                <View className="bg-white/20 rounded-full px-3 py-1">
                  <Text className="text-white text-xs font-medium">
                    {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                  </Text>
                </View>
              </View>
            </View>
          </LinearGradient>
        </View>

        <View className="flex-row px-5 gap-3 mb-8">
          <View 
            className="flex-1 bg-white dark:bg-slate-800 rounded-2xl p-4"
            style={styles.statCard}
          >
            <View className="flex-row items-center mb-2">
              <View className="w-8 h-8 rounded-full bg-mint-100 dark:bg-mint-900/30 items-center justify-center mr-2">
                <Text className="text-sm">📅</Text>
              </View>
              <Text className="text-slate-400 dark:text-slate-500 text-xs font-medium uppercase">Today</Text>
            </View>
            <Text className="text-slate-900 dark:text-white text-2xl font-bold">
              {formatCurrency(todayTotal)}
            </Text>
          </View>
          <View 
            className="flex-1 bg-white dark:bg-slate-800 rounded-2xl p-4"
            style={styles.statCard}
          >
            <View className="flex-row items-center mb-2">
              <View className="w-8 h-8 rounded-full bg-coral-100 dark:bg-coral-900/30 items-center justify-center mr-2">
                <Text className="text-sm">📆</Text>
              </View>
              <Text className="text-slate-400 dark:text-slate-500 text-xs font-medium uppercase">This Week</Text>
            </View>
            <Text className="text-slate-900 dark:text-white text-2xl font-bold">
              {formatCurrency(weekTotal)}
            </Text>
          </View>
        </View>

        <View className="px-5 mb-6">
          <View className="flex-row items-center justify-between mb-4">
            <Text className="text-lg font-bold text-slate-900 dark:text-white">
              Recent Transactions
            </Text>
            {recentExpenses.length > 0 && (
              <Text className="text-primary-500 text-sm font-medium">See All</Text>
            )}
          </View>
          {recentExpenses.length === 0 ? (
            <View 
              className="bg-white dark:bg-slate-800 rounded-3xl p-8 items-center"
              style={styles.emptyCard}
            >
              <View className="w-20 h-20 rounded-full bg-slate-100 dark:bg-slate-700 items-center justify-center mb-4">
                <Text className="text-4xl">📝</Text>
              </View>
              <Text className="text-slate-900 dark:text-white font-semibold text-lg mb-2">
                No transactions yet
              </Text>
              <Text className="text-slate-400 dark:text-slate-500 text-center leading-5">
                Say "Hey Nana" or tap the{'\n'}plus button to start tracking!
              </Text>
            </View>
          ) : (
            <View 
              className="bg-white dark:bg-slate-800 rounded-3xl overflow-hidden"
              style={styles.transactionList}
            >
              {recentExpenses.map((expense, index) => (
                <ExpenseCard
                  key={expense.id}
                  expense={expense}
                  category={getCategoryById(expense.category)}
                  isLast={index === recentExpenses.length - 1}
                />
              ))}
            </View>
          )}
        </View>

        <View className="px-5 mb-8">
          <LinearGradient
            colors={isDark ? ['#3b0764', '#581c87'] : ['#faf5ff', '#f3e8ff']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.tipCard}
          >
            <View className="flex-row items-start">
              <View className="w-12 h-12 rounded-2xl bg-accent-500/20 items-center justify-center mr-4">
                <Text className="text-2xl">🎤</Text>
              </View>
              <View className="flex-1">
                <Text className="text-accent-800 dark:text-accent-200 font-bold text-base mb-1">
                  Voice Command Tip
                </Text>
                <Text className="text-accent-700 dark:text-accent-300 text-sm leading-5">
                  Say "Hey Nana, lunch is $12.50" to quickly log an expense!
                </Text>
              </View>
            </View>
          </LinearGradient>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  mainCard: {
    borderRadius: 28,
    overflow: 'hidden',
  },
  mainCardContent: {
    padding: 24,
    paddingTop: 28,
    paddingBottom: 24,
    position: 'relative',
  },
  cardDecoration: {
    position: 'absolute',
    top: -40,
    right: -40,
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  cardDecorationSmall: {
    position: 'absolute',
    bottom: -20,
    right: 60,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  statCard: {
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 4,
  },
  emptyCard: {
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 4,
  },
  transactionList: {
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 4,
  },
  tipCard: {
    borderRadius: 20,
    padding: 20,
  },
});
