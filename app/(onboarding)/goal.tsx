import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/hooks/useTheme';
import { Button } from '@/components/Button';
import { spacing, typography, radius } from '@/theme';
import { useRouter } from 'expo-router';
import { useAppStore } from '@/store/useAppStore';
import { OutcomeGoal } from '@/types';

const GOALS: { id: OutcomeGoal; title: string; description: string; icon: any }[] = [
  { id: 'basic', title: 'Basic understanding', description: 'Get familiar with core concepts', icon: 'book-outline' },
  { id: 'project', title: 'Build projects', description: 'Apply skills hands-on', icon: 'hammer-outline' },
  { id: 'certification', title: 'Certification', description: 'Prepare for a certificate', icon: 'ribbon-outline' },
  { id: 'exam', title: 'Exam preparation', description: 'Get ready for an exam', icon: 'school-outline' },
  { id: 'job', title: 'Job readiness', description: 'Become interview-ready', icon: 'briefcase-outline' },
];

export default function OnboardingGoal() {
  const theme = useTheme();
  const router = useRouter();
  const onboarding = useAppStore((s) => s.onboarding);
  const createCourse = useAppStore((s) => s.createCourseFromOnboarding);
  const [goal, setGoal] = useState<OutcomeGoal>('project');
  const [loading, setLoading] = useState(false);

  const finish = async () => {
    setLoading(true);
    try {
      await createCourse({
        skill: onboarding.skill!,
        courseName: onboarding.courseName || onboarding.skill!,
        courseUrl: onboarding.courseUrl,
        courseSyllabus: onboarding.courseSyllabus,
        courseInputType: onboarding.courseInputType || 'manual',
        lessons: onboarding.lessons,
        skillLevel: onboarding.skillLevel || 'beginner',
        dailyMinutes: onboarding.dailyMinutes || 30,
        availableDays: onboarding.availableDays || ['mon', 'tue', 'wed', 'thu', 'fri'],
        preferredTime: onboarding.preferredTime || '18:00',
        targetDate: onboarding.targetDate || new Date(Date.now() + 30 * 24 * 3600 * 1000).toISOString(),
        outcomeGoal: goal,
      });
      router.replace('/(tabs)/today' as any);
    } finally { setLoading(false); }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView contentContainerStyle={{ padding: spacing.lg, paddingTop: spacing.xxl }}>
        <Text style={[styles.step, { color: theme.colors.primary }]}>Step 7 of 7</Text>
        <Text style={[typography.h1, { color: theme.colors.text }]}>What's your goal?</Text>
        <Text style={{ color: theme.colors.textSecondary, marginTop: spacing.sm, marginBottom: spacing.xl }}>
          This shapes how deep we go and which exercises we prioritize.
        </Text>
        {GOALS.map((g) => (
          <Pressable key={g.id} onPress={() => setGoal(g.id)} style={[
            styles.card,
            {
              backgroundColor: goal === g.id ? theme.colors.primary : theme.colors.surface,
              borderColor: goal === g.id ? theme.colors.primary : theme.colors.border,
            },
          ]}>
            <View style={[styles.iconWrap, { backgroundColor: goal === g.id ? '#ffffff33' : theme.colors.primary + '22' }]}>
              <Ionicons name={g.icon} size={22} color={goal === g.id ? '#fff' : theme.colors.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ color: goal === g.id ? '#fff' : theme.colors.text, fontSize: 16, fontWeight: '700' }}>{g.title}</Text>
              <Text style={{ color: goal === g.id ? '#ffffffcc' : theme.colors.textSecondary, fontSize: 13 }}>{g.description}</Text>
            </View>
            {goal === g.id && <Ionicons name="checkmark-circle" size={24} color="#fff" />}
          </Pressable>
        ))}
      </ScrollView>
      <View style={styles.footer}>
        <Button title="Build My Roadmap" onPress={finish} loading={loading} />
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
