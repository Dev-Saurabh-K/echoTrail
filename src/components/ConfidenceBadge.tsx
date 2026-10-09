import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Fonts } from '@/constants/theme';
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
      bgColor = '#AEEED3';
      textColor = '#164E47';
      iconName = 'checkmark-circle';
      label = 'High Match';
      break;
    case 'moderate':
      bgColor = '#FFF8B0';
      textColor = '#665103';
      iconName = 'alert-circle';
      label = 'Moderate Match';
      break;
    case 'low':
      bgColor = '#E1EFEA';
      textColor = '#287A74';
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
    fontFamily: Fonts.sans,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: -0.1,
  },
});
