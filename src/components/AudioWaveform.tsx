import React, { useEffect, useMemo } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import { useTheme } from '@/hooks/use-theme';

interface AudioWaveformProps {
  isActive: boolean;
  barCount?: number;
  height?: number;
  color?: string;
}

export function AudioWaveform({
  isActive,
  barCount = 18,
  height = 48,
  color,
}: AudioWaveformProps) {
  const theme = useTheme();
  const barColor = color || theme.primary;

  const animatedValues = useMemo(
    () => Array.from({ length: barCount }, () => new Animated.Value(0.2)),
    [barCount]
  );

  useEffect(() => {
    if (!isActive) {
      animatedValues.forEach((val) => val.setValue(0.2));
      return;
    }

    const animations = animatedValues.map((val, i) => {
      return Animated.loop(
        Animated.sequence([
          Animated.timing(val, {
            toValue: 0.3 + Math.random() * 0.7,
            duration: 180 + (i % 5) * 50,
            useNativeDriver: true,
          }),
          Animated.timing(val, {
            toValue: 0.15 + Math.random() * 0.25,
            duration: 180 + (i % 5) * 50,
            useNativeDriver: true,
          }),
        ])
      );
    });

    animations.forEach((anim) => anim.start());

    return () => {
      animations.forEach((anim) => anim.stop());
    };
  }, [isActive, animatedValues]);

  return (
    <View style={[styles.container, { height }]}>
      {animatedValues.map((animVal, index) => (
        <Animated.View
          key={index}
          style={[
            styles.bar,
            {
              backgroundColor: barColor,
              height,
              transform: [{ scaleY: animVal }],
            },
          ]}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingHorizontal: 12,
  },
  bar: {
    width: 4,
    borderRadius: 2,
  },
});
