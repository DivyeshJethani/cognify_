/**
 * COGNIFY — The Cognify Assistant (Day 4)
 * Reasoned study guidance grounded in the student's profile and data.
 *
 * MOCK SERVICE. Future NestJS backend:
 *   POST /assistant/query { question, context } → AssistantReply
 *
 * This mock composes answers from the student's profile, session history and
 * knowledge state so the UI behaves like a data-grounded assistant rather
 * than a generic chatbot. Topic answers are keyed by topic id and pulled from
 * the curriculum-tied answer bank; a fallback composes a generic grounded
 * reply from the profile.
 */
import { learningDNA, recentActivity } from "./mockData";
import { eventsForResource } from "./playerEvents";
import type { AssistantReply } from "./types";

interface TopicAnswer {
  answer: string;
  steps: string[];
  mistakeHint?: string;
  dnaNote?: string;
}

const TOPIC_ANSWERS: Record<string, TopicAnswer> = {
  "t-1-relationship-between-zeros-c": {
    answer:
      "The sum of the zeros of ax² + bx + c is −b/a, and the product is c/a. The negative sign on the sum is where most students slip.",
    steps: [
      "Identify a, b, c from the polynomial (watch the sign of b).",
      "Sum of zeros = −b/a — the negative sign is deliberate and often missed.",
      "Product of zeros = c/a — no sign change here.",
      "Verify: add and multiply your candidate zeros; they must reproduce b and c.",
    ],
    mistakeHint:
      "Your last attempt dropped the negative sign — you computed the sum as 3 instead of −2. Keep −b/a as one token.",
    dnaNote: "Your Learning DNA selects diagrams and worked examples over text.",
  },
  "t-1-types-of-reactions": {
    answer:
      "There are four fundamental reaction types: combination (A + B → AB), decomposition (AB → A + B), displacement (A + BC → AC + B) and double displacement (AB + CD → AD + CB).",
    steps: [
      "Count reactants and products — one product suggests combination.",
      "A single reactant splitting apart is decomposition.",
      "If one element replaces another in a compound, it is displacement.",
      "If both compounds exchange partners, it is double displacement.",
    ],
    mistakeHint:
      "You have classified displacement reactions as double displacement 46% of the time. Check whether one or two compounds exchange partners.",
    dnaNote: "Your Learning DNA suggests a classification table as the fastest fix.",
  },
  "t-1-nutrition-in-humans": {
    answer:
      "Digestion follows a pathway: mouth (salivary amylase breaks starch), stomach (HCl + pepsin begin protein digestion), small intestine (complete digestion, complete absorption), large intestine (water absorption).",
    steps: [
      "Trace the food from mouth to intestine as a route map.",
      "Match each organ with its enzyme — this is where recall questions are scored.",
      "Remember absorption happens in the small intestine, water absorption in the large intestine.",
      "Label a diagram from memory — the strongest retrieval practice for this topic.",
    ],
    dnaNote: "Your Learning DNA favors labeled diagrams for organ-system topics.",
  },
  "t-0-the-first-world-war-non-coop": {
    answer:
      "The First World War forced economic change in India: forced recruitment, custom duties and war taxes. This hardship fueled the Non-Cooperation Movement, which began in 1920 with the boycott of foreign goods, courts and schools.",
    steps: [
      "Build the 1919–1922 timeline: war taxes → Rowlatt Act → Jallianwala Bagh → Khilafat → Non-Cooperation.",
      "For each event, memorize the year and one sentence of significance.",
      "Retell the chain from memory before reading the notes — this is the method that worked for you last week.",
    ],
    dnaNote: "Your session history shows timeline reconstruction gives the strongest recall gains.",
  },
};

function dnaLabel(): string {
  return learningDNA.topFormat ?? "explanation";
}

export function assistantReply(topicId: string, question: string): AssistantReply {
  const dna = learningDNA;
  const topic = TOPIC_ANSWERS[topicId];
  const topicLabel = topicId ? topicId : "your current topic";

  if (topic) {
    return {
      reply: [topic.answer, ...topic.steps.map((s, i) => `${i + 1}. ${s}`)].join("\n\n"),
      topicLabel,
      dnaNote: topic.dnaNote,
      mistakeHint: topic.mistakeHint,
    };
  }

  // Fallback: grounded generic reply composed from the profile & event ledger.
  const events = eventsForResource(topicId);
  const rewinds = events.filter((e) => e.type === "REWIND").length;
  const replays = events.filter((e) => e.type === "PLAY").length;
  return {
    reply: [
      `You asked: “${question}” — a good question. Before answering, it helps to know what you already understand about ${recentActivity[0]?.topic ?? "your current topic"}.`,
      `1. State the core idea in one sentence, then ask what specifically feels unclear.`,
      `2. I will ground my answer in your profile: your strongest recent session was “${recentActivity[0]?.topic ?? "your last topic"}”, so connect new ideas to that.`,
      `3. My suggestion is to answer through a worked ${dnaLabel()} — your Learning DNA scores that format highest.`,
      `4. Your event ledger for this resource shows ${replays} playbacks${rewinds > 0 ? ` and ${rewinds} rewinds — sections you revisited usually point to the gap` : ""}.`,
    ].join("\n\n"),
    topicLabel,
    dnaNote:
      "This is a simulated reasoning reply — the backend will ground answers in your full profile.",
  };
}
