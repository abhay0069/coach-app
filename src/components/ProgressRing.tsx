import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { useTheme } from '@/hooks/useTheme';

interface Props {
  size?: number;
  strokeWidth?: number;
  progress: number; // 0-1
  label?: string;
  sublabel?: string;
  color?: string;
}

export function ProgressRing({ size = 100, strokeWidth = 10, progress, label, sublabel, color }: Props) {
  const theme = useTheme();
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const clamped = Math.max(0, Math.min(1, progress));
  const offset = circumference * (1 - clamped);
  const ringColor = color || theme.colors.primary;

  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <Svg width={size} height={size}>
        <Circle
          cx={size / 2} cy={size / 2} r={radius}
          stroke={theme.colors.progressBg} strokeWidth={strokeWidth} fill="none"
        />
        <Circle
          cx={size / 2} cy={size / 2} r={radius}
          stroke={ringColor} strokeWidth={strokeWidth} fill="none"
          strokeDasharray={`${circumference} ${circumference}`}
          strokeDashoffset={offset}
          strokeLinecap="round"
          rotation={-90}
          origin={`${size / 2}, ${size / 2}`}
        />
      </Svg>
      <View style={[StyleSheet.absoluteFill, { alignItems: 'center', justifyContent: 'center' }]}>
        {label && <Text style={{ color: theme.colors.text, fontSize: size * 0.22, fontWeight: '800' }}>{label}</Text>}
        {sublabel && <Text style={{ color: theme.colors.textSecondary, fontSize: size * 0.11, marginTop: 2 }}>{sublabel}</Text>}
      </View>
    </View>
  );
}
