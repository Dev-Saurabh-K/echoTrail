import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { ConfidenceLabel } from '@/shared/types';

interface ConfidenceBadgeProps {
  confidence: ConfidenceLabel;
  score?: number;
}

export function ConfidenceBadge({ confidence, score }: ConfidenceBadgeProps) {
  let bgColor = '#E5E7EB';
  let textColor = '#374151';
  let iconName: keyof typeof Ionicons.glyphMap = 'help-circle-outline';
  let label = 'Uncertain';

  switch (confidence) {
    case 'high':
      bgColor = '#DCFCE7';
      textColor = '#15803D';
      iconName = 'checkmark-circle';
      label = 'High Match';
      break;
    case 'moderate':
      bgColor = '#FEF3C7';
      textColor = '#B45309';
      iconName = 'alert-circle';
      label = 'Moderate Match';
      break;
    case 'low':
      bgColor = '#F3F4F6';
      textColor = '#6B7280';
      iconName = 'information-circle';
      label = 'Low Confidence';
      break;
    case 'uncertain':
      bgColor = '#FEE2E2';
      textColor = '#B91C1C';
      iconName = 'warning';
      label = 'Uncertain / Ambiguous';
      break;
  }

  return (
    <View style={[styles.badge, { backgroundColor: bgColor }]}>
      <Ionicons name={iconName} size={14} color={textColor} />
      <Text style={[styles.text, { color: textColor }]}>
        {label}
        {score !== undefined ? ` • ${Math.round(score * 100)}%` : ''}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
    alignSelf: 'flex-start',
  },
  text: {
    fontSize: 12,
    fontWeight: '600',
  },
});
