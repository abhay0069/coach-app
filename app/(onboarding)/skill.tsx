import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, ScrollView } from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { Button } from '@/components/Button';
import { Chip } from '@/components/Chip';
import { spacing, typography, radius } from '@/theme';
import { useRouter } from 'expo-router';
import { useAppStore } from '@/store/useAppStore';

const SUGGESTED = ['Python', 'React / Web Development', 'Machine Learning', 'Graphic Design', 'JavaScript', 'Data Science', 'Spanish', 'Digital Marketing'];

export default function OnboardingSkill() {
  const theme = useTheme();
  const router = useRouter();
  const onboarding = useAppStore((s) => s.onboarding);
  const setOnboarding = useAppStore((s) => s.setOnboardingData);
  const [skill, setSkill] = useState(onboarding.skill || '');

  const next = async () => {
    await setOnboarding({ skill });
    router.push('/(onboarding)/course' as any);
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView contentContainerStyle={{ padding: spacing.lg, paddingTop: spacing.xxl }}>
        <Text style={[styles.step, { color: theme.colors.primary }]}>Step 1 of 7</Text>
        <Text style={[typography.h1, { color: theme.colors.text }]}>What do you want to learn?</Text>
        <Text style={{ color: theme.colors.textSecondary, marginTop: spacing.sm, marginBottom: spacing.xl }}>
          SkillPilot will build a personal roadmap for this skill.
        </Text>
        <TextInput
          value={skill}
          onChangeText={setSkill}
          placeholder="e.g. Python, React, UI Design..."
          placeholderTextColor={theme.colors.textTertiary}
          style={[styles.input, { color: theme.colors.text, backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}
        />
        <Text style={[styles.sectionLabel, { color: theme.colors.textSecondary }]}>Or pick from popular skills:</Text>
        <View style={styles.chipsRow}>
          {SUGGESTED.map((s) => (
            <Chip key={s} label={s} selected={skill === s} onPress={() => setSkill(s)} />
          ))}
        </View>
      </ScrollView>
      <View style={styles.footer}>
        <Button title="Continue" onPress={next} disabled={!skill.trim()} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  step: { fontSize: 13, fontWeight: '700', marginBottom: spacing.sm },
  input: {
    borderWidth: 1, borderRadius: radius.lg, paddingHorizontal: spacing.md, paddingVertical: 14,
    fontSize: 16, marginBottom: spacing.lg,
  },
  sectionLabel: { fontSize: 13, fontWeight: '600', marginBottom: spacing.sm },
  chipsRow: { flexDirection: 'row', flexWrap: 'wrap' },
  footer: { padding: spacing.lg, paddingBottom: spacing.xl },
});
