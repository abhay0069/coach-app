import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  User, Course, Module, Task, Quiz, QuizQuestion, RevisionItem,
  NotificationSettings, MentorMessage, DailyProgress, OnboardingData,
} from '@/types';

const KEYS = {
  USER: 'sp_user',
  ACTIVE_COURSE: 'sp_active_course',
  COURSES: 'sp_courses',
  MODULES: 'sp_modules',
  TASKS: 'sp_tasks',
  QUIZZES: 'sp_quizzes',
  REVISIONS: 'sp_revisions',
  NOTIF_SETTINGS: 'sp_notif_settings',
  MENTOR_MSGS: 'sp_mentor_msgs',
  DAILY_PROGRESS: 'sp_daily_progress',
  ONBOARDING: 'sp_onboarding',
  COMPLETED_ONBOARDING: 'sp_completed_onboarding',
  THEME: 'sp_theme',
};

async function getJSON<T>(key: string, fallback: T): Promise<T> {
  try {
    const raw = await AsyncStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

async function setJSON<T>(key: string, value: T): Promise<void> {
  await AsyncStorage.setItem(key, JSON.stringify(value));
}

export const storage = {
  KEYS,
  getUser: () => getJSON<User | null>(KEYS.USER, null),
  setUser: (u: User | null) => setJSON(KEYS.USER, u),

  getActiveCourseId: () => getJSON<string | null>(KEYS.ACTIVE_COURSE, null),
  setActiveCourseId: (id: string | null) => setJSON(KEYS.ACTIVE_COURSE, id),

  getCourses: () => getJSON<Course[]>(KEYS.COURSES, []),
  setCourses: (courses: Course[]) => setJSON(KEYS.COURSES, courses),

  getModules: () => getJSON<Module[]>(KEYS.MODULES, []),
  setModules: (m: Module[]) => setJSON(KEYS.MODULES, m),

  getTasks: () => getJSON<Task[]>(KEYS.TASKS, []),
  setTasks: (t: Task[]) => setJSON(KEYS.TASKS, t),

  getQuizzes: () => getJSON<Quiz[]>(KEYS.QUIZZES, []),
  setQuizzes: (q: Quiz[]) => setJSON(KEYS.QUIZZES, q),

  getRevisions: () => getJSON<RevisionItem[]>(KEYS.REVISIONS, []),
  setRevisions: (r: RevisionItem[]) => setJSON(KEYS.REVISIONS, r),

  getNotifSettings: () => getJSON<NotificationSettings>(KEYS.NOTIF_SETTINGS, {
    enabled: true, morningReminder: true, morningTime: '08:00',
    studyReminder: true, studyReminderTime: '17:00',
    eveningQuiz: true, eveningQuizTime: '19:00',
    weeklyProgress: true, snoozeMinutes: 15,
  }),
  setNotifSettings: (s: NotificationSettings) => setJSON(KEYS.NOTIF_SETTINGS, s),

  getMentorMessages: () => getJSON<MentorMessage[]>(KEYS.MENTOR_MSGS, []),
  setMentorMessages: (m: MentorMessage[]) => setJSON(KEYS.MENTOR_MSGS, m),

  getDailyProgress: () => getJSON<DailyProgress[]>(KEYS.DAILY_PROGRESS, []),
  setDailyProgress: (p: DailyProgress[]) => setJSON(KEYS.DAILY_PROGRESS, p),

  getOnboarding: () => getJSON<Partial<OnboardingData>>(KEYS.ONBOARDING, {}),
  setOnboarding: (o: Partial<OnboardingData>) => setJSON(KEYS.ONBOARDING, o),

  isOnboardingComplete: () => getJSON<boolean>(KEYS.COMPLETED_ONBOARDING, false),
  setOnboardingComplete: (v: boolean) => setJSON(KEYS.COMPLETED_ONBOARDING, v),

  getTheme: () => getJSON<'light' | 'dark' | 'system'>(KEYS.THEME, 'system'),
  setTheme: (t: 'light' | 'dark' | 'system') => setJSON(KEYS.THEME, t),

  clearAll: async () => {
    await AsyncStorage.multiRemove(Object.values(KEYS));
  },
};

export function genId(prefix = ''): string {
  return `${prefix}${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}
