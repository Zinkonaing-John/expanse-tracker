import { Tabs } from 'expo-router';
import { Platform, View, Text } from 'react-native';

import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';

type TabIconProps = {
  name: string;
  color: string;
  focused: boolean;
};

function TabIcon({ name, color, focused }: TabIconProps) {
  const icons: Record<string, string> = {
    home: '🏠',
    add: '➕',
    history: '📊',
    settings: '⚙️',
  };

  if (name === 'add') {
    return (
      <View 
        style={{
          width: 52,
          height: 52,
          borderRadius: 26,
          backgroundColor: '#3398ff',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: Platform.OS === 'ios' ? 20 : 0,
          shadowColor: '#3398ff',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.35,
          shadowRadius: 8,
          elevation: 8,
        }}
      >
        <Text style={{ fontSize: 24, color: '#ffffff' }}>➕</Text>
      </View>
    );
  }

  return (
    <View style={{ alignItems: 'center', justifyContent: 'center', paddingTop: 4 }}>
      <Text style={{ fontSize: 22 }}>{icons[name] || '●'}</Text>
      {focused && (
        <View 
          style={{
            width: 5,
            height: 5,
            borderRadius: 2.5,
            backgroundColor: color,
            marginTop: 6,
          }}
        />
      )}
    </View>
  );
}

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        tabBarInactiveTintColor: isDark ? '#64748b' : '#94a3b8',
        headerShown: true,
        tabBarShowLabel: false,
        tabBarStyle: {
          position: 'absolute',
          backgroundColor: isDark ? '#1e293b' : '#ffffff',
          borderTopWidth: 0,
          height: Platform.OS === 'ios' ? 90 : 72,
          paddingBottom: Platform.OS === 'ios' ? 28 : 12,
          paddingTop: 12,
          marginHorizontal: 20,
          marginBottom: Platform.OS === 'ios' ? 0 : 16,
          borderRadius: 28,
          shadowColor: isDark ? '#000000' : '#0f172a',
          shadowOffset: { width: 0, height: 10 },
          shadowOpacity: isDark ? 0.4 : 0.12,
          shadowRadius: 20,
          elevation: 20,
        },
        headerStyle: {
          backgroundColor: isDark ? '#0f172a' : '#ffffff',
          shadowColor: 'transparent',
          elevation: 0,
        },
        headerTitleStyle: {
          fontWeight: '700',
          fontSize: 18,
        },
        headerTintColor: isDark ? '#f8fafc' : '#0f172a',
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Dashboard',
          tabBarIcon: ({ color, focused }: { color: string; focused: boolean }) => (
            <TabIcon name="home" color={color} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="add"
        options={{
          title: 'Add Expense',
          tabBarIcon: ({ color, focused }: { color: string; focused: boolean }) => (
            <TabIcon name="add" color={color} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="history"
        options={{
          title: 'History',
          tabBarIcon: ({ color, focused }: { color: string; focused: boolean }) => (
            <TabIcon name="history" color={color} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ color, focused }: { color: string; focused: boolean }) => (
            <TabIcon name="settings" color={color} focused={focused} />
          ),
        }}
      />
    </Tabs>
  );
}
