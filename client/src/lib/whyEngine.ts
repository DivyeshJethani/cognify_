/**
 * COGNIFY Day 6 — "Why Cognify?" engine (mock service).
 *
 * One place every surface asks for an explanation of WHY something is
 * shown, recommended or scheduled. A future backend can replace each
 * generator with a single explain() API returning the same shape.
 *
 * Style: Scholar's Atelier — editorial, restrained, evidence-first.
 */
import { readingForTopic } from "./confidence";
import { categoryLabel, mistakeById, recentMistakes } from "./mistakes";
import { revisionSchedule } from "./revision";
import { findTopicByIdOrAlias } from "./curriculum";
import type { MistakeCategory } from "./types";

export type WhyKind =
  | "why-this-topic"
  | "why-this-resource"
  | "why-this-practice"
  | "why-this-revision"
  | "why-now";

export interface WhyReason {
  kind: WhyKind;
  /** short headline, e.g. "Your recent mistakes suggest a gap here." */
  headline: string;
  /** one-sentence evidence-backed detail */
  detail: string;
  /** optional evidence labels, e.g. ["BASED ON 4 MISTAKES"] */
  evidence: string[];
}

function recentMistakesFor(topicId: string) {
  return recentMistakes().filter((m) => m.topicId === topicId);
}

function categoryOf(topicId: string): MistakeCategory | null {
  const matches = recentMistakesFor(topicId);
  if (matches.length === 0) return null;
  const counts = matches.map((m) => m.category);
  const first = counts[0];
  let best = first;
  let bestN = 0;
  for (const c of counts) {
    const n = counts.filter((x) => x === c).length;
    if (n > bestN) {
      best = c;
      bestN = n;
    }
  }
  return best;
}

function evidenceLabels(category: MistakeCategory | null, count: number): string[] {
  if (!category || count === 0) return [];
  return [`BASED ON ${count} ${count === 1 ? "MISTAKE" : "MISTAKES"}`, category.toUpperCase()];
}

export function whyTopic(topicId: string): WhyReason {
  const matches = recentMistakesFor(topicId);
  if (matches.length >= 2) {
    const cat = categoryOf(topicId) ?? matches[matches.length - 1].category;
    return {
      kind: "why-this-topic",
      headline: "Your recent mistakes suggest a gap in this topic.",
      detail: `${matches.length} recent mistakes carry a ${categoryLabel(cat)} pattern. Cognify surfaces this topic before it becomes revision pressure.`,
      evidence: evidenceLabels(cat, matches.length),
    };
  }
  const reading = readingForTopic(topicId);
  if (reading && reading.gap > 15) {
    return {
      kind: "why-this-topic",
      headline: "Your confidence and performance don't agree here.",
      detail: `You rated this topic ${reading.selfReported}% confident, but your last performance read ${reading.actualPerformance}%. Cognify prioritises calibration before new material.`,
      evidence: ["CONFIDENCE CALIBRATION", `GAP +${reading.gap}%`],
    };
  }
  const topic = findTopicByIdOrAlias(topicId);
  if (topic) {
    return {
      kind: "why-this-topic",
      headline: "A prerequisite for what you are learning now.",
      detail: `This topic underpins the current work in your learning path. Early evidence suggests a pass here compounds across later chapters.`,
      evidence: ["CURRENT SIGNAL", "EARLY EVIDENCE"],
    };
  }
  return {
    kind: "why-this-topic",
    headline: "Next logical step in your path.",
    detail: "No strong signal yet — this is the recommended next topic in your curriculum sequence.",
    evidence: ["CURRICULUM SEQUENCE"],
  };
}

export function whyResource(topicId: string, format: string): WhyReason {
  const cat = categoryOf(topicId);
  if (cat === "conceptual" || cat === "procedural") {
    return {
      kind: "why-this-resource",
      headline: "You retain more from this format.",
      detail: `Your format-experiment results on ${format} outperform your weaker formats for ${categoryLabel(cat)} gaps. Cognify orders explanations accordingly.`,
      evidence: ["BASED ON RECENT SESSIONS", format.toUpperCase()],
    };
  }
  return {
    kind: "why-this-resource",
    headline: "Matches your current learning objective.",
    detail: "The resource's objective aligns with the topic objective Cognify flagged for this session.",
    evidence: ["OBJECTIVE ALIGNMENT"],
  };
}

export function whyPractice(topicId: string): WhyReason {
  const matches = recentMistakesFor(topicId);
  if (matches.length >= 1) {
    const cat = categoryOf(topicId);
    return {
      kind: "why-this-practice",
      headline: "Your last sessions left a repeatable error pattern.",
      detail: `${matches.length} recent mistakes${cat ? ` (${categoryLabel(cat)} type)` : ""}. Targeted practice is the prescribed fix.`,
      evidence: evidenceLabels(cat, matches.length),
    };
  }
  return {
    kind: "why-this-practice",
    headline: "Practice consolidates what you just learned.",
    detail: "Active retrieval after a learning session strengthens the topic file faster than re-watching.",
    evidence: ["BASED ON RECENT SESSIONS"],
  };
}

function revisionEntryFor(topicId: string) {
  return revisionSchedule().find((e) => e.topicId === topicId) ?? null;
}

export function whyRevision(topicId: string): WhyReason {
  const entry = revisionEntryFor(topicId);
  if (entry && (entry.bucket === "due-today" || entry.bucket === "due-tomorrow")) {
    return {
      kind: "why-this-revision",
      headline: "Your revision interval is due.",
      detail: `The spaced schedule for this topic places it in the ${entry.bucket} bucket. A short retrieval pass restores retention.`,
      evidence: ["SPACED SCHEDULE", entry.bucket.toUpperCase()],
    };
  }
  return {
    kind: "why-this-revision",
    headline: "A scheduled maintenance pass.",
    detail: "Retention decays over time; Cognify schedules light retrievals before the curve falls too far.",
    evidence: ["RETENTION MODEL"],
  };
}

export { revisionEntryFor };

export function whyNow(topicId: string): WhyReason {
  const matches = recentMistakesFor(topicId);
  if (matches.length >= 2) {
    return {
      kind: "why-now",
      headline: "Today, while the pattern is fresh.",
      detail: `${matches.length} recent mistakes on this topic form a repeatable pattern. Intervening now is cheaper than revisiting it before the exam.`,
      evidence: ["CURRENT SIGNAL", `BASED ON ${matches.length} MISTAKES`],
    };
  }
  return {
    kind: "why-now",
    headline: "It unlocks two topics you are learning.",
    detail: "This topic is a prerequisite in your current learning path; your DNA ranks it first.",
    evidence: ["LEARNING PATH PRIORITY"],
  };
}

export function why(kind: WhyKind, topicId: string, format?: string): WhyReason {
  switch (kind) {
    case "why-this-topic":
      return whyTopic(topicId);
    case "why-this-resource":
      return whyResource(topicId, format ?? "lecture");
    case "why-this-practice":
      return whyPractice(topicId);
    case "why-this-revision":
      return whyRevision(topicId);
    case "why-now":
      return whyNow(topicId);
  }
}

export { mistakeById };

/* Re-export category label helper to keep callers simple */
export { categoryLabel } from "./mistakes";
