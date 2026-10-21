import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Screen } from '@/components/Screen';
import { Input } from '@/components/Input';
import { Button } from '@/components/Button';
import { useRouter } from 'expo-router';
import { useTheme } from '@/hooks/useTheme';
import { useAppStore } from '@/store/useAppStore';
import { spacing, typography } from '@/theme';

export default function Login() {
  const router = useRouter();
  const theme = useTheme();
  const signIn = useAppStore((s) => s.signIn);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    if (!email) return;
    setLoading(true);
    try {
      await signIn(email, password);
      router.replace('/(tabs)/today' as any);
    } finally { setLoading(false); }
  };

  return (
    <Screen>
      <Text style={[typography.h1, { color: theme.colors.text, marginBottom: spacing.sm }]}>Welcome back</Text>
      <Text style={{ color: theme.colors.textSecondary, marginBottom: spacing.xl }}>Continue where you left off.</Text>

      <Input label="Email" placeholder="you@example.com" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
      <Input label="Password" placeholder="Your password" value={password} onChangeText={setPassword} secureTextEntry />

      <Button title="Sign In" onPress={submit} loading={loading} style={{ marginTop: spacing.md }} />

      <Pressable onPress={() => router.push('/(auth)/signup' as any)} style={{ marginTop: spacing.lg, alignItems: 'center' }}>
        <Text style={{ color: theme.colors.textSecondary }}>
          New here? <Text style={{ color: theme.colors.primary, fontWeight: '600' }}>Create an account</Text>
        </Text>
      </Pressable>
    </Screen>
  );
}
