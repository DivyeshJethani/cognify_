/**
 * COGNIFY Day 6 — Journey data services (mock).
 *
 * Three small services that make the day feel intentional without
 * building a full scheduling engine:
 *
 * 1. todaySequence()  — the "TODAY → AFTER TODAY" ordered plan
 * 2. continuationItems() — the Continue Learning page states
 * 3. recentSearches — localStorage-backed recent search persistence
 *
 * All three are deliberately mock-shaped so a backend can replace
 * them with API calls returning the same interfaces.
 */
import { topicAlias } from "./curriculum";
import { revisionSchedule } from "./revision";
import { recentMistakes } from "./mistakes";
import { flowStateFor } from "./learningSessionFlow";
import type { RecommendedAction } from "./types";

/* ---------- 1. Today → Next ---------- */
export type TodayItemKind = "revise" | "practice" | "teach-back" | "learn";

export interface TodayItem {
  number: number;
  kind: TodayItemKind;
  topicId: string;
  topicTitle: string;
  subjectCode: string;
  minutes: number;
  reason: string;
}

export function todaySequence(): { items: TodayItem[]; afterToday: { topicTitle: string; reason: string } } {
  const due = revisionSchedule()
    .filter((e) => e.bucket === "due-today")
    .slice(0, 1)
    .map<TodayItem | null>((e) => ({
      number: 0,
      kind: "revise",
      topicId: e.topicId,
      topicTitle: e.topicTitle,
      subjectCode: e.subjectCode,
      minutes: e.estimatedMinutes,
      reason: "Your revision interval is due today.",
    }))[0];

  const mistakesByTopic = new Map(recentMistakes().map((m) => [m.topicId, m.topicTitle]));
  const practice =
    mistakesByTopic.size > 0
      ? {
          number: 0,
          kind: "practice" as TodayItemKind,
          topicId: recentMistakes()[0].topicId,
          topicTitle: recentMistakes()[0].topicTitle,
          subjectCode: recentMistakes()[0].subjectCode,
          minutes: 18,
          reason: "A recent mistake pattern needs a targeted pass.",
        }
      : null;

  const unfinished = flowStateFor("r-1-reaction-drill");
  const teachBack: TodayItem =
    unfinished && (unfinished.stage === "retrieval" || unfinished.stage === "practice")
      ? {
          number: 0,
          kind: "teach-back",
          topicId: "t-1-types-of-reactions",
          topicTitle: "Nature of Roots & Discriminant",
          subjectCode: "MATH",
          minutes: 10,
          reason: "You opened a teach-back earlier; finishing it closes the loop.",
        }
      : {
          number: 0,
          kind: "teach-back",
          topicId: "t-6-quadratic-formula-applications",
          topicTitle: "Nature of Roots & Discriminant",
          subjectCode: "MATH",
          minutes: 10,
          reason: "Teaching this back cements it faster than anything else.",
        };

  const items: TodayItem[] = [due, practice, teachBack].filter((x): x is TodayItem => !!x);
  items.forEach((it, i) => (it.number = i + 1));

  return {
    items,
    afterToday: {
      topicTitle: "Types of Reactions",
      reason: "It is a prerequisite for two topics you are currently learning.",
    },
  };
}

/* ---------- 2. Continue Learning states ---------- */
export type ContinuationState = "continue" | "resume" | "due" | "retry" | "saved";

export interface ContinuationItem {
  id: string;
  state: ContinuationState;
  resourceId: string | null;
  topicId: string;
  title: string;
  subtitle: string;
  detail: string;
  actionLabel: string; // CONTINUE / RESUME / REVISE / RETRY / OPEN
  href: string;
}

function watched(resourceId: string): number | null {
  const flow = flowStateFor(resourceId);
  if (!flow) return null;
  if (flow.stage === "complete") return 100;
  // mock: deterministic pseudo-progress so the demo looks alive
  const hash = resourceId.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
  const base = 25 + (hash % 40);
  return flow.stage === "watching" ? Math.min(90, base) : base;
}

export function continuationItems(): ContinuationItem[] {
  const items: ContinuationItem[] = [];

  // CONTINUE — a video lecture partially watched
  const continuePct = watched("r-2-zeros-coefficients-lecture");
  if (continuePct !== null && continuePct < 100) {
    items.push({
      id: "c-continue",
      state: "continue",
      resourceId: "r-2-zeros-coefficients-lecture",
      topicId: "t-3-relationship-zeros-coefficients",
      title: "Relationship Between Zeros & Coefficients",
      subtitle: "Video lecture · Mathematics",
      detail: `${continuePct}% watched — 8 min left`,
      actionLabel: "CONTINUE",
      href: `/session/r-2-zeros-coefficients-lecture?topic=t-3-relationship-zeros-coefficients`,
    });
  }

  // RESUME — unfinished teach-back
  items.push({
    id: "c-resume",
    state: "resume",
    resourceId: null,
    topicId: "t-6-quadratic-formula-applications",
    title: "Teach-back — Nature of Roots",
    subtitle: "Teach Cognify · Mathematics",
    detail: "Explanation unfinished",
    actionLabel: "RESUME",
    href: `/teach`,
  });

  // DUE — revision due today
  const due = revisionSchedule().find((e) => e.bucket === "due-today");
  if (due) {
    items.push({
      id: "c-due",
      state: "due",
      resourceId: null,
      topicId: due.topicId,
      title: due.topicTitle,
      subtitle: `Revision · ${due.subjectLabel}`,
      detail: `Revision due ${due.nextReview.toLowerCase()}`,
      actionLabel: "REVISE",
      href: `/revision`,
    });
  }

  // RETRY — practice accuracy dropped (mock error-pattern signal)
  const mistakeTopic = recentMistakes()[0];
  if (mistakeTopic) {
    items.push({
      id: "c-retry",
      state: "retry",
      resourceId: null,
      topicId: mistakeTopic.topicId,
      title: `${mistakeTopic.topicTitle}`,
      subtitle: `Practice · ${mistakeTopic.subjectLabel}`,
      detail: "Practice accuracy dropped on last pass",
      actionLabel: "RETRY",
      href: `/mistakes`,
    });
  }

  // SAVED — bookmarked resource
  items.push({
    id: "c-saved",
    state: "saved",
    resourceId: "r-8-ncert-real-numbers-ch1",
    topicId: "t-0-euclid-s-division-lemma-hcf",
    title: "NCERT Chapter 1 — Real Numbers",
    subtitle: "NCERT / Textbook · Mathematics",
    detail: "Bookmarked during your last session",
    actionLabel: "OPEN",
    href: `/library`,
  });

  return items;
}

/* ---------- 3. Recent searches ---------- */
const RECENT_KEY = "cognify.recent-searches.v1";

export function getRecentSearches(): string[] {
  try {
    const raw = localStorage.getItem(RECENT_KEY);
    if (!raw) return [];
    const arr = JSON.parse(raw);
    return Array.isArray(arr) ? arr.slice(0, 5) : [];
  } catch {
    return [];
  }
}

export function pushRecentSearch(query: string): string[] {
  const q = query.trim();
  if (!q) return getRecentSearches();
  const current = getRecentSearches().filter((s) => s.toLowerCase() !== q.toLowerCase());
  const next = [q, ...current].slice(0, 5);
  try {
    localStorage.setItem(RECENT_KEY, JSON.stringify(next));
  } catch {
    /* storage unavailable */
  }
  return next;
}

/* Resolve alias-form topic ids for href building */
export { topicAlias };
