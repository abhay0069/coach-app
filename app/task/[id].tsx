import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/hooks/useTheme';
import { Screen } from '@/components/Screen';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { spacing, typography, radius } from '@/theme';
import { useAppStore } from '@/store/useAppStore';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { format } from 'date-fns';

export default function TaskDetail() {
  const theme = useTheme();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const task = useAppStore((s) => s.getTask(id));
  const markComplete = useAppStore((s) => s.markTaskComplete);
  const updateTask = useAppStore((s) => s.updateTask);
  const reschedule = useAppStore((s) => s.rescheduleTask);
  const startQuiz = useAppStore((s) => s.startQuiz);
  const [notes, setNotes] = useState(task?.user_notes || '');

  if (!task) {
    return (
      <Screen><Text style={{ color: theme.colors.text }}>Task not found</Text></Screen>
    );
  }

  const isDone = task.status === 'completed';

  const onComplete = async () => {
    await markComplete(task.id, notes);
    if (task.type === 'quiz') {
      router.replace('/quiz' as any);
    } else {
      Alert.alert('Nice work! 🎉', 'Task marked complete. Keep the momentum going.');
    }
  };

  const onStartQuiz = async () => {
    await startQuiz(task.id);
    router.push('/quiz' as any);
  };

  const onSnooze = () => {
    const tomorrow = format(new Date(Date.now() + 24 * 3600 * 1000), 'yyyy-MM-dd');
    reschedule(task.id, tomorrow);
    Alert.alert('Rescheduled', 'Task moved to tomorrow.');
    router.back();
  };

  const typeColors: Record<string, string> = {
    lesson: theme.colors.primary, exercise: theme.colors.warning, quiz: theme.colors.accent,
    mini_project: theme.colors.success, revision: theme.colors.primaryLight, assessment: theme.colors.success,
  };
  const accent = typeColors[task.type] || theme.colors.primary;

  return (
    <Screen>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={[styles.typeBadge, { backgroundColor: accent + '22' }]}>
          <Ionicons name={
            task.type === 'quiz' ? 'help-circle' :
            task.type === 'exercise' ? 'hammer' :
            task.type === 'mini_project' ? 'rocket' :
            task.type === 'revision' ? 'refresh' : 'book'
          } size={14} color={accent} />
          <Text style={[styles.typeText, { color: accent }]}>{task.type.replace('_', ' ').toUpperCase()}</Text>
        </View>
        <Text style={[typography.h1, { color: theme.colors.text, marginVertical: spacing.sm }]}>{task.title}</Text>
        <Text style={{ color: theme.colors.textSecondary, fontSize: 15, lineHeight: 22 }}>{task.description}</Text>

        <View style={styles.metaRow}>
          <Meta icon="time-outline" label={`${task.estimated_minutes} minutes`} />
          <Meta icon="calendar-outline" label={task.date_scheduled} />
          <Meta icon={isDone ? 'checkmark-circle' : 'ellipse-outline'} label={isDone ? 'Completed' : 'In progress'} />
        </View>

        <Card style={{ marginTop: spacing.lg }}>
          <Text style={[typography.h4, { color: theme.colors.text, marginBottom: spacing.sm }]}>Learning Objective</Text>
          <Text style={{ color: theme.colors.text, lineHeight: 22 }}>{task.learning_objective}</Text>
        </Card>

        <Card style={{ marginTop: spacing.md }}>
          <Text style={[typography.h4, { color: theme.colors.text, marginBottom: spacing.sm }]}>Instructions</Text>
          <Text style={{ color: theme.colors.text, lineHeight: 22 }}>{task.instructions}</Text>
        </Card>

        <Card style={{ marginTop: spacing.md }}>
          <Text style={[typography.h4, { color: theme.colors.text, marginBottom: spacing.sm }]}>Completion Criteria</Text>
          <Text style={{ color: theme.colors.text, lineHeight: 22 }}>{task.completion_criteria}</Text>
        </Card>

        {task.resource && (
          <Card style={{ marginTop: spacing.md }}>
            <Text style={[typography.h4, { color: theme.colors.text, marginBottom: spacing.sm }]}>Resource</Text>
            <Text style={{ color: theme.colors.primary }}>{task.resource.label || task.resource.value}</Text>
          </Card>
        )}

        <Card style={{ marginTop: spacing.md }}>
          <Text style={[typography.h4, { color: theme.colors.text, marginBottom: spacing.sm }]}>Your Notes</Text>
          <TextInput
            value={notes}
            onChangeText={setNotes}
            placeholder="Jot down notes, answers, or takeaways..."
            placeholderTextColor={theme.colors.textTertiary}
            multiline
            style={[
              styles.notesInput,
              { color: theme.colors.text, backgroundColor: theme.colors.surfaceAlt, borderRadius: radius.md },
            ]}
          />
        </Card>

        <View style={{ height: spacing.xxl }} />
      </ScrollView>
      <View style={[styles.footer, { borderTopColor: theme.colors.border, backgroundColor: theme.colors.background }]}>
        <Button title="Reschedule" variant="secondary" onPress={onSnooze} style={{ flex: 1 }} />
        {task.type === 'quiz' ? (
          <Button title="Take Quiz" onPress={onStartQuiz} style={{ flex: 2 }} />
        ) : (
          <Button title={isDone ? 'Completed ✓' : 'Mark Complete'} onPress={onComplete} disabled={isDone} style={{ flex: 2 }} />
        )}
      </View>
    </Screen>
  );
}

function Meta({ icon, label }: { icon: any; label: string }) {
  const theme = useTheme();
  return (
    <View style={styles.meta}>
      <Ionicons name={icon} size={14} color={theme.colors.textTertiary} />
      <Text style={{ color: theme.colors.textSecondary, fontSize: 12, marginLeft: 4 }}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  typeBadge: { flexDirection: 'row', alignSelf: 'flex-start', alignItems: 'center', gap: 6, paddingHorizontal: 10, paddingVertical: 5, borderRadius: radius.pill },
  typeText: { fontSize: 11, fontWeight: '700', letterSpacing: 0.5 },
  metaRow: { flexDirection: 'row', gap: spacing.md, marginTop: spacing.md, flexWrap: 'wrap' },
  meta: { flexDirection: 'row', alignItems: 'center' },
  notesInput: { minHeight: 100, padding: spacing.md, textAlignVertical: 'top', fontSize: 15 },
  footer: { flexDirection: 'row', gap: spacing.sm, padding: spacing.md, borderTopWidth: StyleSheet.hairlineWidth },
});
