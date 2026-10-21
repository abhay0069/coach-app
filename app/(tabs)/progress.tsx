import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/hooks/useTheme';
import { Screen } from '@/components/Screen';
import { Card } from '@/components/Card';
import { ProgressRing } from '@/components/ProgressRing';
import { spacing, typography, radius } from '@/theme';
import { useAppStore } from '@/store/useAppStore';
import { format, parseISO } from 'date-fns';

export default function ProgressScreen() {
  const theme = useTheme();
  const overall = useAppStore((s) => s.overallProgress());
  const weekly = useAppStore((s) => s.weeklyProgress());
  const streak = useAppStore((s) => s.streak());
  const courses = useAppStore((s) => s.courses);
  const activeCourseId = useAppStore((s) => s.activeCourseId);
  const quizzes = useAppStore((s) => s.quizzes.filter((q) => q.course_id === activeCourseId && q.completed));
  const revisions = useAppStore((s) => s.revisions.filter((r) => r.course_id === activeCourseId));
  const weakTopics = useMemo(() => {
    const counts: Record<string, number> = {};
    quizzes.forEach((q) => (q.weak_topics || []).forEach((t) => counts[t] = (counts[t] || 0) + 1));
    return Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 5);
  }, [quizzes]);
  const course = courses.find((c) => c.id === activeCourseId);

  const maxCompleted = Math.max(1, ...weekly.map((d) => d.completed));

  return (
    <Screen scroll>
      <Text style={[typography.h2, { color: theme.colors.text }]}>Progress</Text>
      {course && <Text style={{ color: theme.colors.textSecondary, marginBottom: spacing.md }}>{course.title}</Text>}

      <View style={styles.ringRow}>
        <Card style={[styles.ringCard, { alignItems: 'center' }]}>
          <ProgressRing size={100} progress={overall.completedTasks / Math.max(1, overall.totalTasks)} label={`${Math.round((overall.completedTasks / Math.max(1, overall.totalTasks)) * 100)}%`} sublabel="Course" />
          <Text style={{ color: theme.colors.textSecondary, fontSize: 12, marginTop: spacing.sm }}>{overall.completedTasks}/{overall.totalTasks} tasks</Text>
        </Card>
        <Card style={[styles.ringCard, { alignItems: 'center' }]}>
          <ProgressRing size={100} progress={overall.masteryPct / 100} label={`${overall.masteryPct}%`} sublabel="Mastery" color={theme.colors.accent} />
          <Text style={{ color: theme.colors.textSecondary, fontSize: 12, marginTop: spacing.sm }}>Quiz-weighted</Text>
        </Card>
      </View>

      <Card style={{ marginTop: spacing.md }}>
        <View style={styles.statRow}>
          <Stat icon="flame" value={`${streak}`} label="day streak" color={theme.colors.streak} />
          <Stat icon="ribbon" value={`${overall.avgScore}%`} label="avg quiz" color={theme.colors.success} />
          <Stat icon="time" value={`${weekly.reduce((s, d) => s + d.minutes, 0)}m`} label="this week" color={theme.colors.primary} />
          <Stat icon="refresh" value={`${revisions.filter((r) => r.last_reviewed_at).length}`} label="reviewed" color={theme.colors.warning} />
        </View>
      </Card>

      <Card style={{ marginTop: spacing.md }}>
        <Text style={[typography.h4, { color: theme.colors.text, marginBottom: spacing.md }]}>This Week</Text>
        <View style={styles.bars}>
          {weekly.map((d) => {
            const h = d.completed ? Math.max(8, (d.completed / maxCompleted) * 110) : 4;
            const isToday = d.date === format(new Date(), 'yyyy-MM-dd');
            return (
              <View key={d.date} style={styles.barCol}>
                <View style={{ flex: 1, justifyContent: 'flex-end', height: 120 }}>
                  <View style={[
                    styles.bar,
                    {
                      height: h,
                      backgroundColor: isToday ? theme.colors.primary : d.completed > 0 ? theme.colors.primaryLight : theme.colors.borderAlt,
                    },
                  ]} />
                </View>
                <Text style={{ color: theme.colors.textTertiary, fontSize: 11, marginTop: 4 }}>{format(parseISO(d.date), 'EEE')}</Text>
                <Text style={{ color: theme.colors.text, fontSize: 11, fontWeight: '700' }}>{d.completed}</Text>
              </View>
            );
          })}
        </View>
      </Card>

      {weakTopics.length > 0 && (
        <Card style={{ marginTop: spacing.md }}>
          <Text style={[typography.h4, { color: theme.colors.text, marginBottom: spacing.sm }]}>Weak Areas</Text>
          {weakTopics.map(([t, c]) => (
            <View key={t} style={styles.weakRow}>
              <Ionicons name="alert-circle-outline" size={14} color={theme.colors.warning} />
              <Text style={{ color: theme.colors.text, flex: 1, marginLeft: 6 }}>{t}</Text>
              <Text style={{ color: theme.colors.textTertiary, fontSize: 12 }}>missed {c}x</Text>
            </View>
          ))}
        </Card>
      )}

      <Card style={{ marginTop: spacing.md }}>
        <Text style={[typography.h4, { color: theme.colors.text, marginBottom: spacing.sm }]}>Weekly AI Report</Text>
        <Text style={{ color: theme.colors.textSecondary, lineHeight: 20 }}>
          You completed {weekly.filter((d) => d.completed > 0).length} of 7 study days this week, with a total of {weekly.reduce((s, d) => s + d.minutes, 0)} minutes focused.
          {weakTopics.length > 0 ? ` Your recurring tricky topic is "${weakTopics[0][0]}" — keep reviewing it with the spaced-repetition queue.` : ' Great balance across topics.'}
          {' '}Next week: aim to hit at least 5 study days and review your flashcards daily.
        </Text>
      </Card>

      {course && (
        <Card style={{ marginTop: spacing.md }}>
          <Text style={[typography.h4, { color: theme.colors.text, marginBottom: spacing.sm }]}>Estimated Completion</Text>
          <Text style={{ color: theme.colors.text }}>
            {format(parseISO(course.target_date.slice(0, 10)), 'MMMM d, yyyy')}
          </Text>
          <Text style={{ color: theme.colors.textSecondary, fontSize: 12, marginTop: 2 }}>
            At your current pace you are on track.
          </Text>
        </Card>
      )}

      <View style={{ height: spacing.xxl }} />
    </Screen>
  );
}

function Stat({ icon, value, label, color }: { icon: any; value: string; label: string; color: string }) {
  const theme = useTheme();
  return (
    <View style={styles.stat}>
      <Ionicons name={icon} size={18} color={color} />
      <Text style={{ color: theme.colors.text, fontSize: 18, fontWeight: '800', marginTop: 4 }}>{value}</Text>
      <Text style={{ color: theme.colors.textTertiary, fontSize: 11 }}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  ringRow: { flexDirection: 'row', gap: spacing.md },
  ringCard: { flex: 1, padding: spacing.lg },
  statRow: { flexDirection: 'row', justifyContent: 'space-between' },
  stat: { alignItems: 'center', flex: 1 },
  bars: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', height: 150 },
  barCol: { alignItems: 'center', flex: 1 },
  bar: { width: 20, borderRadius: radius.sm },
  weakRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 6 },
});
