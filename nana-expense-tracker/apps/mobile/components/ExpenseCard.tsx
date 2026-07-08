import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { CategoryIcon, INPUT_METHOD_ICONS } from '@/components/CategoryIcon';
import { useColorScheme } from '@/components/useColorScheme';
import Colors from '@/constants/Colors';
import type { Expense, Category } from '@/types/expense';

type ExpenseCardProps = {
  expense: Expense;
  category?: Category;
  onPress?: () => void;
  isLast?: boolean;
};

export function ExpenseCard({ expense, category, onPress, isLast = false }: ExpenseCardProps) {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];
  const isDark = colorScheme === 'dark';

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

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={!onPress}
      style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 14 }}
      activeOpacity={onPress ? 0.6 : 1}
    >
      <View style={{ marginRight: 14 }}>
        <CategoryIcon category={category} />
      </View>

      <View style={{ flex: 1 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 2 }}>
          <Text style={{ color: theme.text, fontWeight: '700', fontSize: 15 }}>
            {category?.name || 'Unknown'}
          </Text>
          <View
            style={{
              marginLeft: 8,
              backgroundColor: theme.surfaceSecondary,
              borderRadius: 8,
              paddingHorizontal: 6,
              paddingVertical: 3,
            }}
          >
            <MaterialCommunityIcons
              name={INPUT_METHOD_ICONS[expense.inputMethod] || 'pencil-outline'}
              size={11}
              color={theme.textSecondary}
            />
          </View>
        </View>
        <Text style={{ color: theme.textSecondary, fontSize: 13 }} numberOfLines={1}>
          {expense.description || formatDate(expense.date)}
        </Text>
      </View>

      <View style={{ alignItems: 'flex-end' }}>
        <Text style={{ color: theme.text, fontWeight: '800', fontSize: 15, letterSpacing: -0.3 }}>
          -{formatAmount(expense.amount)}
        </Text>
        {expense.description ? (
          <Text style={{ color: theme.textSecondary, fontSize: 11, marginTop: 2 }}>
            {formatDate(expense.date)}
          </Text>
        ) : null}
      </View>

      {!isLast && (
        <View
          style={{
            position: 'absolute',
            bottom: 0,
            left: 76,
            right: 16,
            height: StyleSheet.hairlineWidth,
            backgroundColor: isDark ? 'rgba(148,163,184,0.12)' : 'rgba(11,18,32,0.07)',
          }}
        />
      )}
    </TouchableOpacity>
  );
}

type ExpenseListEmptyProps = {
  message?: string;
};

export function ExpenseListEmpty({ message }: ExpenseListEmptyProps) {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];
  const isDark = colorScheme === 'dark';

  return (
    <View
      style={{
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 56,
        paddingHorizontal: 24,
        backgroundColor: theme.surface,
        borderRadius: 24,
        borderWidth: 1,
        borderColor: theme.border,
      }}
    >
      <View
        style={{
          width: 84,
          height: 84,
          borderRadius: 42,
          borderWidth: 1.5,
          borderColor: isDark ? 'rgba(34,211,238,0.25)' : 'rgba(8,145,178,0.2)',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: 18,
        }}
      >
        <MaterialCommunityIcons name="chart-donut" size={38} color={theme.tint} />
      </View>
      <Text style={{ color: theme.text, fontSize: 19, fontWeight: '800', marginBottom: 8 }}>
        No expenses yet
      </Text>
      <Text style={{ color: theme.textSecondary, textAlign: 'center', lineHeight: 20, fontSize: 14 }}>
        {message || 'Start tracking your expenses by tapping the Add tab or using voice commands.'}
      </Text>
    </View>
  );
}
