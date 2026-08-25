/**
 * COGNIFY — Intervention Center (Day 4)
 * Where Cognify explains what it is changing about the student's learning
 * and why — the intelligence of the system made visible.
 *
 * MOCK SERVICE. Future NestJS backend:
 *   GET /interventions → Intervention[]
 *   POST /interventions/:id/feedback → recorded
 */
import type { Intervention } from "./types";

export function activeInterventions(): Intervention[] {
  return [
    {
      id: "iv-1",
      kind: "format",
      label: "Format change",
      observation:
        "You perform measurably better with diagrams than verbal explanations (+23% recall on diagram-assisted sessions, across 9 sessions).",
      action: "Prioritize visual resources for Mathematics and Science concepts.",
      evidenceStrength: 88,
      sessionsObserved: 9,
      status: "active",
      startedAt: "2026-08-04T10:00:00Z",
    },
    {
      id: "iv-2",
      kind: "revision",
      label: "Revision change",
      observation:
        "Your recall falls after approximately 7 days without a check. The standard 10-day interval was letting two weak topics decay below 50%.",
      action: "Schedule earlier retention checks — interval tightened from 10 to 7 days for weak topics.",
      evidenceStrength: 81,
      sessionsObserved: 4,
      status: "active",
      startedAt: "2026-08-10T10:00:00Z",
    },
    {
      id: "iv-3",
      kind: "confidence",
      label: "Confidence change",
      observation:
        "You frequently overestimate mastery — 2 of 4 calibration readings show a gap above 15 points, both on Mathematics topics.",
      action: "Add confidence checks after practice; retrieval evidence is now weighted above self-report.",
      evidenceStrength: 76,
      sessionsObserved: 4,
      status: "active",
      startedAt: "2026-08-12T10:00:00Z",
    },
    {
      id: "iv-4",
      kind: "mistake",
      label: "Mistake change",
      observation: "46% of your recent errors are conceptual — and the share is rising.",
      action:
        "Reduce repetitive drills and increase concept repair: worked examples and visual explanations precede any new test on affected topics.",
      evidenceStrength: 74,
      sessionsObserved: 6,
      status: "active",
      startedAt: "2026-08-11T10:00:00Z",
    },
    {
      id: "iv-5",
      kind: "sequence",
      label: "Sequence change",
      observation:
        "Three direct attempts at Completing the Square failed at the same algebraic step; the prerequisites (factorisation at 66%) were not yet secure.",
      action: "Insert prerequisite checks before re-attempts. The same pattern previously raised Graphical Method from 41% to 73%.",
      evidenceStrength: 79,
      sessionsObserved: 3,
      status: "active",
      startedAt: "2026-08-15T10:00:00Z",
    },
    {
      id: "iv-6",
      kind: "attention",
      label: "Attention change",
      observation:
        "Weekly minutes concentrate in Mathematics (71%) while Hindi has had no session this week. Subject balance correlates with fewer streak breaks in your history.",
      action: "Surface neglected-subject nudges when any enrolled subject goes 5+ days without activity.",
      evidenceStrength: 63,
      sessionsObserved: 8,
      status: "active",
      startedAt: "2026-08-08T10:00:00Z",
    },
    {
      id: "iv-7",
      kind: "mistake",
      label: "Mistake change (superseded)",
      observation:
        "Procedural drop-outs were the dominant error class in early August (21%).",
      action:
        "Checklist-based solved examples were introduced. Procedural share has since fallen to 15% — this intervention is now supervised by iv-4.",
      evidenceStrength: 70,
      sessionsObserved: 5,
      status: "superseded",
      startedAt: "2026-07-28T10:00:00Z",
    },
  ];
}

export function interventionCount(): number {
  return activeInterventions().filter((i) => i.status === "active").length;
}

export function featuredIntervention(): Intervention {
  return activeInterventions()[0];
}
