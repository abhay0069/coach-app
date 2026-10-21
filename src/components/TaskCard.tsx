import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Task } from '@/types';
import { useTheme } from '@/hooks/useTheme';
import { radius, spacing } from '@/theme';
import { Ionicons } from '@expo/vector-icons';

interface Props {
  task: Task;
  onPress: () => void;
  onToggleComplete?: () => void;
}

const typeMeta: Record<string, { icon: any; label: string; color: string }> = {
  lesson: { icon: 'book-outline', label: 'Lesson', color: 'primary' },
  exercise: { icon: 'hammer-outline', label: 'Exercise', color: 'warning' },
  quiz: { icon: 'help-circle-outline', label: 'Quiz', color: 'accent' },
  mini_project: { icon: 'rocket-outline', label: 'Project', color: 'success' },
  revision: { icon: 'refresh-outline', label: 'Revision', color: 'primaryLight' },
  assessment: { icon: 'trophy-outline', label: 'Assessment', color: 'success' },
};

export function TaskCard({ task, onPress, onToggleComplete }: Props) {
  const theme = useTheme();
  const meta = typeMeta[task.type] || typeMeta.lesson;
  const color =
    meta.color === 'primary' ? theme.colors.primary :
    meta.color === 'warning' ? theme.colors.warning :
    meta.color === 'accent' ? theme.colors.accent :
    meta.color === 'success' ? theme.colors.success : theme.colors.primaryLight;

  const isDone = task.status === 'completed';

  return (
    <Pressable onPress={onPress} style={({ pressed }) => [
      styles.card,
      { backgroundColor: theme.colors.surface, borderColor: theme.colors.border, opacity: pressed ? 0.9 : 1 },
    ]}>
      <Pressable
        onPress={onToggleComplete}
        hitSlop={10}
        style={[
          styles.check,
          { borderColor: isDone ? theme.colors.success : theme.colors.borderAlt, backgroundColor: isDone ? theme.colors.success : 'transparent' },
        ]}
      >
        {isDone && <Ionicons name="checkmark" size={18} color="#fff" />}
      </Pressable>
      <View style={{ flex: 1 }}>
        <View style={styles.row}>
          <View style={[styles.badge, { backgroundColor: color + '22' }]}>
            <Ionicons name={meta.icon} size={12} color={color} />
            <Text style={[styles.badgeText, { color }]}>{meta.label}</Text>
          </View>
          <Text style={[styles.mins, { color: theme.colors.textTertiary }]}>
            <Ionicons name="time-outline" size={11} color={theme.colors.textTertiary} /> {task.estimated_minutes}m
          </Text>
        </View>
        <Text style={[styles.title, { color: isDone ? theme.colors.textTertiary : theme.colors.text, textDecorationLine: isDone ? 'line-through' : 'none' }]} numberOfLines={2}>
          {task.title}
        </Text>
        <Text style={[styles.obj, { color: theme.colors.textSecondary }]} numberOfLines={1}>{task.learning_objective}</Text>
      </View>
      <Ionicons name="chevron-forward" size={18} color={theme.colors.textTertiary} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    gap: spacing.md,
    marginBottom: spacing.sm,
  },
  check: {
    width: 26, height: 26, borderRadius: 13,
    borderWidth: 2, alignItems: 'center', justifyContent: 'center',
  },
  row: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 },
  badge: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 8, paddingVertical: 3, borderRadius: radius.pill },
  badgeText: { fontSize: 11, fontWeight: '600' },
  mins: { fontSize: 12 },
  title: { fontSize: 15, fontWeight: '600', marginBottom: 2 },
  obj: { fontSize: 12 },
});
