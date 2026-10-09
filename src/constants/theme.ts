/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import '@/global.css';

import { Platform } from 'react-native';

export const BrandPalette = {
  buttercup: '#FFF8B0',
  mint: '#AEEED3',
  teal: '#55A9A0',
  deepTeal: '#287A74',
} as const;

export const Colors = {
  light: {
    text: '#14312B',
    textSecondary: '#4A6963',
    background: '#F6FAF8',
    backgroundElement: '#E7F5EF',
    backgroundSelected: '#D2F1E4',
    primary: '#287A74',
    primaryLight: '#55A9A0',
    accent: '#FFF8B0',
    accentDark: '#705803',
    mint: '#AEEED3',
    teal: '#55A9A0',
    deepTeal: '#287A74',
    card: '#FFFFFF',
    border: '#D0E6DE',
    success: '#287A74',
    successLight: '#AEEED3',
    warning: '#997300',
    warningLight: '#FFF8B0',
    danger: '#DC2626',
    dangerLight: '#FEE2E2',
  },
  dark: {
    text: '#EDF7F4',
    textSecondary: '#8DAFA9',
    background: '#0B1716',
    backgroundElement: '#122523',
    backgroundSelected: '#1B3733',
    primary: '#55A9A0',
    primaryLight: '#AEEED3',
    accent: '#FFF8B0',
    accentDark: '#FFF8B0',
    mint: '#AEEED3',
    teal: '#55A9A0',
    deepTeal: '#287A74',
    card: '#132725',
    border: '#1F3E3A',
    success: '#AEEED3',
    successLight: '#163832',
    warning: '#FFF8B0',
    warningLight: '#2C270A',
    danger: '#F87171',
    dangerLight: '#391616',
  },
} as const;

export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;

export const Fonts = Platform.select({
  ios: {
    sans: 'System',
    serif: 'ui-serif',
    rounded: 'ui-rounded',
    mono: 'ui-monospace',
  },
  android: {
    sans: 'sans-serif',
    serif: 'serif',
    rounded: 'sans-serif-medium',
    mono: 'monospace',
  },
  default: {
    sans: 'sans-serif',
    serif: 'serif',
    rounded: 'sans-serif',
    mono: 'monospace',
  },
  web: {
    sans: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    serif: 'ui-serif, Georgia, Cambria, "Times New Roman", Times, serif',
    rounded: 'system-ui, -apple-system, sans-serif',
    mono: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
  },
});

export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 64,
} as const;

export const BottomTabInset = Platform.select({ ios: 50, android: 80 }) ?? 0;
export const MaxContentWidth = 800;
