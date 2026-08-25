/**
 * COGNIFY — Adaptive engine (Day 4)
 * "What should I learn next — and why?"
 *
 * MOCK SERVICE. Future NestJS backend: GET /adaptive/path — the same
 * AdaptiveRecommendation shape is the contract.
 *
 * The engine simulates the adaptive loop:
 *   activity → analysis → weakness detected → DNA updated →
 *   changed WHAT (topic), HOW (format), WHEN (revision)
 */
import { boards } from "./mockData";
import { topicPath } from "./curriculum";
import type {
  AdaptivePriority,
  AdaptiveRecommendation,
  LearningPathStage,
} from "./types";

/* ------------------------------------------------------------------ */
/* The recommendation engine                                            */
/* ------------------------------------------------------------------ */

interface Candidate {
  topicId: string;
  reason: string;
  whyChoseThis: string;
  format: string;
  formatDetail: string;
  priority: AdaptivePriority;
  dnaLink: string;
  evidenceStrength: number;
  /** lower = stronger claim on the student's next minute */
  score: number;
}

function candidateFromTopic(
  topicId: string,
  c: Candidate,
): AdaptiveRecommendation {
  const meta = topicPath(topicId);
  if (!meta) return null as unknown as AdaptiveRecommendation;
  const t = meta.topic;
  return {
    rank: 0,
    topicId,
    topicTitle: t.title,
    subjectCode: meta.subject.code,
    subjectLabel: meta.subject.name,
    reason: c.reason,
    whyChoseThis: c.whyChoseThis,
    format: c.format,
    formatDetail: c.formatDetail,
    priority: c.priority,
    estimatedMinutes: Math.max(10, Math.round(t.estimatedMinutes * 0.9)),
    evidenceStrength: c.evidenceStrength,
    dnaLink: c.dnaLink,
  };
}

/** Simulated analysis of today's weak topics → adaptive path */
export function todayAdaptivePath(): AdaptiveRecommendation[] {
  const candidates: Candidate[] = [
    {
      topicId: "t-1-relationship-between-zeros-c",
      reason: "Needs a conceptual refresh",
      whyChoseThis:
        "You've been finding this topic a bit tricky lately. Since you learn well with visuals, we've prepared a diagram-based review to help you master it.",
      format: "visual explanation",
      formatDetail:
        "Diagram-based explanation followed by 4 worked examples. Visual formats have helped you master similar math topics faster.",
      priority: "high",
      dnaLink: "Teaching format",
      evidenceStrength: 86,
      score: 1,
    },
    {
      topicId: "t-1-types-of-reactions",
      reason: "Review core principles",
      whyChoseThis:
        "A quick refresh of the basics will help you feel much more confident before your next practice session.",
      format: "worked example + diagram",
      formatDetail:
        "Side-by-side comparison of all four reaction types with one balancing chain each, then a 5-question retrieval check.",
      priority: "medium",
      dnaLink: "Mistake pattern",
      evidenceStrength: 74,
      score: 2,
    },
    {
      topicId: "t-0-the-first-world-war-non-coop",
      reason: "Time for a quick review",
      whyChoseThis:
        "It's been a few days since you last looked at this. A quick 10-minute refresh will keep it fresh in your mind.",
      format: "retrieval practice",
      formatDetail:
        "Timed 10-minute recall round (no notes), then an application round using source-based questions.",
      priority: "high",
      dnaLink: "Revision spacing",
      evidenceStrength: 81,
      score: 3,
    },
    {
      topicId: "t-1-completing-the-square",
      reason: "Let's clear the hurdles",
      whyChoseThis:
        "This topic can be tough. We'll start with the basics to make sure you have a solid foundation to build on.",
      format: "step-by-step repair",
      formatDetail:
        "Prerequisite check (factorisation, 5 min) then a guided completion-of-the-square walkthrough with a sign-error caution.",
      priority: "high",
      dnaLink: "Sequence planning",
      evidenceStrength: 79,
      score: 4,
    },
    {
      topicId: "t-1-lhasa-ki-or",
      reason: "Keep your streak alive",
      whyChoseThis:
        "You haven't studied Hindi yet this week! A short session now will keep your daily streak going and help you reach your weekly goal.",
      format: "quick revision",
      formatDetail:
        "15-minute reading-plus-recall revision of ल्हासा की ओर, with a vocabulary recall card set.",
      priority: "low",
      dnaLink: "Attention & balance",
      evidenceStrength: 63,
      score: 5,
    },
  ];

  const ranked = candidates
    .sort((a, b) => a.score - b.score)
    .map((c, i) => candidateFromTopic(c.topicId, { ...c, score: i + 1 }));
  ranked.forEach((r, i) => (r.rank = i + 1));
  return ranked;
}

/* ------------------------------------------------------------------ */
/* Learning path visualisation — one topic's journey                    */
/* ------------------------------------------------------------------ */

export function learningPathFor(
  topicId: string,
): { title: string; stages: LearningPathStage[] } | null {
  const meta = topicPath(topicId);
  if (!meta) return null;
  const t = meta.topic;
  const stages: LearningPathStage[] = [
    {
      stage: "current",
      label: "Current state",
      detail: `Mastery ${t.mastery}% — ${stateLabel(t.state)}. Last studied ${t.lastStudied ? daysAgoLabel(t.lastStudied) : "never"}.`,
      status: "done",
    },
    {
      stage: "weakness",
      label: "Weakness identified",
      detail: weaknessFor(topicId),
      status: "done",
    },
    {
      stage: "intervention",
      label: "Intervention",
      detail: interventionFor(topicId),
      status: "current",
      action: { label: "Begin session", href: `/session?topic=${topicAliasFor(t.id)}` },
    },
    {
      stage: "practice",
      label: "Practice",
      detail: practiceFor(topicId),
      status: "next",
    },
    {
      stage: "confidence",
      label: "Confidence check",
      detail: "We check how well you actually remember the topic compared to how confident you feel, helping you focus where it matters most.",
      status: "next",
    },
    {
      stage: "mastery",
      label: "Mastery",
      detail: "Your progress is saved and your learning path is updated.",
      status: "next",
    },
    {
      stage: "revision",
      label: "Revision",
      detail: `We've scheduled a review for you in about a week to make sure this stays fresh in your memory.`,
      status: "next",
    },
  ];
  return { title: t.title, stages };
}

function stateLabel(s: string): string {
  return (
    {
      new: "not started",
      learning: "in progress",
      developing: "developing",
      proficient: "proficient",
      weak: "weak — below your own average",
      mastered: "mastered",
    } as Record<string, string>
  )[s] ?? s;
}

function weaknessFor(topicId: string): string {
  const map: Record<string, string> = {
    "t-1-relationship-between-zeros-c":
      "You're doing great with the formulas, but sometimes small sign errors during substitution can be tricky. Let's focus on that.",
    "t-1-types-of-reactions":
      "Combustion vs oxidation is misclassified when the same reaction shows both patterns.",
    "t-0-the-first-world-war-non-coop": "You understand the events well, but remembering the exact order can be tough. Let's practice the timeline.",
    "t-1-completing-the-square":
      "One specific step in the process is causing a bit of trouble. We'll walk through it together.",
    "t-1-lhasa-ki-or": "You understand the story perfectly! Let's just spend a few minutes on the new vocabulary words.",
  };
  return map[topicId] ?? "Performance plateau detected below expected trajectory.";
}

function interventionFor(topicId: string): string {
  const map: Record<string, string> = {
    "t-1-relationship-between-zeros-c":
      "Diagram-based explanation of the sum/product relations, then 4 worked examples with explicit sign-tracking.",
    "t-1-types-of-reactions":
      "Side-by-side comparison chart of all four reaction types, one worked balancing chain each.",
    "t-0-the-first-world-war-non-coop": "10-minute timed retrieval practice with no notes, then source-based application.",
    "t-1-completing-the-square":
      "Prerequisite repair (factorisation check) followed by a guided step-by-step walkthrough.",
    "t-1-lhasa-ki-or": "Reading-plus-recall revision with vocabulary recall cards.",
  };
  return map[topicId] ?? "Targeted worked examples followed by retrieval practice.";
}

function practiceFor(topicId: string): string {
  const map: Record<string, string> = {
    "t-1-relationship-between-zeros-c": "5 targeted questions focused on substitution under sign changes.",
    "t-1-types-of-reactions": "5 classification questions mixing combustion/oxidation borderline cases.",
    "t-0-the-first-world-war-non-coop": "Timeline reconstruction exercise plus 3 short-answer source questions.",
    "t-1-completing-the-square": "3 graded problems: guided, semi-guided, independent.",
    "t-1-lhasa-ki-or": "8 vocabulary recall cards + 2 comprehension short answers.",
  };
  return map[topicId] ?? "5 targeted practice questions.";
}

function daysAgoLabel(iso: string): string {
  const days = Math.round((Date.now() - new Date(iso).getTime()) / 86400000);
  return days <= 0 ? "today" : days === 1 ? "yesterday" : `${days} days ago`;
}

function topicAliasFor(runtimeId: string): string {
  // stable URL-friendly identifier derived from the topic's id
  return runtimeId;
}

/* ------------------------------------------------------------------ */
/* Weak-topic summary used by the Command Center                        */
/* ------------------------------------------------------------------ */

export interface WeakTopicSummary {
  topicId: string;
  topicTitle: string;
  subjectCode: string;
  subjectLabel: string;
  mastery: number;
  reason: string;
  recommendation: string;
}

export function weakTopicSummaries(): WeakTopicSummary[] {
  const out: WeakTopicSummary[] = [];
  for (const b of boards) {
    for (const cls of b.classes) {
      for (const s of cls.subjects) {
        for (const ch of s.chapters) {
          for (const t of ch.topics) {
            if (t.state === "weak" || (t.mastery > 0 && t.mastery < 45)) {
              out.push({
                topicId: t.id,
                topicTitle: t.title,
                subjectCode: s.code,
                subjectLabel: s.name,
                mastery: t.mastery,
                reason: actionReason(t.state, t.mastery),
                recommendation: defaultRecommendation(t.state),
              });
            }
          }
        }
      }
    }
  }
  return out.sort((a, b) => a.mastery - b.mastery);
}

function actionReason(state: string, mastery: number): string {
  if (state === "weak") return `Needs a bit more focus (${mastery}% understanding)`;
  return `Making progress (${mastery}% understanding)`;
}

function defaultRecommendation(state: string): string {
  return state === "weak"
    ? "concept repair with visual explanation"
    : "targeted practice + revision";
}
