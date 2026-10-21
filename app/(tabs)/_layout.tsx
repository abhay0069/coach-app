import React from 'react';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/hooks/useTheme';
import { View, Text, StyleSheet, Platform } from 'react-native';

function TabIcon({ name, focused }: { name: keyof typeof Ionicons.glyphMap; focused: boolean }) {
  const theme = useTheme();
  // Use -outline for inactive, filled for active
  const iconName = focused ? name : ((name + '-outline') as keyof typeof Ionicons.glyphMap);
  return (
    <Ionicons
      name={iconName}
      size={22}
      color={focused ? theme.colors.primary : theme.colors.textTertiary}
    />
  );
}

export default function TabsLayout() {
  const theme = useTheme();
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: theme.colors.surface,
          borderTopColor: theme.colors.border,
          height: Platform.OS === 'ios' ? 84 : 64,
          paddingTop: 8,
          paddingBottom: Platform.OS === 'ios' ? 24 : 8,
        },
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.textTertiary,
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
      }}
    >
      <Tabs.Screen
        name="today"
        options={{ title: 'Today', tabBarIcon: ({ focused }) => <TabIcon name="today" focused={focused} /> }}
      />
      <Tabs.Screen
        name="roadmap"
        options={{ title: 'Roadmap', tabBarIcon: ({ focused }) => <TabIcon name="map" focused={focused} /> }}
      />
      <Tabs.Screen
        name="revision"
        options={{ title: 'Revision', tabBarIcon: ({ focused }) => <TabIcon name="refresh" focused={focused} /> }}
      />
      <Tabs.Screen
        name="progress"
        options={{ title: 'Progress', tabBarIcon: ({ focused }) => <TabIcon name="stats-chart" focused={focused} /> }}
      />
      <Tabs.Screen
        name="mentor"
        options={{ title: 'AI Mentor', tabBarIcon: ({ focused }) => <TabIcon name="chatbubble-ellipses" focused={focused} /> }}
      />
    </Tabs>
  );
}
