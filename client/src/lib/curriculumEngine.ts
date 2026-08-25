/**
 * COGNIFY — Curriculum Engine (mock)
 *
 * Turns the raw Board/Classroom/Subject data from mockData into a
 * genuine curriculum map: subject overviews with mastery aggregates,
 * chapter ledgers with priority/revision signals, and the full
 * Board → Class → Subject → Chapter → Topic → LearningObjective
 * breadcrumb for any topic.
 *
 * When the CBSE curriculum pipeline ships, this module is replaced by
 * API calls — every function is a thin query over the same shapes.
 */
import { boards, allTopics, findSubjectForClass } from "./mockData";
import { topicAlias, topicPath } from "./curriculum";
import type {
  Subject,
  Chapter,
  Topic,
  Classroom,
} from "./types";
import { revisionSchedule } from "./revision";

export const subjectNames: Record<string, string> = {
  MATH: "Mathematics",
  SCI: "Science",
  SST: "Social Science",
  ENG: "English",
  HIN: "Hindi — Course A",
  SKT: "Sanskrit",
};

export function cbseClass10(): Classroom {
  const board = boards.find((b) => b.id === "cbse")!;
  return board.classes.find((c) => c.id === "cbse-10")!;
}

/** Breadcrumb context for the class a topic actually belongs to. */
function activeContextFor(subjectId: string): { boardName: string; className: string } {
  const ctx = getStudyContextSafe();
  if (ctx) {
    const cls = classById(ctx.boardId, ctx.classId);
    if (cls) return { boardName: boards.find((b) => b.id === ctx.boardId)?.name ?? "CBSE", className: cls.name };
  }
  return { boardName: "CBSE", className: "Class 10" };
}

export function getStudyContextSafe(): { boardId: string; classId: string; subjectId: string } | null {
  try {
    const raw = localStorage.getItem("cognify.profile-context.v1");
    if (!raw) return null;
    const c = JSON.parse(raw) as { boardId?: string; classId?: string; subjectFocus?: string | null };
    return {
      boardId: c.boardId ?? "cbse",
      classId: c.classId ?? "cbse-10",
      subjectId: c.subjectFocus ?? "math",
    };
  } catch {
    return null;
  }
}

export function classById(boardId: string, classId: string): Classroom | null {
  const board = boards.find((b) => b.id === boardId);
  return board?.classes.find((c) => c.id === classId) ?? null;
}

/* ---------- Subject overview ---------- */

export interface ChapterOverview {
  chapter: Chapter;
  topicCount: number;
  mastery: number; // average mastery across topics
  lastStudied: string | null; // most recent lastStudied
  nextRevision: string | null; // nearest revision due signal
  revisionEntries: number; // how many topics have revision scheduled
  topicsNeedingAttention: number; // mastery < 60
  topicsStudied: number;
  topicsNew: number;
  masteryState: "strong" | "developing" | "needs-attention";
}

export interface SubjectOverview {
  subject: Subject;
  topicCount: number;
  mastery: number;
  topicsStudied: number;
  topicsNeedingAttention: number;
  upcomingRevisions: string[]; // topic titles due within 7 days
  chapters: ChapterOverview[];
  recommendedAction: string | null;
  recommendedActionReason: string | null;
}

const RECENT_ISO = "2026-08-19";

export function subjectOverview(
  subjectId: string,
  boardId: string = "cbse",
  classId: string = "cbse-10"
): SubjectOverview | null {
  const cls = classById(boardId, classId);
  if (!cls) return null;
  // Prefer the class-appropriate variant (Class 8/9) when available.
  const subject =
    findSubjectForClass(boardId, classId, subjectId) ??
    cls.subjects.find((s) => s.id === subjectId) ??
    null;
  if (!subject) return null;

  const chapters = subject.chapters.map((chapter) =>
    chapterOverview(subject, chapter)
  );
  const all = chapters.flatMap((c) => c.chapter.topics);
  const masteries = all.map((t) => t.mastery);
  const avg = masteries.length
    ? Math.round(masteries.reduce((a, b) => a + b, 0) / masteries.length)
    : 0;
  const studied = all.filter((t) => t.lastStudied !== null);
  const attention = all.filter((t) => t.mastery > 0 && t.mastery < 60);

  // Upcoming revisions within 7 days from the spaced-revision service
  const schedule = revisionSchedule();
  const dueSoon = schedule
    .filter(
      (e) =>
        (e.bucket === "due-today" || e.bucket === "due-tomorrow") &&
        e.subjectCode === subject.code
    )
    .slice(0, 3)
    .map((e) => e.topicTitle);

  const low = all.filter((t) => t.mastery <= 45);
  const action = low.length
    ? low.length === 1
      ? "revise"
      : "revise"
    : "practice";
  return {
    subject,
    topicCount: all.length,
    mastery: avg,
    topicsStudied: studied.length,
    topicsNeedingAttention: attention.length,
    upcomingRevisions: dueSoon,
    chapters,
    recommendedAction: action,
    recommendedActionReason:
      attention.length > 0
        ? `${attention.length} topic${attention.length > 1 ? "s" : ""} below your proficiency threshold. Revision windows are already open in your timetable.`
        : "No topic below threshold. Focused practice keeps the strong ones strong.",
  };
}

function chapterOverview(subject: Subject, chapter: Chapter): ChapterOverview {
  const topics = chapter.topics;
  const masteries = topics.map((t) => t.mastery);
  const avg = masteries.length
    ? Math.round(masteries.reduce((a, b) => a + b, 0) / masteries.length)
    : 0;
  const studied = topics.filter((t) => t.lastStudied !== null);
  const newest = studied.length
    ? studied
        .map((t) => t.lastStudied!)
        .sort((a, b) => b.localeCompare(a))[0]
    : null;
  const attention = topics.filter((t) => t.mastery > 0 && t.mastery < 60);
  const revisionEntries = topics.filter((t) => t.revisionDueInDays !== null).length;
  const dueSoon = topics.filter(
    (t) => t.revisionDueInDays !== null && t.revisionDueInDays <= 3
  );
  const newTopics = topics.filter((t) => t.state === "new");
  return {
    chapter,
    topicCount: topics.length,
    mastery: avg,
    lastStudied: newest,
    nextRevision: dueSoon.length
      ? dueSoon[0].revisionStatus === "overdue"
        ? "Overdue"
        : "Within 3 days"
      : revisionEntries
        ? "Scheduled"
        : null,
    revisionEntries,
    topicsNeedingAttention: attention.length,
    topicsStudied: studied.length,
    topicsNew: newTopics.length,
    masteryState:
      avg >= 70 ? "strong" : avg >= 45 ? "developing" : "needs-attention",
  };
}

export function daysSince(iso: string): number {
  return Math.round(
    (Date.now() - new Date(iso).getTime()) / 86400000
  );
}

export function relativeDate(iso: string): string {
  const d = daysSince(iso);
  if (d < 0) return "Today";
  if (d === 0) return "Today";
  if (d === 1) return "Yesterday";
  if (d <= 6) return `${d} days ago`;
  if (d <= 29) return `${Math.round(d / 7)} week${d >= 14 ? "s" : ""} ago`;
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
  });
}

/* ---------- Full breadcrumb for any topic ---------- */

export interface TopicBreadcrumb {
  board: string;
  className: string;
  subjectId: string;
  subjectName: string;
  subjectCode: string;
  chapterTitle: string;
  topic: Topic;
  alias: string | null;
}

export function topicBreadcrumb(topicId: string): TopicBreadcrumb | null {
  const path = topicPath(topicId);
  if (!path) return null;
  const alias = topicAlias(topicId);
  // Read the active class context so breadcrumbs stay honest for
  // Class 8/9 students whose topics live in the variant datasets.
  const { boardName, className } = activeContextFor(path.subject.id);
  return {
    board: boardName,
    className,
    subjectId: path.subject.id,
    subjectName: path.subject.name,
    subjectCode: path.subject.code,
    chapterTitle: path.chapter.title,
    topic: path.topic,
    alias,
  };
}

/* ---------- Priority signals ---------- */

export type ChapterPriority = "high" | "medium" | "low" | "stable";

export function chapterPriority(overview: ChapterOverview): ChapterPriority {
  if (overview.topicsNeedingAttention > 0 && overview.mastery < 60) return "high";
  if (overview.topicsNeedingAttention > 0) return "medium";
  if (overview.nextRevision) return "medium";
  if (overview.mastery >= 70) return "stable";
  return "low";
}
