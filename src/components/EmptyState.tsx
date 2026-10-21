import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/hooks/useTheme';
import { spacing } from '@/theme';
import { Button } from './Button';

interface Props {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  description?: string;
  action?: { label: string; onPress: () => void };
}

export function EmptyState({ icon, title, description, action }: Props) {
  const theme = useTheme();
  return (
    <View style={styles.wrap}>
      <View style={[styles.iconWrap, { backgroundColor: theme.colors.surfaceAlt }]}>
        <Ionicons name={icon} size={36} color={theme.colors.primary} />
      </View>
      <Text style={[styles.title, { color: theme.colors.text }]}>{title}</Text>
      {description && <Text style={[styles.desc, { color: theme.colors.textSecondary }]}>{description}</Text>}
      {action && <Button title={action.label} onPress={action.onPress} style={{ marginTop: spacing.lg, minWidth: 200 }} />}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', padding: spacing.xl },
  iconWrap: { width: 72, height: 72, borderRadius: 36, alignItems: 'center', justifyContent: 'center', marginBottom: spacing.md },
  title: { fontSize: 18, fontWeight: '700', marginBottom: spacing.xs, textAlign: 'center' },
  desc: { fontSize: 14, textAlign: 'center', lineHeight: 20 },
});
