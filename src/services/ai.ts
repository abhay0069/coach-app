/**
 * AI Service for SkillPilot AI.
 *
 * Provides: roadmap generation, quiz generation, mentor chat, adaptive scheduling.
 * Uses a remote AI server when EXPO_PUBLIC_AI_SERVER_URL is configured;
 * otherwise falls back to a deterministic local generator so the app works
 * end-to-end without any external keys.
 */

import { OnboardingData, Course, Module, Task, Quiz, QuizQuestion, TaskType, QuizQuestionType } from '@/types';
import { genId } from './storage';
import { KNOWLEDGE_BASE } from './knowledgeBase';

const AI_SERVER_URL = process.env.EXPO_PUBLIC_AI_SERVER_URL || '';
const AI_API_KEY = process.env.EXPO_PUBLIC_AI_API_KEY || '';
const hasRemoteAI = Boolean(AI_SERVER_URL);

async function callRemote(endpoint: string, body: any): Promise<any> {
  try {
    const resp = await fetch(`${AI_SERVER_URL}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(AI_API_KEY ? { Authorization: `Bearer ${AI_API_KEY}` } : {}),
      },
      body: JSON.stringify(body),
    });
    if (!resp.ok) throw new Error(`AI server error: ${resp.status}`);
    return resp.json();
  } catch (e) {
    return null;
  }
}

// ---------- KNOWLEDGE-DRIVEN LOCAL GENERATOR ----------

function matchKnowledgeBase(skill: string, courseName: string) {
  const q = (skill + ' ' + courseName).toLowerCase();
  for (const entry of KNOWLEDGE_BASE) {
    for (const kw of entry.keywords) {
      if (q.includes(kw)) return entry;
    }
  }
  return KNOWLEDGE_BASE[0]; // generic fallback
}

export function generateRoadmapLocal(onboarding: OnboardingData): {
  modules: Module[];
  tasks: Task[];
} {
  const kb = matchKnowledgeBase(onboarding.skill, onboarding.courseName);
  const startDate = new Date();
  const targetDate = new Date(onboarding.targetDate);
  const totalDays = Math.max(7, Math.ceil((targetDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)));

  // Build modules from KB topics, distribute lessons across available days.
  const courseId = 'course_' + genId();
  const modules: Module[] = kb.modules.map((m, i) => ({
    id: 'mod_' + genId(),
    course_id: courseId,
    title: m.title,
    description: m.description,
    order_index: i,
  }));

  // Flatten lessons and map to tasks
  const allLessons: { title: string; description: string; objective: string; minutes: number; type: TaskType; moduleIdx: number }[] = [];
  kb.modules.forEach((m, mi) => {
    m.lessons.forEach((l) => {
      allLessons.push({
        title: l.title,
        description: l.description,
        objective: l.objective,
        minutes: Math.min(onboarding.dailyMinutes, Math.max(15, l.minutes || 20)),
        type: l.type || 'lesson',
        moduleIdx: mi,
      });
    });
  });

  // Distribute lessons across days based on daily minutes availability
  const tasks: Task[] = [];
  let lessonIdx = 0;
  const availableDaysSet = new Set(onboarding.availableDays);
  let dayCursor = new Date(startDate);
  let dayIndex = 0;
  const maxDays = Math.min(totalDays, 90);

  while (lessonIdx < allLessons.length && dayIndex < maxDays) {
    const dow = dayCursor.toLocaleDateString('en-US', { weekday: 'short' }).toLowerCase().slice(0, 3);
    if (!availableDaysSet.has(dow as any)) {
      dayCursor.setDate(dayCursor.getDate() + 1);
      continue;
    }

    let minutesLeft = onboarding.dailyMinutes;
    const dayTasks: typeof allLessons = [];
    while (lessonIdx < allLessons.length && minutesLeft > 0 && allLessons[lessonIdx].minutes <= minutesLeft + 10) {
      const lesson = allLessons[lessonIdx];
      dayTasks.push(lesson);
      minutesLeft -= lesson.minutes;
      lessonIdx++;
      if (dayTasks.length >= 3) break;
    }

    // Add revision every 5 days
    const isRevisionDay = dayIndex > 0 && dayIndex % 7 === 6;
    // Add mini-project after module groupings
    const isProjectDay = dayIndex > 0 && dayIndex % 10 === 9;

    if (isProjectDay && dayIndex < maxDays - 2) {
      const proj = kb.projects?.[Math.min(Math.floor(dayIndex / 10), (kb.projects?.length || 1) - 1)];
      if (proj) {
        dayTasks.length = 0;
        dayTasks.push({
          title: proj.title,
          description: proj.description,
          objective: proj.objective,
          minutes: onboarding.dailyMinutes,
          type: 'mini_project',
          moduleIdx: Math.floor((modules.length - 1) * (dayIndex / maxDays)),
        });
      }
    } else if (isRevisionDay) {
      dayTasks.push({
        title: 'Weekly Revision',
        description: 'Review concepts from the past week and refresh memory on weak topics.',
        objective: 'Reinforce learning through spaced repetition',
        minutes: Math.min(onboarding.dailyMinutes, 20),
        type: 'revision',
        moduleIdx: 0,
      });
    }

    for (const lesson of dayTasks) {
      tasks.push({
        id: 'task_' + genId(),
        course_id: courseId,
        module_id: modules[lesson.moduleIdx]?.id,
        day_index: dayIndex,
        date_scheduled: dayCursor.toISOString().slice(0, 10),
        title: lesson.title,
        description: lesson.description,
        instructions: lesson.objective + '\n\n' + buildInstructions(lesson, kb),
        estimated_minutes: lesson.minutes,
        learning_objective: lesson.objective,
        resource: { type: 'text', value: 'Refer to your course materials and AI mentor for guidance.' },
        completion_criteria: buildCompletionCriteria(lesson),
        type: lesson.type,
        status: 'pending',
        created_at: new Date().toISOString(),
      });
    }

    // End-of-day quiz task (every day with lessons)
    if (dayTasks.length > 0 && !isProjectDay) {
      tasks.push({
        id: 'task_' + genId(),
        course_id: courseId,
        module_id: dayTasks[0] ? modules[dayTasks[0].moduleIdx]?.id : undefined,
        day_index: dayIndex,
        date_scheduled: dayCursor.toISOString().slice(0, 10),
        title: 'Daily Knowledge Check',
        description: 'Take a short quiz to reinforce what you learned today.',
        instructions: 'Answer 5 questions testing today\'s topics. Review explanations for any missed questions.',
        estimated_minutes: 5,
        learning_objective: 'Verify understanding and identify weak spots',
        completion_criteria: 'Complete the quiz and review all explanations.',
        type: 'quiz',
        status: 'pending',
        created_at: new Date().toISOString(),
      });
    }

    dayCursor.setDate(dayCursor.getDate() + 1);
    dayIndex++;
  }

  return { modules, tasks };
}

function buildInstructions(lesson: any, kb: any): string {
  if (lesson.type === 'exercise') {
    return `Practice: ${lesson.objective}\n\nSpend ${lesson.minutes} minutes on hands-on practice. Write down or build what you learned, then summarize what worked and what was difficult.`;
  }
  if (lesson.type === 'mini_project') {
    return `Project: ${lesson.objective}\n\nBuild a small working example from scratch. Use only what you've learned so far, and be ready to explain your approach.`;
  }
  return `Study the material for ${lesson.title}. Focus on: ${lesson.objective}\n\nAfter reading/watching, write a short summary in your own words and complete the checkpoint.`;
}

function buildCompletionCriteria(lesson: any): string {
  if (lesson.type === 'exercise') return 'Submit your work or notes showing you completed the practice.';
  if (lesson.type === 'mini_project') return 'Submit a link, screenshot, or description of your completed project.';
  if (lesson.type === 'quiz') return 'Answer all questions and review feedback.';
  return 'Mark as complete after studying and completing the summary checkpoint.';
}

// ---------- QUIZ GENERATION ----------

export function generateQuizLocal(course: Course, tasks: Task[], count = 5): Quiz {
  const kb = matchKnowledgeBase(course.skill, course.title);
  const todayTaskTitles = tasks.map((t) => t.title).join(' ').toLowerCase();
  const questions: QuizQuestion[] = [];

  // Pull question bank from KB, filter to relevant topics, pad with generic questions.
  const pool = kb.questions.filter((q) => {
    return !q.topics || q.topics.some((t) => todayTaskTitles.includes(t.toLowerCase()));
  });

  const used = new Set<string>();
  for (const q of pool) {
    if (questions.length >= count) break;
    if (used.has(q.question)) continue;
    used.add(q.question);
    questions.push({
      id: 'q_' + genId(),
      quiz_id: '',
      question: q.question,
      type: q.type,
      options: q.options,
      correct_answer: q.correct_answer,
      explanation: q.explanation,
      topic: q.topic,
      order_index: questions.length,
    });
  }

  // Pad with generic adaptive questions
  while (questions.length < count) {
    const i = questions.length;
    const t = tasks[i % tasks.length];
    questions.push({
      id: 'q_' + genId(),
      quiz_id: '',
      question: `What is the main purpose of "${t.title}" in ${course.skill}?`,
      type: 'short_answer',
      correct_answer: t.learning_objective,
      explanation: `${t.title}: ${t.learning_objective}. Review your notes for a deeper explanation.`,
      topic: t.title,
      order_index: i,
    });
  }

  return {
    id: 'quiz_' + genId(),
    course_id: course.id,
    date: new Date().toISOString().slice(0, 10),
    questions,
    completed: false,
  };
}

// ---------- MENTOR CHAT ----------

export async function mentorChatLocal(
  messages: { role: string; content: string }[],
  context: { course?: Course | null; recentTasks?: Task[]; weakTopics?: string[] }
): Promise<string> {
  const last = messages[messages.length - 1]?.content.toLowerCase() || '';
  const course = context.course;
  const skill = course?.skill || 'your skill';

  if (/explain|what is|how does/.test(last)) {
    return `Sure! Think of it this way: in ${skill}, the concept you're asking about is about applying what you've been practicing recently. Could you tell me a bit more about where you're stuck? I can walk through an example step by step without giving the answer away.`;
  }
  if (/example/.test(last)) {
    return `Here's a simple example related to ${skill}: imagine you're building a small project using what you learned today. Start with the smallest piece that works, then add one feature at a time. What part of today's lesson felt the trickiest?`;
  }
  if (/test|quiz/.test(last)) {
    return `Great idea! Try this: ${context.recentTasks?.[0]?.learning_objective || 'Explain in your own words what you learned today, then solve one short exercise.'} If you want a full mini-quiz, head to the Revision tab.`;
  }
  if (/stuck|wrong|error|help/.test(last)) {
    return `No problem — errors are how we learn. Can you share what you tried and what happened? I'll help you work through it without spoiling the answer. As a hint: revisit the learning objective of your current task and check whether you've covered each step.`;
  }
  if (/15 min|short on time|busy/.test(last)) {
    return `Understood. Today I'd prioritize: 1) Spend 10 minutes on the core lesson for today, focusing only on the learning objective. 2) Save the exercise for tomorrow. 3) Take a 5-minute recap quiz before you stop. I can reschedule the remaining tasks if you'd like.`;
  }
  if (/missed|behind|catch up|rebuild/.test(last)) {
    return `Life happens — no guilt. I can spread missed tasks across the next few days rather than dumping them on you today. Would you like me to rebuild your schedule with a realistic catch-up plan? (I'll ask before changing anything.)`;
  }
  if (/next|what should/.test(last)) {
    const nextTask = context.recentTasks?.find((t) => t.status !== 'completed');
    if (nextTask) {
      return `Your next step is "${nextTask.title}" — ${nextTask.learning_objective}. Aim for about ${nextTask.estimated_minutes} minutes of focused work. Tap it from your Today screen when you're ready.`;
    }
    return `You're all caught up on today's tasks! You could review a weak topic or do a quick revision. Want me to suggest a challenge project?`;
  }

  return `I'm here to help with ${skill}. Ask me to explain a concept, give you an example, test you, help debug an exercise, adjust your schedule if you're short on time, or plan what to do next. What would help right now?`;
}

// ---------- SPACED REPETITION (SM-2 inspired) ----------

export function scheduleRevision(prev: { interval: number; ease: number; reps: number }, performance: number) {
  // performance: 0-5, <3 means struggle
  let { interval, ease, reps } = prev;
  if (performance < 3) {
    reps = 0;
    interval = 1;
  } else {
    if (reps === 0) interval = 1;
    else if (reps === 1) interval = 3;
    else interval = Math.round(interval * ease);
    reps += 1;
  }
  ease = Math.max(1.3, ease + (0.1 - (5 - performance) * (0.08 + (5 - performance) * 0.02)));
  return { interval, ease, reps };
}

// ---------- REMOTE-AWARE WRAPPERS ----------

export async function generateRoadmap(onboarding: OnboardingData): Promise<{ modules: Module[]; tasks: Task[] }> {
  if (hasRemoteAI) {
    const remote = await callRemote('/roadmap', { onboarding });
    if (remote?.modules && remote?.tasks) return remote;
  }
  return generateRoadmapLocal(onboarding);
}

export async function generateQuiz(course: Course, tasks: Task[], count = 5): Promise<Quiz> {
  if (hasRemoteAI) {
    const remote = await callRemote('/quiz', { course, tasks, count });
    if (remote?.questions) return remote;
  }
  return generateQuizLocal(course, tasks, count);
}

export async function mentorReply(
  messages: { role: string; content: string }[],
  context: any
): Promise<string> {
  if (hasRemoteAI) {
    const remote = await callRemote('/mentor', { messages, context });
    if (remote?.reply) return remote.reply;
  }
  return mentorChatLocal(messages, context);
}
