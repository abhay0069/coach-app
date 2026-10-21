import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { Button } from '@/components/Button';
import { spacing, typography, radius } from '@/theme';
import { useRouter } from 'expo-router';
import { useAppStore } from '@/store/useAppStore';
import { addDays, format } from 'date-fns';

const PRESETS = [
  { label: '2 weeks', days: 14 },
  { label: '1 month', days: 30 },
  { label: '2 months', days: 60 },
  { label: '3 months', days: 90 },
  { label: '6 months', days: 180 },
];

export default function OnboardingDeadline() {
  const theme = useTheme();
  const router = useRouter();
  const setOnboarding = useAppStore((s) => s.setOnboardingData);
  const [days, setDays] = useState(30);

  const next = async () => {
    await setOnboarding({ targetDate: addDays(new Date(), days).toISOString() });
    router.push('/(onboarding)/goal' as any);
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView contentContainerStyle={{ padding: spacing.lg, paddingTop: spacing.xxl }}>
        <Text style={[styles.step, { color: theme.colors.primary }]}>Step 6 of 7</Text>
        <Text style={[typography.h1, { color: theme.colors.text }]}>When do you want to finish?</Text>
        <Text style={{ color: theme.colors.textSecondary, marginTop: spacing.sm, marginBottom: spacing.xl }}>
          Your target date shapes the daily pace. You can adjust it anytime.
        </Text>
        <View style={styles.grid}>
          {PRESETS.map((p) => (
            <Pressable key={p.days} onPress={() => setDays(p.days)} style={[
              styles.option,
              { backgroundColor: days === p.days ? theme.colors.primary : theme.colors.surface, borderColor: days === p.days ? theme.colors.primary : theme.colors.border },
            ]}>
              <Text style={{ color: days === p.days ? '#fff' : theme.colors.text, fontSize: 18, fontWeight: '800' }}>{p.label}</Text>
              <Text style={{ color: days === p.days ? '#ffffffcc' : theme.colors.textSecondary, fontSize: 12 }}>
                Target: {format(addDays(new Date(), p.days), 'MMM d')}
              </Text>
            </Pressable>
          ))}
        </View>
      </ScrollView>
      <View style={styles.footer}>
        <Button title="Continue" onPress={next} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  step: { fontSize: 13, fontWeight: '700', marginBottom: spacing.sm },
  grid: { gap: spacing.sm },
  option: { paddingVertical: spacing.md, paddingHorizontal: spacing.lg, borderRadius: radius.lg, borderWidth: 1 },
  footer: { padding: spacing.lg, paddingBottom: spacing.xl },
});
