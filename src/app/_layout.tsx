import { DarkTheme, DefaultTheme, ThemeProvider, Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import React, { useEffect } from 'react';
import { LogBox, useColorScheme } from 'react-native';
import '@/global.css';
import { Fonts } from '@/constants/theme';
import { getDatabase } from '@/core/database';

LogBox.ignoreLogs([
  'SafeAreaView has been deprecated and will be removed in a future release',
]);

SplashScreen.preventAutoHideAsync().catch(() => {});

const EchoLightTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: '#287A74',
    background: '#F6FAF8',
    card: '#FFFFFF',
    text: '#14312B',
    border: '#D0E6DE',
    notification: '#55A9A0',
  },
};

const EchoDarkTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    primary: '#55A9A0',
    background: '#0B1716',
    card: '#132725',
    text: '#EDF7F4',
    border: '#1F3E3A',
    notification: '#AEEED3',
  },
};

export default function RootLayout() {
  const colorScheme = useColorScheme();

  useEffect(() => {
    (async () => {
      try {
        await getDatabase();
      } catch (err) {
        console.warn('Database initialization notice:', err);
      } finally {
        await SplashScreen.hideAsync().catch(() => {});
      }
    })();
  }, []);

  return (
    <ThemeProvider value={colorScheme === 'dark' ? EchoDarkTheme : EchoLightTheme}>
      <Stack
        screenOptions={{
          headerTintColor: colorScheme === 'dark' ? '#55A9A0' : '#287A74',
          headerTitleStyle: {
            fontFamily: Fonts.sans,
            fontWeight: '700',
          },
        }}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen
          name="record"
          options={{
            presentation: 'modal',
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="results"
          options={{
            presentation: 'card',
            title: 'Identification Results',
            headerBackTitle: 'Back',
          }}
        />
        <Stack.Screen
          name="species/[id]"
          options={{
            presentation: 'modal',
            title: 'Species Guide',
          }}
        />
        <Stack.Screen
          name="journal/[id]"
          options={{
            presentation: 'card',
            title: 'Observation Details',
            headerBackTitle: 'Journal',
          }}
        />
      </Stack>
    </ThemeProvider>
  );
}
