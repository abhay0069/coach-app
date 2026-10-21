import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Button } from '@/components/Button';
import { useRouter } from 'expo-router';
import { useTheme } from '@/hooks/useTheme';
import { spacing, typography, radius } from '@/theme';

export default function Welcome() {
  const router = useRouter();
  const theme = useTheme();
  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <LinearGradient
        colors={[theme.colors.primary + '33', theme.colors.accent + '22', 'transparent']}
        style={StyleSheet.absoluteFill}
      />
      <View style={styles.content}>
        <View style={[styles.logo, { backgroundColor: theme.colors.primary }]}>
          <Ionicons name="rocket" size={44} color="#fff" />
        </View>
        <Text style={[typography.h1, { color: theme.colors.text, textAlign: 'center', marginTop: spacing.lg }]}>
          SkillPilot AI
        </Text>
        <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
          Your personal AI coach that helps you finish courses and truly master new skills — one focused day at a time.
        </Text>
        <View style={styles.features}>
          {[
            { icon: 'map', label: 'Personalized roadmaps tailored to your course & deadline' },
            { icon: 'notifications', label: 'Smart reminders that adapt to your schedule' },
            { icon: 'school', label: 'Daily quizzes and spaced repetition for real retention' },
            { icon: 'chatbubbles', label: 'An AI mentor who knows exactly what you studied' },
          ].map((f, i) => (
            <View key={i} style={styles.featureRow}>
              <View style={[styles.fIcon, { backgroundColor: theme.colors.primary + '22' }]}>
                <Ionicons name={f.icon as any} size={18} color={theme.colors.primary} />
              </View>
              <Text style={[styles.fText, { color: theme.colors.textSecondary }]}>{f.label}</Text>
            </View>
          ))}
        </View>
      </View>
      <View style={styles.buttons}>
        <Button title="Get Started" onPress={() => router.push('/(auth)/signup' as any)} />
        <Button title="I already have an account" variant="ghost" onPress={() => router.push('/(auth)/login' as any)} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: spacing.xl, paddingTop: spacing.xxl },
  logo: { width: 96, height: 96, borderRadius: radius.xl, alignItems: 'center', justifyContent: 'center', shadowColor: '#6366F1', shadowOpacity: 0.4, shadowRadius: 16, shadowOffset: { width: 0, height: 8 }, elevation: 6 },
  subtitle: { fontSize: 15, textAlign: 'center', marginTop: spacing.sm, lineHeight: 22 },
  features: { marginTop: spacing.xl, alignSelf: 'stretch', gap: spacing.md },
  featureRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  fIcon: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  fText: { fontSize: 14, flex: 1, lineHeight: 20 },
  buttons: { padding: spacing.lg, gap: spacing.sm, paddingBottom: spacing.xl },
});
