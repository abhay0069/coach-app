import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/hooks/useTheme';
import { Screen } from '@/components/Screen';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { ProgressRing } from '@/components/ProgressRing';
import { spacing, typography, radius } from '@/theme';
import { useAppStore } from '@/store/useAppStore';
import { useLocalSearchParams, useRouter } from 'expo-router';

export default function QuizResults() {
  const theme = useTheme();
  const router = useRouter();
  const { quizId } = useLocalSearchParams<{ quizId: string }>();
  const quiz = useAppStore((s) => s.quizzes.find((q) => q.id === quizId));
  const dueRevisions = useAppStore((s) => s.dueRevisions);

  if (!quiz) {
    return <Screen><Text style={{ color: theme.colors.text }}>Results not found.</Text></Screen>;
  }

  const score = quiz.score || 0;
  const weak = quiz.weak_topics || [];
  const message = score >= 80 ? 'Outstanding! You really nailed today\'s material.' :
                  score >= 60 ? 'Solid effort! A few topics need a revisit.' :
                  'Keep going — these topics need a little more attention.';

  return (
    <Screen>
      <ScrollView contentContainerStyle={{ paddingBottom: spacing.xxl }}>
        <Card style={[styles.scoreCard, { backgroundColor: score >= 60 ? theme.colors.success + '15' : theme.colors.warning + '15' }]}>
          <ProgressRing size={140} progress={score / 100} label={`${score}%`} sublabel="Score" color={score >= 60 ? theme.colors.success : theme.colors.warning} />
          <Text style={[typography.h3, { color: theme.colors.text, marginTop: spacing.md, textAlign: 'center' }]}>{message}</Text>
        </Card>

        {weak.length > 0 && (
          <Card style={{ marginTop: spacing.md }}>
            <Text style={[typography.h4, { color: theme.colors.text, marginBottom: spacing.sm }]}>
              <Ionicons name="warning-outline" size={16} color={theme.colors.warning} /> Topics to review
            </Text>
            {weak.map((w, i) => (
              <View key={i} style={[styles.weakRow, { backgroundColor: theme.colors.surfaceAlt }]}>
                <Ionicons name="refresh" size={16} color={theme.colors.warning} />
                <Text style={{ color: theme.colors.text, marginLeft: spacing.sm, flex: 1 }}>{w}</Text>
              </View>
            ))}
            <Text style={{ color: theme.colors.textSecondary, fontSize: 12, marginTop: spacing.sm }}>
              We've scheduled these in your revision queue with spaced repetition.
            </Text>
          </Card>
        )}

        <Text style={[typography.h4, { color: theme.colors.text, marginTop: spacing.lg, marginBottom: spacing.sm }]}>Question Review</Text>
        {quiz.questions.map((q) => {
          const userAns = quiz.user_answers?.[q.id] || '';
          const isCorrect = (userAns || '').trim().toLowerCase() === q.correct_answer.trim().toLowerCase()
            || (q.type === 'short_answer' && q.correct_answer.toLowerCase().includes((userAns || '').trim().toLowerCase()) && (userAns || '').length > 3);
          return (
            <Card key={q.id} style={{ marginBottom: spacing.sm }}>
              <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: spacing.sm }}>
                <Ionicons
                  name={isCorrect ? 'checkmark-circle' : 'close-circle'}
                  size={20}
                  color={isCorrect ? theme.colors.success : theme.colors.danger}
                  style={{ marginTop: 2 }}
                />
                <View style={{ flex: 1 }}>
                  <Text style={{ color: theme.colors.text, fontWeight: '600' }}>{q.question}</Text>
                  {!isCorrect && (
                    <Text style={{ color: theme.colors.danger, marginTop: 6, fontSize: 13 }}>
                      Your answer: {userAns || '(no answer)'}
                    </Text>
                  )}
                  <Text style={{ color: theme.colors.success, marginTop: isCorrect ? 6 : 2, fontSize: 13 }}>
                    Correct: {q.correct_answer}
                  </Text>
                  <Text style={{ color: theme.colors.textSecondary, marginTop: spacing.sm, fontSize: 13, lineHeight: 18 }}>
                    {q.explanation}
                  </Text>
                </View>
              </View>
            </Card>
          );
        })}
      </ScrollView>
      <View style={[styles.footer, { borderTopColor: theme.colors.border }]}>
        <Button title="Back to Today" onPress={() => router.replace('/(tabs)/today' as any)} variant="secondary" style={{ flex: 1 }} />
        {weak.length > 0 && <Button title="Review Weak Topics" onPress={() => router.replace('/(tabs)/revision' as any)} style={{ flex: 1 }} />}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  scoreCard: { alignItems: 'center', padding: spacing.xl, borderRadius: radius.xl },
  weakRow: { flexDirection: 'row', alignItems: 'center', padding: spacing.sm, borderRadius: radius.md, marginTop: spacing.xs },
  footer: { flexDirection: 'row', gap: spacing.sm, padding: spacing.md, borderTopWidth: StyleSheet.hairlineWidth },
});
