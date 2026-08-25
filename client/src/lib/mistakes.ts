/**
 * COGNIFY — Mistake Analysis (Day 4)
 * Categories: conceptual / careless / procedural / recall / interpretation
 *
 * MOCK SERVICE. Future NestJS backend:
 *   GET  /mistakes/analytics   → MistakeAnalysisSummary[]
 *   GET  /mistakes             → Mistake[]
 *   POST /mistakes/:id/resolve → { resolved: true }
 *
 * Every classified mistake writes evidence into Learning DNA (see dnaLink).
 */
import type { Mistake, MistakeAnalysisSummary, MistakeCategory } from "./types";

/* ------------------------------------------------------------------ */
/* Category analytics                                                   */
/* ------------------------------------------------------------------ */

export function mistakeAnalytics(): MistakeAnalysisSummary[] {
  return [
    {
      category: "conceptual",
      label: "Conceptual",
      percentage: 46,
      count: 12,
      affectedSubjects: ["Mathematics", "Science"],
      affectedTopics: [
        "Relationship between Zeros & Coefficients",
        "Types of Reactions",
        "Completing the Square",
      ],
      trend: "rising",
      trendNote: "+9 points over the last two weeks",
      pattern:
        "Errors increase when questions require connecting two concepts — e.g., holding the sum relation while substituting into the product relation.",
      intervention:
        "Worked examples + visual explanations before attempting another test. Repetitive drills are paused for this cluster.",
    },
    {
      category: "careless",
      label: "Careless",
      percentage: 22,
      count: 6,
      affectedSubjects: ["Mathematics"],
      affectedTopics: [
        "Substitution & Elimination Methods",
        "Relationship between Zeros & Coefficients",
      ],
      trend: "stable",
      trendNote: "Within your historical band",
      pattern:
        "Sign errors during substitution; correct method, wrong sign. Appears mostly in timed attempts.",
      intervention:
        "Timed practice with a deliberate sign-check step added to the last 60 seconds of every question.",
    },
    {
      category: "procedural",
      label: "Procedural",
      percentage: 15,
      count: 4,
      affectedSubjects: ["Mathematics"],
      affectedTopics: ["Completing the Square", "Substitution & Elimination Methods"],
      trend: "falling",
      trendNote: "−6 points after the guided walkthrough series",
      pattern:
        "Steps are dropped mid-procedure under load — e.g., the half-coefficient step in completing the square.",
      intervention:
        "Checklist-based solved examples; the student annotates each step before solving.",
    },
    {
      category: "recall",
      label: "Recall",
      percentage: 11,
      count: 3,
      affectedSubjects: ["Social Science", "Hindi — Course A"],
      affectedTopics: ["The First World War & Non-Cooperation", "ल्हासा की ओर"],
      trend: "rising",
      trendNote: "Appearing as revision intervals lengthen",
      pattern:
        "Recall decays after ~7 days without a spaced check. Knowledge is stored; retrieval is the gap.",
      intervention:
        "Earlier retention checks — spaced revision interval tightened from 10 days to 7.",
    },
    {
      category: "interpretation",
      label: "Interpretation",
      percentage: 6,
      count: 2,
      affectedSubjects: ["Science", "Mathematics"],
      affectedTopics: ["pH Scale & Strength", "Cross-Multiplication & Word Problems"],
      trend: "stable",
      trendNote: "Only observed in unfamiliar wording",
      pattern:
        "Correct method chosen only when the question is phrased in familiar terms; novel phrasings misread.",
      intervention:
        "One reworded variant per topic — the engine surfaces the same question in different wording each revision.",
    },
  ];
}

export function categoryLabel(c: MistakeCategory): string {
  return (
    (mistakeAnalytics().find((m) => m.category === c) as MistakeAnalysisSummary)
      ?.label ?? c
  );
}

/* ------------------------------------------------------------------ */
/* Individual mistakes                                                  */
/* ------------------------------------------------------------------ */

export function recentMistakes(): Mistake[] {
  return [
    {
      id: "m-1",
      topicId: "t-1-relationship-between-zeros-c",
      topicTitle: "Relationship between Zeros & Coefficients",
      subjectCode: "MATH",
      subjectLabel: "Mathematics",
      question:
        "If α and β are zeros of p(x) = x² − 6x + 9, find the value of α² + β².",
      studentAnswer: "α² + β² = 12",
      correctAnswer: "α² + β² = (α + β)² − 2αβ = 36 − 18 = 18",
      category: "procedural",
      likelyCause:
        "Sign handling during substitution — the −2αβ term was evaluated as +2αβ.",
      confidence: "low",
      occurredAt: "2026-08-18T16:40:00Z",
      actions: [
        "Review the identity α² + β² = (α + β)² − 2αβ",
        "Solve 3 targeted examples",
        "Attempt confidence check",
      ],
    },
    {
      id: "m-2",
      topicId: "t-1-relationship-between-zeros-c",
      topicTitle: "Relationship between Zeros & Coefficients",
      subjectCode: "MATH",
      subjectLabel: "Mathematics",
      question:
        "For p(x) = 2x² + kx − 5 with one zero equal to 1, find k.",
      studentAnswer: "k = 3",
      correctAnswer:
        "p(1) = 2 + k − 5 = 0 ⟹ k = 3 (student answer is right here — the flagged item is the follow-up)",
      category: "careless",
      likelyCause:
        "In the follow-up (product of zeros) the leading coefficient 2 was dropped when writing α·β = c/a.",
      confidence: "medium",
      occurredAt: "2026-08-17T17:12:00Z",
      actions: ["Always write the full identity before substituting", "Practice with a ≠ 1"],
    },
    {
      id: "m-3",
      topicId: "t-1-types-of-reactions",
      topicTitle: "Types of Reactions",
      subjectCode: "SCI",
      subjectLabel: "Science",
      question:
        "Classify: CH₄ + 2O₂ → CO₂ + 2H₂O",
      studentAnswer: "Oxidation",
      correctAnswer: "Combustion (oxidation is a component, but the reaction type is combustion)",
      category: "conceptual",
      likelyCause:
        "Boundary confusion: the question asks for the named type of reaction, not the underlying process.",
      confidence: "high",
      occurredAt: "2026-08-17T15:30:00Z",
      actions: [
        "Revisit the classification hierarchy (combustion ⊂ oxidation)",
        "Complete the comparison chart",
        "Retake the 5-question classification check",
      ],
    },
    {
      id: "m-4",
      topicId: "t-1-completing-the-square",
      topicTitle: "Completing the Square",
      subjectCode: "MATH",
      subjectLabel: "Mathematics",
      question: "Rewrite x² + 8x + 5 in the form (x + a)² + b.",
      studentAnswer: "(x + 4)² + 5",
      correctAnswer: "(x + 4)² − 11  —  since (x + 4)² = x² + 8x + 16, we subtract 16 and add 5.",
      category: "procedural",
      likelyCause: "The half-coefficient step was performed but the compensation (−16 + 5) was skipped.",
      confidence: "low",
      occurredAt: "2026-08-16T18:05:00Z",
      actions: [
        "Review the completing-the-square walkthrough",
        "Annotate each algebraic step on 3 solved examples",
        "Attempt the confidence check",
      ],
    },
    {
      id: "m-5",
      topicId: "t-0-the-first-world-war-non-coop",
      topicTitle: "The First World War & Non-Cooperation",
      subjectCode: "SST",
      subjectLabel: "Social Science",
      question: "Place the Khilafat Movement and the Non-Cooperation Movement in correct sequence.",
      studentAnswer: "Non-Cooperation began first, then Khilafat joined it.",
      correctAnswer:
        "The Khilafat issue preceded and fused with Non-Cooperation (1919–1920); both were launched together in 1920.",
      category: "recall",
      likelyCause: "Timeline blur — both movements occupy the same period and the linkage is fuzzy.",
      confidence: "medium",
      occurredAt: "2026-08-15T14:20:00Z",
      actions: [
        "Reconstruct the 1919–1922 timeline from memory",
        "Do a 10-minute retrieval round",
        "Revise in 3 days (spaced check)",
      ],
    },
    {
      id: "m-6",
      topicId: "t-1-ph-scale-strength",
      topicTitle: "pH Scale & Strength",
      subjectCode: "SCI",
      subjectLabel: "Science",
      question:
        "A solution has pH 2. Another has pH 5. Which has higher hydrogen-ion concentration, and by how much?",
      studentAnswer: "The pH 2 solution is 3 times stronger.",
      correctAnswer:
        "The pH 2 solution — 10³ (1,000) times higher [H⁺], since the scale is logarithmic.",
      category: "interpretation",
      likelyCause:
        "Treated the pH difference as a linear difference rather than reading the logarithmic scale.",
      confidence: "high",
      occurredAt: "2026-08-14T16:55:00Z",
      actions: [
        "Revisit how logarithmic scales compress magnitude",
        "Solve 3 reworded variants",
        "Attempt confidence check",
      ],
    },
  ];
}

export function mistakeById(id: string): Mistake | null {
  return recentMistakes().find((m) => m.id === id) ?? null;
}

export function mistakesByCategory(c: MistakeCategory): Mistake[] {
  return recentMistakes().filter((m) => m.category === c);
}

export function mistakeTrendIcon(trend: "rising" | "stable" | "falling"): string {
  return trend === "rising" ? "up" : trend === "falling" ? "down" : "flat";
}
