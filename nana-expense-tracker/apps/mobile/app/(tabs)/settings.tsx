import { View, Text, TouchableOpacity, ScrollView, Switch, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState, useCallback } from 'react';
import { useFocusEffect } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useExpenses, useCategories } from '@/hooks/useExpenses';
import { usePersistedSetting } from '@/hooks/usePersistedSetting';
import { exportExpenses } from '@/services/exportService';
import { clearAllData } from '@/services/database';
import { notify, confirmDialog } from '@/services/dialogs';
import { useColorScheme } from '@/components/useColorScheme';
import Colors, { Accent } from '@/constants/Colors';

type IconName = keyof typeof MaterialCommunityIcons.glyphMap;
type ThemeType = (typeof Colors)['light'] | (typeof Colors)['dark'];

type SettingItemProps = {
  icon: IconName;
  iconColor?: string;
  title: string;
  subtitle?: string;
  onPress?: () => void;
  rightElement?: React.ReactNode;
  danger?: boolean;
  isLast?: boolean;
  theme: ThemeType;
  isDark: boolean;
};

function SettingItem({ icon, iconColor, title, subtitle, onPress, rightElement, danger, isLast, theme, isDark }: SettingItemProps) {
  const color = danger ? '#ef4444' : iconColor || theme.tint;

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={!onPress && !rightElement}
      activeOpacity={0.6}
      style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 15 }}
    >
      <View
        style={{
          width: 42,
          height: 42,
          borderRadius: 14,
          backgroundColor: color + '1A',
          borderWidth: 1,
          borderColor: color + '2E',
          alignItems: 'center',
          justifyContent: 'center',
          marginRight: 14,
        }}
      >
        <MaterialCommunityIcons name={icon} size={21} color={color} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={{ fontWeight: '700', fontSize: 15, color: danger ? '#ef4444' : theme.text }}>
          {title}
        </Text>
        {subtitle && (
          <Text style={{ color: theme.textSecondary, fontSize: 13, marginTop: 2 }}>{subtitle}</Text>
        )}
      </View>
      {rightElement || (
        onPress && <MaterialCommunityIcons name="chevron-right" size={22} color={theme.textSecondary} />
      )}
      {!isLast && (
        <View
          style={{
            position: 'absolute',
            bottom: 0,
            left: 72,
            right: 16,
            height: StyleSheet.hairlineWidth,
            backgroundColor: isDark ? 'rgba(148,163,184,0.12)' : 'rgba(11,18,32,0.07)',
          }}
        />
      )}
    </TouchableOpacity>
  );
}

function SectionHeader({ title, theme }: { title: string; theme: ThemeType }) {
  return (
    <Text
      style={{
        fontSize: 11,
        fontWeight: '700',
        color: theme.textSecondary,
        textTransform: 'uppercase',
        letterSpacing: 1.5,
        marginBottom: 10,
        paddingHorizontal: 4,
      }}
    >
      {title}
    </Text>
  );
}

export default function SettingsScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const theme = Colors[colorScheme ?? 'light'];
  const [voiceEnabled, setVoiceEnabled] = usePersistedSetting('nana.settings.voiceEnabled', true);
  const [notifications, setNotifications] = usePersistedSetting('nana.settings.notifications', false);
  const [isExporting, setIsExporting] = useState(false);

  const { expenses, refresh } = useExpenses();
  const { categories } = useCategories();

  // Keep the export counts current when switching to this tab.
  useFocusEffect(
    useCallback(() => {
      refresh();
    }, [])
  );

  const switchProps = {
    trackColor: { false: isDark ? '#26334b' : '#cdd8e9', true: Accent.cyanDark },
    thumbColor: '#ffffff',
    ios_backgroundColor: isDark ? '#26334b' : '#cdd8e9',
  };

  const cardStyle = {
    backgroundColor: theme.surface,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: theme.border,
  };

  const handleExport = async (format: 'csv' | 'json') => {
    if (isExporting) return;
    if (expenses.length === 0) {
      notify('No Data', 'There are no expenses to export.');
      return;
    }

    setIsExporting(true);
    try {
      const success = await exportExpenses(expenses, categories, { format });
      if (!success) {
        notify('Error', 'Failed to export expenses.');
      }
    } catch (error) {
      notify('Error', 'An error occurred while exporting.');
    } finally {
      setIsExporting(false);
    }
  };

  const handleClearData = async () => {
    const confirmed = await confirmDialog(
      'Clear All Data',
      'Are you sure you want to delete all your expenses? This action cannot be undone.',
      'Delete All',
      true
    );
    if (!confirmed) return;

    try {
      await clearAllData();
      await refresh();
      notify('Success', 'All data has been cleared.');
    } catch (error) {
      notify('Error', 'Failed to clear data.');
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.background }} edges={['bottom']}>
      <ScrollView
        style={{ flex: 1, paddingHorizontal: 20 }}
        contentContainerStyle={{ paddingBottom: 110 }}
        showsVerticalScrollIndicator={false}
      >
        <View style={{ paddingTop: 8, paddingBottom: 24 }}>
          <SectionHeader title="Voice Assistant" theme={theme} />
          <View style={cardStyle}>
            <SettingItem
              icon="microphone"
              iconColor={Accent.violet}
              title="Hey Nana"
              subtitle="Voice wake word activation"
              theme={theme}
              isDark={isDark}
              rightElement={<Switch value={voiceEnabled} onValueChange={setVoiceEnabled} {...switchProps} />}
            />
            <SettingItem
              icon="account-voice"
              iconColor={Accent.violet}
              title="Voice Training"
              subtitle="Improve recognition accuracy"
              onPress={() => notify('Coming Soon', 'Voice training will be available in a future update.')}
              isLast
              theme={theme}
              isDark={isDark}
            />
          </View>
        </View>

        <View style={{ paddingBottom: 24 }}>
          <SectionHeader title="Preferences" theme={theme} />
          <View style={cardStyle}>
            <SettingItem
              icon="currency-usd"
              iconColor="#10b981"
              title="Currency"
              subtitle="USD ($)"
              onPress={() => notify('Currency', 'Currency settings coming soon!')}
              theme={theme}
              isDark={isDark}
            />
            <SettingItem
              icon="shape-outline"
              iconColor={Accent.cyan}
              title="Categories"
              subtitle={`${categories.length} categories configured`}
              onPress={() => notify('Categories', 'Category management coming soon!')}
              theme={theme}
              isDark={isDark}
            />
            <SettingItem
              icon="bell-outline"
              iconColor="#f59e0b"
              title="Notifications"
              subtitle="Daily spending reminders"
              isLast
              theme={theme}
              isDark={isDark}
              rightElement={<Switch value={notifications} onValueChange={setNotifications} {...switchProps} />}
            />
          </View>
        </View>

        <View style={{ paddingBottom: 24 }}>
          <SectionHeader title="Data" theme={theme} />
          <View style={cardStyle}>
            <SettingItem
              icon="file-delimited-outline"
              iconColor={Accent.cyan}
              title="Export as CSV"
              subtitle={`${expenses.length} expenses`}
              onPress={() => handleExport('csv')}
              theme={theme}
              isDark={isDark}
            />
            <SettingItem
              icon="code-json"
              iconColor={Accent.cyan}
              title="Export as JSON"
              subtitle="For developers"
              onPress={() => handleExport('json')}
              theme={theme}
              isDark={isDark}
            />
            <SettingItem
              icon="cloud-upload-outline"
              iconColor={Accent.cyan}
              title="Cloud Backup"
              subtitle="Coming soon"
              onPress={() => notify('Coming Soon', 'Cloud backup will be available in a future update.')}
              theme={theme}
              isDark={isDark}
            />
            <SettingItem
              icon="trash-can-outline"
              title="Clear All Data"
              subtitle="Delete all expenses"
              onPress={handleClearData}
              danger
              isLast
              theme={theme}
              isDark={isDark}
            />
          </View>
        </View>

        <View style={{ paddingBottom: 24 }}>
          <SectionHeader title="About" theme={theme} />
          <View style={cardStyle}>
            <SettingItem
              icon="information-outline"
              iconColor={theme.textSecondary}
              title="About Nana"
              subtitle="Version 1.0.0"
              onPress={() => notify(
                'About Nana',
                'Nana is your voice-activated expense tracker.\n\nBuilt with Expo, NestJS, and NativeWind.\n\nSay "Hey Nana" to log expenses hands-free!'
              )}
              theme={theme}
              isDark={isDark}
            />
            <SettingItem
              icon="help-circle-outline"
              iconColor={theme.textSecondary}
              title="Help & Support"
              onPress={() => notify('Help', 'For support, please contact support@nana-app.com')}
              theme={theme}
              isDark={isDark}
            />
            <SettingItem
              icon="star-outline"
              iconColor="#f59e0b"
              title="Rate the App"
              onPress={() => notify('Thank You!', 'We appreciate your feedback!')}
              isLast
              theme={theme}
              isDark={isDark}
            />
          </View>
        </View>

        <View style={{ paddingVertical: 28, alignItems: 'center' }}>
          <View
            style={{
              shadowColor: Accent.cyan,
              shadowOffset: { width: 0, height: 0 },
              shadowOpacity: 0.4,
              shadowRadius: 14,
              elevation: 8,
              marginBottom: 16,
            }}
          >
            <LinearGradient
              colors={[Accent.cyan, Accent.violet]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={{
                width: 72,
                height: 72,
                borderRadius: 24,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <MaterialCommunityIcons name="microphone" size={34} color="#ffffff" />
            </LinearGradient>
          </View>
          <Text style={{ color: theme.text, fontWeight: '800', fontSize: 17, marginBottom: 4 }}>
            Nana
          </Text>
          <Text style={{ color: theme.textSecondary, textAlign: 'center', fontSize: 13, lineHeight: 19 }}>
            Your Voice-Activated{'\n'}Expense Tracker
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
