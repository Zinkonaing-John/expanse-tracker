import { View, Text, TouchableOpacity, ScrollView, Switch, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState } from 'react';
import { useExpenses, useCategories } from '@/hooks/useExpenses';
import { exportExpenses } from '@/services/exportService';
import { clearAllData } from '@/services/database';

type SettingItemProps = {
  icon: string;
  title: string;
  subtitle?: string;
  onPress?: () => void;
  rightElement?: React.ReactNode;
  danger?: boolean;
};

function SettingItem({ icon, title, subtitle, onPress, rightElement, danger }: SettingItemProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={!onPress}
      className="flex-row items-center bg-white dark:bg-gray-800 p-4 rounded-xl mb-2"
    >
      <View className={`w-10 h-10 rounded-full items-center justify-center mr-3 ${
        danger ? 'bg-red-100 dark:bg-red-900/30' : 'bg-gray-100 dark:bg-gray-700'
      }`}>
        <Text className="text-xl">{icon}</Text>
      </View>
      <View className="flex-1">
        <Text className={`font-medium ${
          danger ? 'text-red-600 dark:text-red-400' : 'text-gray-900 dark:text-white'
        }`}>{title}</Text>
        {subtitle && (
          <Text className="text-gray-500 dark:text-gray-400 text-sm">{subtitle}</Text>
        )}
      </View>
      {rightElement || (
        onPress && <Text className="text-gray-400 text-lg">›</Text>
      )}
    </TouchableOpacity>
  );
}

export default function SettingsScreen() {
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
    <SafeAreaView className="flex-1 bg-gray-50 dark:bg-gray-900" edges={['bottom']}>
      <ScrollView className="flex-1 px-4">
        <View className="py-4">
          <Text className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-2 px-1">
            Voice Assistant
          </Text>
          <SettingItem
            icon="🎤"
            title="Hey Nana"
            subtitle="Voice wake word activation"
            rightElement={
              <Switch
                value={voiceEnabled}
                onValueChange={setVoiceEnabled}
                trackColor={{ false: '#d1d5db', true: '#0ea5e9' }}
                thumbColor="#ffffff"
              />
            }
          />
          <SettingItem
            icon="🗣️"
            title="Voice Training"
            subtitle="Improve recognition accuracy"
            onPress={() => Alert.alert('Coming Soon', 'Voice training will be available in a future update.')}
          />
        </View>

        <View className="py-4">
          <Text className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-2 px-1">
            Preferences
          </Text>
          <SettingItem
            icon="💵"
            title="Currency"
            subtitle="USD ($)"
            onPress={() => Alert.alert('Currency', 'Currency settings coming soon!')}
          />
          <SettingItem
            icon="📁"
            title="Categories"
            subtitle={`${categories.length} categories configured`}
            onPress={() => Alert.alert('Categories', 'Category management coming soon!')}
          />
          <SettingItem
            icon="🔔"
            title="Notifications"
            subtitle="Daily spending reminders"
            rightElement={
              <Switch
                value={notifications}
                onValueChange={setNotifications}
                trackColor={{ false: '#d1d5db', true: '#0ea5e9' }}
                thumbColor="#ffffff"
              />
            }
          />
        </View>

        <View className="py-4">
          <Text className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-2 px-1">
            Data
          </Text>
          <SettingItem
            icon="📤"
            title="Export as CSV"
            subtitle={`${expenses.length} expenses`}
            onPress={handleExportCSV}
          />
          <SettingItem
            icon="📋"
            title="Export as JSON"
            subtitle="For developers"
            onPress={handleExportJSON}
          />
          <SettingItem
            icon="☁️"
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
          />
        </View>

        <View className="py-4">
          <Text className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-2 px-1">
            About
          </Text>
          <SettingItem
            icon="ℹ️"
            title="About Nana"
            subtitle="Version 1.0.0"
            onPress={() => Alert.alert(
              'About Nana',
              'Nana is your voice-activated expense tracker.\n\nBuilt with Expo, NestJS, and NativeWind.\n\nSay "Hey Nana" to log expenses hands-free!'
            )}
          />
          <SettingItem
            icon="📖"
            title="Help & Support"
            onPress={() => Alert.alert('Help', 'For support, please contact support@nana-app.com')}
          />
          <SettingItem
            icon="⭐"
            title="Rate the App"
            onPress={() => Alert.alert('Thank You!', 'We appreciate your feedback!')}
          />
        </View>

        <View className="py-8 items-center">
          <Text className="text-4xl mb-2">🎙️</Text>
          <Text className="text-gray-500 dark:text-gray-400 text-center text-sm">
            Nana - Your Voice-Activated{'\n'}Expense Tracker
          </Text>
          <Text className="text-gray-400 dark:text-gray-500 text-xs mt-2">
            Made with ❤️
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
