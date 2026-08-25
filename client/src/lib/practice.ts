/**
 * COGNIFY — Practice layer (Day 10)
 *
 * Powers the /practice feature: quick 5-question quizzes, topic practice,
 * and short tests. Questions reuse the existing per-resource retrieval
 * banks (learningSessionFlow) so practice is grounded in real CBSE
 * curriculum content rather than invented filler.
 *
 * Results persist to localStorage (cognify.practice.v1). The intelligence
 * layer reads this silently when forming recommendations — nothing here
 * exposes Learning DNA on screen.
 */
import { retrievalQuestionsFor } from "./learningSessionFlow";
import type { RetrievalQuestion } from "./learningSessionFlow";

const PRACTICE_KEY = "cognify.practice.v1";

export interface PracticeResult {
  id: string;
  kind: "quick" | "topic" | "short-test";
  title: string;
  answered: number;
  correct: number;
  topicId?: string;
  recordedAt: string;
}

interface PracticeAnswer {
  questionId: string;
  chosenIndex: number;
  correct: boolean;
}

export interface PracticeAttempt {
  kind: "quick" | "topic" | "short-test";
  title: string;
  topicId?: string;
  answers: PracticeAnswer[];
  startedAt: string;
}

/* ----------------------------- bank access ----------------------------- */

/** Topic practice questions — pulled from the first video resource of a
 *  topic's curated set (every real topic has ≥1 lecture resource). */
export function questionsForTopic(topicId: string): RetrievalQuestion[] {
  // The session-flow bank is keyed by resource id; topics map to their
  // canonical lecture resource by a stable prefix rule used across mocks.
  const hits = Object.keys(retrievalBankPublic()).filter((rid) => rid.includes(topicId));
  const key = hits[0];
  if (key) return retrievalQuestionsFor(key);
  return retrievalQuestionsFor("fallback");
}

/** Exported only so this module is the single reader of the bank shape. */
function retrievalBankPublic() {
  // We read the bank indirectly via known resource ids to stay decoupled
  // from the private bank inside learningSessionFlow.
  return {
    "r-yt-factorisation-concept": retrievalQuestionsFor("r-yt-factorisation-concept"),
    "r-khan-reactions": retrievalQuestionsFor("r-khan-reactions"),
    "r-yt-wwi-nationalism": retrievalQuestionsFor("r-yt-wwi-nationalism"),
    "r-khan-nutrition": retrievalQuestionsFor("r-khan-nutrition"),
  };
}

/* ---------------------------- result store ----------------------------- */

export function getPracticeResults(): PracticeResult[] {
  try {
    const raw = localStorage.getItem(PRACTICE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as PracticeResult[];
  } catch {
    return [];
  }
}

export function recordPractice(attempt: PracticeAttempt): PracticeResult {
  const answered = attempt.answers.length;
  const correct = attempt.answers.filter((a) => a.correct).length;
  const result: PracticeResult = {
    id: `p-${Date.now().toString(36)}`,
    kind: attempt.kind,
    title: attempt.title,
    answered,
    correct,
    topicId: attempt.topicId,
    recordedAt: new Date().toISOString(),
  };
  const all = getPracticeResults();
  all.unshift(result);
  localStorage.setItem(PRACTICE_KEY, JSON.stringify(all.slice(0, 40)));
  return result;
}

/* ---------------------------- human feedback --------------------------- */

export interface PracticeVerdict {
  headline: string;
  detail: string;
  tone: "celebrate" | "steady" | "retry";
}

/** Reads an attempt and returns plain, encouraging, honest feedback. */
export function verdictFor(attempt: PracticeAttempt): PracticeVerdict {
  const answered = attempt.answers.length;
  const correct = attempt.answers.filter((a) => a.correct).length;
  const ratio = answered > 0 ? correct / answered : 0;
  if (ratio >= 0.8) {
    return {
      headline: "You've got this topic.",
      detail: `${correct} of ${answered} right — you can explain this one. A quick revision in a few days will lock it in.`,
      tone: "celebrate",
    };
  }
  if (ratio >= 0.5) {
    return {
      headline: "On the right track.",
      detail: `${correct} of ${answered} right — the core idea is landing. Practise it again before a test and it becomes solid.`,
      tone: "steady",
    };
  }
  return {
    headline: "Keep practising this concept.",
    detail: `${correct} of ${answered} right. Not a problem — revisit the video explanation once, then try again.`,
    tone: "retry",
  };
}

export function scoreLabel(correct: number, total: number): string {
  return `${correct}/${total}`;
}
