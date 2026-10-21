import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { Button } from '@/components/Button';
import { spacing, typography, radius } from '@/theme';
import { useRouter } from 'expo-router';
import { useAppStore } from '@/store/useAppStore';
import { DaysOfWeek } from '@/types';

const DAYS: { id: DaysOfWeek; label: string }[] = [
  { id: 'mon', label: 'Mon' }, { id: 'tue', label: 'Tue' }, { id: 'wed', label: 'Wed' },
  { id: 'thu', label: 'Thu' }, { id: 'fri', label: 'Fri' }, { id: 'sat', label: 'Sat' }, { id: 'sun', label: 'Sun' },
];

export default function OnboardingDays() {
  const theme = useTheme();
  const router = useRouter();
  const setOnboarding = useAppStore((s) => s.setOnboardingData);
  const [days, setDays] = useState<DaysOfWeek[]>(['mon', 'tue', 'wed', 'thu', 'fri']);
  const [time, setTime] = useState('18:00');

  const toggle = (d: DaysOfWeek) => {
    setDays(days.includes(d) ? days.filter((x) => x !== d) : [...days, d]);
  };

  const next = async () => {
    await setOnboarding({ availableDays: days.length ? days : ['mon', 'tue', 'wed', 'thu', 'fri'], preferredTime: time });
    router.push('/(onboarding)/deadline' as any);
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView contentContainerStyle={{ padding: spacing.lg, paddingTop: spacing.xxl }}>
        <Text style={[styles.step, { color: theme.colors.primary }]}>Step 5 of 7</Text>
        <Text style={[typography.h1, { color: theme.colors.text }]}>Which days work best?</Text>
        <Text style={{ color: theme.colors.textSecondary, marginTop: spacing.sm, marginBottom: spacing.xl }}>
          We'll schedule around your availability.
        </Text>
        <View style={styles.daysRow}>
          {DAYS.map((d) => {
            const selected = days.includes(d.id);
            return (
              <Pressable key={d.id} onPress={() => toggle(d.id)} style={[
                styles.day,
                { backgroundColor: selected ? theme.colors.primary : theme.colors.surface, borderColor: selected ? theme.colors.primary : theme.colors.border },
              ]}>
                <Text style={{ color: selected ? '#fff' : theme.colors.text, fontWeight: '700' }}>{d.label}</Text>
              </Pressable>
            );
          })}
        </View>

        <Text style={[typography.h4, { color: theme.colors.text, marginTop: spacing.xl, marginBottom: spacing.sm }]}>Preferred study time</Text>
        <View style={styles.timeRow}>
          {['07:00', '12:30', '18:00', '21:00'].map((t) => (
            <Pressable key={t} onPress={() => setTime(t)} style={[
              styles.timeChip,
              { backgroundColor: time === t ? theme.colors.primary : theme.colors.surfaceAlt, borderColor: time === t ? theme.colors.primary : theme.colors.border },
            ]}>
              <Text style={{ color: time === t ? '#fff' : theme.colors.text, fontWeight: '600' }}>{t}</Text>
            </Pressable>
          ))}
        </View>
      </ScrollView>
      <View style={styles.footer}>
        <Button title="Continue" onPress={next} disabled={days.length === 0} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  step: { fontSize: 13, fontWeight: '700', marginBottom: spacing.sm },
  daysRow: { flexDirection: 'row', justifyContent: 'space-between' },
  day: { width: 42, height: 48, borderRadius: radius.md, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  timeRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  timeChip: { paddingHorizontal: spacing.md, paddingVertical: 10, borderRadius: radius.pill, borderWidth: 1 },
  footer: { padding: spacing.lg, paddingBottom: spacing.xl },
});
