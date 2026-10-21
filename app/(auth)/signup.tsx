import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Screen } from '@/components/Screen';
import { Input } from '@/components/Input';
import { Button } from '@/components/Button';
import { useRouter } from 'expo-router';
import { useTheme } from '@/hooks/useTheme';
import { useAppStore } from '@/store/useAppStore';
import { spacing, typography } from '@/theme';

export default function SignUp() {
  const router = useRouter();
  const theme = useTheme();
  const signUp = useAppStore((s) => s.signUp);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    if (!email || !password) return;
    setLoading(true);
    try {
      await signUp(email, password, name);
      router.replace('/(onboarding)/skill' as any);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen>
      <Text style={[typography.h1, { color: theme.colors.text, marginBottom: spacing.sm }]}>Create account</Text>
      <Text style={{ color: theme.colors.textSecondary, marginBottom: spacing.xl }}>Start your learning journey today.</Text>

      <Input label="Name" placeholder="Your name" value={name} onChangeText={setName} autoCapitalize="words" />
      <Input label="Email" placeholder="you@example.com" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
      <Input label="Password" placeholder="At least 6 characters" value={password} onChangeText={setPassword} secureTextEntry />

      <Button title="Create Account" onPress={submit} loading={loading} style={{ marginTop: spacing.md }} />

      <Pressable onPress={() => router.push('/(auth)/login' as any)} style={{ marginTop: spacing.lg, alignItems: 'center' }}>
        <Text style={{ color: theme.colors.textSecondary }}>
          Already have an account? <Text style={{ color: theme.colors.primary, fontWeight: '600' }}>Sign in</Text>
        </Text>
      </Pressable>
    </Screen>
  );
}

const styles = StyleSheet.create({});
