# SkillPilot AI

Your personal AI learning coach — a complete React Native + Expo app that turns any course into a daily plan with smart reminders, quizzes, spaced repetition, and an AI mentor.

## Features

- **AI Course Planner** — generates a day-by-day roadmap from your skill, level, time budget, days available, and target date.
- **Today Screen** — one question answered: *"What should I do today?"* with a progress ring, streak, next deadline, and a big Start Learning button.
- **Smart Notifications** — lock-screen Android reminders for morning plan, study time, evening quiz, and weekly recap. Quiet hours, snooze, and per-time customization. Deep-link to the correct task/quiz on tap.
- **Daily AI Quiz** — 5 questions mixing multiple-choice, true/false, and short-answer. Scores answers, shows explanations, and schedules weak topics for revision.
- **Spaced Repetition** — SM-2 style revision queue with Again/Hard/Good/Easy ratings, handles gaps and missed days gracefully.
- **Progress Dashboard** — course completion vs knowledge mastery, weekly bar chart, streak, weak areas, and an AI-generated weekly report.
- **AI Mentor Chat** — knows your course, recent tasks, and weak topics. Special intents for "I have 15 minutes" and "I missed days, rebuild" actually reschedule tasks.
- **Adaptive Engine** — catch-up plans spread missed tasks rather than dumping them; short-session mode picks the best tasks for the time you have.
- **Dark / Light mode** · **Premium-ready architecture** · **Offline-first with AsyncStorage**.

## Tech Stack

- **React Native + Expo SDK 51** with **expo-router** (file-based navigation) and **TypeScript**
- **Zustand** for state, **AsyncStorage** for offline persistence
- **Supabase** (optional) for auth + cloud sync — see `supabase/migrations/001_init.sql`
- **Expo Notifications** for scheduled local reminders (Android lock-screen / heads-up)
- **Optional AI proxy** in `server/` so API keys never ship to the client
- Built-in **knowledge-base fallback** means the app works end-to-end without any external API keys

## Getting Started

### Prerequisites

- Node 18+
- Expo CLI: `npm i -g expo`
- Android Studio (for emulator) **or** the **Expo Go** app on a real Android device

### Install & Run

```bash
npm install
cp .env.example .env   # optional; app works with defaults
npx expo start
```

Then press `a` in the terminal to launch on an Android emulator, or scan the QR code with Expo Go.

### Optional: Supabase Cloud Sync

1. Create a Supabase project
2. Run `supabase/migrations/001_init.sql` in the SQL editor
3. Add to `.env`:
   ```
   EXPO_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
   EXPO_PUBLIC_SUPABASE_ANON_KEY=ey...
   ```
Restart the app. When not configured, the app stores everything locally.

### Optional: Remote AI Server

```bash
cd server
npm install
OPENAI_API_KEY=sk-... API_KEY=my-secret npm start
```

Then in `.env`:

```
EXPO_PUBLIC_AI_SERVER_URL=http://<your-ip>:3000
EXPO_PUBLIC_AI_API_KEY=my-secret
```

Without these env vars the app uses a curated knowledge-base generator that ships with the app — it produces realistic plans for Python, React, Machine Learning, Graphic Design, and a generic fallback for any other skill.

## Project Structure

```
app/                    # expo-router file-based routes
  (auth)/               # welcome, signup, login
  (onboarding)/         # 7-step onboarding flow
  (tabs)/               # today · roadmap · revision · progress · mentor
  task/[id].tsx         # task details
  quiz.tsx              # daily quiz runner
  quiz-results.tsx      # post-quiz feedback
  calendar.tsx          # learning calendar
  notifications.tsx     # notification preferences
  profile.tsx           # profile & settings
src/
  components/           # Button, Card, TaskCard, ProgressRing, Input, Chip, ...
  hooks/useTheme.tsx    # dark/light theme
  screens/              # (thin wrappers not needed due to expo-router)
  services/
    ai.ts               # AI service (remote + local generator)
    knowledgeBase.ts    # Built-in curriculum & question bank
    notifications.ts    # Expo Notifications scheduling + response handling
    storage.ts          # AsyncStorage wrapper + id gen
    supabase.ts         # supabase-js client (optional)
  store/useAppStore.ts  # Zustand store: auth, courses, tasks, quizzes, revisions, progress
  theme/                # colors, spacing, radius, typography
  types/                # TypeScript domain models
server/                 # Optional AI proxy (Express)
supabase/migrations/    # Postgres schema for cloud sync
```

## Acceptance Test Walkthrough

1. **Sign up** — enter name + email (stored locally).
2. **Onboarding** — pick a skill (try "Python"), course source, beginner/intermediate, minutes per day, available days, preferred time, target date, and goal.
3. **Roadmap** — a day-by-day plan is generated with lessons, exercises, weekly reviews, mini-projects, and daily quiz tasks.
4. **Today** — open the first lesson, read the instructions, jot notes, tap "Mark Complete". The progress ring and streak update.
5. **Quiz** — a daily quiz becomes available; answer questions, see score, per-question explanations, and weak-topic feedback.
6. **Revision** — weak topics appear as flashcards rated Again/Hard/Good/Easy, scheduled with spaced repetition.
7. **Notifications** — go to Settings → Notifications and enable. Morning, study-time, evening-quiz, and weekly reminders schedule locally. Tapping opens the right screen.
8. **Mentor** — ask the AI mentor questions. Try "I only have 15 minutes today" to see live schedule adjustment, or "I missed a few days, rebuild my plan" to trigger a gentle catch-up.
9. **Persistence** — kill the app, re-open, sign in with the same email; all your courses, tasks, quiz history, and revision queue are restored.

## Building for Android

```bash
# Development build (install on device via EAS or local build)
npx expo prebuild
npx expo run:android

# Production APK/AAB via EAS Build
npm i -g eas-cli
eas build -p android --profile production
```

Remember to configure your `google-services.json` if you add push notifications (FCM) for server-triggered delivery; local scheduled notifications work without it.

## Monetization-Ready

The codebase is structured to gate premium features:

- Multiple active courses (currently new-course CTA in Profile shows a "Premium" placeholder).
- Advanced analytics, unlimited revision, and adaptive depth are wired but easy to flip behind a `user.premium` flag.
- AI usage routes through one service (`src/services/ai.ts`) so per-user quotas/token budgets can be tracked centrally.

No fake payment flows — upgrade UI clearly labels features as coming soon.

## Environment Variables

| Variable | Purpose | Required |
|----------|---------|----------|
| `EXPO_PUBLIC_SUPABASE_URL` | Supabase project URL | No (local only) |
| `EXPO_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon key | No |
| `EXPO_PUBLIC_AI_SERVER_URL` | External AI proxy base URL | No (uses local generator) |
| `EXPO_PUBLIC_AI_API_KEY` | Bearer token for AI proxy | No |

## License

MIT
