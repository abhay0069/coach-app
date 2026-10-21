import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { radius, spacing } from '@/theme';

export function Card({ children, style, padded = true }: { children: React.ReactNode; style?: ViewStyle | ViewStyle[]; padded?: boolean }) {
  const theme = useTheme();
  return (
    <View style={[
      styles.card,
      {
        backgroundColor: theme.colors.surface,
        borderColor: theme.colors.border,
        shadowColor: theme.colors.cardShadow,
        padding: padded ? spacing.md : 0,
      },
      ...(Array.isArray(style) ? style : [style]),
    ]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 2,
  },
});
