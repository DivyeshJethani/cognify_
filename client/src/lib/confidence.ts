/**
 * COGNIFY — Confidence Calibration (Day 4)
 * Compares self-reported confidence against measured performance.
 *
 * MOCK SERVICE. Future NestJS backend:
 *   GET  /confidence/readings           → ConfidenceReading[]
 *   POST /confidence/record             (student reports confidence after activity)
 *
 * Overestimate → confidence checks added; Underestimate → encouragement
 * + harder material. Both write to Learning DNA (Calibration dimension).
 */
import type { ConfidenceReading } from "./types";

export function confidenceReadings(): ConfidenceReading[] {
  return [
    {
      topicId: "t-1-relationship-between-zeros-c",
      topicTitle: "Relationship between Zeros & Coefficients",
      subjectCode: "MATH",
      selfReported: 78,
      actualPerformance: 52,
      gap: 26,
      verdict: "overestimating",
      observation:
        "You are currently overestimating your mastery of this topic. This is the third consecutive reading in this direction — pattern confirmed after 4 sessions.",
      recommendation:
        "Take a 5-question confidence check before moving on. The engine will weight retrieval evidence over self-report for this topic.",
      recordedAt: "2026-08-18T17:05:00Z",
    },
    {
      topicId: "t-1-completing-the-square",
      topicTitle: "Completing the Square",
      subjectCode: "MATH",
      selfReported: 30,
      actualPerformance: 58,
      gap: -28,
      verdict: "underestimating",
      observation:
        "You understand more than you think. Your measured performance on the walkthrough series exceeded your reported confidence by 28 points.",
      recommendation:
        "Proceed to independent problems — you have already cleared the guided stage. The engine is promoting you one stage early.",
      recordedAt: "2026-08-17T18:30:00Z",
    },
    {
      topicId: "t-0-graphical-method",
      topicTitle: "Graphical Method",
      subjectCode: "MATH",
      selfReported: 70,
      actualPerformance: 74,
      gap: -4,
      verdict: "calibrated",
      observation:
        "Your self-assessment and measured performance are within 5 points. This topic is well calibrated — no adjustment needed.",
      recommendation: "Continue the normal revision schedule.",
      recordedAt: "2026-08-15T16:00:00Z",
    },
    {
      topicId: "t-1-types-of-reactions",
      topicTitle: "Types of Reactions",
      subjectCode: "SCI",
      selfReported: 72,
      actualPerformance: 55,
      gap: 17,
      verdict: "overestimating",
      observation:
        "Mild overestimate on reaction classification. Confidence is high on familiar phrasings but falls on borderline cases.",
      recommendation:
        "Add reworded variants to your next practice set; the engine will sample unfamiliar phrasings at higher weight.",
      recordedAt: "2026-08-16T15:45:00Z",
    },
  ];
}

export function readingForTopic(topicId: string): ConfidenceReading | null {
  return confidenceReadings().find((r) => r.topicId === topicId) ?? null;
}

export function calibrationSummary() {
  const readings = confidenceReadings();
  const avgGap = Math.round(
    readings.reduce((s, r) => s + r.gap, 0) / readings.length,
  );
  const overCount = readings.filter((r) => r.verdict === "overestimating").length;
  return {
    avgGap,
    overCount,
    total: readings.length,
    dnaNote:
      avgGap > 10
        ? "Learning DNA: calibration dimension flagged — confidence checks are being inserted after practice."
        : avgGap < -10
          ? "Learning DNA: student underestimates — confidence checks are being converted into stretch invitations."
          : "Learning DNA: calibration is healthy across recorded topics.",
  };
}
