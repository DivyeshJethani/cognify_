/**
 * COGNIFY — Teach Cognify (Day 4)
 * Teaching as revision and mastery verification.
 *
 * MOCK SERVICE. Future NestJS backend:
 *   GET  /teach-back/prompts                 → TeachBackPrompt[]
 *   POST /teach-back/:topicId/submit         → TeachBackAnalysis
 *
 * This local evaluator deliberately distinguishes between a correct explanation,
 * a partial explanation, a misconception, an off-topic answer, and an answer
 * that is too short to assess. The backend can later replace this rubric with
 * an LLM while preserving the same result contract.
 */
import type { TeachBackAnalysis, TeachBackPrompt, TeachBackOutcome } from "./types";

export function teachBackPrompts(): TeachBackPrompt[] {
  return [
    {
      topicId: "t-2-nature-of-roots-discriminant",
      topicTitle: "Nature of Roots & Discriminant",
      subjectCode: "MATH",
      chapterTitle: "Quadratic Equations",
      prompt: "Explain why the discriminant determines the nature of roots.",
      keyPoints: [
        "Discriminant D = b² − 4ac computed from coefficients",
        "D > 0 → two distinct real roots (the parabola crosses the x-axis twice)",
        "D = 0 → one repeated real root (the parabola just touches the axis)",
        "D < 0 → no real roots (the parabola never meets the x-axis)",
        "The relationship between the discriminant and the shape of the graph",
      ],
    },
    {
      topicId: "t-0-standard-form-factorisation",
      topicTitle: "Standard Form & Factorisation",
      subjectCode: "MATH",
      chapterTitle: "Quadratic Equations",
      prompt:
        "Explain how factorisation solves a quadratic equation — and why it only works when the roots are rational.",
      keyPoints: [
        "Standard form ax² + bx + c = 0",
        "Factorising rewrites it as (x − α)(x − β) = 0",
        "Zero-product property: each factor can independently be zero",
        "Why rational roots are required for clean integer factorisation",
      ],
    },
    {
      topicId: "t-1-types-of-reactions",
      topicTitle: "Types of Reactions",
      subjectCode: "SCI",
      chapterTitle: "Chemical Reactions & Equations",
      prompt:
        "Explain the difference between combustion and oxidation, using methane burning as your example.",
      keyPoints: [
        "Oxidation is gain of oxygen / loss of electrons — a broad process",
        "Combustion is rapid oxidation releasing heat and light",
        "CH₄ + 2O₂ → CO₂ + 2H₂O as a combustion example",
        "Every combustion is oxidation; not every oxidation is combustion",
      ],
    },
    {
      topicId: "t-0-the-first-world-war-non-coop",
      topicTitle: "The First World War & Non-Cooperation",
      subjectCode: "SST",
      chapterTitle: "Nationalism in India",
      prompt:
        "Explain how the First World War prepared the ground for the Non-Cooperation Movement in India.",
      keyPoints: [
        "Economic strain: forced recruitment, war taxes, crop failure",
        "The Rowlatt Act and its suppression of civil liberties",
        "Khilafat issue aligning with the nationalist cause",
        "Gandhi's shift from support to non-cooperation (1919–1920)",
      ],
    },
  ];
}

type TeachBackRubric = {
  conceptTerms: string[];
  pointSignals: string[][];
  wrongPatterns: string[];
  correctConcept: string;
};

const RUBRICS: Record<string, TeachBackRubric> = {
  "t-2-nature-of-roots-discriminant": {
    conceptTerms: ["discriminant", "roots", "quadratic", "parabola", "x axis"],
    pointSignals: [
      ["discriminant", "b2", "b squared", "4ac", "coefficients"],
      ["d > 0", "greater than zero", "two distinct", "two real roots", "crosses the x axis"],
      ["d = 0", "equal to zero", "repeated root", "one repeated", "touches the axis"],
      ["d < 0", "less than zero", "no real roots", "never meets the x axis"],
      ["parabola", "x axis", "graph", "crosses", "touches"],
    ],
    wrongPatterns: [
      "discriminant is a triangle",
      "discriminant has nothing to do",
      "discriminant is unrelated",
      "d > 0 means no real",
      "d < 0 means two real",
      "d = 0 means two distinct",
      "all roots are real",
    ],
    correctConcept:
      "The discriminant D = b² − 4ac tells us how many times the quadratic's graph meets the x-axis: positive gives two distinct real roots, zero gives one repeated real root, and negative gives no real roots.",
  },
  "t-0-standard-form-factorisation": {
    conceptTerms: ["factorisation", "factorization", "factor", "quadratic", "zero product", "rational roots"],
    pointSignals: [
      ["standard form", "ax2", "a x squared", "quadratic equation", "= 0"],
      ["factorising", "factorization", "factorisation", "rewrite", "x -", "two factors"],
      ["zero product", "each factor", "factor can", "independently", "either factor"],
      ["rational roots", "rational", "integer factor", "clean factorisation", "clean factorization"],
    ],
    wrongPatterns: [
      "factorisation cannot solve",
      "factorization cannot solve",
      "zero product is false",
      "rational roots are not needed",
      "factorisation always works",
    ],
    correctConcept:
      "Factorisation rewrites ax² + bx + c = 0 as two factors whose product is zero. The zero-product property lets either factor equal zero, and clean integer factorisation requires rational roots.",
  },
  "t-1-types-of-reactions": {
    conceptTerms: ["combustion", "oxidation", "methane", "oxygen", "heat", "electrons"],
    pointSignals: [
      ["oxidation", "gain of oxygen", "loss of electrons", "oxygen transfer"],
      ["combustion", "rapid oxidation", "heat", "light"],
      ["ch4", "methane", "co2", "h2o", "2o2"],
      ["every combustion", "not every oxidation", "subset", "combustion is oxidation"],
    ],
    wrongPatterns: [
      "combustion is not oxidation",
      "combustion is unrelated to oxidation",
      "oxidation only happens when burning",
      "methane is not a combustion",
      "combustion is slow oxidation",
    ],
    correctConcept:
      "Oxidation is the broader process of gaining oxygen or losing electrons. Combustion is rapid oxidation that releases heat and light, so every combustion is oxidation but not every oxidation is combustion.",
  },
  "t-0-the-first-world-war-non-coop": {
    conceptTerms: ["first world war", "world war", "war", "non cooperation", "non-cooperation", "gandhi", "rowlatt", "khilafat", "india"],
    pointSignals: [
      ["forced recruitment", "war taxes", "crop failure", "economic strain", "economic hardship"],
      ["rowlatt", "civil liberties", "suppression"],
      ["khilafat", "nationalist cause", "caliphate"],
      ["gandhi", "non cooperation", "non-cooperation", "1919", "1920", "shift from support"],
    ],
    wrongPatterns: [
      "war had no effect",
      "war did not affect india",
      "rowlatt act gave freedom",
      "khilafat was unrelated",
      "gandhi supported violence",
      "non cooperation supported the british",
    ],
    correctConcept:
      "The war created economic hardship and forced recruitment, the Rowlatt Act restricted civil liberties, and the Khilafat issue helped unite people. Gandhi then moved toward Non-Cooperation in 1920.",
  },
};

function normalizeText(value: string): string {
  return value
    .toLowerCase()
    .replace(/²/g, "2")
    .replace(/[–—−]/g, "-")
    .replace(/[^a-z0-9<>=+\-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function hasSignal(text: string, signal: string): boolean {
  return text.includes(normalizeText(signal));
}

function firstMissingPoint(prompt: TeachBackPrompt, matchedIndexes: number[]): string {
  const missing = prompt.keyPoints.findIndex((_, index) => !matchedIndexes.includes(index));
  return missing >= 0 ? prompt.keyPoints[missing] : "The explanation needs one more link between the ideas.";
}

function clarityFor(outcome: TeachBackOutcome, matchedCount: number, wordCount: number): number {
  if (outcome === "too-short") return 0;
  if (outcome === "irrelevant") return Math.min(30, 15 + Math.round(wordCount / 3));
  if (outcome === "incorrect") return Math.min(48, 24 + matchedCount * 5);
  if (outcome === "partial") return Math.min(76, 48 + matchedCount * 7 + (wordCount > 45 ? 5 : 0));
  return Math.min(96, 76 + matchedCount * 4 + (wordCount > 55 ? 5 : 0));
}

function verdictFor(
  outcome: TeachBackOutcome,
  topicTitle: string,
  missingIdea: string,
  wrong: string,
): string {
  switch (outcome) {
    case "correct":
      return `Correct explanation — you connected the key ideas in ${topicTitle.toLowerCase()} clearly. One small extension can make it even stronger: add ${missingIdea.toLowerCase()}.`;
    case "partial":
      return `Partly correct — your explanation has the right starting point, but it is missing an important link: ${missingIdea.toLowerCase()}.`;
    case "incorrect":
      return `❌ There is an error in your explanation. ${wrong}`;
    case "irrelevant":
      return `This explanation does not address ${topicTitle.toLowerCase()} yet. Use the prompt as your guide and explain the concept in your own words.`;
    case "too-short":
      return "Please add a meaningful explanation with a few connected sentences so Cognify can check your understanding.";
  }
}

export function analyseTeachBack(topicId: string, studentText: string): TeachBackAnalysis {
  const prompt = teachBackPrompts().find((p) => p.topicId === topicId);
  const fallbackPrompt: TeachBackPrompt = prompt ?? {
    topicId,
    topicTitle: "this topic",
    subjectCode: "",
    chapterTitle: "",
    prompt: "Explain the concept in your own words.",
    keyPoints: ["The main concept and its key relationship"],
  };
  const rubric = RUBRICS[topicId] ?? {
    conceptTerms: normalizeText(`${fallbackPrompt.topicTitle} ${fallbackPrompt.prompt}`).split(" ").filter((word) => word.length > 3),
    pointSignals: fallbackPrompt.keyPoints.map((point) => [point]),
    wrongPatterns: ["nothing to do", "unrelated", "always", "never"],
    correctConcept: fallbackPrompt.keyPoints.join(" "),
  } satisfies TeachBackRubric;

  const original = studentText.trim();
  const text = normalizeText(original);
  const wordCount = text ? text.split(" ").length : 0;
  const tooShort = wordCount < 5 || original.length < 24;
  if (tooShort) {
    return {
      coverage: 0,
      clarity: 0,
      missingIdea: fallbackPrompt.keyPoints[0] ?? "The main concept and its key relationship",
      verdict: verdictFor("too-short", fallbackPrompt.topicTitle, fallbackPrompt.keyPoints[0] ?? "the main concept", ""),
      evidence: 0,
      outcome: "too-short",
      whatWasWrong: "There is not enough explanation to tell whether the concept is understood.",
      correctConcept: rubric.correctConcept,
      tryAgain: `Write at least two or three connected sentences answering: “${fallbackPrompt.prompt}”`,
      matchedPoints: [],
    };
  }

  const matchedIndexes = rubric.pointSignals.reduce<number[]>((matches, signals, index) => {
    if (signals.some((signal) => hasSignal(text, signal))) matches.push(index);
    return matches;
  }, []);
  const hasConceptTerm = rubric.conceptTerms.some((term) => hasSignal(text, term));
  const wrongPattern = rubric.wrongPatterns.find((pattern) => hasSignal(text, pattern));
  const missingIdea = matchedIndexes.length >= rubric.pointSignals.length
    ? "one worked example that shows the idea in action"
    : firstMissingPoint(fallbackPrompt, matchedIndexes);
  const hasEnoughForCorrect = matchedIndexes.length >= Math.max(2, Math.ceil(rubric.pointSignals.length * 0.7));

  let outcome: TeachBackOutcome;
  let whatWasWrong: string;
  let tryAgain: string;

  if (wrongPattern) {
    outcome = "incorrect";
    whatWasWrong = `The explanation says “${wrongPattern}”, which conflicts with the concept being tested.`;
    tryAgain = `Correct that claim, then explain why ${missingIdea.toLowerCase()}.`;
  } else if (!hasConceptTerm && matchedIndexes.length === 0) {
    outcome = "irrelevant";
    whatWasWrong = "The response does not use the topic's key ideas, so it cannot answer the question yet.";
    tryAgain = `Start with the central idea in the prompt, then include ${fallbackPrompt.keyPoints[0]?.toLowerCase() ?? "one key point"}.`;
  } else if (matchedIndexes.length === 0) {
    outcome = "incorrect";
    whatWasWrong = "The response mentions the topic but does not explain any of the relationships that make the concept correct.";
    tryAgain = `Rebuild the explanation from the definition, then connect it to ${fallbackPrompt.keyPoints[0]?.toLowerCase() ?? "the first key idea"}.`;
  } else if (hasEnoughForCorrect) {
    outcome = "correct";
    whatWasWrong = "No central error was detected in the explanation.";
    tryAgain = `Add one example or graph-based detail about ${missingIdea.toLowerCase()} to make the explanation more complete.`;
  } else {
    outcome = "partial";
    whatWasWrong = `The response gets part of the idea right, but it leaves out ${missingIdea.toLowerCase()}.`;
    tryAgain = `Keep the correct part, add ${missingIdea.toLowerCase()}, and explain how the two ideas connect.`;
  }

  const coverage = Math.min(100, Math.round((matchedIndexes.length / rubric.pointSignals.length) * 100));
  const clarity = clarityFor(outcome, matchedIndexes.length, wordCount);
  const evidenceByOutcome: Record<TeachBackOutcome, number> = {
    correct: 88,
    partial: 58,
    incorrect: 22,
    irrelevant: 10,
    "too-short": 0,
  };

  return {
    coverage,
    clarity,
    missingIdea,
    verdict: verdictFor(outcome, fallbackPrompt.topicTitle, missingIdea, whatWasWrong),
    evidence: evidenceByOutcome[outcome],
    outcome,
    whatWasWrong,
    correctConcept: rubric.correctConcept,
    tryAgain,
    matchedPoints: matchedIndexes.map((index) => fallbackPrompt.keyPoints[index]).filter(Boolean),
  };
}

export function missingIdeaPrompt(topicId: string): string | null {
  const a = analyseTeachBack(topicId, "explain the topic in enough detail to review it");
  return a.missingTopicId ?? a.missingIdea;
}
