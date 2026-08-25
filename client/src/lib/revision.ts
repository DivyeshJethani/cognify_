/**
 * COGNIFY — Spaced Revision (Day 4)
 * Schedule buckets: due today / due tomorrow / upcoming / mastered
 *
 * MOCK SERVICE. Future NestJS backend:
 *   GET /revision/schedule → RevisionEntry[]
 *   POST /revision/:topic/session/:id → retention result
 *
 * Retention estimates come from each student's personal decay curve
 * (this student's average decay ≈ 7 days without a check).
 */
import { boards } from "./mockData";
import { topicPath } from "./curriculum";
import type { LearningFormat, RevisionBucket, RevisionEntry } from "./types";

interface EntrySeed {
  topicId: string;
  mastery: number;
  lastStudiedIso: string; // ISO of last study session
  retentionEstimate: number;
  priority: RevisionEntry["priority"];
  priorityReason: string;
  format: LearningFormat;
  minutes: number;
}

const SEEDS: EntrySeed[] = [
  // DUE TODAY
  {
    topicId: "t-1-irrational-numbers-proofs",
    mastery: 38,
    lastStudiedIso: "2026-08-13",
    retentionEstimate: 44,
    priority: "high",
    priorityReason: "Weak topic with interval already lapsed 2 days",
    format: "worked-example",
    minutes: 15,
  },
  {
    topicId: "t-1-relationship-between-zeros-c",
    mastery: 27,
    lastStudiedIso: "2026-08-18",
    retentionEstimate: 61,
    priority: "high",
    priorityReason: "Confidence-check flagged overestimation yesterday",
    format: "worked-example",
    minutes: 10,
  },
  {
    topicId: "t-1-nutrition-in-humans",
    mastery: 33,
    lastStudiedIso: "2026-08-18",
    retentionEstimate: 55,
    priority: "medium",
    priorityReason: "Weak topic on the standard 1-day revisit",
    format: "step-by-step",
    minutes: 12,
  },
  // DUE TOMORROW
  {
    topicId: "t-1-types-of-reactions",
    mastery: 41,
    lastStudiedIso: "2026-08-17",
    retentionEstimate: 63,
    priority: "high",
    priorityReason: "Conceptual error cluster; interval tightened to 4 days",
    format: "worked-example",
    minutes: 10,
  },
  {
    topicId: "t-1-completing-the-square",
    mastery: 19,
    lastStudiedIso: "2026-08-16",
    retentionEstimate: 49,
    priority: "high",
    priorityReason: "Procedural gap; repair in progress",
    format: "step-by-step",
    minutes: 15,
  },
  {
    topicId: "t-1-lhasa-ki-or",
    mastery: 30,
    lastStudiedIso: "2026-08-16",
    retentionEstimate: 58,
    priority: "medium",
    priorityReason: "Vocabulary recall gap, 3-day interval",
    format: "verbal-explanation",
    minutes: 10,
  },
  // UPCOMING
  {
    topicId: "t-0-the-first-world-war-non-coop",
    mastery: 58,
    lastStudiedIso: "2026-08-13",
    retentionEstimate: 68,
    priority: "high",
    priorityReason: "Recall cluster — retention crosses your 7-day decay line on 20 Aug",
    format: "analogy",
    minutes: 10,
  },
  {
    topicId: "t-1-making-of-nationalism-in-ita",
    mastery: 22,
    lastStudiedIso: "2026-08-14",
    retentionEstimate: 52,
    priority: "high",
    priorityReason: "Weak topic with interval lapsed 1 day",
    format: "step-by-step",
    minutes: 15,
  },
  {
    topicId: "t-1-substitution-elimination-met",
    mastery: 55,
    lastStudiedIso: "2026-08-14",
    retentionEstimate: 66,
    priority: "medium",
    priorityReason: "Careless-error pattern; 5-day interval",
    format: "worked-example",
    minutes: 12,
  },
  {
    topicId: "t-1-ph-scale-strength",
    mastery: 52,
    lastStudiedIso: "2026-08-15",
    retentionEstimate: 71,
    priority: "medium",
    priorityReason: "Interpretation errors under unfamiliar wording",
    format: "worked-example",
    minutes: 10,
  },
  {
    topicId: "t-1-nelson-mandela-long-walk-to-",
    mastery: 44,
    lastStudiedIso: "2026-08-17",
    retentionEstimate: 74,
    priority: "low",
    priorityReason: "Standard 2-day interval",
    format: "verbal-explanation",
    minutes: 10,
  },
  // MASTERED (shown for record)
  {
    topicId: "t-0-zeros-of-a-polynomial",
    mastery: 92,
    lastStudiedIso: "2026-08-07",
    retentionEstimate: 90,
    priority: "low",
    priorityReason: "Mastery confirmed across 3 consecutive checks",
    format: "worked-example",
    minutes: 0,
  },
  {
    topicId: "t-0-nutrition-in-plants",
    mastery: 95,
    lastStudiedIso: "2026-08-05",
    retentionEstimate: 91,
    priority: "low",
    priorityReason: "Mastery confirmed; monthly maintenance check only",
    format: "worked-example",
    minutes: 0,
  },
];

export function revisionSchedule(): RevisionEntry[] {
  return SEEDS.map((s) => {
    const meta = topicPath(s.topicId);
    const now = new Date("2026-08-19T09:00:00Z"); // fixed "today" for the demo
    const last = new Date(s.lastStudiedIso);
    const daysSince = Math.round((now.getTime() - last.getTime()) / 86400000);
    const bucket: RevisionBucket =
      daysSince <= 0 ? "due-today" : daysSince <= 1 ? "due-tomorrow" : "upcoming";
    const nextReview =
      bucket === "due-today"
        ? "TODAY"
        : bucket === "due-tomorrow"
          ? "TOMORROW"
          : s.topicId === "t-0-the-first-world-war-non-coop"
            ? "Thu 20 Aug"
            : `${daysSince + 1} day${daysSince > 0 ? "s" : ""} from now`;
    const lastStudiedRel =
      daysSince === 0 ? "today" : daysSince === 1 ? "yesterday" : `${daysSince} days ago`;
    return {
      topicId: s.topicId,
      topicTitle: meta?.topic.title ?? s.topicId,
      subjectCode: meta?.subject.code ?? "",
      subjectLabel: meta?.subject.name ?? "",
      chapterTitle: meta?.chapter.title ?? "",
      mastery: s.mastery,
      lastStudied: lastStudiedRel,
      lastStudiedIso: s.lastStudiedIso,
      nextReview,
      retentionEstimate: s.retentionEstimate,
      priority: s.priority,
      priorityReason: s.priorityReason,
      recommendedFormat: s.format,
      bucket,
      estimatedMinutes: s.minutes,
    };
  });
}

export function bucketLabel(b: RevisionBucket): string {
  return {
    "due-today": "Due today",
    "due-tomorrow": "Due tomorrow",
    upcoming: "Upcoming",
    mastered: "Mastered",
  }[b];
}

export function buckets(): RevisionBucket[] {
  return ["due-today", "due-tomorrow", "upcoming", "mastered"];
}

export function revisionEntriesByBucket(b: RevisionBucket): RevisionEntry[] {
  return revisionSchedule().filter((e) => e.bucket === b);
}

/* ------------------------------------------------------------------ */
/* Revision session result (mock algorithm)                             */
/* ------------------------------------------------------------------ */

export interface RevisionSessionResult {
  topicId: string;
  topicTitle: string;
  previousMastery: number;
  recallRound1: number; // recall
  recallRound2: number; // application
  confidenceRound3: number; // confidence
  decision: string;
  nextReviewIn: string;
  dnaNote: string;
}

export function revisionResultFor(topicId: string): RevisionSessionResult {
  const entry = revisionSchedule().find((e) => e.topicId === topicId);
  const recall1 = Math.max(40, (entry?.retentionEstimate ?? 70) - 8);
  const recall2 = recall1 + 6;
  const conf3 = 74;
  return {
    topicId,
    topicTitle: entry?.topicTitle ?? topicId,
    previousMastery: entry?.mastery ?? 60,
    recallRound1: recall1,
    recallRound2: recall2,
    confidenceRound3: conf3,
    decision:
      recall1 >= 70
        ? "Retention is healthy. Interval is being extended."
        : "Recall is decaying. Another review is scheduled earlier than the standard interval.",
    nextReviewIn: recall1 >= 70 ? "6 days" : "3 days",
    dnaNote:
      "This reading updates the Retention spacing dimension of your Learning DNA (evidence 72%).",
  };
}
