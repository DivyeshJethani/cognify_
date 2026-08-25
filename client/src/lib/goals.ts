/**
 * COGNIFY — Stretch Goals (Day 4)
 * Academic, purposeful goals — not gamification.
 *
 * MOCK SERVICE. Future NestJS backend:
 *   GET  /goals              → StretchGoal[]
 *   POST /goals/:id/progress → progress bump (server-computed from activity)
 *
 * Progress shown here is locally simulated; server truth would derive from
 * real activity.
 */
import type { StretchGoal } from "./types";
import { listMutations, mutate } from "./mutateStore";

const STORE_KEY = "cognify.goals.v1";

interface GoalMutation {
  goalId: string;
  /** locally simulated progress override */
  progressBump?: number;
}

const DEFAULT_GOALS: StretchGoal[] = [
  {
    id: "g-1",
    title: "Reach 70% mastery in Mathematics Chapter 4 (Quadratic Equations)",
    progress: 48,
    deadline: "Sat 23 Aug",
    whyItMatters:
      "Chapter 4 is the heaviest weighted unit in the board exam paper, and it currently holds two weak topics. Getting it to 70% removes the single largest drag on your projected score.",
    suggestedActions: [
      "Complete today's concept-repair session on zeros & coefficients",
      "Do the prerequisite check before re-attempting Completing the Square",
      "Finish the Teach-back challenge on Nature of Roots",
    ],
    status: "on-track",
  },
  {
    id: "g-2",
    title: "Complete 3 overdue revisions",
    progress: 33,
    deadline: "Thu 21 Aug",
    whyItMatters:
      "Your retention curve shows recall decaying after ~7 days. The two lapsed revisions (Irrational Numbers, Italian/German Nationalism) are already costing measured recall points.",
    suggestedActions: [
      "Start the 15-minute revision on Irrational Numbers & Proofs",
      "Run the 20-minute comparative timeline on Nationalism in Italy & Germany",
      "Take the retrieval round on The First World War & Non-Cooperation",
    ],
    status: "at-risk",
  },
  {
    id: "g-3",
    title: "Maintain a 7-day learning streak",
    progress: 57,
    deadline: "Mon 25 Aug",
    whyItMatters:
      "Consistency, not intensity, is what your data shows drives mastery: your best mastery gains (Graphical Method +32 points) occurred during a sustained streak, not during long single sessions.",
    suggestedActions: [
      "Complete at least one scheduled session each evening",
      "Keep the Hindi balance session tonight to avoid a neglected subject",
    ],
    status: "on-track",
  },
  {
    id: "g-4",
    title: "Teach one concept this week",
    progress: 0,
    deadline: "Sun 24 Aug",
    whyItMatters:
      "Teach-back is the strongest mastery signal in your profile. Teaching forces retrieval, organization, and gap-detection that passive study cannot.",
    suggestedActions: [
      "Pick a topic from the Teach Cognify list (Nature of Roots is suggested)",
      "Write or record your explanation without notes",
      "Review the analysis and revisit the single missing idea",
    ],
    status: "on-track",
  },
];

export function stretchGoals(): StretchGoal[] {
  const mutations = listMutations<GoalMutation>(STORE_KEY);
  return DEFAULT_GOALS.map((g) => {
    const bump = mutations
      .filter((m) => m.goalId === g.id)
      .reduce((s, m) => s + (m.progressBump ?? 0), 0);
    const progress = Math.min(100, g.progress + bump);
    return {
      ...g,
      progress,
      status:
        progress >= 100 ? "achieved" : progress >= g.progress ? g.status : "at-risk",
    };
  });
}

export function bumpGoalProgress(goalId: string, points: number): void {
  mutate<GoalMutation>(STORE_KEY, { goalId, progressBump: points });
}

export function activeGoalTitle(): string {
  return stretchGoals().find((g) => g.status === "on-track")?.title ?? "";
}
