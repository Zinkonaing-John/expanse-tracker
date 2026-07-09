import { Tabs } from 'expo-router';
import { Platform, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import Colors, { Accent } from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { useLocale } from '@/i18n/LocaleContext';

type IconName = keyof typeof MaterialCommunityIcons.glyphMap;

const TAB_ICONS: Record<string, { active: IconName; inactive: IconName }> = {
  home: { active: 'view-dashboard', inactive: 'view-dashboard-outline' },
  add: { active: 'plus-circle', inactive: 'plus-circle-outline' },
  history: { active: 'chart-timeline-variant-shimmer', inactive: 'chart-timeline-variant' },
  settings: { active: 'cog', inactive: 'cog-outline' },
};

function TabIcon({ name, color, focused }: { name: string; color: string; focused: boolean }) {
  const icons = TAB_ICONS[name] ?? TAB_ICONS.home;

  return (
    <View style={{ alignItems: 'center', justifyContent: 'center', paddingTop: 6 }}>
      <MaterialCommunityIcons
        name={focused ? icons.active : icons.inactive}
        size={24}
        color={color}
        style={
          focused
            ? {
                textShadowColor: Accent.glow,
                textShadowOffset: { width: 0, height: 0 },
                textShadowRadius: 12,
              }
            : undefined
        }
      />
      <View
        style={{
          width: 14,
          height: 3,
          borderRadius: 2,
          marginTop: 5,
          backgroundColor: focused ? color : 'transparent',
        }}
      />
    </View>
  );
}

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const theme = Colors[colorScheme ?? 'light'];
  const { t } = useLocale();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: theme.tint,
        tabBarInactiveTintColor: theme.tabIconDefault,
        headerShown: true,
        tabBarShowLabel: false,
        tabBarStyle: {
          position: 'absolute',
          backgroundColor: isDark ? 'rgba(13, 21, 38, 0.98)' : 'rgba(255, 255, 255, 0.98)',
          borderTopWidth: 1,
          borderWidth: 1,
          borderColor: theme.border,
          height: Platform.OS === 'ios' ? 92 : 74,
          paddingBottom: Platform.OS === 'ios' ? 28 : 12,
          paddingTop: 10,
          marginHorizontal: 20,
          marginBottom: Platform.OS === 'ios' ? 0 : 16,
          borderRadius: 30,
          shadowColor: isDark ? Accent.cyan : '#0b1220',
          shadowOffset: { width: 0, height: 8 },
          shadowOpacity: isDark ? 0.15 : 0.12,
          shadowRadius: 24,
          elevation: 20,
        },
        headerStyle: {
          backgroundColor: theme.background,
          shadowColor: 'transparent',
          elevation: 0,
        },
        headerTitleStyle: {
          fontWeight: '800',
          fontSize: 18,
          letterSpacing: 0.3,
        },
        headerTintColor: theme.text,
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: t('tabDashboard'),
          tabBarIcon: ({ color, focused }: { color: string; focused: boolean }) => (
            <TabIcon name="home" color={color} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="add"
        options={{
          title: t('tabAdd'),
          tabBarIcon: ({ color, focused }: { color: string; focused: boolean }) => (
            <TabIcon name="add" color={color} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="history"
        options={{
          title: t('tabHistory'),
          tabBarIcon: ({ color, focused }: { color: string; focused: boolean }) => (
            <TabIcon name="history" color={color} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: t('tabSettings'),
          tabBarIcon: ({ color, focused }: { color: string; focused: boolean }) => (
            <TabIcon name="settings" color={color} focused={focused} />
          ),
        }}
      />
    </Tabs>
  );
}
