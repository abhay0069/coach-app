export type SkillLevel = 'beginner' | 'intermediate' | 'advanced';
export type OutcomeGoal = 'basic' | 'project' | 'certification' | 'exam' | 'job';
export type TaskStatus = 'pending' | 'in_progress' | 'completed' | 'skipped' | 'rescheduled';
export type TaskType = 'lesson' | 'exercise' | 'quiz' | 'mini_project' | 'revision' | 'assessment';
export type QuizQuestionType = 'multiple_choice' | 'true_false' | 'short_answer' | 'scenario' | 'code';
export type DaysOfWeek = 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun';

export interface User {
  id: string;
  email: string;
  name?: string;
  created_at: string;
  premium?: boolean;
  dark_mode?: boolean;
  notification_enabled?: boolean;
}

export interface OnboardingData {
  skill: string;
  courseName: string;
  courseUrl?: string;
  courseSyllabus?: string;
  courseInputType: 'url' | 'syllabus' | 'manual' | 'youtube';
  lessons?: string[];
  skillLevel: SkillLevel;
  dailyMinutes: number;
  availableDays: DaysOfWeek[];
  preferredTime: string; // HH:mm
  targetDate: string; // ISO date
  outcomeGoal: OutcomeGoal;
}

export interface Course {
  id: string;
  user_id: string;
  title: string;
  skill: string;
  description?: string;
  source_url?: string;
  syllabus?: string;
  skill_level: SkillLevel;
  daily_minutes: number;
  available_days: DaysOfWeek[];
  preferred_time: string;
  target_date: string;
  outcome_goal: OutcomeGoal;
  created_at: string;
  completed_at?: string;
  archived?: boolean;
}

export interface Module {
  id: string;
  course_id: string;
  title: string;
  description?: string;
  order_index: number;
}

export interface Task {
  id: string;
  course_id: string;
  module_id?: string;
  day_index: number;
  date_scheduled: string;
  title: string;
  description: string;
  instructions: string;
  estimated_minutes: number;
  learning_objective: string;
  resource?: { type: 'url' | 'text' | 'video'; value: string; label?: string };
  completion_criteria: string;
  type: TaskType;
  status: TaskStatus;
  completed_at?: string;
  user_notes?: string;
  user_submission?: string;
  created_at: string;
}

export interface QuizQuestion {
  id: string;
  quiz_id: string;
  question: string;
  type: QuizQuestionType;
  options?: string[];
  correct_answer: string;
  explanation: string;
  topic: string;
  order_index: number;
}

export interface Quiz {
  id: string;
  course_id: string;
  task_id?: string;
  date: string;
  questions: QuizQuestion[];
  score?: number;
  completed?: boolean;
  started_at?: string;
  completed_at?: string;
  user_answers?: Record<string, string>;
  weak_topics?: string[];
}

export interface RevisionItem {
  id: string;
  course_id: string;
  topic: string;
  next_review_date: string;
  interval_days: number;
  ease_factor: number;
  repetitions: number;
  last_performance?: number; // 0-5
  created_at: string;
  last_reviewed_at?: string;
  source_quiz_id?: string;
}

export interface NotificationSettings {
  enabled: boolean;
  morningReminder: boolean;
  morningTime: string;
  studyReminder: boolean;
  studyReminderTime: string;
  eveningQuiz: boolean;
  eveningQuizTime: string;
  weeklyProgress: boolean;
  quietHoursStart?: string;
  quietHoursEnd?: string;
  snoozeMinutes: number;
}

export interface MentorMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  context?: Record<string, any>;
}

export interface DailyProgress {
  date: string;
  course_id: string;
  tasks_planned: number;
  tasks_completed: number;
  minutes_studied: number;
  quiz_score?: number;
  quiz_completed?: boolean;
}

export interface AppState {
  user: User | null;
  activeCourse: Course | null;
  onboarding: Partial<OnboardingData>;
  isAuthenticated: boolean;
  isLoading: boolean;
  onboardingComplete: boolean;
}
