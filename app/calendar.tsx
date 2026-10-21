import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, FlatList, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/hooks/useTheme';
import { Screen } from '@/components/Screen';
import { Card } from '@/components/Card';
import { TaskCard } from '@/components/TaskCard';
import { spacing, typography, radius } from '@/theme';
import { useAppStore } from '@/store/useAppStore';
import { useRouter } from 'expo-router';
import { addDays, addMonths, format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, isSameMonth, isSameDay, parseISO } from 'date-fns';

export default function CalendarScreen() {
  const theme = useTheme();
  const router = useRouter();
  const tasks = useAppStore((s) => s.tasks);
  const activeCourseId = useAppStore((s) => s.activeCourseId);
  const [cursor, setCursor] = useState(new Date());
  const [selected, setSelected] = useState(format(new Date(), 'yyyy-MM-dd'));

  const daysGrid = useMemo(() => {
    const start = startOfWeek(startOfMonth(cursor), { weekStartsOn: 1 });
    const end = endOfWeek(endOfMonth(cursor), { weekStartsOn: 1 });
    const days: Date[] = [];
    let d = start;
    while (d <= end) { days.push(d); d = addDays(d, 1); }
    return days;
  }, [cursor]);

  const taskMap = useMemo(() => {
    const map: Record<string, number> = {};
    tasks.filter((t) => t.course_id === activeCourseId).forEach((t) => {
      map[t.date_scheduled] = (map[t.date_scheduled] || 0) + 1;
    });
    return map;
  }, [tasks, activeCourseId]);

  const dayTasks = tasks.filter((t) => t.course_id === activeCourseId && t.date_scheduled === selected);

  return (
    <Screen>
      <View style={styles.monthRow}>
        <Pressable onPress={() => setCursor(addMonths(cursor, -1))} style={styles.navBtn}>
          <Ionicons name="chevron-back" size={20} color={theme.colors.text} />
        </Pressable>
        <Text style={[typography.h3, { color: theme.colors.text }]}>{format(cursor, 'MMMM yyyy')}</Text>
        <Pressable onPress={() => setCursor(addMonths(cursor, 1))} style={styles.navBtn}>
          <Ionicons name="chevron-forward" size={20} color={theme.colors.text} />
        </Pressable>
      </View>

      <Card style={{ marginBottom: spacing.md }}>
        <View style={styles.weekRow}>
          {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((l, i) => (
            <Text key={i} style={[styles.weekLabel, { color: theme.colors.textTertiary }]}>{l}</Text>
          ))}
        </View>
        <View style={styles.grid}>
          {daysGrid.map((d, i) => {
            const key = format(d, 'yyyy-MM-dd');
            const isThisMonth = isSameMonth(d, cursor);
            const isSelected = key === selected;
            const isToday = isSameDay(d, new Date());
            const count = taskMap[key] || 0;
            return (
              <Pressable key={i} onPress={() => setSelected(key)} style={[
                styles.dayCell,
                {
                  backgroundColor: isSelected ? theme.colors.primary : isToday ? theme.colors.surfaceAlt : 'transparent',
                },
              ]}>
                <Text style={{
                  color: isSelected ? '#fff' : !isThisMonth ? theme.colors.textTertiary : theme.colors.text,
                  fontWeight: isToday ? '800' : '500',
                }}>{format(d, 'd')}</Text>
                {count > 0 && (
                  <View style={[styles.dot, { backgroundColor: isSelected ? '#fff' : theme.colors.primary }]} />
                )}
              </Pressable>
            );
          })}
        </View>
      </Card>

      <Text style={[typography.h4, { color: theme.colors.text, marginBottom: spacing.sm }]}>
        {format(parseISO(selected), 'EEEE, MMMM d')}
      </Text>
      {dayTasks.length === 0 ? (
        <Text style={{ color: theme.colors.textTertiary }}>No tasks scheduled for this day.</Text>
      ) : (
        dayTasks.map((t) => (
          <TaskCard
            key={t.id} task={t}
            onPress={() => router.push({ pathname: '/task/[id]', params: { id: t.id } } as any)}
          />
        ))
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  monthRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.md },
  navBtn: { padding: spacing.sm },
  weekRow: { flexDirection: 'row', marginBottom: spacing.sm },
  weekLabel: { flex: 1, textAlign: 'center', fontSize: 11, fontWeight: '700' },
  grid: { flexDirection: 'row', flexWrap: 'wrap' },
  dayCell: { width: `${100 / 7}%`, height: 44, alignItems: 'center', justifyContent: 'center', borderRadius: radius.md },
  dot: { width: 5, height: 5, borderRadius: 3, marginTop: 2 },
});
