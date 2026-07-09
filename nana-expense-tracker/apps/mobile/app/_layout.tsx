import "../global.css";

import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import 'react-native-reanimated';

import { useColorScheme } from '@/components/useColorScheme';
import { LocaleProvider } from '@/i18n/LocaleContext';

export {
  ErrorBoundary,
} from 'expo-router';

export const unstable_settings = {
  initialRouteName: '(tabs)',
};

SplashScreen.preventAutoHideAsync();

const CustomLightTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: '#0891b2',
    background: '#eef2f9',
    card: '#ffffff',
    text: '#0b1220',
    border: 'rgba(11, 18, 32, 0.08)',
    notification: '#ef4444',
  },
};

const CustomDarkTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    primary: '#22d3ee',
    background: '#050a16',
    card: '#0d1526',
    text: '#e8f0ff',
    border: 'rgba(148, 163, 184, 0.10)',
    notification: '#ef4444',
  },
};

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return <RootLayoutNav />;
}

function RootLayoutNav() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  return (
    <LocaleProvider>
      <ThemeProvider value={isDark ? CustomDarkTheme : CustomLightTheme}>
        <Stack
        screenOptions={{
          contentStyle: {
            backgroundColor: isDark ? '#050a16' : '#eef2f9',
          },
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen
          name="expense/[id]"
          options={{
            title: 'Expense',
            headerStyle: {
              backgroundColor: isDark ? '#0d1526' : '#ffffff',
            },
            headerTintColor: isDark ? '#e8f0ff' : '#0b1220',
            headerTitleStyle: { fontWeight: '700' },
            headerShadowVisible: false,
          }}
        />
        <Stack.Screen 
          name="modal" 
          options={{ 
            presentation: 'modal',
            title: 'Scan Receipt',
            headerStyle: {
              backgroundColor: isDark ? '#0d1526' : '#ffffff',
            },
            headerTintColor: isDark ? '#e8f0ff' : '#0b1220',
            headerTitleStyle: {
              fontWeight: '700',
            },
            headerShadowVisible: false,
          }} 
        />
      </Stack>
    </ThemeProvider>
    </LocaleProvider>
  );
}
