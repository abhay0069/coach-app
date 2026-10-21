import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Pressable, TextInput, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/hooks/useTheme';
import { Screen } from '@/components/Screen';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { ProgressRing } from '@/components/ProgressRing';
import { spacing, typography, radius } from '@/theme';
import { useAppStore } from '@/store/useAppStore';
import { useRouter } from 'expo-router';

export default function QuizScreen() {
  const theme = useTheme();
  const router = useRouter();
  const getTodayQuiz = useAppStore((s) => s.getTodayQuiz);
  const startQuiz = useAppStore((s) => s.startQuiz);
  const submitQuiz = useAppStore((s) => s.submitQuiz);
  const [quiz, setQuiz] = useState(getTodayQuiz());
  const [idx, setIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(!quiz);

  useEffect(() => {
    if (!quiz) {
      startQuiz().then((q) => { setQuiz(q); setLoading(false); });
    } else {
      setAnswers(quiz.user_answers || {});
    }
  }, []);

  if (loading || !quiz) {
    return <Screen><Text style={{ color: theme.colors.text }}>Loading quiz...</Text></Screen>;
  }

  if (quiz.completed) {
    router.replace('/quiz-results' as any);
    return null;
  }

  const q = quiz.questions[idx];
  const answered = Object.keys(answers).length;
  const progress = (idx + 1) / quiz.questions.length;

  const select = (choice: string) => {
    setAnswers({ ...answers, [q.id]: choice });
  };

  const next = () => {
    if (idx < quiz.questions.length - 1) setIdx(idx + 1);
    else submit();
  };

  const submit = async () => {
    setSubmitting(true);
    try {
      const result = await submitQuiz(quiz.id, answers);
      router.replace({ pathname: '/quiz-results', params: { quizId: quiz.id } } as any);
    } finally { setSubmitting(false); }
  };

  const currentAnswer = answers[q.id] || '';

  return (
    <Screen>
      <View style={styles.topBar}>
        <Pressable onPress={() => router.back()} style={{ padding: 8 }}>
          <Ionicons name="close" size={24} color={theme.colors.text} />
        </Pressable>
        <View style={styles.progressRow}>
          <View style={[styles.progressTrack, { backgroundColor: theme.colors.progressBg }]}>
            <View style={[styles.progressFill, { backgroundColor: theme.colors.primary, width: `${progress * 100}%` }]} />
          </View>
          <Text style={{ color: theme.colors.textSecondary, fontSize: 12, fontWeight: '600' }}>{idx + 1}/{quiz.questions.length}</Text>
        </View>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: spacing.xxl }}>
        <Card>
          <Text style={[styles.qType, { color: theme.colors.accent }]}>
            {q.type === 'multiple_choice' ? 'MULTIPLE CHOICE' : q.type === 'true_false' ? 'TRUE / FALSE' : 'SHORT ANSWER'}
          </Text>
          <Text style={[typography.h3, { color: theme.colors.text, marginTop: spacing.sm }]}>{q.question}</Text>
        </Card>

        <View style={{ height: spacing.md }} />

        {q.type === 'multiple_choice' && q.options && (
          <View style={{ gap: spacing.sm }}>
            {q.options.map((opt) => {
              const selected = currentAnswer === opt;
              return (
                <Pressable key={opt} onPress={() => select(opt)} style={[
                  styles.option,
                  {
                    backgroundColor: selected ? theme.colors.primary : theme.colors.surface,
                    borderColor: selected ? theme.colors.primary : theme.colors.border,
                  },
                ]}>
                  <Text style={{ color: selected ? '#fff' : theme.colors.text, fontSize: 15, fontWeight: '500' }}>{opt}</Text>
                </Pressable>
              );
            })}
          </View>
        )}

        {q.type === 'true_false' && (
          <View style={{ flexDirection: 'row', gap: spacing.sm }}>
            {['True', 'False'].map((opt) => {
              const selected = currentAnswer.toLowerCase() === opt.toLowerCase();
              return (
                <Pressable key={opt} onPress={() => select(opt)} style={[
                  styles.option, { flex: 1,
                    backgroundColor: selected ? theme.colors.primary : theme.colors.surface,
                    borderColor: selected ? theme.colors.primary : theme.colors.border,
                  },
                ]}>
                  <Text style={{ color: selected ? '#fff' : theme.colors.text, fontSize: 16, fontWeight: '700' }}>{opt}</Text>
                </Pressable>
              );
            })}
          </View>
        )}

        {(q.type === 'short_answer' || q.type === 'scenario' || q.type === 'code') && (
          <Card>
            <Text style={{ color: theme.colors.textSecondary, marginBottom: spacing.sm }}>Your answer:</Text>
            <TextInput
              value={currentAnswer}
              onChangeText={(t) => setAnswers({ ...answers, [q.id]: t })}
              placeholder="Type your answer..."
              placeholderTextColor={theme.colors.textTertiary}
              multiline
              style={[{
                color: theme.colors.text, fontSize: 15,
                minHeight: 100, textAlignVertical: 'top',
                backgroundColor: theme.colors.surfaceAlt, borderRadius: radius.md, padding: spacing.md,
              }]}
            />
          </Card>
        )}
      </ScrollView>

      <View style={[styles.footer, { borderTopColor: theme.colors.border }]}>
        <Button
          title={idx === quiz.questions.length - 1 ? 'Submit Quiz' : 'Next Question'}
          onPress={next}
          loading={submitting}
          disabled={!currentAnswer.trim()}
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  topBar: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.md },
  progressRow: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  progressTrack: { flex: 1, height: 6, borderRadius: 3, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 3 },
  qType: { fontSize: 11, fontWeight: '700', letterSpacing: 1 },
  option: { padding: spacing.md, borderRadius: radius.lg, borderWidth: 1 },
  footer: { padding: spacing.md, borderTopWidth: StyleSheet.hairlineWidth },
});
