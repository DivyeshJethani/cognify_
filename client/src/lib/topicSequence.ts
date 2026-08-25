/**
 * COGNIFY — Learn This Topic: 7-stage sequence engine (mock)
 *
 * Every topic in the curriculum resolves into the same evidence-based
 * learning arc: CONCEPT → VISUAL EXPLANATION → WORKED EXAMPLE → VIDEO
 * → RETRIEVAL → PRACTICE → TEACH-BACK.
 *
 * Stage 1–5 carry CBSE-real per-topic content (a concept line, a
 * visual cue, a worked example, the anchor video resource id and the
 * retrieval set), sourced from the existing inventory so every link
 * points at a real resource. Generic content fills the remaining
 * topics until the curriculum content pipeline ships.
 *
 * This is the frontend half of GET /api/topics/:id/sequence.
 */
import { topicPath, topicAlias } from "./curriculum";
import { INVENTORY_EXPORT, classifyType, type RawResource } from "./resourceDiscovery";
import { retrievalQuestionsFor } from "./learningSessionFlow";

export type StageKey =
  | "concept"
  | "visual"
  | "worked-example"
  | "video"
  | "retrieval"
  | "practice"
  | "teach-back";

export interface StageInfo {
  key: StageKey;
  index: number;
  numeral: string;
  label: string;
  purpose: string;
  timeMinutes: number;
  resourceId?: string;
  body?: string;
  /** For stages that generate questions: question count */
  questionCount?: number;
  /** For practice: what to expect */
  practiceNote?: string;
  /** For teach-back: prompt + key points */
  teachPrompt?: string;
  teachPoints?: string[];
}

const NUMERALS = ["I", "II", "III", "IV", "V", "VI", "VII"];

/* ------------------------------------------------------------------
 * Topic-family content — keyed by the topic alias used across the app
 * ---------------------------------------------------------------- */

interface FamilyContent {
  concept: string;
  visual: string;
  workedExample: string;
  retrievalPrompt: string;
  practiceNote: string;
  teachPrompt: string;
  teachPoints: string[];
  /** stage-4 anchor video resource ids (primary, alternative) */
  videoIds: string[];
  /** stage-6 practice resource ids */
  practiceIds: string[];
}

const FAMILY: Record<string, FamilyContent> = {
  "t-0-standard-form-factorisation": {
    concept:
      "Every quadratic can be written as ax² + bx + c = 0. Factorisation rewrites it as a product of two linear factors — the zeros fall out immediately because a product is zero only when one factor is.",
    visual:
      "Sketch y = x² − 5x + 6. The parabola crosses the x-axis at x = 2 and x = 3 — those crossings are the zeros, and they are exactly what the factors (x − 2)(x − 3) encode.",
    workedExample:
      "Solve x² − 7x + 12 = 0 by splitting the middle term. Find p, q with p + q = −7 and p·q = 12: p = −3, q = −4. So x² − 3x − 4x + 12 = x(x − 3) − 4(x − 3) = (x − 3)(x − 4) = 0, giving x = 3 or x = 4. Verify: 3² − 21 + 12 = 0. ✓",
    retrievalPrompt:
      "Without looking at anything: factorise x² − 5x + 6, then state the two zeros.",
    practiceNote:
      "Five problems — two split-the-middle-term, two special identities (difference of squares, perfect square), one word problem. Your error profile says watch the sign of the split terms.",
    teachPrompt:
      "Teach factorisation of a quadratic to a Class 9 student who has never seen it. Start with what a zero is, not with a formula.",
    teachPoints: [
      "Define a zero: p(α) = 0 means α is a zero",
      "Connect zeros to factors: (x − α) divides p(x)",
      "Split the middle term: p + q = b, p·q = ac",
      "Show the identity shortcut a² − b² = (a − b)(a + b)",
      "Verify by re-expanding — the algebra checks itself",
    ],
    videoIds: ["r-yt-factorisation-concept", "r-learn-qf"],
    practiceIds: ["r-prac-factorisation", "r-prac-circ"],
  },
  "t-1-types-of-reactions": {
    concept:
      "A reaction is classified by what happens to the substances: combination builds, decomposition breaks, displacement swaps a more reactive element in, and double displacement swaps ions between two compounds. The same transformation can be oxidation (gaining oxygen) and exothermic (releasing heat) at once.",
    visual:
      "Draw a simple swap diagram: Fe dives into CuSO₄ solution, Cu rises out. The reactivity-series ladder explains who displaces whom — a metal higher up always wins.",
    workedExample:
      "Balance and classify: Fe + CuSO₄ → FeSO₄ + Cu. Already balanced (1 : 1 : 1 : 1). Iron is above copper in the reactivity series, so this is a single displacement. Copper's blue solution fades as Fe²⁺ forms — colour change is your observation clue.",
    retrievalPrompt:
      "Classify these at sight: 2H₂O → 2H₂ + O₂, and 2Mg + O₂ → 2MgO. Which substance is oxidised in the second?",
    practiceNote:
      "Ten classification items plus three balancing problems. Watch the exothermic/endothermic pairing — your last attempt confused which direction the heat flows.",
    teachPrompt:
      "Explain displacement reactions using only a reactivity-series ladder and one real example per direction.",
    teachPoints: [
      "Higher metal displaces lower metal from its salt solution",
      "Combination: A + B → AB; Decomposition: AB → A + B",
      "Oxidation = gain of oxygen; Reduction = loss of oxygen",
      "Exothermic releases heat; endothermic absorbs it",
      "Balancing enforces conservation of mass",
    ],
    videoIds: ["r-khan-reactions", "r-learn-redox"],
    practiceIds: ["r-prac-balancing", "r-prac-redox"],
  },
  "t-0-the-first-world-war-non-coop": {
    concept:
      "The Treaty of Versailles ended the war but engineered the next one: war-guilt clause, reparations of £6.6 billion, territorial losses. In India the same era produced Non-Cooperation (1920): Gandhi fused the Khilafat cause with the independence movement to build the first mass non-violent campaign.",
    visual:
      "A two-lane timeline: 1919 Versailles → 1920 Khilafat + Non-Cooperation launched → 1922 Chauri Chaura violence ends phase one. Notice how a single event in a village redirected the national movement.",
    workedExample:
      "Source question: 'Germany signed the treaty to avoid invasion.' Does the source support the claim the treaty was fair? No — the source records acceptance under duress; fairness requires terms negotiated between equals, which reparations and war guilt explicitly deny.",
    retrievalPrompt:
      "Name three harsh terms imposed on Germany, and two methods Indians used to express non-cooperation.",
    practiceNote:
      "Four source-based questions in CBSE board format (identify, analyse, conclude) plus two 80-word answer drills. Structure your conclusions with the evidence first.",
    teachPrompt:
      "Explain in two minutes why Non-Cooperation was called off, and whether that decision strengthened or weakened the movement.",
    teachPoints: [
      "Treaty of Versailles: blame, reparations, territory, military limits",
      "Khilafat + Swaraj fused mass Hindu-Muslim participation",
      "Non-cooperation methods: boycott, resignations, strikes, swadeshi",
      "Chauri Chaura 1922: violence ended the first phase",
      "The decision showed the movement's commitment to non-violence",
    ],
    videoIds: ["r-yt-wwi-nationalism", "r-learn-fr"],
    practiceIds: ["r-prac-sources-wwi", "r-prac-balkans"],
  },
  "t-1-nutrition-in-humans": {
    concept:
      "Digestion is a pipeline: mechanical breakdown in the mouth, chemical breakdown by enzymes along the tube, and absorption through a vastly expanded surface — villi turn the small intestine into a carpet of uptake sites. Each enzyme has one job and one working pH.",
    visual:
      "Trace one mouthful of rice and dal: amylase attacks starch in the mouth, pepsin takes proteins in acid stomach fluid, bile emulsifies fats in the duodenum, pancreatic enzymes finish the job, villi absorb everything — water alone survives to the large intestine.",
    workedExample:
      "Why does pepsin work in the stomach but not the mouth? Pepsin needs pH ≈ 2; HCl supplies that environment. Saliva is near neutral, so pepsin is inactive there — enzymes are place-locked. That is why the pancreas must add alkaline juice to neutralise acid in the duodenum.",
    retrievalPrompt:
      "Where does starch digestion begin, which organ makes bile, and where do villi sit?",
    practiceNote:
      "Six labelling and reasoning questions on the alimentary canal diagram, plus three 'explain the observation' items in the style of your last practice attempt.",
    teachPrompt:
      "Teach the journey of a slice of bread through the human digestive system, naming one enzyme per station.",
    teachPoints: [
      "Mouth: salivary amylase starts starch digestion",
      "Stomach: HCl + pepsin, protein breakdown",
      "Liver makes bile; gall bladder stores; emulsifies fats",
      "Small intestine: villi maximise absorption surface",
      "Large intestine: water absorption only",
    ],
    videoIds: ["r-khan-nutrition", "r-learn-se"],
    practiceIds: ["r-prac-digest", "r-prac-nutrition"],
  },
  "t-0-euclid-s-division-lemma-hcf": {
    concept:
      "Euclid's division lemma — for any positive integers a and b there exist unique q and r with a = bq + r, 0 ≤ r < b — is the engine behind the division algorithm for HCF: keep dividing, keep replacing, until the remainder hits zero. The last non-zero remainder is the HCF.",
    visual:
      "A remainder ladder for HCF(225, 135): 225 = 135·1 + 90 → 135 = 90·1 + 45 → 90 = 45·2 + 0. Each step the numbers shrink; the bottom of the ladder is the answer — no prime factorisation needed.",
    workedExample:
      "HCF(468, 222): 468 = 222·2 + 24; 222 = 24·9 + 6; 24 = 6·4 + 0. HCF = 6. Every step you carry the previous divisor and remainder — write each line as 'divisor = quotient·... + remainder' to avoid the classic slip of subtracting instead of dividing.",
    retrievalPrompt:
      "State Euclid's lemma with its condition on r, then run the algorithm on HCF(196, 38220) — the big number first, always.",
    practiceNote:
      "Five algorithm drills plus two lemma-application proofs. Your repeated remainder error from the last attempt gets a dedicated correction item.",
    teachPrompt:
      "Prove to a sceptical friend that Euclid's algorithm always stops, and why the last remainder is the HCF.",
    teachPoints: [
      "Lemma statement with 0 ≤ r < b",
      "Each step: a = bq + r, replace (a, b) by (b, r)",
      "Remainders strictly decrease → the process stops",
      "Divisors of a and b equal divisors of b and r",
      "Last non-zero remainder is the HCF",
    ],
    videoIds: ["r-khan-euclid", "r-lp-euclid"],
    practiceIds: ["r-prac-hcf", "r-prac-euclid"],
  },
  "t-1-irrational-numbers-proofs": {
    concept:
      "Proof by contradiction: assume the opposite of what you want, and derive an impossibility. For √2: assume it is rational, write √2 = p/q in lowest terms, square both sides, and parity chasing forces p and q to share a factor of 2 — contradicting 'lowest terms'.",
    visual:
      "A parity seesaw: 2q² = p² means p² is even, so p is even, so p² is divisible by 4, so q² is even, so q is even — both sides of the seesaw land on 'even', breaking the lowest-terms assumption.",
    workedExample:
      "Prove √3 irrational: assume √3 = p/q lowest terms → 3q² = p² → 3 | p² → 3 | p (3 is prime) → p = 3m → 3q² = 9m² → q² = 3m² → 3 | q. Both divisible by 3 — contradiction. The prime-divisibility step ('p² divisible by prime p ⇒ p divides the base') is the hinge; get it right and √5, √7 follow the same skeleton.",
    retrievalPrompt:
      "Reconstruct the √2 proof from memory in four lines, naming the contradiction explicitly.",
    practiceNote:
      "Three full contradiction proofs (√2, √3, 3 + √5) and four rational-or-irrational classification items. Watch the 'assume lowest terms' opening — it is worth a full mark on its own.",
    teachPrompt:
      "Walk someone through why 'assume √2 = p/q in lowest terms' is the make-or-break step of the whole proof.",
    teachPoints: [
      "Assume rational in lowest terms p/q",
      "Square and clear denominators",
      "Prime divisibility: p² divisible by prime ⇒ p divisible by that prime",
      "Both p and q share the prime — contradiction",
      "Conclusion: the assumption was false; the number is irrational",
    ],
    videoIds: ["r-khan-fta", "r-learn-da"],
    practiceIds: ["r-prac-irrational", "r-prac-proofs"],
  },
};

/* ------------------------------------------------------------------
 * Generic content — used for any topic without family content
 * ---------------------------------------------------------------- */

function genericContent(topicTitle: string): FamilyContent {
  return {
    concept: `Break ${topicTitle.toLowerCase()} into the single idea the whole chapter depends on — state it in one sentence before you touch any resource.`,
    visual:
      "Find the visual explanation in the library and trace it with your finger: diagrams that you physically follow encode roughly twice as well as passive viewing.",
    workedExample:
      "Re-derive one solved example with the solution hidden: write each step yourself, then compare. The gap between your version and the model is the practice list for later.",
    retrievalPrompt: `Without looking: write down the definition or core rule of ${topicTitle.toLowerCase()} from memory, then check it against the resource.`,
    practiceNote:
      "Five to ten problems from the practice sets for this topic, weighted toward your recorded mistake pattern.",
    teachPrompt: `Teach ${topicTitle.toLowerCase()} to a Class 9 student in your own words. If you need the textbook, you haven't finished learning it.`,
    teachPoints: [
      `The core definition or law behind ${topicTitle.toLowerCase()}`,
      "One worked example you can solve without help",
      "The most common mistake on this topic and how to avoid it",
      "Where this idea shows up later in the syllabus",
      "A real-world situation where the idea applies",
    ],
    videoIds: [],
    practiceIds: [],
  };
}

function familyFor(topicId: string): { content: FamilyContent; alias: string | null } {
  const alias = topicAlias(topicId);
  const content = (alias && FAMILY[alias]) ?? null;
  if (content) return { content, alias };
  // match by partial alias containment (family aliases may differ from exact id)
  if (alias) {
    for (const [key, c] of Object.entries(FAMILY)) {
      if (alias.includes(key.slice(2)) || key.includes(alias.slice(2))) {
        return { content: c, alias };
      }
    }
  }
  return { content: null as unknown as FamilyContent, alias };
}

/* ------------------------------------------------------------------
 * Sequence builder
 * ---------------------------------------------------------------- */

export interface TopicSequence {
  topicId: string;
  topicTitle: string;
  subjectName: string;
  chapterTitle: string;
  stages: StageInfo[];
  totalMinutes: number;
}

export function buildTopicSequence(topicId: string): TopicSequence | null {
  const path = topicPath(topicId);
  if (!path) return null;
  const alias = topicAlias(topicId);
  const { content, alias: familyAlias } = familyFor(topicId);
  const isGeneric = content == null;
  const family = isGeneric
    ? genericContent(path.topic.title)
    : (content as FamilyContent);
  const stage4Video = family.videoIds?.[0] ?? bestResourceForTopic(topicId, "lecture");
  const stage6Practice = family.practiceIds?.[0] ?? bestResourceForTopic(topicId, "practice");
  const q = retrievalQuestionsFor(stage4Video ?? "fallback").slice(0, 5);

  const stages: StageInfo[] = [
    {
      key: "concept",
      index: 0,
      numeral: NUMERALS[0],
      label: "Concept",
      purpose: "Lock the single idea the topic stands on",
      timeMinutes: 5,
      body: family.concept,
    },
    {
      key: "visual",
      index: 1,
      numeral: NUMERALS[1],
      label: "Visual Explanation",
      purpose: "See the idea before you hear it",
      timeMinutes: 8,
      body: family.visual,
      resourceId: bestResourceForTopic(topicId, "diagram") ?? undefined,
    },
    {
      key: "worked-example",
      index: 2,
      numeral: NUMERALS[2],
      label: "Worked Example",
      purpose: "Watch the method, then reproduce it unaided",
      timeMinutes: 10,
      body: family.workedExample,
      resourceId: bestResourceForTopic(topicId, "example") ?? undefined,
    },
    {
      key: "video",
      index: 3,
      numeral: NUMERALS[3],
      label: "Anchor Lecture",
      purpose: "Full explanation with retrieval checkpoint",
      timeMinutes: 15,
      resourceId: stage4Video,
    },
    {
      key: "retrieval",
      index: 4,
      numeral: NUMERALS[4],
      label: "Retrieval Check",
      purpose: "Prove you can recall it, not recognise it",
      timeMinutes: 5,
      body: family.retrievalPrompt,
      questionCount: q.length,
    },
    {
      key: "practice",
      index: 5,
      numeral: NUMERALS[5],
      label: "Targeted Practice",
      purpose: "Solve, err, classify the errors",
      timeMinutes: 20,
      resourceId: stage6Practice,
      practiceNote: family.practiceNote,
    },
    {
      key: "teach-back",
      index: 6,
      numeral: NUMERALS[6],
      label: "Teach Cognify",
      purpose: "Re-explain the topic — the strongest mastery signal",
      timeMinutes: 12,
      teachPrompt: family.teachPrompt,
      teachPoints: family.teachPoints,
    },
  ];

  return {
    topicId: alias ?? topicId,
    topicTitle: path.topic.title,
    subjectName: path.subject.name,
    chapterTitle: path.chapter.title,
    stages,
    totalMinutes: stages.reduce((a, s) => a + s.timeMinutes, 0),
  };
}

/* ------------------------------------------------------------------
 * Inventory helpers
 * ---------------------------------------------------------------- */

function bestResourceForTopic(
  topicId: string,
  kind: "lecture" | "practice" | "diagram" | "example"
): string | null {
  const alias = topicAlias(topicId) ?? topicId;
  const raw = INVENTORY_EXPORT[alias];
  if (!raw) return null;
  const wanted: Record<string, (r: RawResource) => boolean> = {
    lecture: (r) => classifyType(r) === "video-lecture" || classifyType(r) === "concept-explanation",
    practice: (r) => classifyType(r) === "practice-set" || classifyType(r) === "quick-revision",
    diagram: (r) => classifyType(r) === "diagram" || classifyType(r) === "animation-visual",
    example: (r) => classifyType(r) === "solved-example",
  };
  const pred = wanted[kind] ?? (() => false);
  const hit = raw.find(pred);
  return hit?.id ?? null;
}
