import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, ScrollView, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/hooks/useTheme';
import { Button } from '@/components/Button';
import { spacing, typography, radius } from '@/theme';
import { useRouter } from 'expo-router';
import { useAppStore } from '@/store/useAppStore';

type InputType = 'manual' | 'url' | 'syllabus' | 'youtube';

export default function OnboardingCourse() {
  const theme = useTheme();
  const router = useRouter();
  const onboarding = useAppStore((s) => s.onboarding);
  const setOnboarding = useAppStore((s) => s.setOnboardingData);
  const [type, setType] = useState<InputType>(onboarding.courseInputType || 'manual');
  const [name, setName] = useState(onboarding.courseName || '');
  const [url, setUrl] = useState(onboarding.courseUrl || '');
  const [syllabus, setSyllabus] = useState(onboarding.courseSyllabus || '');

  const types: { id: InputType; icon: any; label: string; hint: string }[] = [
    { id: 'manual', icon: 'create-outline', label: 'Manual', hint: 'Enter a course name' },
    { id: 'url', icon: 'link-outline', label: 'URL', hint: 'Course page URL' },
    { id: 'youtube', icon: 'logo-youtube', label: 'YouTube', hint: 'Playlist URL' },
    { id: 'syllabus', icon: 'document-text-outline', label: 'Syllabus', hint: 'Paste outline' },
  ];

  const next = async () => {
    await setOnboarding({ courseName: name || (onboarding.skill || 'Course'), courseInputType: type, courseUrl: url, courseSyllabus: syllabus });
    router.push('/(onboarding)/level' as any);
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView contentContainerStyle={{ padding: spacing.lg, paddingTop: spacing.xxl }}>
        <Text style={[styles.step, { color: theme.colors.primary }]}>Step 2 of 7</Text>
        <Text style={[typography.h1, { color: theme.colors.text }]}>Which course are you following?</Text>
        <Text style={{ color: theme.colors.textSecondary, marginTop: spacing.sm, marginBottom: spacing.lg }}>
          SkillPilot analyzes what you share and builds your plan. We only use content you can access.
        </Text>

        <View style={styles.typeGrid}>
          {types.map((t) => (
            <Pressable key={t.id} onPress={() => setType(t.id)} style={[
              styles.typeCard,
              {
                backgroundColor: type === t.id ? theme.colors.primary : theme.colors.surface,
                borderColor: type === t.id ? theme.colors.primary : theme.colors.border,
              },
            ]}>
              <Ionicons name={t.icon} size={22} color={type === t.id ? '#fff' : theme.colors.text} />
              <Text style={{ color: type === t.id ? '#fff' : theme.colors.text, fontWeight: '700', marginTop: 6 }}>{t.label}</Text>
              <Text style={{ color: type === t.id ? '#ffffffcc' : theme.colors.textSecondary, fontSize: 11, textAlign: 'center' }}>{t.hint}</Text>
            </Pressable>
          ))}
        </View>

        <TextInput
          value={name}
          onChangeText={setName}
          placeholder="Course name (e.g. 'Complete Python Bootcamp')"
          placeholderTextColor={theme.colors.textTertiary}
          style={[styles.input, { color: theme.colors.text, backgroundColor: theme.colors.surface, borderColor: theme.colors.border, marginTop: spacing.lg }]}
        />

        {type === 'url' || type === 'youtube' ? (
          <TextInput
            value={url}
            onChangeText={setUrl}
            placeholder={type === 'youtube' ? 'Paste YouTube playlist URL' : 'Paste course URL'}
            placeholderTextColor={theme.colors.textTertiary}
            style={[styles.input, { color: theme.colors.text, backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}
            autoCapitalize="none"
          />
        ) : null}

        {type === 'syllabus' ? (
          <TextInput
            value={syllabus}
            onChangeText={setSyllabus}
            placeholder="Paste the syllabus / lesson list here..."
            placeholderTextColor={theme.colors.textTertiary}
            multiline
            style={[styles.input, styles.textarea, { color: theme.colors.text, backgroundColor: theme.colors.surface, borderColor: theme.colors.border, height: 160, textAlignVertical: 'top' }]}
          />
        ) : null}

        <Text style={{ color: theme.colors.textTertiary, fontSize: 12, marginTop: spacing.sm }}>
          Note: If a URL cannot be read we'll fall back to a knowledge-based plan — you can edit lessons anytime.
        </Text>
      </ScrollView>
      <View style={styles.footer}>
        <Button title="Continue" onPress={next} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  step: { fontSize: 13, fontWeight: '700', marginBottom: spacing.sm },
  typeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  typeCard: { width: '48%', padding: spacing.md, borderRadius: radius.lg, borderWidth: 1, alignItems: 'center' },
  input: { borderWidth: 1, borderRadius: radius.md, paddingHorizontal: 14, paddingVertical: 12, fontSize: 15, marginBottom: spacing.md },
  textarea: { paddingTop: 14 },
  footer: { padding: spacing.lg, paddingBottom: spacing.xl },
});
