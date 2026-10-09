import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { EchoTrailErrorCode, getFriendlyErrorMessage } from '@/core/errors';

interface ErrorAlertProps {
  code: EchoTrailErrorCode;
  customMessage?: string;
  onRetry?: () => void;
  onDismiss?: () => void;
  onUseSample?: () => void;
}

export function ErrorAlert({
  code,
  customMessage,
  onRetry,
  onDismiss,
  onUseSample,
}: ErrorAlertProps) {
  const info = getFriendlyErrorMessage(code);

  return (
    <View style={[styles.container, { backgroundColor: '#FEF2F2', borderColor: '#FECACA' }]}>
      <View style={styles.header}>
        <Ionicons name="alert-circle" size={22} color="#DC2626" />
        <Text style={styles.title}>{info.title}</Text>
      </View>

      <Text style={styles.message}>
        {customMessage || info.message}
      </Text>

      <View style={styles.actionBox}>
        <Ionicons name="bulb-outline" size={16} color="#B91C1C" />
        <Text style={styles.actionText}>{info.action}</Text>
      </View>

      <View style={styles.buttonRow}>
        {onRetry && (
          <Pressable
            style={({ pressed }) => [
              styles.retryButton,
              { backgroundColor: '#DC2626' },
              pressed && { opacity: 0.8 },
            ]}
            onPress={onRetry}>
            <Ionicons name="refresh" size={16} color="#FFFFFF" />
            <Text style={styles.retryButtonText}>Try Again</Text>
          </Pressable>
        )}

        {onUseSample && (
          <Pressable
            style={({ pressed }) => [
              styles.sampleButton,
              { borderColor: '#DC2626' },
              pressed && { opacity: 0.8 },
            ]}
            onPress={onUseSample}>
            <Text style={styles.sampleButtonText}>Try Sample Clip</Text>
          </Pressable>
        )}

        {onDismiss && (
          <Pressable
            style={({ pressed }) => [styles.dismissButton, pressed && { opacity: 0.6 }]}
            onPress={onDismiss}>
            <Text style={styles.dismissText}>Dismiss</Text>
          </Pressable>
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
    alignItems: 'center',
    gap: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: '#991B1B',
  },
  message: {
    fontSize: 13,
    lineHeight: 18,
    color: '#7F1D1D',
  },
  actionBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#FEE2E2',
    padding: 10,
    borderRadius: 10,
    gap: 6,
  },
  actionText: {
    fontSize: 12,
    lineHeight: 16,
    color: '#991B1B',
    fontWeight: '600',
    flex: 1,
  },
  buttonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flexWrap: 'wrap',
    paddingTop: 4,
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  sampleButton: {
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
  },
  sampleButtonText: {
    color: '#DC2626',
    fontSize: 13,
    fontWeight: '600',
  },
  dismissButton: {
    paddingHorizontal: 8,
    paddingVertical: 8,
  },
  dismissText: {
    color: '#7F1D1D',
    fontSize: 13,
  },
});
