import { View, Text, TouchableOpacity, ScrollView, Switch, Alert, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState } from 'react';
import { useExpenses, useCategories } from '@/hooks/useExpenses';
import { exportExpenses } from '@/services/exportService';
import { clearAllData } from '@/services/database';
import { useColorScheme } from '@/components/useColorScheme';

type SettingItemProps = {
  icon: string;
  iconBg?: string;
  title: string;
  subtitle?: string;
  onPress?: () => void;
  rightElement?: React.ReactNode;
  danger?: boolean;
  isFirst?: boolean;
  isLast?: boolean;
};

function SettingItem({ icon, iconBg, title, subtitle, onPress, rightElement, danger, isFirst, isLast }: SettingItemProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={!onPress && !rightElement}
      activeOpacity={0.6}
      className={`flex-row items-center px-4 py-4 ${
        isFirst ? 'rounded-t-2xl' : ''
      } ${isLast ? 'rounded-b-2xl' : ''}`}
    >
      <View 
        className="w-11 h-11 rounded-xl items-center justify-center mr-4"
        style={{ 
          backgroundColor: danger 
            ? (isDark ? 'rgba(239, 68, 68, 0.15)' : '#fee2e2')
            : iconBg || (isDark ? '#334155' : '#f1f5f9')
        }}
      >
        <Text className="text-xl">{icon}</Text>
      </View>
      <View className="flex-1">
        <Text className={`font-semibold text-base ${
          danger ? 'text-error dark:text-red-400' : 'text-slate-900 dark:text-white'
        }`}>{title}</Text>
        {subtitle && (
          <Text className="text-slate-400 dark:text-slate-500 text-sm mt-0.5">{subtitle}</Text>
        )}
      </View>
      {rightElement || (
        onPress && <Text style={{ fontSize: 18, color: isDark ? '#64748b' : '#94a3b8' }}>›</Text>
      )}
      {!isLast && (
        <View className="absolute bottom-0 left-[72px] right-4 h-px bg-slate-100 dark:bg-slate-700/50" />
      )}
    </TouchableOpacity>
  );
}

export default function SettingsScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [notifications, setNotifications] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const { expenses, refresh } = useExpenses();
  const { categories } = useCategories();

  const handleExportCSV = async () => {
    if (expenses.length === 0) {
      Alert.alert('No Data', 'There are no expenses to export.');
      return;
    }

    setIsExporting(true);
    try {
      const success = await exportExpenses(expenses, categories, { format: 'csv' });
      if (success) {
        Alert.alert('Success', 'Expenses exported successfully!');
      } else {
        Alert.alert('Error', 'Failed to export expenses.');
      }
    } catch (error) {
      Alert.alert('Error', 'An error occurred while exporting.');
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportJSON = async () => {
    if (expenses.length === 0) {
      Alert.alert('No Data', 'There are no expenses to export.');
      return;
    }

    setIsExporting(true);
    try {
      const success = await exportExpenses(expenses, categories, { format: 'json' });
      if (success) {
        Alert.alert('Success', 'Expenses exported successfully!');
      } else {
        Alert.alert('Error', 'Failed to export expenses.');
      }
    } catch (error) {
      Alert.alert('Error', 'An error occurred while exporting.');
    } finally {
      setIsExporting(false);
    }
  };

  const handleClearData = () => {
    Alert.alert(
      'Clear All Data',
      'Are you sure you want to delete all your expenses? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete All',
          style: 'destructive',
          onPress: async () => {
            try {
              await clearAllData();
              await refresh();
              Alert.alert('Success', 'All data has been cleared.');
            } catch (error) {
              Alert.alert('Error', 'Failed to clear data.');
            }
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-slate-50 dark:bg-slate-900" edges={['bottom']}>
      <ScrollView 
        className="flex-1 px-5"
        contentContainerStyle={{ paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      >
        <View className="pt-2 pb-6">
          <Text className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-3 px-1">
            Voice Assistant
          </Text>
          <View className="bg-white dark:bg-slate-800 rounded-2xl" style={styles.card}>
            <SettingItem
              icon="🎤"
              iconBg={isDark ? 'rgba(168, 85, 247, 0.15)' : '#faf5ff'}
              title="Hey Nana"
              subtitle="Voice wake word activation"
              isFirst
              rightElement={
                <Switch
                  value={voiceEnabled}
                  onValueChange={setVoiceEnabled}
                  trackColor={{ false: isDark ? '#334155' : '#e2e8f0', true: '#3398ff' }}
                  thumbColor="#ffffff"
                  ios_backgroundColor={isDark ? '#334155' : '#e2e8f0'}
                />
              }
            />
            <SettingItem
              icon="🗣️"
              iconBg={isDark ? 'rgba(168, 85, 247, 0.15)' : '#faf5ff'}
              title="Voice Training"
              subtitle="Improve recognition accuracy"
              onPress={() => Alert.alert('Coming Soon', 'Voice training will be available in a future update.')}
              isLast
            />
          </View>
        </View>

        <View className="pb-6">
          <Text className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-3 px-1">
            Preferences
          </Text>
          <View className="bg-white dark:bg-slate-800 rounded-2xl" style={styles.card}>
            <SettingItem
              icon="💵"
              iconBg={isDark ? 'rgba(16, 185, 129, 0.15)' : '#ecfdf5'}
              title="Currency"
              subtitle="USD ($)"
              onPress={() => Alert.alert('Currency', 'Currency settings coming soon!')}
              isFirst
            />
            <SettingItem
              icon="📁"
              iconBg={isDark ? 'rgba(59, 130, 246, 0.15)' : '#eff6ff'}
              title="Categories"
              subtitle={`${categories.length} categories configured`}
              onPress={() => Alert.alert('Categories', 'Category management coming soon!')}
            />
            <SettingItem
              icon="🔔"
              iconBg={isDark ? 'rgba(249, 115, 22, 0.15)' : '#fff7ed'}
              title="Notifications"
              subtitle="Daily spending reminders"
              isLast
              rightElement={
                <Switch
                  value={notifications}
                  onValueChange={setNotifications}
                  trackColor={{ false: isDark ? '#334155' : '#e2e8f0', true: '#3398ff' }}
                  thumbColor="#ffffff"
                  ios_backgroundColor={isDark ? '#334155' : '#e2e8f0'}
                />
              }
            />
          </View>
        </View>

        <View className="pb-6">
          <Text className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-3 px-1">
            Data
          </Text>
          <View className="bg-white dark:bg-slate-800 rounded-2xl" style={styles.card}>
            <SettingItem
              icon="📤"
              iconBg={isDark ? 'rgba(59, 130, 246, 0.15)' : '#eff6ff'}
              title="Export as CSV"
              subtitle={`${expenses.length} expenses`}
              onPress={handleExportCSV}
              isFirst
            />
            <SettingItem
              icon="📋"
              iconBg={isDark ? 'rgba(59, 130, 246, 0.15)' : '#eff6ff'}
              title="Export as JSON"
              subtitle="For developers"
              onPress={handleExportJSON}
            />
            <SettingItem
              icon="☁️"
              iconBg={isDark ? 'rgba(59, 130, 246, 0.15)' : '#eff6ff'}
              title="Cloud Backup"
              subtitle="Coming soon"
              onPress={() => Alert.alert('Coming Soon', 'Cloud backup will be available in a future update.')}
            />
            <SettingItem
              icon="🗑️"
              title="Clear All Data"
              subtitle="Delete all expenses"
              onPress={handleClearData}
              danger
              isLast
            />
          </View>
        </View>

        <View className="pb-6">
          <Text className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-3 px-1">
            About
          </Text>
          <View className="bg-white dark:bg-slate-800 rounded-2xl" style={styles.card}>
            <SettingItem
              icon="ℹ️"
              iconBg={isDark ? 'rgba(100, 116, 139, 0.15)' : '#f8fafc'}
              title="About Nana"
              subtitle="Version 1.0.0"
              onPress={() => Alert.alert(
                'About Nana',
                'Nana is your voice-activated expense tracker.\n\nBuilt with Expo, NestJS, and NativeWind.\n\nSay "Hey Nana" to log expenses hands-free!'
              )}
              isFirst
            />
            <SettingItem
              icon="📖"
              iconBg={isDark ? 'rgba(100, 116, 139, 0.15)' : '#f8fafc'}
              title="Help & Support"
              onPress={() => Alert.alert('Help', 'For support, please contact support@nana-app.com')}
            />
            <SettingItem
              icon="⭐"
              iconBg={isDark ? 'rgba(250, 204, 21, 0.15)' : '#fefce8'}
              title="Rate the App"
              onPress={() => Alert.alert('Thank You!', 'We appreciate your feedback!')}
              isLast
            />
          </View>
        </View>

        <View className="py-8 items-center">
          <View 
            className="w-20 h-20 rounded-3xl bg-gradient-to-br items-center justify-center mb-4"
            style={styles.logoContainer}
          >
            <Text className="text-4xl">🎙️</Text>
          </View>
          <Text className="text-slate-900 dark:text-white font-bold text-lg mb-1">
            Nana
          </Text>
          <Text className="text-slate-400 dark:text-slate-500 text-center text-sm">
            Your Voice-Activated{'\n'}Expense Tracker
          </Text>
          <Text className="text-slate-300 dark:text-slate-600 text-xs mt-4">
            Made with ❤️
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  card: {
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  logoContainer: {
    backgroundColor: '#f1f5f9',
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 4,
  },
});
