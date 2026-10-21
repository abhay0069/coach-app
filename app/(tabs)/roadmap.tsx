import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, SectionList, Pressable, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/hooks/useTheme';
import { Screen } from '@/components/Screen';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { Chip } from '@/components/Chip';
import { TaskCard } from '@/components/TaskCard';
import { EmptyState } from '@/components/EmptyState';
import { spacing, typography, radius } from '@/theme';
import { useAppStore } from '@/store/useAppStore';
import { useRouter } from 'expo-router';
import { format, parseISO } from 'date-fns';

export default function RoadmapScreen() {
  const theme = useTheme();
  const router = useRouter();
  const tasks = useAppStore((s) => s.tasks);
  const modules = useAppStore((s) => s.modules);
  const activeCourseId = useAppStore((s) => s.activeCourseId);
  const courses = useAppStore((s) => s.courses);
  const regenerate = useAppStore((s) => s.regenerateRoadmap);
  const skipTask = useAppStore((s) => s.skipTask);
  const [filter, setFilter] = useState<'all' | 'upcoming' | 'completed'>('all');
  const [regening, setRegening] = useState(false);

  const course = courses.find((c) => c.id === activeCourseId);
  const courseTasks = tasks.filter((t) => t.course_id === activeCourseId);
  const courseModules = modules.filter((m) => m.course_id === activeCourseId);

  const sections = useMemo(() => {
    const filtered = courseTasks.filter((t) => {
      if (filter === 'upcoming') return t.status !== 'completed';
      if (filter === 'completed') return t.status === 'completed';
      return true;
    });
    const byDate: Record<string, typeof courseTasks> = {};
    for (const t of filtered) {
      byDate[t.date_scheduled] = byDate[t.date_scheduled] || [];
      byDate[t.date_scheduled].push(t);
    }
    return Object.keys(byDate).sort().map((d) => ({
      title: d,
      data: byDate[d],
    }));
  }, [courseTasks, filter]);

  const onRegenerate = () => {
    Alert.alert('Regenerate roadmap?', 'This will reschedule upcoming tasks while keeping your completed work.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Regenerate', onPress: async () => {
          setRegening(true);
          await regenerate();
          setRegening(false);
        },
      },
    ]);
  };

  return (
    <Screen>
      <View style={styles.headerRow}>
        <View style={{ flex: 1 }}>
          <Text style={[typography.h2, { color: theme.colors.text }]}>Roadmap</Text>
          {course && <Text style={{ color: theme.colors.textSecondary }}>{course.title}</Text>}
        </View>
        <Pressable onPress={() => router.push('/calendar' as any)} style={[styles.iconBtn, { borderColor: theme.colors.border, backgroundColor: theme.colors.surface }]}>
          <Ionicons name="calendar-outline" size={20} color={theme.colors.text} />
        </Pressable>
      </View>

      <Card style={{ marginBottom: spacing.md }}>
        <View style={{ flexDirection: 'row', gap: spacing.sm }}>
          <StatBox label="Modules" value={courseModules.length} />
          <StatBox label="Tasks" value={courseTasks.length} />
          <StatBox label="Completed" value={courseTasks.filter((t) => t.status === 'completed').length} />
        </View>
        {course && (
          <Text style={{ color: theme.colors.textSecondary, fontSize: 12, marginTop: spacing.sm }}>
            Target date: {format(parseISO(course.target_date.slice(0, 10)), 'MMM d, yyyy')}
          </Text>
        )}
      </Card>

      <View style={styles.filterRow}>
        {(['all', 'upcoming', 'completed'] as const).map((f) => (
          <Chip key={f} label={f[0].toUpperCase() + f.slice(1)} selected={filter === f} onPress={() => setFilter(f)} />
        ))}
        <View style={{ flex: 1 }} />
        <Pressable onPress={onRegenerate} style={styles.regenerate}>
          <Ionicons name="refresh" size={14} color={theme.colors.primary} />
          <Text style={{ color: theme.colors.primary, fontSize: 12, fontWeight: '700', marginLeft: 4 }}>Regenerate</Text>
        </Pressable>
      </View>

      <SectionList
        sections={sections}
        keyExtractor={(item) => item.id}
        renderSectionHeader={({ section: { title } }) => {
          const d = parseISO(title);
          const isToday = title === format(new Date(), 'yyyy-MM-dd');
          return (
            <View style={[styles.sectionHeader, { backgroundColor: theme.colors.background }]}>
              <Text style={{ color: isToday ? theme.colors.primary : theme.colors.textSecondary, fontSize: 13, fontWeight: '700' }}>
                {isToday ? 'Today' : format(d, 'EEE, MMM d')}
              </Text>
            </View>
          );
        }}
        renderItem={({ item }) => (
          <TaskCard
            task={item}
            onPress={() => router.push({ pathname: '/task/[id]', params: { id: item.id } } as any)}
          />
        )}
        ListEmptyComponent={<EmptyState icon="map-outline" title="No tasks found" description="Try adjusting the filter." />}
        SectionSeparatorComponent={() => <View style={{ height: spacing.sm }} />}
        contentContainerStyle={{ paddingBottom: spacing.xxl }}
        stickySectionHeadersEnabled={false}
      />
    </Screen>
  );
}

function StatBox({ label, value }: { label: string; value: number }) {
  const theme = useTheme();
  return (
    <View style={[styles.statBox, { backgroundColor: theme.colors.surfaceAlt }]}>
      <Text style={{ color: theme.colors.text, fontSize: 20, fontWeight: '800' }}>{value}</Text>
      <Text style={{ color: theme.colors.textSecondary, fontSize: 11, fontWeight: '600' }}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  headerRow: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.md, gap: spacing.sm },
  iconBtn: { width: 42, height: 42, borderRadius: 21, borderWidth: StyleSheet.hairlineWidth, alignItems: 'center', justifyContent: 'center' },
  statBox: { flex: 1, padding: spacing.md, borderRadius: radius.md, alignItems: 'center' },
  filterRow: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.sm },
  regenerate: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: spacing.sm, paddingVertical: 6 },
  sectionHeader: { paddingVertical: spacing.sm, paddingHorizontal: spacing.xs },
});
