/**
 * COGNIFY — Learning Session Flow (mock)
 *
 * The core loop made visible: WATCH → RETRIEVE → PRACTICE → ANALYSE →
 * UPDATE LEARNING DNA → NEXT RECOMMENDATION.
 *
 * This module owns the session state machine for the video learning
 * page (Session.tsx). It persists per-resource progress and per-topic
 * evidence entries to localStorage under cognify.session-flow.v1 so
 * the loop survives reloads. When the backend ships, watch/quiz/practice
 * events stream to the analytics API instead.
 */
import { learningDNA } from "./mockData";
import type { LearningFormat } from "./types";

const FLOW_KEY = "cognify.session-flow.v1";

export type FlowStage =
  | "ready"
  | "watching"
  | "watched"
  | "retrieval"
  | "retrieval-done"
  | "practice"
  | "confidence"
  | "complete";

export interface RetrievalQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface RetrievalResult {
  answered: number;
  correct: number;
  confidence: number; // 0–100 self-reported
  recordedAt: string;
}

export interface SessionFlowState {
  resourceId: string;
  stage: FlowStage;
  watched: boolean;
  watchedAt: string | null;
  retrieval: RetrievalResult | null;
  confidenceRating: number | null;
  completedAt: string | null;
  /** evidence written back to the Learning DNA */
  dnaEvidence: string[];
}

/* ------------------------------------------------------------------
 * Per-resource mock retrieval checks — 5 questions each, CBSE-real,
 * keyed by resource id so each resource has its own set.
 * ---------------------------------------------------------------- */

const RETRIEVAL_BANK: Record<string, RetrievalQuestion[]> = {
  /* Quadratics — factorisation */
  "r-yt-factorisation-concept": [
    {
      id: "f1",
      question: "What is the factorised form of x² − 5x + 6?",
      options: ["(x − 2)(x − 3)", "(x + 2)(x + 3)", "(x − 1)(x − 6)", "(x + 1)(x − 6)"],
      correctIndex: 0,
      explanation: "Two numbers that multiply to 6 and add to −5 are −2 and −3.",
    },
    {
      id: "f2",
      question: "To factorise ax² + bx + c by splitting the middle term, what must you find?",
      options: [
        "Two numbers whose sum is b and product is ac",
        "Two numbers whose sum is ac and product is b",
        "The LCM of a and c",
        "The HCF of b and c",
      ],
      correctIndex: 0,
      explanation: "Splitting the middle term needs p + q = b and p·q = a·c.",
    },
    {
      id: "f3",
      question: "If x = 2 is a zero of a polynomial p(x), which statement is always true?",
      options: ["p(2) = 0", "p(0) = 2", "(x − 2)² divides p(x)", "p(2) = 2"],
      correctIndex: 0,
      explanation: "By definition a zero α satisfies p(α) = 0, so (x − 2) is a factor.",
    },
    {
      id: "f4",
      question: "Factorise x² − 9.",
      options: ["(x − 3)(x − 3)", "(x − 3)(x + 3)", "(x − 9)(x + 1)", "Cannot be factorised"],
      correctIndex: 1,
      explanation: "Difference of squares: a² − b² = (a − b)(a + b).",
    },
    {
      id: "f5",
      question: "How many zeros can a quadratic polynomial have at most?",
      options: ["1", "2", "3", "Infinitely many"],
      correctIndex: 1,
      explanation: "A degree-2 polynomial has at most 2 zeros.",
    },
  ],
  /* Reactions — types of reactions */
  "r-khan-reactions": [
    {
      id: "t1",
      question: "Which type of reaction is: 2H₂O → 2H₂ + O₂?",
      options: ["Combination", "Decomposition", "Displacement", "Double displacement"],
      correctIndex: 1,
      explanation: "One reactant splits into simpler products — thermal decomposition.",
    },
    {
      id: "t2",
      question: "Fe + CuSO₄ → FeSO₄ + Cu is an example of?",
      options: ["Combination", "Decomposition", "Single displacement", "Double displacement"],
      correctIndex: 2,
      explanation: "A more reactive metal displaces a less reactive one from its salt.",
    },
    {
      id: "t3",
      question: "In 2Mg + O₂ → 2MgO, which substance is oxidised?",
      options: ["Oxygen", "Magnesium", "Magnesium oxide", "None"],
      correctIndex: 1,
      explanation: "Magnesium gains oxygen — gaining oxygen is oxidation.",
    },
    {
      id: "t4",
      question: "Which reaction absorbs energy from surroundings?",
      options: ["Exothermic", "Endothermic", "Combustion", "Neutralisation"],
      correctIndex: 1,
      explanation: "Endothermic reactions absorb heat; the surroundings cool.",
    },
    {
      id: "t5",
      question: "Balancing equations directly uses which law?",
      options: ["Law of constant proportions", "Law of conservation of mass", "Avogadro's law", "Dalton's law"],
      correctIndex: 1,
      explanation: "Atoms are neither created nor destroyed — total mass stays constant.",
    },
  ],
  /* First World War — non-cooperation */
  "r-yt-wwi-nationalism": [
    {
      id: "w1",
      question: "Which treaty ended the First World War?",
      options: ["Treaty of Paris", "Treaty of Versailles", "Treaty of Vienna", "Treaty of Brest-Litovsk"],
      correctIndex: 1,
      explanation: "The Treaty of Versailles (1919) imposed harsh terms on Germany.",
    },
    {
      id: "w2",
      question: "The 'war guilt clause' forced Germany to?",
      options: ["Join the League of Nations", "Accept blame and pay reparations", "Give up all colonies to France only", "Abolish its monarchy immediately"],
      correctIndex: 1,
      explanation: "Article 231 assigned blame; reparations of 6.6 billion pounds followed.",
    },
    {
      id: "w3",
      question: "Who led the Non-Cooperation Movement in India?",
      options: ["Subhas Bose", "Mahatma Gandhi", "Jawaharlal Nehru", "Bhagat Singh"],
      correctIndex: 1,
      explanation: "Gandhi launched it in 1920, withdrawing cooperation from British institutions.",
    },
    {
      id: "w4",
      question: "Non-cooperation involved all EXCEPT?",
      options: ["Boycotting British goods", "Resigning from government jobs", "Violent attacks on officials", "Refusing British titles"],
      correctIndex: 2,
      explanation: "The movement was strictly non-violent; violence ended its first phase.",
    },
    {
      id: "w5",
      question: "The Khilafat issue was connected to which power's treatment of the Ottoman emperor?",
      options: ["France", "Britain", "Russia", "Japan"],
      correctIndex: 1,
      explanation: "Indian Muslims feared for the Ottoman Caliph under British policy.",
    },
  ],
  /* Nutrition in humans */
  "r-khan-nutrition": [
    {
      id: "n1",
      question: "Where does starch digestion begin?",
      options: ["Stomach", "Mouth", "Small intestine", "Large intestine"],
      correctIndex: 1,
      explanation: "Salivary amylase in saliva starts breaking starch into maltose.",
    },
    {
      id: "n2",
      question: "Which organ produces bile?",
      options: ["Pancreas", "Liver", "Stomach", "Gall bladder"],
      correctIndex: 1,
      explanation: "The liver makes bile; the gall bladder stores it.",
    },
    {
      id: "n3",
      question: "Villi are found in the?",
      options: ["Stomach lining", "Small intestine lining", "Large intestine", "Oesophagus"],
      correctIndex: 1,
      explanation: "Villi massively increase the absorption surface of the small intestine.",
    },
    {
      id: "n4",
      question: "The main function of the large intestine is?",
      options: ["Protein digestion", "Water absorption", "Fat emulsification", "Acid secretion"],
      correctIndex: 1,
      explanation: "The large intestine absorbs water from undigested material.",
    },
    {
      id: "n5",
      question: "Which enzyme digests proteins in the stomach?",
      options: ["Amylase", "Lipase", "Pepsin", "Trypsin"],
      correctIndex: 2,
      explanation: "Pepsin, active in acidic pH, breaks proteins into peptides.",
    },
  ],
};

const FALLBACK_QUESTIONS: RetrievalQuestion[] = [
  {
    id: "g1",
    question: "What was the single most important idea in this resource?",
    options: ["It introduced a new definition", "It connected two ideas I already knew", "It showed a method I can reuse", "It corrected something I believed"],
    correctIndex: 3,
    explanation: "Any of these answers is defensible — what matters is that you can state one idea in your own words.",
  },
  {
    id: "g2",
    question: "If you had to teach this resource's topic in one sentence, you would say?",
    options: [
      "It is about memorising rules",
      "It is about understanding why the rules work",
      "It is only useful for exams",
      "It is too hard to explain",
    ],
    correctIndex: 1,
    explanation: "Cognify measures learning by whether you can re-explain the idea — not by re-watching.",
  },
  {
    id: "g3",
    question: "Which part of the resource would you revisit before a test?",
    options: ["The opening summary", "The worked example", "The closing recap", "I don't know yet"],
    correctIndex: 1,
    explanation: "Worked examples carry the highest retrieval value — practice them first.",
  },
  {
    id: "g4",
    question: "We've noticed you learn best with visual diagrams. How did this video feel?",
    options: [
      "The diagrams made the concept much clearer",
      "I prefer reading text over watching diagrams",
      "The visuals were a bit distracting",
      "I didn't notice any diagrams",
    ],
    correctIndex: 0,
    explanation: "Using your preferred learning style helps you master new topics faster.",
  },
  {
    id: "g5",
    question: "What's the best next step after finishing this video?",
    options: ["Watch another video right away", "Test what I remember, then practice", "Take a long break", "Read the same transcript again"],
    correctIndex: 1,
    explanation: "Testing yourself right after learning is the best way to make it stick.",
  },
];

export function retrievalQuestionsFor(resourceId: string): RetrievalQuestion[] {
  return RETRIEVAL_BANK[resourceId] ?? FALLBACK_QUESTIONS;
}

/* ------------------------------------------------------------------
 * State machine
 * ---------------------------------------------------------------- */

function loadAll(): Record<string, SessionFlowState> {
  try {
    return JSON.parse(localStorage.getItem(FLOW_KEY) ?? "{}") as Record<string, SessionFlowState>;
  } catch {
    return {};
  }
}

function saveAll(all: Record<string, SessionFlowState>) {
  localStorage.setItem(FLOW_KEY, JSON.stringify(all));
}

export function flowStateFor(resourceId: string): SessionFlowState {
  return (
    loadAll()[resourceId] ?? {
      resourceId,
      stage: "ready",
      watched: false,
      watchedAt: null,
      retrieval: null,
      confidenceRating: null,
      completedAt: null,
      dnaEvidence: [],
    }
  );
}

function persist(state: SessionFlowState) {
  const all = loadAll();
  all[state.resourceId] = state;
  saveAll(all);
}

export function markWatched(resourceId: string): SessionFlowState {
  const s = flowStateFor(resourceId);
  s.watched = true;
  s.watchedAt = new Date().toISOString();
  s.stage = s.retrieval ? "retrieval-done" : "retrieval";
  s.dnaEvidence = [
    ...s.dnaEvidence,
    "Progress updated: You've finished watching the entire resource.",
  ];
  persist(s);
  return s;
}

export function recordRetrieval(
  resourceId: string,
  result: { answered: number; correct: number; confidence: number }
): SessionFlowState {
  const s = flowStateFor(resourceId);
  s.retrieval = { ...result, recordedAt: new Date().toISOString() };
  s.stage = "practice";
  const pct = Math.round((result.correct / Math.max(1, result.answered)) * 100);
  s.dnaEvidence = [
    ...s.dnaEvidence,
    `Progress updated: You got ${result.correct} out of ${result.answered} questions right!`,
  ];
  persist(s);
  return s;
}

export function recordConfidence(resourceId: string, rating: number): SessionFlowState {
  const s = flowStateFor(resourceId);
  s.confidenceRating = rating;
  s.stage = "complete";
  s.completedAt = new Date().toISOString();
  s.dnaEvidence = [
    ...s.dnaEvidence,
    `Progress updated: You're feeling confident about this topic.`,
  ];
  persist(s);
  return s;
}

export function resetFlow(resourceId: string): SessionFlowState {
  const fresh = {
    resourceId,
    stage: "ready" as FlowStage,
    watched: false,
    watchedAt: null,
    retrieval: null,
    confidenceRating: null,
    completedAt: null,
    dnaEvidence: [] as string[],
  };
  const all = loadAll();
  delete all[resourceId];
  saveAll(all);
  return fresh;
}

/** Watched-but-not-verified resources, for the Continue Learning rail. */
export function unfinishedRetrieval(): SessionFlowState[] {
  return Object.values(loadAll()).filter(
    (s) => s.watched && (!s.retrieval || s.confidenceRating === null)
  );
}

/* ------------------------------------------------------------------
 * DNA linkage — the loop's 'UPDATE LEARNING DNA' step
 * ---------------------------------------------------------------- */

export interface DnaUpdateNote {
  dimension: string;
  finding: string;
  implication: string;
}

/**
 * Composes a Learning DNA update note from the session's evidence.
 * The real backend writes this into the DNA record; the frontend
 * displays the note as the visible 'DNA update' moment.
 */
export function composeDnaUpdate(
  resourceId: string,
  topicLabel: string
): DnaUpdateNote {
  const s = flowStateFor(resourceId);
  const pct = s.retrieval
    ? Math.round((s.retrieval.correct / Math.max(1, s.retrieval.answered)) * 100)
    : null;
  
  let finding: string;
  let implication: string;
  
  if (pct === null) {
    finding = `You're just getting started with ${topicLabel}.`;
    implication = "Complete the quick check to see how much you've learned.";
  } else if (pct >= 80) {
    finding = `Great job! You've mastered the main points of ${topicLabel} (${pct}% correct).`;
    implication = "You're ready for some practice problems now.";
  } else if (pct >= 50) {
    finding = `Good start! You've got a solid grasp of ${topicLabel} (${pct}% correct).`;
    implication = "A bit more practice will help you clear up the remaining details.";
  } else {
    finding = `This topic is a bit tricky. You got ${pct}% correct on the first try.`;
    implication = "We'll suggest a simpler visual review to help you out.";
  }
  
  return {
    dimension: "Progress Update",
    finding,
    implication,
  };
}
