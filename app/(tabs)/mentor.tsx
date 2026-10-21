import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, TextInput, FlatList, Pressable, KeyboardAvoidingView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/hooks/useTheme';
import { Screen } from '@/components/Screen';
import { Button } from '@/components/Button';
import { spacing, radius } from '@/theme';
import { useAppStore } from '@/store/useAppStore';
import { MentorMessage } from '@/types';

const QUICK_PROMPTS = [
  'Explain today\'s concept simply',
  'Give me another example',
  'Test me on yesterday\'s lesson',
  'Help me solve this exercise',
  'I only have 15 minutes today',
  'I missed a few days, rebuild my plan',
];

export default function MentorScreen() {
  const theme = useTheme();
  const flatList = useRef<FlatList>(null);
  const messages = useAppStore((s) => s.mentorMessages);
  const addMessage = useAppStore((s) => s.addMentorMessage);
  const clearChat = useAppStore((s) => s.clearMentor);
  const rebuildCatchUp = useAppStore((s) => s.rebuildCatchUpPlan);
  const adjustShortSession = useAppStore((s) => s.adjustForShortSession);
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (messages.length === 0) {
      addMessage('assistant', "Hi! I'm your AI mentor. I know what you've been studying, what you've aced, and where you've struggled. Ask me anything — to explain a concept, give you a practice question, adjust your schedule, or plan what to do next.");
    }
  }, []);

  const send = async (content?: string) => {
    const msg = (content ?? text).trim();
    if (!msg || sending) return;
    setText('');
    setSending(true);
    try {
      // Handle special intents
      if (/missed|behind|catch up|rebuild/.test(msg.toLowerCase())) {
        await addMessage('user', msg);
        await rebuildCatchUp();
        await addMessage('assistant', 'I\'ve rebuilt your schedule with a gentle catch-up plan — no overload. Check your Roadmap tab to see the updated days.');
      } else if (/15 min|short on time|only have/.test(msg.toLowerCase())) {
        await addMessage('user', msg);
        const picked = await adjustShortSession(15);
        await addMessage('assistant', picked.length
          ? `Focus today on: ${picked.map((t) => `"${t.title}"`).join(', ')}. I've rescheduled other tasks to tomorrow.`
          : 'No tasks fit 15 minutes right now. Try a quick revision instead.');
      } else {
        await addMessage('user', msg);
      }
    } finally { setSending(false); }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: theme.colors.background }} behavior={Platform.OS === 'ios' ? 'padding' : undefined} keyboardVerticalOffset={90}>
      <View style={styles.header}>
        <View style={[styles.avatar, { backgroundColor: theme.colors.primary }]}>
          <Ionicons name="school" size={20} color="#fff" />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={{ color: theme.colors.text, fontSize: 17, fontWeight: '700' }}>AI Mentor</Text>
          <Text style={{ color: theme.colors.textSecondary, fontSize: 12 }}>Always here to help you learn better</Text>
        </View>
        <Pressable onPress={clearChat} hitSlop={10}>
          <Ionicons name="create-outline" size={22} color={theme.colors.textTertiary} />
        </Pressable>
      </View>

      <FlatList
        ref={flatList}
        data={messages}
        keyExtractor={(m) => m.id}
        contentContainerStyle={{ padding: spacing.md, paddingBottom: spacing.lg }}
        onContentSizeChange={() => flatList.current?.scrollToEnd({ animated: true })}
        renderItem={({ item }) => <ChatBubble msg={item} />}
        ListFooterComponent={
          messages.length <= 1 ? (
            <View style={styles.prompts}>
              <Text style={{ color: theme.colors.textTertiary, fontSize: 12, marginBottom: spacing.sm, fontWeight: '600' }}>QUICK PROMPTS</Text>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
                {QUICK_PROMPTS.map((p) => (
                  <Pressable key={p} onPress={() => send(p)} style={[styles.promptChip, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
                    <Text style={{ color: theme.colors.text, fontSize: 12 }}>{p}</Text>
                  </Pressable>
                ))}
              </View>
            </View>
          ) : null
        }
      />

      <View style={[styles.inputBar, { borderTopColor: theme.colors.border, backgroundColor: theme.colors.surface }]}>
        <TextInput
          value={text}
          onChangeText={setText}
          placeholder="Ask anything about your learning..."
          placeholderTextColor={theme.colors.textTertiary}
          multiline
          style={[styles.input, { color: theme.colors.text, backgroundColor: theme.colors.surfaceAlt }]}
        />
        <Pressable onPress={() => send()} style={[styles.sendBtn, { backgroundColor: theme.colors.primary, opacity: sending || !text.trim() ? 0.5 : 1 }]} disabled={sending || !text.trim()}>
          <Ionicons name="send" size={18} color="#fff" />
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

function ChatBubble({ msg }: { msg: MentorMessage }) {
  const theme = useTheme();
  const isUser = msg.role === 'user';
  return (
    <View style={[styles.bubbleRow, { justifyContent: isUser ? 'flex-end' : 'flex-start' }]}>
      <View style={[
        styles.bubble,
        {
          backgroundColor: isUser ? theme.colors.primary : theme.colors.surface,
          borderColor: isUser ? theme.colors.primary : theme.colors.border,
        },
      ]}>
        <Text style={{ color: isUser ? '#fff' : theme.colors.text, lineHeight: 20 }}>{msg.content}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', padding: spacing.md, gap: spacing.sm },
  avatar: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  bubbleRow: { marginVertical: 4 },
  bubble: { maxWidth: '82%', paddingHorizontal: 14, paddingVertical: 10, borderRadius: 18, borderWidth: StyleSheet.hairlineWidth },
  prompts: { marginTop: spacing.lg },
  promptChip: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: radius.pill, borderWidth: StyleSheet.hairlineWidth, marginRight: 8, marginBottom: 8 },
  inputBar: { flexDirection: 'row', alignItems: 'flex-end', padding: spacing.sm, gap: spacing.sm, borderTopWidth: StyleSheet.hairlineWidth },
  input: { flex: 1, borderRadius: 20, paddingHorizontal: 14, paddingVertical: 10, maxHeight: 120, fontSize: 15 },
  sendBtn: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
});
