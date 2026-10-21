import { create } from 'zustand';
import {
  User, Course, Module, Task, Quiz, RevisionItem, NotificationSettings,
  MentorMessage, DailyProgress, OnboardingData, DaysOfWeek,
} from '@/types';
import { storage, genId } from '@/services/storage';
import { generateRoadmap, generateQuiz, scheduleRevision, mentorReply } from '@/services/ai';
import { scheduleDailyReminders } from '@/services/notifications';
import { format, addDays, parseISO, differenceInDays } from 'date-fns';

type TodayFilter = 'all' | 'pending' | 'completed';

async function updateDailyProgressImpl() {
  const state = useAppStore.getState();
  const activeId = state.activeCourseId;
  if (!activeId) return;
  const today = format(new Date(), 'yyyy-MM-dd');
  const dayTasks = state.tasks.filter((t) => t.course_id === activeId && t.date_scheduled === today);
  const completed = dayTasks.filter((t) => t.status === 'completed');
  const minutes = completed.reduce((sum, t) => sum + t.estimated_minutes, 0);
  const todayQuiz = state.quizzes.find((q) => q.course_id === activeId && q.date === today && q.completed);

  const existing = state.dailyProgress.find((p) => p.course_id === activeId && p.date === today);
  const entry: DailyProgress = {
    date: today,
    course_id: activeId,
    tasks_planned: dayTasks.length,
    tasks_completed: completed.length,
    minutes_studied: minutes,
    quiz_score: todayQuiz?.score,
    quiz_completed: !!todayQuiz?.completed,
  };
  const others = state.dailyProgress.filter((p) => !(p.course_id === activeId && p.date === today));
  useAppStore.setState({ dailyProgress: [...others, entry] });
  await persist(useAppStore.getState);
}

interface AppStore {
  // Persisted state
  user: User | null;
  courses: Course[];
  modules: Module[];
  tasks: Task[];
  quizzes: Quiz[];
  revisions: RevisionItem[];
  mentorMessages: MentorMessage[];
  dailyProgress: DailyProgress[];
  notifSettings: NotificationSettings;
  activeCourseId: string | null;
  onboarding: Partial<OnboardingData>;
  onboardingComplete: boolean;
  darkMode: boolean;

  // UI state
  loading: boolean;
  todayFilter: TodayFilter;
  activeQuizId: string | null;

  // Initialization
  hydrate: () => Promise<void>;

  // Auth (mock / local; supabase wiring optional)
  signUp: (email: string, password: string, name?: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  updateProfile: (patch: Partial<User>) => Promise<void>;

  // Onboarding
  setOnboarding: (patch: Partial<OnboardingData>) => void;
  completeOnboarding: () => Promise<Course>;
  setOnboardingData: (o: Partial<OnboardingData>) => Promise<void>;

  // Courses
  setActiveCourse: (id: string) => Promise<void>;
  createCourseFromOnboarding: (onboarding: OnboardingData) => Promise<Course>;
  regenerateRoadmap: () => Promise<void>;

  // Tasks
  todayTasks: () => Task[];
  markTaskComplete: (id: string, notes?: string) => Promise<void>;
  markTaskInProgress: (id: string) => void;
  skipTask: (id: string) => void;
  rescheduleTask: (id: string, newDate: string) => void;
  updateTask: (id: string, patch: Partial<Task>) => Promise<void>;
  getTask: (id: string) => Task | undefined;

  // Quizzes
  getTodayQuiz: () => Quiz | undefined;
  startQuiz: (taskId?: string) => Promise<Quiz>;
  submitQuiz: (quizId: string, answers: Record<string, string>) => Promise<{ score: number; weakTopics: string[]; explanations: Record<string, { correct: boolean; correct_answer: string; explanation: string }> }>;

  // Revision
  dueRevisions: () => RevisionItem[];
  completeRevision: (id: string, performance: number) => Promise<void>;
  addRevision: (topic: string, sourceQuizId?: string) => void;

  // Mentor
  addMentorMessage: (role: 'user' | 'assistant', content: string) => Promise<string>;
  clearMentor: () => void;

  // Progress
  streak: () => number;
  weeklyProgress: () => { date: string; completed: number; planned: number; minutes: number }[];
  overallProgress: () => { completedTasks: number; totalTasks: number; masteryPct: number; avgScore: number };
  getDailyProgressForDate: (date: string) => DailyProgress | undefined;

  // Settings
  updateNotifSettings: (patch: Partial<NotificationSettings>) => Promise<void>;
  setDarkMode: (v: boolean) => Promise<void>;

  // Adaptive helpers
  rebuildCatchUpPlan: () => Promise<void>;
  adjustForShortSession: (minutes: number) => Promise<Task[]>;

  // UI helpers
  setTodayFilter: (f: TodayFilter) => void;
}

// Helper to persist after state changes
async function persist(get: () => any) {
  const s = get();
  await Promise.all([
    storage.setUser(s.user),
    storage.setCourses(s.courses),
    storage.setModules(s.modules),
    storage.setTasks(s.tasks),
    storage.setQuizzes(s.quizzes),
    storage.setRevisions(s.revisions),
    storage.setMentorMessages(s.mentorMessages),
    storage.setDailyProgress(s.dailyProgress),
    storage.setNotifSettings(s.notifSettings),
    storage.setActiveCourseId(s.activeCourseId),
    storage.setOnboarding(s.onboarding),
    storage.setOnboardingComplete(s.onboardingComplete),
    storage.setTheme(s.darkMode ? 'dark' : 'light'),
  ]);
}

export const useAppStore = create<AppStore>((set, get) => ({
  user: null,
  courses: [],
  modules: [],
  tasks: [],
  quizzes: [],
  revisions: [],
  mentorMessages: [],
  dailyProgress: [],
  notifSettings: {
    enabled: true,
    morningReminder: true,
    morningTime: '08:00',
    studyReminder: true,
    studyReminderTime: '17:00',
    eveningQuiz: true,
    eveningQuizTime: '19:00',
    weeklyProgress: true,
    snoozeMinutes: 15,
  },
  activeCourseId: null,
  onboarding: {},
  onboardingComplete: false,
  darkMode: false,
  loading: true,
  todayFilter: 'all',
  activeQuizId: null,

  hydrate: async () => {
    set({ loading: true });
    const [
      user, courses, modules, tasks, quizzes, revisions, mentor,
      progress, notifSettings, activeId, onboarding, onboardingDone, theme,
    ] = await Promise.all([
      storage.getUser(),
      storage.getCourses(),
      storage.getModules(),
      storage.getTasks(),
      storage.getQuizzes(),
      storage.getRevisions(),
      storage.getMentorMessages(),
      storage.getDailyProgress(),
      storage.getNotifSettings(),
      storage.getActiveCourseId(),
      storage.getOnboarding(),
      storage.isOnboardingComplete(),
      storage.getTheme(),
    ]);
    set({
      user,
      courses,
      modules,
      tasks,
      quizzes,
      revisions,
      mentorMessages: mentor,
      dailyProgress: progress,
      notifSettings,
      activeCourseId: activeId || (courses[0]?.id ?? null),
      onboarding,
      onboardingComplete: onboardingDone,
      darkMode: theme === 'dark',
      loading: false,
    });
    // Re-schedule notifications on launch
    scheduleDailyReminders(notifSettings).catch(() => {});
  },

  signUp: async (email, password, name) => {
    const user: User = { id: genId('u_'), email, name, created_at: new Date().toISOString() };
    set({ user });
    await persist(get);
  },

  signIn: async (email) => {
    // Simple local auth - in production this would hit Supabase. We "log in" by loading existing data.
    let user = get().user;
    if (!user) {
      user = { id: genId('u_'), email, created_at: new Date().toISOString() };
      set({ user });
      await persist(get);
    }
  },

  signOut: async () => {
    set({ user: null, onboardingComplete: false, activeCourseId: null });
    await persist(get);
  },

  updateProfile: async (patch) => {
    const user = get().user;
    if (!user) return;
    set({ user: { ...user, ...patch } });
    await persist(get);
  },

  setOnboarding: (patch) => set((s) => ({ onboarding: { ...s.onboarding, ...patch } })),
  setOnboardingData: async (o) => { set((s) => ({ onboarding: { ...s.onboarding, ...o } })); await persist(get); },

  createCourseFromOnboarding: async (onboarding: OnboardingData) => {
    const courseId = genId('c_');
    const now = new Date().toISOString();
    const course: Course = {
      id: courseId,
      user_id: get().user?.id || 'guest',
      title: onboarding.courseName || onboarding.skill,
      skill: onboarding.skill,
      description: `${onboarding.skillLevel} level • ${onboarding.dailyMinutes} min/day • Target: ${onboarding.targetDate.slice(0, 10)}`,
      source_url: onboarding.courseUrl,
      syllabus: onboarding.courseSyllabus,
      skill_level: onboarding.skillLevel,
      daily_minutes: onboarding.dailyMinutes,
      available_days: onboarding.availableDays,
      preferred_time: onboarding.preferredTime,
      target_date: onboarding.targetDate,
      outcome_goal: onboarding.outcomeGoal,
      created_at: now,
    };

    // Pass courseId-aware generation
    const roadmap = await generateRoadmap(onboarding);
    // Rewrite course_id on generated modules/tasks
    const modules = roadmap.modules.map((m) => ({ ...m, id: genId('m_'), course_id: courseId }));
    const tasks: Task[] = roadmap.tasks.map((t) => {
      const matchingModule = modules.find((m) => m.title === roadmap.modules.find((rm) => rm.id === t.module_id)?.title);
      return { ...t, id: genId('t_'), course_id: courseId, module_id: matchingModule?.id };
    });

    set((s) => ({
      courses: [...s.courses, course],
      modules: [...s.modules, ...modules],
      tasks: [...s.tasks, ...tasks],
      activeCourseId: courseId,
      onboardingComplete: true,
      onboarding: {},
    }));
    await persist(get);
    scheduleDailyReminders(get().notifSettings).catch(() => {});
    return course;
  },

  completeOnboarding: async () => {
    const o = get().onboarding as OnboardingData;
    return get().createCourseFromOnboarding(o);
  },

  setActiveCourse: async (id) => { set({ activeCourseId: id }); await persist(get); },

  regenerateRoadmap: async () => {
    const course = get().courses.find((c) => c.id === get().activeCourseId);
    if (!course) return;
    // Keep completed tasks intact; remove pending ones for this course and regenerate from today.
    const completedTasks = get().tasks.filter((t) => t.course_id === course.id && t.status === 'completed');
    const remainingTasks = get().tasks.filter((t) => t.course_id !== course.id);
    const onboarding: OnboardingData = {
      skill: course.skill,
      courseName: course.title,
      courseUrl: course.source_url,
      courseSyllabus: course.syllabus,
      courseInputType: 'manual',
      skillLevel: course.skill_level,
      dailyMinutes: course.daily_minutes,
      availableDays: course.available_days,
      preferredTime: course.preferred_time,
      targetDate: course.target_date,
      outcomeGoal: course.outcome_goal,
    };
    const roadmap = await generateRoadmap(onboarding);
    const modules = roadmap.modules.map((m) => ({ ...m, id: genId('m_'), course_id: course.id }));
    const newTasks: Task[] = roadmap.tasks.map((t) => {
      const matchingModule = modules.find((m) => m.title === roadmap.modules.find((rm) => rm.id === t.module_id)?.title);
      return { ...t, id: genId('t_'), course_id: course.id, module_id: matchingModule?.id };
    });
    // Keep other courses' modules
    const remainingModules = get().modules.filter((m) => m.course_id !== course.id);
    set({
      tasks: [...remainingTasks, ...completedTasks, ...newTasks],
      modules: [...remainingModules, ...modules],
    });
    await persist(get);
  },

  todayTasks: () => {
    const activeId = get().activeCourseId;
    if (!activeId) return [];
    const today = format(new Date(), 'yyyy-MM-dd');
    return get().tasks
      .filter((t) => t.course_id === activeId && t.date_scheduled === today)
      .sort((a, b) => a.type === 'quiz' ? 1 : b.type === 'quiz' ? -1 : 0);
  },

  markTaskComplete: async (id, notes) => {
    const tasks = get().tasks.map((t) =>
      t.id === id ? { ...t, status: 'completed' as const, completed_at: new Date().toISOString(), user_notes: notes ?? t.user_notes } : t
    );
    set({ tasks });
    await updateDailyProgressImpl();
    await persist(get);
  },

  markTaskInProgress: (id) => {
    set((s) => ({ tasks: s.tasks.map((t) => t.id === id ? { ...t, status: 'in_progress' as const } : t) }));
    persist(get);
  },

  skipTask: (id) => {
    set((s) => ({ tasks: s.tasks.map((t) => t.id === id ? { ...t, status: 'skipped' as const } : t) }));
    persist(get);
  },

  rescheduleTask: (id, newDate) => {
    set((s) => ({
      tasks: s.tasks.map((t) => t.id === id ? { ...t, date_scheduled: newDate, status: 'rescheduled' as const } : t),
    }));
    persist(get);
  },

  updateTask: async (id, patch) => {
    set((s) => ({ tasks: s.tasks.map((t) => t.id === id ? { ...t, ...patch } : t) }));
    await persist(get);
  },

  getTask: (id) => get().tasks.find((t) => t.id === id),

  getTodayQuiz: () => {
    const activeId = get().activeCourseId;
    const today = format(new Date(), 'yyyy-MM-dd');
    return get().quizzes.find((q) => q.course_id === activeId && q.date === today);
  },

  startQuiz: async (taskId) => {
    const course = get().courses.find((c) => c.id === get().activeCourseId);
    if (!course) throw new Error('No active course');
    const today = format(new Date(), 'yyyy-MM-dd');
    const existing = get().quizzes.find((q) => q.course_id === course.id && q.date === today);
    if (existing) {
      set({ activeQuizId: existing.id });
      return existing;
    }
    const studyTasks = get().tasks.filter(
      (t) => t.course_id === course.id && t.date_scheduled === today && t.type !== 'quiz'
    );
    const quiz = await generateQuiz(course, studyTasks.length ? studyTasks : get().tasks.filter((t) => t.course_id === course.id).slice(-5));
    quiz.task_id = taskId;
    quiz.started_at = new Date().toISOString();
    set((s) => ({ quizzes: [...s.quizzes, quiz], activeQuizId: quiz.id }));
    await persist(get);
    return quiz;
  },

  submitQuiz: async (quizId, answers) => {
    const quiz = get().quizzes.find((q) => q.id === quizId);
    if (!quiz) throw new Error('Quiz not found');
    let correct = 0;
    const weakTopicsSet = new Set<string>();
    const explanations: Record<string, { correct: boolean; correct_answer: string; explanation: string }> = {};
    for (const q of quiz.questions) {
      const userAnswer = (answers[q.id] || '').trim().toLowerCase();
      const isCorrect = userAnswer === q.correct_answer.trim().toLowerCase() ||
        (q.type === 'short_answer' && q.correct_answer.toLowerCase().includes(userAnswer) && userAnswer.length > 3);
      explanations[q.id] = { correct: isCorrect, correct_answer: q.correct_answer, explanation: q.explanation };
      if (isCorrect) correct++;
      else weakTopicsSet.add(q.topic);
    }
    const score = Math.round((correct / quiz.questions.length) * 100);
    const weakTopics = Array.from(weakTopicsSet);
    const updated: Quiz = {
      ...quiz,
      score,
      completed: true,
      user_answers: answers,
      weak_topics: weakTopics,
      completed_at: new Date().toISOString(),
    };

    // Schedule revisions for weak topics
    const newRevisions = weakTopics.map((topic) => ({
      id: genId('r_'),
      course_id: quiz.course_id,
      topic,
      next_review_date: format(addDays(new Date(), 1), 'yyyy-MM-dd'),
      interval_days: 1,
      ease_factor: 2.5,
      repetitions: 0,
      source_quiz_id: quiz.id,
      created_at: new Date().toISOString(),
    } as RevisionItem));

    // If user scored well, upgrade intervals for existing topics (not weak)
    const goodTopics = quiz.questions.map((q) => q.topic).filter((t) => !weakTopicsSet.has(t));
    const revisions = get().revisions.map((r) => {
      if (goodTopics.includes(r.topic) && r.course_id === quiz.course_id) {
        const { interval, ease, reps } = scheduleRevision(
          { interval: r.interval_days, ease: r.ease_factor, reps: r.repetitions },
          5
        );
        return { ...r, interval_days: interval, ease_factor: ease, repetitions: reps, next_review_date: format(addDays(new Date(), interval), 'yyyy-MM-dd') };
      }
      return r;
    });

    set((s) => ({
      quizzes: s.quizzes.map((q) => q.id === quizId ? updated : q),
      revisions: [...revisions, ...newRevisions],
    }));

    // Mark today's quiz task as complete if exists
    const todayQuizTask = get().tasks.find((t) => t.course_id === quiz.course_id && t.date_scheduled === quiz.date && t.type === 'quiz');
    if (todayQuizTask) {
      await get().markTaskComplete(todayQuizTask.id);
    } else {
      await updateDailyProgressImpl();
    }
    await persist(get);
    return { score, weakTopics, explanations };
  },

  dueRevisions: () => {
    const activeId = get().activeCourseId;
    const today = format(new Date(), 'yyyy-MM-dd');
    return get().revisions
      .filter((r) => r.course_id === activeId && r.next_review_date <= today)
      .sort((a, b) => a.next_review_date.localeCompare(b.next_review_date));
  },

  completeRevision: async (id, performance) => {
    const revisions = get().revisions.map((r) => {
      if (r.id !== id) return r;
      const { interval, ease, reps } = scheduleRevision(
        { interval: r.interval_days, ease: r.ease_factor, reps: r.repetitions },
        performance
      );
      return {
        ...r,
        interval_days: interval,
        ease_factor: ease,
        repetitions: reps,
        last_performance: performance,
        last_reviewed_at: new Date().toISOString(),
        next_review_date: format(addDays(new Date(), interval), 'yyyy-MM-dd'),
      };
    });
    set({ revisions });
    await persist(get);
  },

  addRevision: (topic, sourceQuizId) => {
    const activeId = get().activeCourseId;
    if (!activeId) return;
    const rev: RevisionItem = {
      id: genId('r_'),
      course_id: activeId,
      topic,
      next_review_date: format(addDays(new Date(), 1), 'yyyy-MM-dd'),
      interval_days: 1,
      ease_factor: 2.5,
      repetitions: 0,
      source_quiz_id: sourceQuizId,
      created_at: new Date().toISOString(),
    };
    set((s) => ({ revisions: [...s.revisions, rev] }));
    persist(get);
  },

  addMentorMessage: async (role, content) => {
    const msg: MentorMessage = { id: genId('msg_'), role, content, timestamp: new Date().toISOString() };
    const newMsgs = [...get().mentorMessages, msg];
    set({ mentorMessages: newMsgs });
    if (role === 'user') {
      // typing placeholder
      const placeholder: MentorMessage = { id: genId('msg_'), role: 'assistant', content: '…', timestamp: new Date().toISOString() };
      set((s) => ({ mentorMessages: [...newMsgs, placeholder] }));

      const course = get().courses.find((c) => c.id === get().activeCourseId);
      const recentTasks = get().tasks.filter((t) => t.course_id === get().activeCourseId).slice(-10);
      const weakTopics = get().revisions.filter((r) => r.course_id === get().activeCourseId).map((r) => r.topic);
      const reply = await mentorReply(newMsgs.map((m) => ({ role: m.role, content: m.content })), { course, recentTasks, weakTopics });
      const replyMsg: MentorMessage = { id: placeholder.id, role: 'assistant', content: reply, timestamp: new Date().toISOString() };
      set((s) => ({ mentorMessages: [...newMsgs, replyMsg] }));
    }
    await persist(get);
    return get().mentorMessages[get().mentorMessages.length - 1].content;
  },

  clearMentor: () => { set({ mentorMessages: [] }); persist(get); },

  streak: () => {
    const activeId = get().activeCourseId;
    if (!activeId) return 0;
    let streak = 0;
    let cursor = new Date();
    const progressMap = new Map(get().dailyProgress.filter((p) => p.course_id === activeId).map((p) => [p.date, p]));
    // Allow today to be incomplete without breaking streak
    const todayKey = format(cursor, 'yyyy-MM-dd');
    if (!progressMap.get(todayKey) || progressMap.get(todayKey)!.tasks_completed === 0) {
      cursor.setDate(cursor.getDate() - 1);
    }
    while (true) {
      const key = format(cursor, 'yyyy-MM-dd');
      const p = progressMap.get(key);
      if (p && p.tasks_completed > 0) {
        streak++;
        cursor.setDate(cursor.getDate() - 1);
      } else break;
    }
    return streak;
  },

  weeklyProgress: () => {
    const activeId = get().activeCourseId;
    const result: { date: string; completed: number; planned: number; minutes: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = format(d, 'yyyy-MM-dd');
      const p = get().dailyProgress.find((x) => x.course_id === activeId && x.date === key);
      const dayTasks = get().tasks.filter((t) => t.course_id === activeId && t.date_scheduled === key);
      result.push({
        date: key,
        completed: p?.tasks_completed ?? dayTasks.filter((t) => t.status === 'completed').length,
        planned: p?.tasks_planned ?? dayTasks.length,
        minutes: p?.minutes_studied ?? dayTasks.filter((t) => t.status === 'completed').reduce((sum, t) => sum + t.estimated_minutes, 0),
      });
    }
    return result;
  },

  overallProgress: () => {
    const activeId = get().activeCourseId;
    const courseTasks = get().tasks.filter((t) => t.course_id === activeId);
    const completed = courseTasks.filter((t) => t.status === 'completed').length;
    const courseQuizzes = get().quizzes.filter((q) => q.course_id === activeId && q.completed);
    const avgScore = courseQuizzes.length ? Math.round(courseQuizzes.reduce((s, q) => s + (q.score || 0), 0) / courseQuizzes.length) : 0;
    // Mastery: avg quiz score weighted by tasks completed beyond lessons
    const taskMastery = completed / Math.max(1, courseTasks.length);
    const quizMastery = courseQuizzes.length ? avgScore / 100 : taskMastery;
    const masteryPct = Math.round(taskMastery * 50 + quizMastery * 50 * 100);
    return { completedTasks: completed, totalTasks: courseTasks.length, masteryPct: Math.min(100, masteryPct), avgScore };
  },

  getDailyProgressForDate: (date) => {
    const activeId = get().activeCourseId;
    return get().dailyProgress.find((p) => p.course_id === activeId && p.date === date);
  },

  updateNotifSettings: async (patch) => {
    const s = { ...get().notifSettings, ...patch };
    set({ notifSettings: s });
    await persist(get);
    await scheduleDailyReminders(s).catch(() => {});
  },

  setDarkMode: async (v) => { set({ darkMode: v }); await persist(get); },

  rebuildCatchUpPlan: async () => {
    const course = get().courses.find((c) => c.id === get().activeCourseId);
    if (!course) return;
    const today = format(new Date(), 'yyyy-MM-dd');
    const pending = get().tasks.filter((t) => t.course_id === course.id && t.date_scheduled < today && t.status !== 'completed');
    const futureTasks = get().tasks.filter((t) => t.course_id === course.id && t.date_scheduled >= today && t.status !== 'completed');
    // Distribute 1-2 catch-up tasks over next days without overloading
    let dayCursor = new Date();
    const availSet = new Set(course.available_days);
    const updated = [...futureTasks];
    let queue = [...pending];
    let safety = 30;
    while (queue.length && safety-- > 0) {
      const dow = dayCursor.toLocaleDateString('en-US', { weekday: 'short' }).toLowerCase().slice(0, 3);
      if (availSet.has(dow as DaysOfWeek)) {
        const key = format(dayCursor, 'yyyy-MM-dd');
        const existingForDay = updated.filter((t) => t.date_scheduled === key && t.type !== 'quiz').length;
        if (existingForDay < 2) {
          const t = queue.shift()!;
          updated.push({ ...t, date_scheduled: key, status: 'rescheduled' });
        }
      }
      dayCursor.setDate(dayCursor.getDate() + 1);
    }
    const completedOnes = get().tasks.filter((t) => t.course_id === course.id && t.status === 'completed');
    const otherCourses = get().tasks.filter((t) => t.course_id !== course.id);
    set({ tasks: [...otherCourses, ...completedOnes, ...updated] });
    await persist(get);
  },

  adjustForShortSession: async (minutes) => {
    const course = get().courses.find((c) => c.id === get().activeCourseId);
    if (!course) return [];
    const today = format(new Date(), 'yyyy-MM-dd');
    const todayTasks = get().tasks.filter((t) => t.course_id === course.id && t.date_scheduled === today && t.status === 'pending');
    // Pick tasks that fit into available time, prioritising lessons first
    const picked: Task[] = [];
    let remaining = minutes;
    for (const t of [...todayTasks].sort((a, b) => (a.type === 'lesson' ? -1 : 1))) {
      if (t.estimated_minutes <= remaining + 5) {
        picked.push(t);
        remaining -= t.estimated_minutes;
        if (remaining <= 0) break;
      }
    }
    // Reschedule unpicked tasks to tomorrow
    const pickedIds = new Set(picked.map((t) => t.id));
    const unpicked = todayTasks.filter((t) => !pickedIds.has(t.id));
    const tomorrow = format(addDays(new Date(), 1), 'yyyy-MM-dd');
    set((s) => ({
      tasks: s.tasks.map((t) => unpicked.find((u) => u.id === t.id) ? { ...t, date_scheduled: tomorrow, status: 'rescheduled' as const } : t),
    }));
    await persist(get);
    return picked;
  },

  setTodayFilter: (f) => set({ todayFilter: f }),
}));
