import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Switch, Pressable, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/hooks/useTheme';
import { Screen } from '@/components/Screen';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { spacing, radius } from '@/theme';
import { useAppStore } from '@/store/useAppStore';
import { areNotificationsEnabled, requestNotificationPermissions, scheduleDailyReminders } from '@/services/notifications';

const TIMES = ['06:00', '07:00', '08:00', '09:00', '12:00', '17:00', '18:00', '19:00', '20:00', '21:00'];

export default function NotificationsScreen() {
  const theme = useTheme();
  const settings = useAppStore((s) => s.notifSettings);
  const update = useAppStore((s) => s.updateNotifSettings);
  const [sysEnabled, setSysEnabled] = useState(true);

  useEffect(() => {
    areNotificationsEnabled().then(setSysEnabled);
  }, []);

  const toggle = async (key: keyof typeof settings) => {
    await update({ [key]: !(settings as any)[key] });
  };

  const pickTime = async (key: 'morningTime' | 'studyReminderTime' | 'eveningQuizTime') => {
    Alert.alert(
      'Pick time',
      'Choose a reminder time',
      TIMES.map((t) => ({
        text: t,
        onPress: () => update({ [key]: t } as any),
      })).concat([{ text: 'Cancel', onPress: () => {}, style: 'cancel' } as any]),
    );
  };

  const enable = async () => {
    const ok = await requestNotificationPermissions();
    setSysEnabled(ok);
    if (ok) {
      await update({ enabled: true });
      await scheduleDailyReminders({ ...settings, enabled: true });
    } else {
      Alert.alert('Notifications blocked', 'You can enable them in Android Settings. In-app reminders will still appear when you open SkillPilot.');
    }
  };

  return (
    <Screen scroll>
      {!sysEnabled && (
        <Card style={[styles.banner, { backgroundColor: theme.colors.warning + '22', borderColor: theme.colors.warning + '55' }]}>
          <Ionicons name="notifications-off-outline" size={20} color={theme.colors.warning} />
          <View style={{ flex: 1, marginLeft: spacing.sm }}>
            <Text style={{ color: theme.colors.text, fontWeight: '700' }}>System notifications disabled</Text>
            <Text style={{ color: theme.colors.textSecondary, fontSize: 12 }}>Enable them to receive reminders on your lock screen.</Text>
          </View>
          <Button title="Enable" onPress={enable} />
        </Card>
      )}

      <Card style={{ marginTop: spacing.md }}>
        <SwitchRow label="Enable all reminders" value={settings.enabled} onValueChange={() => toggle('enabled')} />
      </Card>

      <Text style={[styles.sectionLabel, { color: theme.colors.textSecondary }]}>Reminders</Text>
      <Card>
        <SwitchRow
          label="Morning plan"
          value={settings.morningReminder}
          onValueChange={() => toggle('morningReminder')}
          right={<TimePill time={settings.morningTime} onPress={() => pickTime('morningTime')} />}
        />
        <Divider />
        <SwitchRow
          label="Time to study"
          value={settings.studyReminder}
          onValueChange={() => toggle('studyReminder')}
          right={<TimePill time={settings.studyReminderTime} onPress={() => pickTime('studyReminderTime')} />}
        />
        <Divider />
        <SwitchRow
          label="Evening quiz"
          value={settings.eveningQuiz}
          onValueChange={() => toggle('eveningQuiz')}
          right={<TimePill time={settings.eveningQuizTime} onPress={() => pickTime('eveningQuizTime')} />}
        />
        <Divider />
        <SwitchRow label="Weekly progress recap" value={settings.weeklyProgress} onValueChange={() => toggle('weeklyProgress')} />
      </Card>

      <Text style={[styles.sectionLabel, { color: theme.colors.textSecondary }]}>Quiet hours</Text>
      <Card>
        <View style={styles.row}>
          <Text style={{ color: theme.colors.text, flex: 1 }}>Start</Text>
          <TimePill time={settings.quietHoursStart || 'Not set'} onPress={() => {
            Alert.alert('Start quiet hours', 'Pick a time',
              TIMES.concat(['22:00', '23:00']).map((t) => ({ text: t, onPress: () => update({ quietHoursStart: t }) }))
                .concat([{ text: 'Cancel', style: 'cancel', onPress: () => {} } as any]));
          }} />
        </View>
        <Divider />
        <View style={styles.row}>
          <Text style={{ color: theme.colors.text, flex: 1 }}>End</Text>
          <TimePill time={settings.quietHoursEnd || 'Not set'} onPress={() => {
            Alert.alert('End quiet hours', 'Pick a time',
              ['06:00', '07:00', '08:00', '09:00'].map((t) => ({ text: t, onPress: () => update({ quietHoursEnd: t }) }))
                .concat([{ text: 'Cancel', style: 'cancel', onPress: () => {} } as any]));
          }} />
        </View>
      </Card>

      <Text style={[styles.sectionLabel, { color: theme.colors.textSecondary }]}>Snooze</Text>
      <Card>
        <View style={styles.row}>
          <Text style={{ color: theme.colors.text, flex: 1 }}>Snooze length</Text>
          {[10, 15, 30].map((m) => (
            <Pressable key={m} onPress={() => update({ snoozeMinutes: m })} style={[
              styles.snooze,
              { backgroundColor: settings.snoozeMinutes === m ? theme.colors.primary : theme.colors.surfaceAlt },
            ]}>
              <Text style={{ color: settings.snoozeMinutes === m ? '#fff' : theme.colors.text, fontWeight: '700' }}>{m}m</Text>
            </Pressable>
          ))}
        </View>
      </Card>

      <View style={{ height: spacing.xl }} />
    </Screen>
  );
}

function SwitchRow({ label, value, onValueChange, right }: { label: string; value: boolean; onValueChange: () => void; right?: React.ReactNode }) {
  const theme = useTheme();
  return (
    <View style={styles.switchRow}>
      <Text style={{ color: theme.colors.text, flex: 1, fontSize: 15 }}>{label}</Text>
      {right}
      <Switch value={value} onValueChange={onValueChange} trackColor={{ true: theme.colors.primary, false: theme.colors.borderAlt }} thumbColor="#fff" />
    </View>
  );
}

function TimePill({ time, onPress }: { time: string; onPress: () => void }) {
  const theme = useTheme();
  return (
    <Pressable onPress={onPress} style={[styles.timePill, { backgroundColor: theme.colors.surfaceAlt }]}>
      <Text style={{ color: theme.colors.text, fontWeight: '600', fontSize: 13 }}>{time}</Text>
    </Pressable>
  );
}

function Divider() {
  const theme = useTheme();
  return <View style={[styles.divider, { backgroundColor: theme.colors.border }]} />;
}

const styles = StyleSheet.create({
  banner: { padding: spacing.md, borderRadius: radius.lg, borderWidth: 1, flexDirection: 'row', alignItems: 'center' },
  sectionLabel: { fontSize: 12, fontWeight: '700', letterSpacing: 1, textTransform: 'uppercase', marginTop: spacing.lg, marginBottom: spacing.sm },
  switchRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: spacing.md, gap: spacing.sm },
  divider: { height: StyleSheet.hairlineWidth },
  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: spacing.md, gap: spacing.sm },
  timePill: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: radius.pill, marginRight: spacing.sm },
  snooze: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: radius.pill, marginLeft: 6 },
});
