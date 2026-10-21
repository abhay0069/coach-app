import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { Button } from '@/components/Button';
import { spacing, typography, radius } from '@/theme';
import { useRouter } from 'expo-router';
import { useAppStore } from '@/store/useAppStore';

const OPTIONS = [15, 25, 40, 60, 90, 120];

export default function OnboardingTime() {
  const theme = useTheme();
  const router = useRouter();
  const setOnboarding = useAppStore((s) => s.setOnboardingData);
  const [mins, setMins] = useState(30);

  const next = async () => {
    await setOnboarding({ dailyMinutes: mins });
    router.push('/(onboarding)/days' as any);
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView contentContainerStyle={{ padding: spacing.lg, paddingTop: spacing.xxl }}>
        <Text style={[styles.step, { color: theme.colors.primary }]}>Step 4 of 7</Text>
        <Text style={[typography.h1, { color: theme.colors.text }]}>How much time can you study each day?</Text>
        <Text style={{ color: theme.colors.textSecondary, marginTop: spacing.sm, marginBottom: spacing.xl }}>
          Pick something realistic. Consistency beats intensity.
        </Text>
        <View style={styles.grid}>
          {OPTIONS.map((m) => (
            <Pressable key={m} onPress={() => setMins(m)} style={[
              styles.option,
              {
                backgroundColor: mins === m ? theme.colors.primary : theme.colors.surface,
                borderColor: mins === m ? theme.colors.primary : theme.colors.border,
              },
            ]}>
              <Text style={{ color: mins === m ? '#fff' : theme.colors.text, fontSize: 22, fontWeight: '800' }}>{m}</Text>
              <Text style={{ color: mins === m ? '#ffffffcc' : theme.colors.textSecondary, fontSize: 12 }}>minutes</Text>
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
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  option: { width: '31%', paddingVertical: spacing.lg, borderRadius: radius.lg, borderWidth: 1, alignItems: 'center' },
  footer: { padding: spacing.lg, paddingBottom: spacing.xl },
});
