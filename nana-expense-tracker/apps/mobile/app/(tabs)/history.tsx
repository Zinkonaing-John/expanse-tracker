import { useState, useCallback, useMemo } from 'react';
import { View, Text, ScrollView, TouchableOpacity, RefreshControl, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { ExpenseCard, ExpenseListEmpty } from '@/components/ExpenseCard';
import { useExpenses, useCategories, useExpenseSummary } from '@/hooks/useExpenses';
import { useColorScheme } from '@/components/useColorScheme';
import Colors, { Accent } from '@/constants/Colors';
import { todayString, toLocalDateString, weekStartString, monthStartString } from '@/services/dates';
import { confirmDialog } from '@/services/dialogs';
import type { Expense } from '@/types/expense';

type Period = 'day' | 'week' | 'month' | 'year';

const PERIODS: { key: Period; label: string; shortLabel: string }[] = [
  { key: 'day', label: 'Today', shortLabel: 'Today' },
  { key: 'week', label: 'This Week', shortLabel: 'Week' },
  { key: 'month', label: 'This Month', shortLabel: 'Month' },
  { key: 'year', label: 'This Year', shortLabel: 'Year' },
];

function getDateRange(period: Period): { startDate: string; endDate: string } {
  const endDate = todayString();
  let startDate: string;

  switch (period) {
    case 'day':
      startDate = endDate;
      break;
    case 'week':
      startDate = weekStartString();
      break;
    case 'month':
      startDate = monthStartString();
      break;
    case 'year':
      startDate = toLocalDateString(new Date(new Date().getFullYear(), 0, 1));
      break;
  }

  return { startDate, endDate };
}

export default function HistoryScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const theme = Colors[colorScheme ?? 'light'];
  const [selectedPeriod, setSelectedPeriod] = useState<Period>('month');
  const { categories } = useCategories();

  const { startDate, endDate } = useMemo(() => getDateRange(selectedPeriod), [selectedPeriod]);

  const { expenses, loading, refresh, deleteExpense } = useExpenses({ startDate, endDate });
  const { summary, refresh: refreshSummary } = useExpenseSummary(startDate, endDate);

  const handleExpensePress = async (expense: Expense) => {
    const category = getCategoryById(expense.category);
    const confirmed = await confirmDialog(
      'Delete Expense',
      `Delete ${category?.name || 'this'} expense of ${formatCurrency(expense.amount)}?`,
      'Delete',
      true
    );
    if (confirmed) {
      await deleteExpense(expense.id);
      await refreshSummary();
    }
  };

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
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    if (dateString === todayString()) {
      return 'Today';
    }
    if (dateString === toLocalDateString(yesterday)) {
      return 'Yesterday';
    }
    // Parse as local date (appending T00:00:00 avoids UTC interpretation).
    const date = new Date(`${dateString}T00:00:00`);
    return date.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });
  };

  const groupedExpenses = groupExpensesByDate();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.background }} edges={['bottom']}>
      <View style={{ paddingHorizontal: 20, paddingTop: 8, paddingBottom: 16 }}>
        <View
          style={[
            styles.periodSelector,
            { backgroundColor: theme.surface, borderColor: theme.border },
          ]}
        >
          {PERIODS.map((period) => {
            const isSelected = selectedPeriod === period.key;
            return (
              <TouchableOpacity
                key={period.key}
                onPress={() => setSelectedPeriod(period.key)}
                activeOpacity={0.7}
                style={{ flex: 1 }}
              >
                <View
                  style={[
                    styles.periodButton,
                    isSelected && {
                      backgroundColor: isDark ? 'rgba(34,211,238,0.15)' : 'rgba(8,145,178,0.10)',
                      borderWidth: 1,
                      borderColor: isDark ? 'rgba(34,211,238,0.4)' : 'rgba(8,145,178,0.35)',
                    },
                  ]}
                >
                  <Text
                    style={{
                      color: isSelected ? theme.tint : theme.textSecondary,
                      fontWeight: isSelected ? '800' : '600',
                      fontSize: 13,
                    }}
                  >
                    {period.shortLabel}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        <View
          style={[
            styles.summaryCard,
            { backgroundColor: theme.surface, borderColor: theme.border },
          ]}
        >
          <View style={{ flex: 1 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
              <MaterialCommunityIcons name="trending-down" size={14} color={theme.tint} />
              <Text style={{ color: theme.textSecondary, fontSize: 12, fontWeight: '600', letterSpacing: 1, textTransform: 'uppercase', marginLeft: 6 }}>
                {PERIODS.find(p => p.key === selectedPeriod)?.label}
              </Text>
            </View>
            <Text style={{ color: theme.text, fontSize: 34, fontWeight: '800', letterSpacing: -1 }}>
              {formatCurrency(summary.total)}
            </Text>
          </View>
          <View
            style={{
              alignItems: 'center',
              backgroundColor: theme.surfaceSecondary,
              borderRadius: 16,
              paddingHorizontal: 16,
              paddingVertical: 10,
              borderWidth: 1,
              borderColor: theme.border,
            }}
          >
            <Text style={{ color: theme.text, fontSize: 20, fontWeight: '800' }}>
              {summary.count}
            </Text>
            <Text style={{ color: theme.textSecondary, fontSize: 11, fontWeight: '600' }}>
              {summary.count === 1 ? 'expense' : 'expenses'}
            </Text>
          </View>
        </View>
      </View>

      <ScrollView
        style={{ flex: 1, paddingHorizontal: 20 }}
        contentContainerStyle={{ paddingBottom: 110 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={handleRefresh} tintColor={theme.tint} />
        }
      >
        <Text style={{ color: theme.text, fontSize: 17, fontWeight: '800', letterSpacing: 0.3, marginBottom: 14 }}>
          Transactions
        </Text>

        {expenses.length === 0 ? (
          <ExpenseListEmpty
            message={`No expenses for this period.\nStart tracking to see your spending here.`}
          />
        ) : (
          <View>
            {groupedExpenses.map(([date, dateExpenses]) => (
              <View key={date} style={{ marginBottom: 20 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
                  <View
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: 4,
                      backgroundColor: Accent.cyan,
                      marginRight: 8,
                      shadowColor: Accent.cyan,
                      shadowOffset: { width: 0, height: 0 },
                      shadowOpacity: 0.8,
                      shadowRadius: 4,
                      elevation: 3,
                    }}
                  />
                  <Text style={{ color: theme.textSecondary, fontSize: 12, fontWeight: '700', letterSpacing: 1.2, textTransform: 'uppercase' }}>
                    {formatDateHeader(date)}
                  </Text>
                </View>
                <View
                  style={{
                    backgroundColor: theme.surface,
                    borderRadius: 20,
                    borderWidth: 1,
                    borderColor: theme.border,
                    overflow: 'hidden',
                  }}
                >
                  {dateExpenses.map((expense, index) => (
                    <ExpenseCard
                      key={expense.id}
                      expense={expense}
                      category={getCategoryById(expense.category)}
                      onPress={() => handleExpensePress(expense)}
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
    flexDirection: 'row',
    borderRadius: 18,
    borderWidth: 1,
    padding: 5,
    marginBottom: 18,
  },
  periodButton: {
    paddingVertical: 9,
    paddingHorizontal: 4,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 13,
  },
  summaryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 24,
    borderWidth: 1,
    padding: 20,
  },
});
