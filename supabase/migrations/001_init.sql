-- SkillPilot AI — initial schema
-- Execute this in your Supabase SQL editor to enable cloud sync.
-- The app runs fully offline using local storage; these tables are used
-- only when Supabase is configured via EXPO_PUBLIC_SUPABASE_URL/ANON_KEY.

create extension if not exists "uuid-ossp";

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text unique not null,
  name text,
  premium boolean default false,
  dark_mode boolean default false,
  notification_enabled boolean default true,
  created_at timestamptz default now()
);

create table if not exists public.courses (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references public.profiles(id) on delete cascade not null,
  title text not null,
  skill text not null,
  description text,
  source_url text,
  syllabus text,
  skill_level text not null default 'beginner',
  daily_minutes int not null default 30,
  available_days text[] not null default array['mon','tue','wed','thu','fri'],
  preferred_time text not null default '18:00',
  target_date date not null,
  outcome_goal text not null default 'project',
  created_at timestamptz default now(),
  completed_at timestamptz,
  archived boolean default false
);

create table if not exists public.modules (
  id uuid primary key default uuid_generate_v4(),
  course_id uuid references public.courses(id) on delete cascade not null,
  title text not null,
  description text,
  order_index int not null default 0
);

create table if not exists public.tasks (
  id uuid primary key default uuid_generate_v4(),
  course_id uuid references public.courses(id) on delete cascade not null,
  module_id uuid references public.modules(id) on delete set null,
  day_index int not null default 0,
  date_scheduled date not null,
  title text not null,
  description text,
  instructions text,
  estimated_minutes int not null default 20,
  learning_objective text,
  resource jsonb,
  completion_criteria text,
  type text not null default 'lesson',
  status text not null default 'pending',
  completed_at timestamptz,
  user_notes text,
  user_submission text,
  created_at timestamptz default now()
);

create table if not exists public.quizzes (
  id uuid primary key default uuid_generate_v4(),
  course_id uuid references public.courses(id) on delete cascade not null,
  task_id uuid references public.tasks(id) on delete set null,
  date date not null,
  questions jsonb not null default '[]'::jsonb,
  score int,
  completed boolean default false,
  started_at timestamptz,
  completed_at timestamptz,
  user_answers jsonb,
  weak_topics text[]
);

create table if not exists public.revision_items (
  id uuid primary key default uuid_generate_v4(),
  course_id uuid references public.courses(id) on delete cascade not null,
  topic text not null,
  next_review_date date not null,
  interval_days int not null default 1,
  ease_factor numeric not null default 2.5,
  repetitions int not null default 0,
  last_performance int,
  created_at timestamptz default now(),
  last_reviewed_at timestamptz,
  source_quiz_id uuid references public.quizzes(id) on delete set null
);

create table if not exists public.mentor_messages (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references public.profiles(id) on delete cascade not null,
  role text not null,
  content text not null,
  context jsonb,
  created_at timestamptz default now()
);

create table if not exists public.daily_progress (
  user_id uuid references public.profiles(id) on delete cascade not null,
  course_id uuid references public.courses(id) on delete cascade not null,
  date date not null,
  tasks_planned int default 0,
  tasks_completed int default 0,
  minutes_studied int default 0,
  quiz_score int,
  quiz_completed boolean default false,
  primary key (user_id, course_id, date)
);

create table if not exists public.notification_settings (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  enabled boolean default true,
  morning_reminder boolean default true,
  morning_time text default '08:00',
  study_reminder boolean default true,
  study_reminder_time text default '17:00',
  evening_quiz boolean default true,
  evening_quiz_time text default '19:00',
  weekly_progress boolean default true,
  quiet_hours_start text,
  quiet_hours_end text,
  snooze_minutes int default 15
);

-- RLS: users can only access their own data
alter table public.profiles enable row level security;
alter table public.courses enable row level security;
alter table public.modules enable row level security;
alter table public.tasks enable row level security;
alter table public.quizzes enable row level security;
alter table public.revision_items enable row level security;
alter table public.mentor_messages enable row level security;
alter table public.daily_progress enable row level security;
alter table public.notification_settings enable row level security;

create policy "own profile" on public.profiles for all using (auth.uid() = id) with check (auth.uid() = id);
create policy "own courses" on public.courses for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own modules" on public.modules for all using (exists (select 1 from public.courses c where c.id = course_id and c.user_id = auth.uid())) with check (exists (select 1 from public.courses c where c.id = course_id and c.user_id = auth.uid()));
create policy "own tasks" on public.tasks for all using (exists (select 1 from public.courses c where c.id = course_id and c.user_id = auth.uid())) with check (exists (select 1 from public.courses c where c.id = course_id and c.user_id = auth.uid()));
create policy "own quizzes" on public.quizzes for all using (exists (select 1 from public.courses c where c.id = course_id and c.user_id = auth.uid())) with check (exists (select 1 from public.courses c where c.id = course_id and c.user_id = auth.uid()));
create policy "own revisions" on public.revision_items for all using (exists (select 1 from public.courses c where c.id = course_id and c.user_id = auth.uid())) with check (exists (select 1 from public.courses c where c.id = course_id and c.user_id = auth.uid()));
create policy "own messages" on public.mentor_messages for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own progress" on public.daily_progress for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own notif" on public.notification_settings for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
