import React, { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { ThemeProvider, useTheme } from '@/hooks/useTheme';
import { useAppStore } from '@/store/useAppStore';
import { addNotificationResponseListener } from '@/services/notifications';
import { useRouter, useSegments } from 'expo-router';

function NavigationGuard() {
  const router = useRouter();
  const segments = useSegments();
  const user = useAppStore((s) => s.user);
  const onboardingComplete = useAppStore((s) => s.onboardingComplete);
  const loading = useAppStore((s) => s.loading);
  const hydrate = useAppStore((s) => s.hydrate);

  useEffect(() => {
    hydrate();
  }, []);

  useEffect(() => {
    if (loading) return;
    const inAuthGroup = segments[0] === '(auth)';
    const inOnboarding = segments[0] === '(onboarding)';
    if (!user && !inAuthGroup) {
      router.replace('/(auth)/welcome' as any);
    } else if (user && !onboardingComplete && !inOnboarding && segments[0] !== '(auth)') {
      router.replace('/(onboarding)/skill' as any);
    } else if (user && onboardingComplete && (inAuthGroup || inOnboarding)) {
      router.replace('/(tabs)/today' as any);
    }
  }, [user, onboardingComplete, loading, segments]);

  // Deep link from notifications
  useEffect(() => {
    const unsub = addNotificationResponseListener((data) => {
      if (!data) return;
      if (data.screen === 'quiz') router.push('/(tabs)/today' as any);
      else if (data.screen === 'progress') router.push('/(tabs)/progress' as any);
      else if (data.screen === 'task' && data.taskId) router.push({ pathname: '/task/[id]', params: { id: data.taskId } } as any);
      else router.push('/(tabs)/today' as any);
    });
    return unsub;
  }, []);

  return null;
}

function ThemedStack() {
  const theme = useTheme();
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: theme.colors.background },
        headerTintColor: theme.colors.text,
        headerTitleStyle: { fontWeight: '700' },
        contentStyle: { backgroundColor: theme.colors.background },
        headerShadowVisible: false,
      }}
    >
      <Stack.Screen name="(auth)" options={{ headerShown: false }} />
      <Stack.Screen name="(onboarding)" options={{ headerShown: false }} />
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="task/[id]" options={{ title: 'Task' }} />
      <Stack.Screen name="quiz" options={{ title: 'Daily Quiz' }} />
      <Stack.Screen name="quiz-results" options={{ title: 'Results', headerBackVisible: false }} />
      <Stack.Screen name="calendar" options={{ title: 'Learning Calendar' }} />
      <Stack.Screen name="settings" options={{ title: 'Settings' }} />
      <Stack.Screen name="notifications" options={{ title: 'Notifications' }} />
      <Stack.Screen name="profile" options={{ title: 'Profile' }} />
      <Stack.Screen name="course-setup" options={{ title: 'Course Import' }} />
      <Stack.Screen name="roadmap" options={{ title: 'Your Roadmap' }} />
      <Stack.Screen name="index" options={{ headerShown: false }} />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <ThemeProvider>
          <NavigationGuard />
          <StatusBar style="auto" />
          <ThemedStack />
        </ThemeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
