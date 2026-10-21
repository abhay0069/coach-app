import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/hooks/useTheme';
import { Button } from '@/components/Button';
import { spacing, typography, radius } from '@/theme';
import { useRouter } from 'expo-router';
import { useAppStore } from '@/store/useAppStore';
import { SkillLevel } from '@/types';

const LEVELS: { id: SkillLevel; title: string; description: string; icon: any }[] = [
  { id: 'beginner', title: 'Beginner', description: 'I\'m brand new to this skill', icon: 'leaf-outline' },
  { id: 'intermediate', title: 'Intermediate', description: 'I know the basics and want to go deeper', icon: 'trending-up-outline' },
  { id: 'advanced', title: 'Advanced', description: 'I have solid experience and want to master it', icon: 'flame-outline' },
];

export default function OnboardingLevel() {
  const theme = useTheme();
  const router = useRouter();
  const setOnboarding = useAppStore((s) => s.setOnboardingData);
  const [level, setLevel] = useState<SkillLevel>('beginner');

  const next = async () => {
    await setOnboarding({ skillLevel: level });
    router.push('/(onboarding)/time' as any);
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView contentContainerStyle={{ padding: spacing.lg, paddingTop: spacing.xxl }}>
        <Text style={[styles.step, { color: theme.colors.primary }]}>Step 3 of 7</Text>
        <Text style={[typography.h1, { color: theme.colors.text }]}>What's your current level?</Text>
        <Text style={{ color: theme.colors.textSecondary, marginTop: spacing.sm, marginBottom: spacing.xl }}>
          This helps us pace your plan correctly.
        </Text>
        {LEVELS.map((l) => (
          <Pressable key={l.id} onPress={() => setLevel(l.id)} style={[
            styles.card,
            {
              backgroundColor: level === l.id ? theme.colors.primary : theme.colors.surface,
              borderColor: level === l.id ? theme.colors.primary : theme.colors.border,
            },
          ]}>
            <View style={[styles.iconWrap, { backgroundColor: level === l.id ? '#ffffff33' : theme.colors.primary + '22' }]}>
              <Ionicons name={l.icon} size={22} color={level === l.id ? '#fff' : theme.colors.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ color: level === l.id ? '#fff' : theme.colors.text, fontSize: 16, fontWeight: '700' }}>{l.title}</Text>
              <Text style={{ color: level === l.id ? '#ffffffcc' : theme.colors.textSecondary, fontSize: 13 }}>{l.description}</Text>
            </View>
            {level === l.id && <Ionicons name="checkmark-circle" size={24} color="#fff" />}
          </Pressable>
        ))}
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
  card: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, padding: spacing.md, borderRadius: radius.lg, borderWidth: 1, marginBottom: spacing.sm },
  iconWrap: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  footer: { padding: spacing.lg, paddingBottom: spacing.xl },
});
