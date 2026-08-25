/**
 * COGNIFY — Your Learning Schedule (Day 4)
 * Personalized timetable generated from the adaptive engine.
 *
 * MOCK SERVICE. Future NestJS backend:
 *   GET  /timetable                → TimetableSession[]
 *   POST /timetable/:id/complete | skip | reschedule
 *
 * Sessions are locally mutable (localStorage) — mutations mirror what the
 * backend would persist.
 */
import type { TimetableSession } from "./types";
import { listMutations, mutate } from "./mutateStore";

const STORE_KEY = "cognify.timetable.v1";

const DEFAULT_SESSIONS: TimetableSession[] = [
  // TODAY
  {
    id: "ts-1",
    period: "today",
    date: "Tue 19 Aug",
    startTime: "16:00",
    endTime: "16:25",
    subjectCode: "MATH",
    subjectLabel: "Mathematics",
    topicId: "t-1-relationship-between-zeros-c",
    topicTitle: "Relationship between Zeros & Coefficients",
    activityType: "concept-repair",
    activityLabel: "Concept repair",
    durationMinutes: 25,
    priority: "high",
    reason: "You've been struggling with this concept recently. A quick diagram-based review will help clear things up.",
    status: "scheduled",
  },
  {
    id: "ts-2",
    period: "today",
    date: "Tue 19 Aug",
    startTime: "17:00",
    endTime: "17:15",
    subjectCode: "SST",
    subjectLabel: "Social Science",
    topicId: "t-0-the-first-world-war-non-coop",
    topicTitle: "The First World War & Non-Cooperation",
    activityType: "retrieval-practice",
    activityLabel: "Retrieval practice",
    durationMinutes: 10,
    priority: "high",
    reason: "It's been a week since you last studied this. Let's refresh your memory.",
    status: "scheduled",
  },
  {
    id: "ts-3",
    period: "today",
    date: "Tue 19 Aug",
    startTime: "18:00",
    endTime: "18:15",
    subjectCode: "SCI",
    subjectLabel: "Science",
    topicId: "t-1-types-of-reactions",
    topicTitle: "Types of Reactions",
    activityType: "timed-practice",
    activityLabel: "Timed practice",
    durationMinutes: 15,
    priority: "medium",
    reason: "You've made a few mistakes here lately. Let's try some new types of questions to master it.",
    status: "scheduled",
  },
  {
    id: "ts-4",
    period: "today",
    date: "Tue 19 Aug",
    startTime: "19:00",
    endTime: "19:10",
    subjectCode: "HIN",
    subjectLabel: "Hindi — Course A",
    topicId: "t-1-lhasa-ki-or",
    topicTitle: "ल्हासा की ओर",
    activityType: "revision",
    activityLabel: "Quick revision",
    durationMinutes: 10,
    priority: "low",
    reason: "Time to check in on your Hindi progress to stay on track for your weekly goal.",
    status: "scheduled",
  },
  // THIS WEEK
  {
    id: "ts-5",
    period: "week",
    date: "Wed 20 Aug",
    startTime: "17:30",
    endTime: "17:45",
    subjectCode: "MATH",
    subjectLabel: "Mathematics",
    topicId: "t-1-completing-the-square",
    topicTitle: "Completing the Square",
    activityType: "concept-repair",
    activityLabel: "Concept repair",
    durationMinutes: 15,
    priority: "high",
    reason: "This topic is tricky! Let's break it down into smaller, easier steps today.",
    status: "scheduled",
  },
  {
    id: "ts-6",
    period: "week",
    date: "Wed 20 Aug",
    startTime: "18:30",
    endTime: "18:50",
    subjectCode: "SCI",
    subjectLabel: "Science",
    topicId: "t-1-nutrition-in-humans",
    topicTitle: "Nutrition in Humans",
    activityType: "concept-repair",
    activityLabel: "Concept repair",
    durationMinutes: 20,
    priority: "medium",
    reason: "Let's use a labeling activity to help you remember the digestion pathway better.",
    status: "scheduled",
  },
  {
    id: "ts-7",
    period: "week",
    date: "Thu 21 Aug",
    startTime: "17:00",
    endTime: "17:20",
    subjectCode: "MATH",
    subjectLabel: "Mathematics",
    topicId: "t-1-irrational-numbers-proofs",
    topicTitle: "Irrational Numbers & Proofs",
    activityType: "timed-practice",
    activityLabel: "Timed practice",
    durationMinutes: 20,
    priority: "high",
    reason: "You're slightly behind on this topic. Let's catch up with a guided practice session.",
    status: "scheduled",
  },
  {
    id: "ts-8",
    period: "week",
    date: "Fri 22 Aug",
    startTime: "17:30",
    endTime: "17:50",
    subjectCode: "SST",
    subjectLabel: "Social Science",
    topicId: "t-1-making-of-nationalism-in-ita",
    topicTitle: "Making of Nationalism in Italy & Germany",
    activityType: "concept-repair",
    activityLabel: "Concept repair",
    durationMinutes: 20,
    priority: "high",
    reason: "A quick timeline review will make these historical events much easier to remember.",
    status: "scheduled",
  },
  {
    id: "ts-9",
    period: "week",
    date: "Sat 23 Aug",
    startTime: "10:00",
    endTime: "10:25",
    subjectCode: "MATH",
    subjectLabel: "Mathematics",
    topicId: "t-2-nature-of-roots-discriminant",
    topicTitle: "Nature of Roots & Discriminant",
    activityType: "teach-back",
    activityLabel: "Teach-back challenge",
    durationMinutes: 25,
    priority: "medium",
    reason: "Try explaining this new topic in your own words to see how much you already know.",
    status: "scheduled",
  },
  // UPCOMING
  {
    id: "ts-10",
    period: "upcoming",
    date: "Mon 25 Aug",
    startTime: "17:00",
    endTime: "17:15",
    subjectCode: "SCI",
    subjectLabel: "Science",
    topicId: "t-1-ph-scale-strength",
    topicTitle: "pH Scale & Strength",
    activityType: "revision",
    activityLabel: "Revision",
    durationMinutes: 15,
    priority: "medium",
    reason: "Let's practice these questions with different wording to build your confidence.",
    status: "scheduled",
  },
  {
    id: "ts-11",
    period: "upcoming",
    date: "Tue 26 Aug",
    startTime: "18:00",
    endTime: "18:25",
    subjectCode: "MATH",
    subjectLabel: "Mathematics",
    topicId: "t-1-substitution-elimination-met",
    topicTitle: "Substitution & Elimination Methods",
    activityType: "timed-practice",
    activityLabel: "Timed practice",
    durationMinutes: 25,
    priority: "medium",
    reason: "You've been rushing these lately. Let's practice a few with extra focus on checking your work.",
    status: "scheduled",
  },
  {
    id: "ts-12",
    period: "upcoming",
    date: "Wed 27 Aug",
    startTime: "17:30",
    endTime: "17:45",
    subjectCode: "ENG",
    subjectLabel: "English",
    topicId: "t-1-nelson-mandela-long-walk-to-",
    topicTitle: "Nelson Mandela: Long Walk to Freedom",
    activityType: "revision",
    activityLabel: "Revision",
    durationMinutes: 15,
    priority: "low",
    reason: "A quick review of your notes will get you ready for the upcoming unit test.",
    status: "scheduled",
  },
];

/* ------------------------------------------------------------------ */
/* localStorage-backed session store                                    */
/* ------------------------------------------------------------------ */

interface Mutation {
  sessionId: string;
  status: TimetableSession["status"];
  rescheduledTo?: string;
}

export function timetableSessions(): TimetableSession[] {
  const mutations = listMutations<Mutation>(STORE_KEY);
  return DEFAULT_SESSIONS.map((s) => {
    const m = mutations.find((x) => x.sessionId === s.id);
    if (!m) return s;
    return { ...s, status: m.status, rescheduledTo: m.rescheduledTo };
  });
}

export function completeSession(id: string): void {
  mutate<Mutation>(STORE_KEY, { sessionId: id, status: "completed" });
}

export function skipSession(id: string): void {
  mutate<Mutation>(STORE_KEY, { sessionId: id, status: "skipped" });
}

export function rescheduleSession(id: string, to: string): void {
  mutate<Mutation>(STORE_KEY, {
    sessionId: id,
    status: "rescheduled",
    rescheduledTo: to,
  });
}

export function startSession(id: string): void {
  mutate<Mutation>(STORE_KEY, { sessionId: id, status: "in-progress" });
}

export function sessionsByPeriod(p: TimetableSession["period"]): TimetableSession[] {
  return timetableSessions().filter((s) => s.period === p);
}

export function todaySessionCount(): number {
  return sessionsByPeriod("today").filter((s) => s.status === "scheduled").length;
}
