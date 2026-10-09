import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useRef, useState } from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { AudioWaveform } from './AudioWaveform';
import { Fonts } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

interface ReferenceAudioPlayerProps {
  speciesName: string;
  callDescription: string;
  attribution?: string;
  audioPath?: string;
}

export function ReferenceAudioPlayer({
  speciesName,
  callDescription,
  attribution,
  audioPath,
}: ReferenceAudioPlayerProps) {
  const theme = useTheme();
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackProgress, setPlaybackProgress] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const togglePlayback = () => {
    if (isPlaying) {
      if (timerRef.current) clearInterval(timerRef.current);
      setIsPlaying(false);
    } else {
      setIsPlaying(true);
      setPlaybackProgress(0);

      // Playback simulation with progress updates (works cross-platform and offline)
      const duration = 4000; // 4 seconds reference call
      const interval = 100;
      let elapsed = 0;

      // On web, also play an acoustic synthesized bird tone using Web Audio API
      if (Platform.OS === 'web' && typeof window !== 'undefined' && (window as any).AudioContext) {
        try {
          const AudioContext = (window as any).AudioContext || (window as any).webkitAudioContext;
          const ctx = new AudioContext();
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(2400, ctx.currentTime);
          osc.frequency.exponentialRampToValueAtTime(3200, ctx.currentTime + 0.2);
          osc.frequency.exponentialRampToValueAtTime(2000, ctx.currentTime + 0.4);
          gain.gain.setValueAtTime(0.15, ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.8);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start();
          osc.stop(ctx.currentTime + 0.8);
        } catch {
          // ignore
        }
      }

      timerRef.current = setInterval(() => {
        elapsed += interval;
        const p = Math.min(elapsed / duration, 1);
        setPlaybackProgress(p);

        if (elapsed >= duration) {
          if (timerRef.current) clearInterval(timerRef.current);
          setIsPlaying(false);
          setPlaybackProgress(0);
        }
      }, interval);
    }
  };

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: theme.backgroundElement,
          borderColor: theme.border,
        },
      ]}>
      <View style={styles.header}>
        <View style={styles.iconContainer}>
          <Ionicons name="musical-notes" size={20} color={theme.primary} />
        </View>
        <View style={styles.textContainer}>
          <Text style={[styles.title, { color: theme.text }]}>
            Reference Call: {speciesName}
          </Text>
          <Text style={[styles.description, { color: theme.textSecondary }]}>
            {callDescription}
          </Text>
        </View>
      </View>

      <View style={styles.waveformContainer}>
        <AudioWaveform isActive={isPlaying} barCount={24} height={32} />
      </View>

      {/* Progress Bar */}
      <View style={[styles.progressBarBg, { backgroundColor: theme.border }]}>
        <View
          style={[
            styles.progressBarFill,
            {
              backgroundColor: theme.primary,
              width: `${Math.round(playbackProgress * 100)}%`,
            },
          ]}
        />
      </View>

      <View style={styles.controlsRow}>
        <Pressable
          style={({ pressed }) => [
            styles.playButton,
            { backgroundColor: theme.primary },
            pressed && styles.pressed,
          ]}
          onPress={togglePlayback}>
          <Ionicons
            name={isPlaying ? 'pause' : 'play'}
            size={18}
            color="#FFFFFF"
          />
          <Text style={styles.playButtonText}>
            {isPlaying ? 'Pause Call' : 'Play Reference Call'}
          </Text>
        </Pressable>

        {attribution && (
          <Text
            numberOfLines={1}
            style={[styles.attribution, { color: theme.textSecondary }]}>
            Src: {attribution}
          </Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    gap: 12,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#AEEED3',
    alignItems: 'center',
    justifyContent: 'center',
  },
  textContainer: {
    flex: 1,
    gap: 2,
  },
  title: {
    fontFamily: Fonts.sans,
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  description: {
    fontFamily: Fonts.sans,
    fontSize: 13,
    lineHeight: 18,
  },
  waveformContainer: {
    paddingVertical: 4,
    alignItems: 'center',
  },
  progressBarBg: {
    height: 4,
    borderRadius: 2,
    overflow: 'hidden',
    width: '100%',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 2,
  },
  controlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  playButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
  },
  playButtonText: {
    fontFamily: Fonts.sans,
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  attribution: {
    fontFamily: Fonts.sans,
    fontSize: 11,
    flex: 1,
    textAlign: 'right',
  },
  pressed: {
    opacity: 0.8,
  },
});
