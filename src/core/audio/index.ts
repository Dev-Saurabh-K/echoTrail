import {
  getRecordingPermissionsAsync,
  requestRecordingPermissionsAsync,
  setAudioModeAsync,
} from 'expo-audio';
import * as FileSystem from 'expo-file-system';
import { Platform } from 'react-native';
import { EchoTrailError } from '@/core/errors';
import { AudioInput } from '@/shared/types';

export interface RecordingSession {
  uri: string;
  durationMs: number;
  sampleRate: number;
  channels: number;
}

export class AudioCaptureManager {
  private isRecordingActive = false;

  async checkPermissions(): Promise<boolean> {
    try {
      const { granted } = await getRecordingPermissionsAsync();
      return granted;
    } catch {
      return false;
    }
  }

  async requestPermissions(): Promise<boolean> {
    try {
      const { granted, canAskAgain } = await requestRecordingPermissionsAsync();
      if (!granted) {
        throw new EchoTrailError(
          'MICROPHONE_PERMISSION_DENIED',
          'Microphone permission was not granted.',
          canAskAgain
            ? 'Tap Record again to allow microphone access.'
            : 'Enable microphone permission in your device settings.'
        );
      }
      return granted;
    } catch (err: any) {
      if (err instanceof EchoTrailError) throw err;
      throw new EchoTrailError(
        'MICROPHONE_PERMISSION_DENIED',
        'Unable to access microphone: ' + (err.message || 'Permission denied'),
        'Enable microphone access in device settings.'
      );
    }
  }

  async configureAudioMode(): Promise<void> {
    try {
      await setAudioModeAsync({
        allowsRecording: true,
        playsInSilentMode: true,
      });
    } catch {
      // Non-fatal if audio mode fails on web or emulator
    }
  }

  get isRecording(): boolean {
    return this.isRecordingActive;
  }

  setRecordingActive(active: boolean): void {
    this.isRecordingActive = active;
  }

  async validateRecordedFile(uri: string, durationMs: number): Promise<AudioInput> {
    if (durationMs < 2000) {
      throw new EchoTrailError(
        'AUDIO_TOO_SHORT',
        `Recording duration (${(durationMs / 1000).toFixed(1)}s) was too short. Minimum required is 2.0 seconds.`,
        'Aim for 5 to 10 seconds of birdsong.'
      );
    }

    if (Platform.OS !== 'web' && uri.startsWith('file://')) {
      try {
        const info = await FileSystem.getInfoAsync(uri);
        if (!info.exists || (info.size && info.size < 1000)) {
          throw new EchoTrailError(
            'AUDIO_UNUSABLE',
            'Recording file is empty or corrupted.',
            'Check microphone connection and try again.'
          );
        }
      } catch (err: any) {
        if (err instanceof EchoTrailError) throw err;
      }
    }

    return {
      uri,
      durationMs,
      sampleRate: 16000,
      channels: 1,
    };
  }

  async cleanupTemporaryAudio(uri: string): Promise<void> {
    if (!uri) return;
    try {
      if (Platform.OS !== 'web' && uri.startsWith('file://')) {
        const info = await FileSystem.getInfoAsync(uri);
        if (info.exists) {
          await FileSystem.deleteAsync(uri, { idempotent: true });
        }
      }
    } catch {
      // Ignore cleanup error
    }
  }
}

export const audioCaptureManager = new AudioCaptureManager();
