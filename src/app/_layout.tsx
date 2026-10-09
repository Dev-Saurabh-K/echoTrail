import { DarkTheme, DefaultTheme, ThemeProvider, Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import React, { useEffect } from 'react';
import { useColorScheme } from 'react-native';
import '@/global.css';
import { getDatabase } from '@/core/database';

SplashScreen.preventAutoHideAsync().catch(() => {});

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
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack>
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
