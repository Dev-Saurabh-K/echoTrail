import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AudioWaveform } from '@/components/AudioWaveform';
import { ErrorAlert } from '@/components/ErrorAlert';
import { Fonts } from '@/constants/theme';
import { audioCaptureManager } from '@/core/audio';
import { EchoTrailError, EchoTrailErrorCode } from '@/core/errors';
import { useTheme } from '@/hooks/use-theme';

export default function RecordScreen() {
  const theme = useTheme();
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorCode, setErrorCode] = useState<EchoTrailErrorCode | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const elapsedSecondsRef = useRef(0);
  const maxDuration = 10; // 10 seconds max target
  const minDuration = 3; // 3 seconds min threshold

  const handleStopRecording = React.useCallback(async (finalDuration?: number) => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    const duration = finalDuration !== undefined ? finalDuration : elapsedSecondsRef.current;

    if (duration < minDuration) {
      setErrorCode('AUDIO_TOO_SHORT');
      setErrorMessage(
        `Recording was only ${duration}s. The classifier requires at least 3 seconds to analyze acoustic patterns.`
      );
      setIsRecording(false);
      return;
    }

    setIsRecording(false);
    setIsProcessing(true);

    try {
      // Validate recorded audio input
      const simulatedUri = `file://cache/echotrail_rec_${Date.now()}.m4a`;
      const validatedInput = await audioCaptureManager.validateRecordedFile(
        simulatedUri,
        duration * 1000
      );

      // Route to results screen
      router.replace({
        pathname: '/results',
        params: {
          recordedUri: validatedInput.uri,
          durationMs: validatedInput.durationMs.toString(),
          noiseLevel: 'low',
        },
      });
    } catch (err: any) {
      setIsProcessing(false);
      if (err instanceof EchoTrailError) {
        setErrorCode(err.code);
        setErrorMessage(err.message);
      } else {
        setErrorCode('INFERENCE_FAILED');
        setErrorMessage(err.message || 'Failed to process audio.');
      }
    }
  }, []);

  const startSession = React.useCallback(async () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    try {
      await audioCaptureManager.configureAudioMode();
      const hasPermission = await audioCaptureManager.requestPermissions();
      if (!hasPermission) return;

      audioCaptureManager.setRecordingActive(true);
      setErrorCode(null);
      setErrorMessage(null);
      setIsRecording(true);
      elapsedSecondsRef.current = 0;
      setElapsedSeconds(0);

      // Start elapsed timer
      timerRef.current = setInterval(() => {
        setElapsedSeconds((prev) => {
          const next = prev + 1;
          elapsedSecondsRef.current = next;
          if (next >= maxDuration) {
            if (timerRef.current) {
              clearInterval(timerRef.current);
              timerRef.current = null;
            }
            handleStopRecording(next);
            return maxDuration;
          }
          return next;
        });
      }, 1000);
    } catch (err: any) {
      if (err instanceof EchoTrailError) {
        setErrorCode(err.code);
        setErrorMessage(err.message);
      } else {
        setErrorCode('MICROPHONE_PERMISSION_DENIED');
        setErrorMessage(err.message || 'Microphone access denied');
      }
      setIsRecording(false);
    }
  }, [handleStopRecording]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      startSession();
    }, 0);

    return () => {
      clearTimeout(timeout);
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      audioCaptureManager.setRecordingActive(false);
    };
  }, [startSession]);

  const handleCancel = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    audioCaptureManager.setRecordingActive(false);
    setIsRecording(false);
    router.back();
  };

  const progressPercent = Math.min((elapsedSeconds / maxDuration) * 100, 100);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Top Header */}
      <View style={styles.topBar}>
        <Pressable
          style={({ pressed }) => [styles.cancelIconButton, pressed && { opacity: 0.6 }]}
          onPress={handleCancel}>
          <Ionicons name="close" size={26} color={theme.text} />
        </Pressable>
        <Text style={[styles.topTitle, { color: theme.text }]}>Recording Birdsong</Text>
        <View style={{ width: 36 }} />
      </View>

      <View style={styles.content}>
        {errorCode ? (
          <View style={styles.errorContainer}>
            <ErrorAlert
              code={errorCode}
              customMessage={errorMessage || undefined}
              onRetry={() => startSession()}
              onUseSample={() => {
                router.replace('/');
              }}
              onDismiss={handleCancel}
            />
          </View>
        ) : isProcessing ? (
          <View style={styles.processingContainer}>
            <ActivityIndicator size="large" color={theme.primary} />
            <Text style={[styles.processingTitle, { color: theme.text }]}>
              Analyzing Acoustic Harmonics...
            </Text>
            <Text style={[styles.processingSubtitle, { color: theme.textSecondary }]}>
              Running on-device classifier across regional species profiles
            </Text>
          </View>
        ) : (
          <>
            {/* Pulsing Visual Waveform */}
            <View style={styles.centerVisual}>
              <View
                style={[
                  styles.pulseOuterCircle,
                  { backgroundColor: isRecording ? '#AEEED3' : theme.backgroundElement },
                ]}>
                <View
                  style={[
                    styles.pulseInnerCircle,
                    { backgroundColor: isRecording ? theme.primary : theme.border },
                  ]}>
                  <Ionicons name="mic" size={42} color="#FFFFFF" />
                </View>
              </View>

              <View style={styles.waveContainer}>
                <AudioWaveform isActive={isRecording} barCount={26} height={48} />
              </View>

              <Text style={[styles.timerText, { color: theme.text }]}>
                00:{elapsedSeconds < 10 ? `0${elapsedSeconds}` : elapsedSeconds}
                <Text style={{ fontSize: 16, color: theme.textSecondary }}>
                  {' '}/ 00:10
                </Text>
              </Text>

              <Text style={[styles.instructions, { color: theme.textSecondary }]}>
                {elapsedSeconds < minDuration
                  ? 'Keep recording... (aim for at least 3 seconds)'
                  : 'Great! Identifying clear song cadence.'}
              </Text>
            </View>

            {/* Progress Meter */}
            <View style={styles.progressContainer}>
              <View style={[styles.progressBarBg, { backgroundColor: theme.border }]}>
                <View
                  style={[
                    styles.progressBarFill,
                    {
                      backgroundColor: theme.primary,
                      width: `${progressPercent}%`,
                    },
                  ]}
                />
              </View>
              <View style={styles.progressMilestones}>
                <Text style={[styles.milestoneText, { color: theme.textSecondary }]}>
                  0s
                </Text>
                <Text style={[styles.milestoneText, { color: theme.primary, fontWeight: '700' }]}>
                  3s (Min)
                </Text>
                <Text style={[styles.milestoneText, { color: theme.textSecondary }]}>
                  10s (Target)
                </Text>
              </View>
            </View>

            {/* Action Buttons */}
            <View style={styles.actionsContainer}>
              <Pressable
                style={({ pressed }) => [
                  styles.stopIdentifyButton,
                  {
                    backgroundColor:
                      elapsedSeconds >= minDuration ? theme.primary : '#55A9A0',
                    opacity: elapsedSeconds >= minDuration ? 1 : 0.65,
                  },
                  pressed && { opacity: 0.85 },
                ]}
                disabled={elapsedSeconds < minDuration}
                onPress={() => handleStopRecording()}>
                <Ionicons name="checkmark-circle" size={20} color="#FFFFFF" />
                <Text style={styles.stopIdentifyButtonText}>
                  {elapsedSeconds >= minDuration
                    ? 'Identify Species Now'
                    : `Listen (${minDuration - elapsedSeconds}s more)`}
                </Text>
              </Pressable>

              <Pressable
                style={({ pressed }) => [
                  styles.cancelTextButton,
                  pressed && { opacity: 0.6 },
                ]}
                onPress={handleCancel}>
                <Text style={[styles.cancelTextButtonLabel, { color: theme.textSecondary }]}>
                  Cancel Recording
                </Text>
              </Pressable>
            </View>
          </>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  cancelIconButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  topTitle: {
    fontFamily: Fonts.sans,
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  content: {
    flex: 1,
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingBottom: 36,
    paddingTop: 16,
  },
  centerVisual: {
    alignItems: 'center',
    gap: 18,
  },
  pulseOuterCircle: {
    width: 130,
    height: 130,
    borderRadius: 65,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pulseInnerCircle: {
    width: 90,
    height: 90,
    borderRadius: 45,
    alignItems: 'center',
    justifyContent: 'center',
  },
  waveContainer: {
    width: '100%',
    paddingVertical: 8,
  },
  timerText: {
    fontFamily: Fonts.sans,
    fontSize: 34,
    fontWeight: '800',
    fontVariant: ['tabular-nums'],
    letterSpacing: -0.5,
  },
  instructions: {
    fontFamily: Fonts.sans,
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    maxWidth: 280,
  },
  progressContainer: {
    gap: 8,
    width: '100%',
  },
  progressBarBg: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
    width: '100%',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressMilestones: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  milestoneText: {
    fontFamily: Fonts.sans,
    fontSize: 11,
  },
  actionsContainer: {
    gap: 12,
    width: '100%',
  },
  stopIdentifyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderRadius: 16,
    paddingVertical: 16,
  },
  stopIdentifyButtonText: {
    fontFamily: Fonts.sans,
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  cancelTextButton: {
    alignItems: 'center',
    paddingVertical: 10,
  },
  cancelTextButtonLabel: {
    fontFamily: Fonts.sans,
    fontSize: 14,
    fontWeight: '600',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  processingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  processingTitle: {
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
  },
  processingSubtitle: {
    fontSize: 13,
    textAlign: 'center',
    maxWidth: 260,
    lineHeight: 18,
  },
});
