import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/hooks/useTheme';
import { Screen } from '@/components/Screen';
import { Card } from '@/components/Card';
import { TaskCard } from '@/components/TaskCard';
import { ProgressRing } from '@/components/ProgressRing';
import { Button } from '@/components/Button';
import { Chip } from '@/components/Chip';
import { EmptyState } from '@/components/EmptyState';
import { spacing, typography } from '@/theme';
import { useAppStore } from '@/store/useAppStore';
import { useRouter } from 'expo-router';
import { format } from 'date-fns';

export default function TodayScreen() {
  const theme = useTheme();
  const router = useRouter();
  const courses = useAppStore((s) => s.courses);
  const activeCourseId = useAppStore((s) => s.activeCourseId);
  const todayTasks = useAppStore((s) => s.todayTasks);
  const todayFilter = useAppStore((s) => s.todayFilter);
  const setTodayFilter = useAppStore((s) => s.setTodayFilter);
  const markTaskComplete = useAppStore((s) => s.markTaskComplete);
  const streak = useAppStore((s) => s.streak());
  const getTodayQuiz = useAppStore((s) => s.getTodayQuiz);
  const startQuiz = useAppStore((s) => s.startQuiz);
  const dueRevisions = useAppStore((s) => s.dueRevisions);
  const weeklyProgress = useAppStore((s) => s.weeklyProgress());
  const activeCourse = courses.find((c) => c.id === activeCourseId);
  const tasks = todayTasks();
  const [refreshing, setRefreshing] = React.useState(false);

  const completed = tasks.filter((t) => t.status === 'completed').length;
  const progress = tasks.length ? completed / tasks.length : 0;
  const totalMinutes = tasks.filter((t) => t.status !== 'completed').reduce((s, t) => s + t.estimated_minutes, 0);
  const quiz = getTodayQuiz();
  const pendingRevisions = dueRevisions();

  const filtered = useMemo(() => {
    if (todayFilter === 'pending') return tasks.filter((t) => t.status !== 'completed');
    if (todayFilter === 'completed') return tasks.filter((t) => t.status === 'completed');
    return tasks;
  }, [tasks, todayFilter]);

  const nextPendingTask = tasks.find((t) => t.status !== 'completed' && t.type !== 'quiz');

  const greeting = (() => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 18) return 'Good afternoon';
    return 'Good evening';
  })();

  const onRefresh = async () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 500);
  };

  return (
    <Screen scroll
      scrollProps={{ refreshControl: <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.colors.primary} /> }}
    >
      <View style={styles.header}>
        <View>
          <Text style={[styles.greeting, { color: theme.colors.textSecondary }]}>{greeting}</Text>
          <Text style={[typography.h2, { color: theme.colors.text }]}>Today's Plan</Text>
          {activeCourse && <Text style={{ color: theme.colors.textTertiary, marginTop: 2 }}>{activeCourse.title}</Text>}
        </View>
        <Pressable onPress={() => router.push('/notifications' as any)} style={[styles.iconBtn, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
          <Ionicons name="notifications-outline" size={20} color={theme.colors.text} />
        </Pressable>
      </View>

      <Card style={styles.heroCard}>
        <View style={styles.heroTop}>
          <View style={{ flex: 1 }}>
            <Text style={{ color: theme.colors.textSecondary, fontSize: 12, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 1 }}>
              {format(new Date(), 'EEEE, MMM d')}
            </Text>
            <Text style={[typography.h3, { color: theme.colors.text, marginTop: 4 }]}>
              {nextPendingTask ? nextPendingTask.learning_objective : 'All tasks done for today! 🎉'}
            </Text>
            <Text style={{ color: theme.colors.textSecondary, marginTop: 6 }}>
              {totalMinutes > 0 ? `${totalMinutes} min of focused learning left` : 'Excellent work today.'}
            </Text>
          </View>
          <ProgressRing size={82} progress={progress} label={`${Math.round(progress * 100)}%`} sublabel="done" />
        </View>
        <View style={styles.heroStats}>
          <Stat icon="flame" label={`${streak} day streak`} color={theme.colors.streak} />
          <Stat icon="checkmark-done" label={`${completed}/${tasks.length} tasks`} color={theme.colors.success} />
          <Stat icon="time-outline" label={`${tasks.reduce((s, t) => s + t.estimated_minutes, 0)}m planned`} color={theme.colors.primary} />
        </View>
        {nextPendingTask && (
          <Button
            title="Start Learning"
            onPress={() => router.push({ pathname: '/task/[id]', params: { id: nextPendingTask.id } } as any)}
            style={{ marginTop: spacing.md }}
          />
        )}
        {!nextPendingTask && tasks.length > 0 && !quiz?.completed && (
          <Button title="Take Daily Quiz" onPress={() => router.push('/quiz' as any)} style={{ marginTop: spacing.md }} />
        )}
      </Card>

      {pendingRevisions.length > 0 && (
        <Pressable onPress={() => router.push('/(tabs)/revision' as any)}>
          <Card style={[styles.reviewCard, { backgroundColor: theme.colors.warning + '18', borderColor: theme.colors.warning + '44' }]}>
            <Ionicons name="alert-circle-outline" size={20} color={theme.colors.warning} />
            <View style={{ flex: 1, marginLeft: spacing.sm }}>
              <Text style={{ color: theme.colors.text, fontWeight: '700' }}>{pendingRevisions.length} revision{pendingRevisions.length > 1 ? 's' : ''} due</Text>
              <Text style={{ color: theme.colors.textSecondary, fontSize: 12 }}>Tap to review and strengthen memory</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={theme.colors.textSecondary} />
          </Card>
        </Pressable>
      )}

      {quiz && !quiz.completed && tasks.some((t) => t.type !== 'quiz' && t.status === 'completed') && (
        <Card style={[styles.quizCard, { backgroundColor: theme.colors.accent + '15', borderColor: theme.colors.accent + '44' }]}>
          <View style={{ flex: 1 }}>
            <Text style={{ color: theme.colors.text, fontWeight: '700' }}>Daily Knowledge Check</Text>
            <Text style={{ color: theme.colors.textSecondary, fontSize: 12, marginTop: 2 }}>5 questions • ~5 min</Text>
          </View>
          <Button title="Start" onPress={() => router.push('/quiz' as any)} />
        </Card>
      )}

      <View style={styles.filterRow}>
        {(['all', 'pending', 'completed'] as const).map((f) => (
          <Chip key={f} label={f[0].toUpperCase() + f.slice(1)} selected={todayFilter === f} onPress={() => setTodayFilter(f)} />
        ))}
      </View>

      {filtered.length === 0 ? (
        <EmptyState
          icon="checkmark-done-circle-outline"
          title="Nothing here"
          description={todayFilter === 'completed' ? 'No completed tasks yet today.' : 'No tasks match this filter.'}
        />
      ) : (
        filtered.map((task) => (
          <TaskCard
            key={task.id}
            task={task}
            onPress={() => router.push({ pathname: '/task/[id]', params: { id: task.id } } as any)}
            onToggleComplete={() => {
              if (task.status === 'completed') return;
              markTaskComplete(task.id);
            }}
          />
        ))
      )}

      <View style={{ height: spacing.xxl }} />
    </Screen>
  );
}

function Stat({ icon, label, color }: { icon: any; label: string; color: string }) {
  const theme = useTheme();
  return (
    <View style={styles.stat}>
      <Ionicons name={icon} size={16} color={color} />
      <Text style={{ color: theme.colors.textSecondary, fontSize: 12, marginLeft: 4, fontWeight: '600' }}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: spacing.md },
  greeting: { fontSize: 13, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 1 },
  iconBtn: { width: 42, height: 42, borderRadius: 21, alignItems: 'center', justifyContent: 'center', borderWidth: StyleSheet.hairlineWidth },
  heroCard: { marginBottom: spacing.md },
  heroTop: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  heroStats: { flexDirection: 'row', gap: spacing.md, marginTop: spacing.md, flexWrap: 'wrap' },
  stat: { flexDirection: 'row', alignItems: 'center', marginRight: spacing.md },
  reviewCard: { flexDirection: 'row', alignItems: 'center', padding: spacing.md, borderRadius: 16, borderWidth: 1, marginBottom: spacing.sm },
  quizCard: { flexDirection: 'row', alignItems: 'center', padding: spacing.md, borderRadius: 16, borderWidth: 1, marginBottom: spacing.md, gap: spacing.md },
  filterRow: { flexDirection: 'row', marginTop: spacing.md, marginBottom: spacing.sm },
});
