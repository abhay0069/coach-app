import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, Pressable, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/hooks/useTheme';
import { Screen } from '@/components/Screen';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { EmptyState } from '@/components/EmptyState';
import { spacing, typography, radius } from '@/theme';
import { useAppStore } from '@/store/useAppStore';
import { RevisionItem } from '@/types';
import { format, parseISO, differenceInDays } from 'date-fns';

export default function RevisionScreen() {
  const theme = useTheme();
  const due = useAppStore((s) => s.dueRevisions());
  const allRevs = useAppStore((s) => s.revisions);
  const activeCourseId = useAppStore((s) => s.activeCourseId);
  const complete = useAppStore((s) => s.completeRevision);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [showAnswer, setShowAnswer] = useState(false);

  const active = due.find((r) => r.id === activeId) || due[0];
  const upcoming = allRevs.filter((r) => r.course_id === activeCourseId && r.next_review_date > format(new Date(), 'yyyy-MM-dd'))
    .sort((a, b) => a.next_review_date.localeCompare(b.next_review_date));

  const rate = async (perf: number) => {
    if (!active) return;
    await complete(active.id, perf);
    setShowAnswer(false);
    setActiveId(null);
  };

  if (!active && due.length === 0) {
    return (
      <Screen>
        <Text style={[typography.h2, { color: theme.colors.text }]}>Revision</Text>
        <Text style={{ color: theme.colors.textSecondary, marginBottom: spacing.lg }}>Spaced repetition keeps knowledge in long-term memory.</Text>
        <EmptyState
          icon="checkmark-done-circle-outline"
          title="All caught up!"
          description="No revisions due today. Take more quizzes to generate flashcards here, or come back tomorrow."
        />
        {upcoming.length > 0 && (
          <Card style={{ marginTop: spacing.lg }}>
            <Text style={[typography.h4, { color: theme.colors.text, marginBottom: spacing.sm }]}>Upcoming reviews</Text>
            {upcoming.slice(0, 10).map((r) => (
              <View key={r.id} style={[styles.upcomingRow, { borderBottomColor: theme.colors.border }]}>
                <Ionicons name="time-outline" size={14} color={theme.colors.textTertiary} />
                <Text style={{ color: theme.colors.text, flex: 1, marginLeft: 6 }}>{r.topic}</Text>
                <Text style={{ color: theme.colors.textTertiary, fontSize: 12 }}>{format(parseISO(r.next_review_date), 'MMM d')}</Text>
              </View>
            ))}
          </Card>
        )}
      </Screen>
    );
  }

  return (
    <Screen>
      <Text style={[typography.h2, { color: theme.colors.text }]}>Revision</Text>
      <Text style={{ color: theme.colors.textSecondary, marginBottom: spacing.md }}>
        {due.length} topic{due.length !== 1 ? 's' : ''} due • Answer from memory, then rate how well you did.
      </Text>

      <Card style={[styles.flashcard, { backgroundColor: theme.colors.primary + '12', borderColor: theme.colors.primary + '44' }]}>
        <Text style={{ color: theme.colors.textSecondary, fontSize: 12, fontWeight: '700', letterSpacing: 1 }}>TOPIC</Text>
        <Text style={[typography.h3, { color: theme.colors.text, marginTop: spacing.sm, textAlign: 'center' }]}>{active.topic}</Text>
        <Text style={{ color: theme.colors.textSecondary, marginTop: spacing.md, textAlign: 'center' }}>
          Recall everything you can about this concept. When you're ready, reveal.
        </Text>
        {showAnswer ? (
          <View style={{ marginTop: spacing.lg }}>
            <Text style={{ color: theme.colors.textSecondary, fontSize: 12, fontWeight: '700' }}>How well did you remember?</Text>
            <View style={styles.rateRow}>
              <RateBtn label="Again" color={theme.colors.danger} onPress={() => rate(1)} />
              <RateBtn label="Hard" color={theme.colors.warning} onPress={() => rate(3)} />
              <RateBtn label="Good" color={theme.colors.success} onPress={() => rate(4)} />
              <RateBtn label="Easy" color={theme.colors.primary} onPress={() => rate(5)} />
            </View>
          </View>
        ) : (
          <Button title="Show Answer" onPress={() => setShowAnswer(true)} style={{ marginTop: spacing.xl }} />
        )}
      </Card>

      <Card style={{ marginTop: spacing.md }}>
        <Text style={[typography.h4, { color: theme.colors.text, marginBottom: spacing.sm }]}>Other topics due</Text>
        {due.filter((r) => r.id !== active?.id).map((r) => (
          <Pressable key={r.id} onPress={() => { setActiveId(r.id); setShowAnswer(false); }} style={[styles.dueRow, { backgroundColor: theme.colors.surfaceAlt }]}>
            <Ionicons name="alert-circle" size={16} color={theme.colors.warning} />
            <Text style={{ color: theme.colors.text, flex: 1, marginLeft: 8 }}>{r.topic}</Text>
            <Text style={{ color: theme.colors.textTertiary, fontSize: 12 }}>
              {differenceInDays(new Date(), parseISO(r.next_review_date)) > 0
                ? `${differenceInDays(new Date(), parseISO(r.next_review_date))}d overdue`
                : 'Today'}
            </Text>
          </Pressable>
        ))}
        {due.filter((r) => r.id !== active?.id).length === 0 && (
          <Text style={{ color: theme.colors.textTertiary, fontSize: 13 }}>That's all for now.</Text>
        )}
      </Card>
    </Screen>
  );
}

function RateBtn({ label, color, onPress }: { label: string; color: string; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={[styles.rateBtn, { backgroundColor: color }]}>
      <Text style={{ color: '#fff', fontWeight: '700' }}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  flashcard: { padding: spacing.xl, borderRadius: radius.xl, borderWidth: 1, alignItems: 'center', minHeight: 280, justifyContent: 'center' },
  rateRow: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.md },
  rateBtn: { flex: 1, paddingVertical: 12, borderRadius: radius.md, alignItems: 'center' },
  dueRow: { flexDirection: 'row', alignItems: 'center', padding: spacing.sm, borderRadius: radius.md, marginBottom: spacing.xs },
  upcomingRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: spacing.sm, borderBottomWidth: StyleSheet.hairlineWidth },
});
