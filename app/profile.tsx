import React from 'react';
import { View, Text, StyleSheet, Pressable, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/hooks/useTheme';
import { Screen } from '@/components/Screen';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { spacing, typography, radius } from '@/theme';
import { useAppStore } from '@/store/useAppStore';
import { useRouter } from 'expo-router';

export default function ProfileScreen() {
  const theme = useTheme();
  const router = useRouter();
  const user = useAppStore((s) => s.user);
  const courses = useAppStore((s) => s.courses);
  const darkMode = useAppStore((s) => s.darkMode);
  const setDarkMode = useAppStore((s) => s.setDarkMode);
  const signOut = useAppStore((s) => s.signOut);
  const tasks = useAppStore((s) => s.tasks);

  return (
    <Screen scroll>
      <View style={styles.header}>
        <View style={[styles.avatar, { backgroundColor: theme.colors.primary }]}>
          <Text style={{ color: '#fff', fontSize: 24, fontWeight: '800' }}>{(user?.name || user?.email || '?')[0].toUpperCase()}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={[typography.h3, { color: theme.colors.text }]}>{user?.name || 'Learner'}</Text>
          <Text style={{ color: theme.colors.textSecondary }}>{user?.email}</Text>
        </View>
      </View>

      <Text style={sectionLabel(theme)}>Account</Text>
      <Card>
        <Row icon="person-outline" label="Edit profile" onPress={() => Alert.alert('Coming soon', 'Profile editing will be available in the next update.')} />
        <Divider />
        <Row icon="moon-outline" label="Dark mode" right={
          <Pressable onPress={() => setDarkMode(!darkMode)} style={[styles.toggle, { backgroundColor: darkMode ? theme.colors.primary : theme.colors.surfaceAlt }]}>
            <View style={[styles.thumb, { marginLeft: darkMode ? 22 : 2, backgroundColor: '#fff' }]} />
          </Pressable>
        } />
        <Divider />
        <Row icon="notifications-outline" label="Notifications" onPress={() => router.push('/notifications' as any)} />
        <Divider />
        <Row icon="calendar-outline" label="Learning calendar" onPress={() => router.push('/calendar' as any)} />
      </Card>

      <Text style={sectionLabel(theme)}>Your learning</Text>
      <Card>
        <Row icon="book-outline" label="Active courses" value={String(courses.length)} />
        <Divider />
        <Row icon="checkmark-done-outline" label="Tasks completed" value={String(tasks.filter((t) => t.status === 'completed').length)} />
        <Divider />
        <Row icon="add-circle-outline" label="Start a new course" onPress={() => Alert.alert('Premium feature', 'Multiple courses will be available with SkillPilot Premium.')} />
      </Card>

      <Text style={sectionLabel(theme)}>About</Text>
      <Card>
        <Row icon="information-circle-outline" label="SkillPilot AI v1.0" />
        <Divider />
        <Row icon="star-outline" label="Upgrade to Premium" onPress={() => Alert.alert('Premium', 'Premium plans are coming soon — multiple courses, advanced analytics and deeper AI tutoring.')} />
        <Divider />
        <Row icon="mail-outline" label="Contact support" onPress={() => Alert.alert('Contact', 'Email support@skillpilot.ai')} />
      </Card>

      <Button title="Sign Out" variant="danger" onPress={() => {
        Alert.alert('Sign out', 'Are you sure you want to sign out?', [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Sign out', style: 'destructive', onPress: async () => { await signOut(); router.replace('/(auth)/welcome' as any); } },
        ]);
      }} style={{ marginTop: spacing.xl }} />
      <View style={{ height: spacing.xxl }} />
    </Screen>
  );
}

function sectionLabel(theme: any) {
  return { fontSize: 12, fontWeight: '700' as const, letterSpacing: 1, textTransform: 'uppercase' as const, color: theme.colors.textSecondary, marginTop: spacing.lg, marginBottom: spacing.sm };
}

function Row({ icon, label, value, right, onPress }: { icon: any; label: string; value?: string; right?: React.ReactNode; onPress?: () => void }) {
  const theme = useTheme();
  return (
    <Pressable onPress={onPress} style={styles.row} disabled={!onPress}>
      <Ionicons name={icon} size={20} color={theme.colors.textSecondary} />
      <Text style={{ color: theme.colors.text, flex: 1, marginLeft: spacing.sm, fontSize: 15 }}>{label}</Text>
      {value && <Text style={{ color: theme.colors.textTertiary, fontSize: 14 }}>{value}</Text>}
      {right}
      {onPress && <Ionicons name="chevron-forward" size={16} color={theme.colors.textTertiary} style={{ marginLeft: 6 }} />}
    </Pressable>
  );
}

function Divider() {
  const theme = useTheme();
  return <View style={{ height: StyleSheet.hairlineWidth, backgroundColor: theme.colors.border, marginLeft: 32 }} />;
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, marginBottom: spacing.lg },
  avatar: { width: 64, height: 64, borderRadius: 32, alignItems: 'center', justifyContent: 'center' },
  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: spacing.md },
  toggle: { width: 46, height: 26, borderRadius: 13, padding: 2 },
  thumb: { width: 22, height: 22, borderRadius: 11 },
});
