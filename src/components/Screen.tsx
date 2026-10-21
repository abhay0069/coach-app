import React from 'react';
import { View, StyleSheet, ViewStyle, ScrollView, ScrollViewProps } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@/hooks/useTheme';
import { spacing } from '@/theme';

interface Props {
  children: React.ReactNode;
  scroll?: boolean;
  style?: ViewStyle;
  contentStyle?: ViewStyle;
  padded?: boolean;
  scrollProps?: ScrollViewProps;
}

export function Screen({ children, scroll, style, contentStyle, padded = true, scrollProps }: Props) {
  const theme = useTheme();
  const content = (
    <View style={[{ flex: 1, padding: padded ? spacing.md : 0 }, contentStyle]}>{children}</View>
  );
  return (
    <SafeAreaView style={[{ flex: 1, backgroundColor: theme.colors.background }, style]} edges={['top']}>
      {scroll ? (
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ padding: padded ? spacing.md : 0, paddingBottom: spacing.xxl }}
          keyboardShouldPersistTaps="handled"
          {...scrollProps}
        >
          {children}
        </ScrollView>
      ) : (
        content
      )}
    </SafeAreaView>
  );
}
