import { useCallback } from 'react';
import { View, Text, ScrollView, RefreshControl, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect, useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { ExpenseCard } from '@/components/ExpenseCard';
import { useExpenses, useCategories, useDashboardStats } from '@/hooks/useExpenses';
import { useLocale } from '@/i18n/LocaleContext';
import { useColorScheme } from '@/components/useColorScheme';
import Colors, { Accent } from '@/constants/Colors';

export default function DashboardScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const theme = Colors[colorScheme ?? 'light'];
  const { t, formatCurrency } = useLocale();
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

  const getCategoryById = (categoryId: string) => {
    return categories.find(c => c.id === categoryId);
  };

  const handleRefresh = async () => {
    await Promise.all([refreshExpenses(), refreshStats()]);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.background }} edges={['bottom']}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 110 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={expensesLoading || statsLoading}
            onRefresh={handleRefresh}
            tintColor={theme.tint}
          />
        }
      >
        <View style={{ paddingHorizontal: 20, paddingTop: 8, paddingBottom: 18 }}>
          <Text style={{ color: theme.textSecondary, fontSize: 12, fontWeight: '600', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 4 }}>
            {t('dashboardGreeting')}
          </Text>
          <Text style={{ color: theme.text, fontSize: 30, fontWeight: '800', letterSpacing: 0.5 }}>
            {t('appName')}
          </Text>
        </View>

        <View style={{ paddingHorizontal: 20, marginBottom: 20 }}>
          <View
            style={{
              borderRadius: 28,
              shadowColor: Accent.cyan,
              shadowOffset: { width: 0, height: 8 },
              shadowOpacity: isDark ? 0.35 : 0.3,
              shadowRadius: 24,
              elevation: 12,
            }}
          >
            <LinearGradient
              colors={isDark ? ['#0e7490', '#6d28d9'] : ['#06b6d4', '#8b5cf6']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.heroCard}
            >
              <View style={styles.heroDecorLarge} />
              <View style={styles.heroDecorSmall} />
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 6 }}>
                <MaterialCommunityIcons name="lightning-bolt" size={16} color="rgba(255,255,255,0.85)" />
                <Text style={{ color: 'rgba(255,255,255,0.85)', fontSize: 13, fontWeight: '600', letterSpacing: 1.5, textTransform: 'uppercase', marginLeft: 6 }}>
                  {t('dashboardMonth')}
                </Text>
              </View>
              <Text style={{ color: '#ffffff', fontSize: 44, fontWeight: '800', letterSpacing: -1 }}>
                {formatCurrency(monthTotal)}
              </Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 14 }}>
                <View style={styles.heroBadge}>
                  <MaterialCommunityIcons name="calendar-month-outline" size={14} color="#ffffff" />
                  <Text style={{ color: '#ffffff', fontSize: 12, fontWeight: '600', marginLeft: 6 }}>
                    {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                  </Text>
                </View>
              </View>
            </LinearGradient>
          </View>
        </View>

        <View style={{ flexDirection: 'row', paddingHorizontal: 20, gap: 12, marginBottom: 28 }}>
          <StatCard
            icon="calendar-today"
            iconColor={Accent.cyan}
            label={t('dashboardToday')}
            value={formatCurrency(todayTotal)}
            theme={theme}
          />
          <StatCard
            icon="calendar-week"
            iconColor={Accent.violet}
            label={t('dashboardWeek')}
            value={formatCurrency(weekTotal)}
            theme={theme}
          />
        </View>

        <View style={{ paddingHorizontal: 20, marginBottom: 20 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
            <Text style={{ color: theme.text, fontSize: 17, fontWeight: '800', letterSpacing: 0.3 }}>
              {t('dashboardRecent')}
            </Text>
            {recentExpenses.length > 0 && (
              <TouchableOpacity
                onPress={() => router.push('/(tabs)/history')}
                activeOpacity={0.7}
                style={{ flexDirection: 'row', alignItems: 'center' }}
              >
                <Text style={{ color: theme.tint, fontSize: 13, fontWeight: '700' }}>See All</Text>
                <MaterialCommunityIcons name="chevron-right" size={20} color={theme.tint} />
              </TouchableOpacity>
            )}
          </View>
          {recentExpenses.length === 0 ? (
            <View style={[styles.emptyCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
              <View style={[styles.emptyIconRing, { borderColor: isDark ? 'rgba(34,211,238,0.25)' : 'rgba(8,145,178,0.2)' }]}>
                <MaterialCommunityIcons name="text-box-plus-outline" size={34} color={theme.tint} />
              </View>
              <Text style={{ color: theme.text, fontWeight: '700', fontSize: 17, marginBottom: 6 }}>
                No transactions yet
              </Text>
              <Text style={{ color: theme.textSecondary, textAlign: 'center', lineHeight: 20, fontSize: 14 }}>
                Say "Hey Nana" or tap the plus{'\n'}button to start tracking!
              </Text>
            </View>
          ) : (
            <View style={[styles.listCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
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

        <View style={{ paddingHorizontal: 20, marginBottom: 24 }}>
          <View
            style={[
              styles.tipCard,
              {
                backgroundColor: isDark ? 'rgba(139, 92, 246, 0.10)' : 'rgba(139, 92, 246, 0.08)',
                borderColor: isDark ? 'rgba(139, 92, 246, 0.30)' : 'rgba(139, 92, 246, 0.25)',
              },
            ]}
          >
            <View
              style={{
                width: 46,
                height: 46,
                borderRadius: 16,
                backgroundColor: 'rgba(139, 92, 246, 0.18)',
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: 14,
              }}
            >
              <MaterialCommunityIcons name="microphone" size={24} color={Accent.violet} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ color: isDark ? '#c4b5fd' : '#6d28d9', fontWeight: '800', fontSize: 15, marginBottom: 3 }}>
                Voice Command Tip
              </Text>
              <Text style={{ color: isDark ? '#a78bfa' : '#7c3aed', fontSize: 13, lineHeight: 19 }}>
                Say "Hey Nana, lunch is $12.50" to quickly log an expense!
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

type StatCardProps = {
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  iconColor: string;
  label: string;
  value: string;
  theme: (typeof Colors)['light'] | (typeof Colors)['dark'];
};

function StatCard({ icon, iconColor, label, value, theme }: StatCardProps) {
  return (
    <View style={[styles.statCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
        <View
          style={{
            width: 30,
            height: 30,
            borderRadius: 10,
            backgroundColor: iconColor + '1F',
            alignItems: 'center',
            justifyContent: 'center',
            marginRight: 8,
          }}
        >
          <MaterialCommunityIcons name={icon} size={16} color={iconColor} />
        </View>
        <Text style={{ color: theme.textSecondary, fontSize: 11, fontWeight: '700', letterSpacing: 1.2, textTransform: 'uppercase' }}>
          {label}
        </Text>
      </View>
      <Text style={{ color: theme.text, fontSize: 22, fontWeight: '800', letterSpacing: -0.5 }}>
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  heroCard: {
    borderRadius: 28,
    padding: 24,
    paddingVertical: 28,
    overflow: 'hidden',
  },
  heroDecorLarge: {
    position: 'absolute',
    top: -50,
    right: -50,
    width: 150,
    height: 150,
    borderRadius: 75,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.25)',
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
  },
  heroDecorSmall: {
    position: 'absolute',
    bottom: -24,
    right: 70,
    width: 70,
    height: 70,
    borderRadius: 35,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.18)',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  heroBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.18)',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.25)',
  },
  statCard: {
    flex: 1,
    borderRadius: 20,
    borderWidth: 1,
    padding: 16,
  },
  emptyCard: {
    borderRadius: 24,
    borderWidth: 1,
    padding: 32,
    alignItems: 'center',
  },
  emptyIconRing: {
    width: 76,
    height: 76,
    borderRadius: 38,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  listCard: {
    borderRadius: 24,
    borderWidth: 1,
    overflow: 'hidden',
  },
  tipCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    borderRadius: 20,
    borderWidth: 1,
    padding: 18,
  },
});
