import React from 'react';
import { View, Text, TextInput, StyleSheet, TextInputProps } from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { radius, spacing } from '@/theme';

interface Props extends TextInputProps {
  label?: string;
  error?: string;
  hint?: string;
}

export function Input({ label, error, hint, style, ...props }: Props) {
  const theme = useTheme();
  return (
    <View style={{ marginBottom: spacing.md }}>
      {label && <Text style={[styles.label, { color: theme.colors.text }]}>{label}</Text>}
      <TextInput
        placeholderTextColor={theme.colors.textTertiary}
        style={[
          styles.input,
          {
            color: theme.colors.text,
            backgroundColor: theme.colors.surface,
            borderColor: error ? theme.colors.danger : theme.colors.border,
          },
          style,
        ]}
        {...props}
      />
      {hint && !error && <Text style={[styles.hint, { color: theme.colors.textTertiary }]}>{hint}</Text>}
      {error && <Text style={[styles.hint, { color: theme.colors.danger }]}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  label: { fontSize: 14, fontWeight: '600', marginBottom: 6 },
  input: {
    borderWidth: 1,
    borderRadius: radius.md,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
  },
  hint: { fontSize: 12, marginTop: 4 },
});
