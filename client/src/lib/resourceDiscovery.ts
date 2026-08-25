/**
 * COGNIFY — Resource Discovery Service (mock)
 *
 * This module simulates the future backend resource-discovery API.
 * When the NestJS backend ships, this entire file is replaced by an axios
 * client hitting e.g. GET /api/discovery/resources?topicId=...&formats=...
 *
 * Design commitments:
 * - Every resource is curriculum-real (CBSE Class 10 content), tied to a
 *   concrete Topic id, chapter and subject code from the curriculum data.
 * - Each resource carries relevance (DNA + mastery aware ranking), a
 *   difficulty tier, and a "why recommended" reason written per-student.
 * - Sources are labelled honestly: YouTube channels, NCERT/CBSE official
 *   resources, free education websites. The UI never pretends the entire
 *   internet has been searched — rankingNote explains the provenance.
 */
import type {
  Difficulty,
  LearningResource,
  LearningInteractionType,
  ResourceDiscoveryResult,
  ResourceFormat,
  ResourceSource,
  ResourceType,
  TranscriptSegment,
  TimelineNote,
} from "./types";
import { boards } from "./mockData";
import { findTopicByIdOrAlias } from "./curriculum";

const DNA = {
  topFormat: "visual-diagram" as const,
  mistakeProfile: { conceptual: 46, careless: 31, procedural: 23 },
  attention: "Focus is strongest in short, visual sessions",
  confidenceCalibration: "You're building confidence on new topics",
};

export interface RawResource {
  id: string;
  title: string;
  source: ResourceSource;
  sourceLabel: string;
  durationMinutes: number;
  format: ResourceFormat;
  difficulty: Difficulty;
  relevance: number;
  whyRecommended: string;
  dnaDimension: string | null;
}

/* ------------------------------------------------------------------
 * Resource type taxonomy — ten COGNIFY resource types. Derived from the
 * raw format/source/title so the entire inventory classifies itself.
 * ---------------------------------------------------------------- */

export interface ResourceTypeMeta {
  id: ResourceType;
  label: string;
  /** Monogram used in ledgers and badges */
  glyph: string;
  showsDuration: boolean;
}

export const RESOURCE_TYPES: ResourceTypeMeta[] = [
  { id: "video-lecture", label: "Video lecture", glyph: "▶", showsDuration: true },
  { id: "article", label: "Article", glyph: "¶", showsDuration: false },
  { id: "ncert-textbook", label: "NCERT / textbook", glyph: "▤", showsDuration: true },
  { id: "diagram", label: "Diagram", glyph: "◫", showsDuration: true },
  { id: "animation-visual", label: "Animation / visual", glyph: "◎", showsDuration: true },
  { id: "revision-notes", label: "Revision notes", glyph: "✎", showsDuration: true },
  { id: "solved-example", label: "Solved example", glyph: "✎", showsDuration: true },
  { id: "practice-set", label: "Practice set", glyph: "Px", showsDuration: true },
  { id: "quick-revision", label: "Quick revision", glyph: "↻", showsDuration: true },
  { id: "concept-explanation", label: "Concept explanation", glyph: "⊙", showsDuration: true },
];

export function typeMeta(id: ResourceType): ResourceTypeMeta {
  return RESOURCE_TYPES.find((t) => t.id === id) ?? RESOURCE_TYPES[0];
}

const FREE_SOURCES: ResourceSource[] = ["youtube", "ncert", "cbse", "edu-website"];

/** Classify a raw resource into one of the ten COGNIFY resource types. */
export function classifyType(r: RawResource): ResourceType {
  const t = r.title.toLowerCase();
  const free = FREE_SOURCES.includes(r.source);
  if (free && (r.source === "ncert" || r.source === "cbse")) return "ncert-textbook";
  if (free && r.source === "youtube" && r.format === "lecture") return "video-lecture";
  if (r.format === "diagram" && (t.includes("animat") || t.includes("drag") || t.includes("interactive") || t.includes("mechanism")))
    return "animation-visual";
  if (r.format === "diagram") return "diagram";
  if (r.format === "practice") return "practice-set";
  if (r.format === "example") return "solved-example";
  if (r.format === "revision" && (r.durationMinutes <= 15 || t.includes("rapid")))
    return "quick-revision";
  if (r.format === "revision") return "revision-notes";
  if (r.format === "lecture") return free ? "video-lecture" : "concept-explanation";
  if (r.format === "explanation") return "concept-explanation";
  return "article";
}

/** One-line description derived from the resource's own fields. */
function describe(r: RawResource): string {
  const t = r.title.toLowerCase();
  if (r.format === "lecture") return "A guided walkthrough of the topic — play it, pause it, ask questions as they come.";
  if (r.format === "explanation") return "One idea explained on its own terms, with the misconceptions around it named.";
  if (r.format === "revision") return "A personalized review of exactly what you need to refresh today.";
  if (r.format === "example") return "Worked problems in board style — follow the solution structure, not just the answer.";
  if (r.format === "practice") return "A timed practice session focused on the types of questions you've seen recently.";
  if (r.format === "diagram") return "A visual treatment — diagrams, maps or interactive visuals for the objectives that are picture-shaped.";
  return "A short, focused treatment of the topic in its own format.";
}

/* ------------------------------------------------------------------
 * Canonical aliases — the inventory keys below are stable, human-readable
 * topic slugs. mockData generates truncated, per-chapter ids at runtime
 * (e.g. "t-1-relationship-between-zeros-c"). This map bridges the two so
 * the discovery service, transcript store and frontend links all resolve
 * to the same topics regardless of id scheme changes.
 * ---------------------------------------------------------------- */
export const TOPIC_ALIASES: Record<string, string> = {
  "t-0-euclid-s-division-lemma-hcf": "t-0-euclid-s-division-lemma-hcf",
  "t-1-irrational-numbers-proofs": "t-1-irrational-numbers-proofs",
  "t-2-fundamental-theorem-of-arithmetic": "t-2-fundamental-theorem-of-arith",
  "t-3-zeros-of-a-polynomial": "t-0-zeros-of-a-polynomial",
  "t-4-relationship-between-zeros-coefficients": "t-1-relationship-between-zeros-c",
  "t-5-division-algorithm-for-polynomials": "t-2-division-algorithm-for-polyn",
  "t-6-graphical-method": "t-0-graphical-method",
  "t-7-substitution-elimination-methods": "t-1-substitution-elimination-met",
  "t-8-cross-multiplication-word-problems": "t-2-cross-multiplication-word-pr",
  "t-9-standard-form-factorisation": "t-0-standard-form-factorisation",
  "t-10-completing-the-square": "t-1-completing-the-square",
  "t-11-nature-of-roots-discriminant": "t-2-nature-of-roots-discriminant",
  "t-6-quadratic-formula-applications": "t-2-nature-of-roots-discriminant",
  "t-0-writing-balancing-equations": "t-0-writing-balancing-equations",
  "t-1-types-of-reactions": "t-1-types-of-reactions",
  "t-2-oxidation-reduction-corrosion": "t-2-oxidation-reduction-corrosio",
  "t-3-properties-of-acids-bases": "t-0-properties-of-acids-bases",
  "t-4-ph-scale-strength": "t-1-ph-scale-strength",
  "t-5-nutrition-in-plants": "t-0-nutrition-in-plants",
  "t-2-relationship-between-zeros-coefficients": "t-4-relationship-between-zeros-coefficients",
  "t-1-substitution-elimination-methods": "t-7-substitution-elimination-methods",
  "t-0-nutrition-in-humans": "t-6-nutrition-in-humans",
  "t-7-transportation-excretion": "t-2-transportation-excretion",
  "t-0-french-revolution-idea-of-nation": "t-0-the-french-revolution-the-id",
  "t-1-making-of-nationalism-italy-germany": "t-1-making-of-nationalism-in-ita",
  "t-3-first-world-war-non-cooperation": "t-0-the-first-world-war-non-coop",
  "t-4-civil-disobedience-collective-belonging": "t-1-civil-disobedience-sense-of-",
  "t-0-a-letter-to-god": "t-0-a-letter-to-god",
  "t-1-nelson-mandela": "t-1-nelson-mandela-long-walk-to-",
  "t-2-two-stories-about-flying": "t-2-two-stories-about-flying",
  "t-0-maa-ki-chitthi": "t-0-maa-ki-chitthi",
  "t-1-lhasa-ki-or": "t-1-lhasa-ki-or",
  "t-0-achha-vakt-mein-bhale-kaam": "t-0-achha-vakt-mein-bhale-kaam",
};

/** Resolve any topic identifier to the INVENTORY key (an alias slug).
 *  INVENTORY is keyed by stable aliases; runtime ids (generated by mockData)
 *  are reverse-mapped through TOPIC_ALIASES values. */
export function resolveAlias(slug: string): string | null {
  if (!slug) return null;
  // direct inventory hit — slug is already an alias key
  if (slug in INVENTORY) return slug;
  // slug is a known alias → its mapped value is the INVENTORY key when it
  // lives in the inventory; otherwise fall through to reverse mapping
  if (slug in TOPIC_ALIASES && TOPIC_ALIASES[slug] in INVENTORY) return TOPIC_ALIASES[slug];
  // slug is a runtime id → find its alias key
  const aliasKey = Object.entries(TOPIC_ALIASES).find(([, realId]) => realId === slug)?.[0] ?? null;
  if (aliasKey && aliasKey in INVENTORY) return aliasKey;
  // slug is a known alias whose value is not in the inventory — reverse map
  // by the value instead (covers truncated canonical ids)
  if (slug in TOPIC_ALIASES) {
    const rev = Object.entries(TOPIC_ALIASES).find(([, realId]) => realId === TOPIC_ALIASES[slug])?.[0] ?? null;
    if (rev && rev in INVENTORY) return rev;
  }
  return null;
}

/** Alias (stable) ids, exposed for links and UIs */
export const ALIAS_IDS: string[] = Object.keys(TOPIC_ALIASES);

/* ------------------------------------------------------------------
 * Raw resource inventory — keyed by stable alias slug
 * ---------------------------------------------------------------- */
const INVENTORY: Record<string, RawResource[]> = {
  /* ---------- MATHEMATICS: Real Numbers ---------- */
  "t-0-euclid-s-division-lemma-hcf": [
    {
      id: "r-khan-euclid",
      title: "Euclid's Division Lemma — step by step with worked HCF",
      source: "youtube",
      sourceLabel: "YouTube · Khan Academy India",
      durationMinutes: 14,
      format: "lecture",
      difficulty: "core",
      relevance: 92,
      whyRecommended: "This walkthrough focuses on the parts you've found tricky lately.",
      dnaDimension: "Step-by-step sequencing",
    },
    {
      id: "r-ncert-euclid",
      title: "NCERT Class 10 Maths — Chapter 1 Real Numbers, Ex 1.1 worked examples",
      source: "ncert",
      sourceLabel: "NCERT Official",
      durationMinutes: 20,
      format: "example",
      difficulty: "core",
      relevance: 88,
      whyRecommended: "NCERT's own worked examples — closest to what your exam will actually ask.",
      dnaDimension: null,
    },
    {
      id: "r-diagram-euclid",
      title: "Euclidean division as repeated subtraction — animated diagram",
      source: "edu-website",
      sourceLabel: "Vedantu Visual Maths",
      durationMinutes: 6,
      format: "diagram",
      difficulty: "foundational",
      relevance: 79,
      whyRecommended: "A quick visual primer to help you understand the concept through diagrams.",
      dnaDimension: "Teaching format",
    },
    {
      id: "r-prac-euclid",
      title: "Timed drill — HCF by Euclid's algorithm, 10 questions",
      source: "cognify-original",
      sourceLabel: "COGNIFY practice engine",
      durationMinutes: 15,
      format: "practice",
      difficulty: "core",
      relevance: 94,
      whyRecommended: "A great way to practice the steps and build your confidence.",
      dnaDimension: "Mistake pattern",
    },
    {
      id: "r-lp-euclid",
      title: "Euclid's Division Algorithm — long-play lecture with pause exercises",
      source: "youtube",
      sourceLabel: "YouTube · Physics Wallah Foundation",
      durationMinutes: 42,
      format: "lecture",
      difficulty: "advanced",
      relevance: 66,
      whyRecommended: "A detailed explanation for when you want to fully master the topic.",
      dnaDimension: "Attention",
    },
  ],
  "t-1-irrational-numbers-proofs": [
    {
      id: "r-rev-proof",
      title: "Proof by contradiction: why √2 is irrational — guided revision",
      source: "cognify-original",
      sourceLabel: "COGNIFY revision guide",
      durationMinutes: 20,
      format: "revision",
      difficulty: "core",
      relevance: 97,
      whyRecommended: "This session focuses on the parts that will help you master the topic fastest.",
      dnaDimension: "Mistake pattern",
    },
    {
      id: "r-yt-irrational",
      title: "The discovery that √2 cannot be a fraction — story-based explanation",
      source: "youtube",
      sourceLabel: "YouTube · Mathologer",
      durationMinutes: 18,
      format: "explanation",
      difficulty: "foundational",
      relevance: 84,
      whyRecommended: "A simple explanation to help you understand the 'why' behind the math.",
      dnaDimension: "Mistake pattern",
    },
    {
      id: "r-ncert-proof",
      title: "NCERT Chapter 1 — Theorem 1.2 statement and proof walkthrough",
      source: "ncert",
      sourceLabel: "NCERT Official",
      durationMinutes: 12,
      format: "example",
      difficulty: "core",
      relevance: 90,
      whyRecommended: "This theorem appears word-for-word in CBSE papers — NCERT's wording wins marks.",
      dnaDimension: null,
    },
    {
      id: "r-diag-irrational",
      title: "Square-diagonal construction — visual proof that √2 is irrational",
      source: "edu-website",
      sourceLabel: "Brilliant.org (free tier)",
      durationMinutes: 9,
      format: "diagram",
      difficulty: "advanced",
      relevance: 77,
      whyRecommended: "A visual way to understand the proof through geometry.",
      dnaDimension: "Teaching format",
    },
  ],
  "t-2-fundamental-theorem-of-arithmetic": [
    {
      id: "r-khan-fta",
      title: "Prime factorisation & the Fundamental Theorem — visual walkthrough",
      source: "youtube",
      sourceLabel: "YouTube · Khan Academy India",
      durationMinutes: 12,
      format: "explanation",
      difficulty: "core",
      relevance: 86,
      whyRecommended: "This connects prime factorisation to HCF/LCM — the exact next link you need.",
      dnaDimension: null,
    },
    {
      id: "r-prac-fta",
      title: "HCF & LCM by prime factorisation — 12 problems, adaptive",
      source: "cognify-original",
      sourceLabel: "COGNIFY practice engine",
      durationMinutes: 15,
      format: "practice",
      difficulty: "core",
      relevance: 89,
      whyRecommended: "Practice makes perfect! This set helps you get faster at solving these.",
      dnaDimension: "Mastery gap",
    },
    {
      id: "r-ncert-fta",
      title: "NCERT Ex 1.2 — all problems solved in board style",
      source: "ncert",
      sourceLabel: "NCERT Official",
      durationMinutes: 16,
      format: "example",
      difficulty: "core",
      relevance: 83,
      whyRecommended: "Exercise 1.2 is where this theorem is tested — in the style examiners expect.",
      dnaDimension: null,
    },
  ],
  /* ---------- MATHEMATICS: Polynomials ---------- */
  "t-3-zeros-of-a-polynomial": [
    {
      id: "r-rev-zeros",
      title: "Spaced revision — zeros from graphs, 10 rapid questions",
      source: "cognify-original",
      sourceLabel: "COGNIFY revision engine",
      durationMinutes: 10,
      format: "revision",
      difficulty: "core",
      relevance: 91,
      whyRecommended: "You've got this, but it's due for a quick refresh — ten rapid questions will keep it.",
      dnaDimension: "Spaced retention",
    },
    {
      id: "r-diag-zeros",
      title: "How many times does the curve cross the x-axis? — diagram set",
      source: "edu-website",
      sourceLabel: "Vedantu Visual Maths",
      durationMinutes: 7,
      format: "diagram",
      difficulty: "foundational",
      relevance: 82,
      whyRecommended: "Counting zeros from graphs is a visual skill — this set plays to your strength.",
      dnaDimension: "Teaching format",
    },
  ],
  "t-4-relationship-between-zeros-coefficients": [
    {
      id: "r-rev-zc",
      title: "Sum & product of zeros — high-frequency revision module",
      source: "cognify-original",
      sourceLabel: "COGNIFY revision guide",
      durationMinutes: 20,
      format: "revision",
      difficulty: "core",
      relevance: 98,
      whyRecommended: "Your weakest topic right now — and the highest-impact 30 minutes you can spend today.",
      dnaDimension: "Confidence calibration",
    },
    {
      id: "r-yt-zc",
      title: "Zeros & coefficients made visual — quadratic graph intuition",
      source: "youtube",
      sourceLabel: "YouTube · Let's Crack Foundation & NTSE",
      durationMinutes: 16,
      format: "explanation",
      difficulty: "core",
      relevance: 87,
      whyRecommended: "This topic is conceptually weak for you — connecting α+β and αβ to the graph's shape builds understanding before the formulas.",
      dnaDimension: "Teaching format",
    },
    {
      id: "r-ncert-zc",
      title: "NCERT Ex 2.2 — sum/product problems solved with verification steps",
      source: "ncert",
      sourceLabel: "NCERT Official",
      durationMinutes: 14,
      format: "example",
      difficulty: "core",
      relevance: 91,
      whyRecommended: "Forming a quadratic from given zeros is a guaranteed board question type.",
      dnaDimension: null,
    },
    {
      id: "r-prac-zc",
      title: "Mixed problem set — zeros, coefficients & forming quadratics",
      source: "cognify-original",
      sourceLabel: "COGNIFY practice engine",
      durationMinutes: 15,
      format: "practice",
      difficulty: "advanced",
      relevance: 93,
      whyRecommended: "After the revision module, evidence of mastery requires a timed attempt.",
      dnaDimension: "Mastery gap",
    },
    {
      id: "r-diag-zc",
      title: "α, β and the parabola — one animated diagram that links it all",
      source: "edu-website",
      sourceLabel: "GeoGebra classroom library",
      durationMinutes: 5,
      format: "diagram",
      difficulty: "foundational",
      relevance: 80,
      whyRecommended: "5 minutes, diagram-first, your",
      dnaDimension: "Teaching format",
    },
  ],
  "t-5-division-algorithm-for-polynomials": [
    {
      id: "r-learn-da",
      title: "Polynomial long division — first-exposure guided lesson",
      source: "cognify-original",
      sourceLabel: "COGNIFY lesson",
      durationMinutes: 25,
      format: "lecture",
      difficulty: "core",
      relevance: 95,
      whyRecommended: "Recommended action: Learn.",
      dnaDimension: "Curriculum sequence",
    },
    {
      id: "r-yt-da",
      title: "Visual long division — dividend = divisor × quotient + remainder",
      source: "youtube",
      sourceLabel: "YouTube · Khan Academy India",
      durationMinutes: 10,
      format: "explanation",
      difficulty: "core",
      relevance: 88,
      whyRecommended: "The verification identity is where students slip procedurally.",
      dnaDimension: "Attention",
    },
    {
      id: "r-prac-da",
      title: "Division algorithm problem set — with dividend verification",
      source: "cognify-original",
      sourceLabel: "COGNIFY practice engine",
      durationMinutes: 15,
      format: "practice",
      difficulty: "core",
      relevance: 86,
      whyRecommended: "CBSE requires you to verify with the identity.",
      dnaDimension: "Mistake pattern",
    },
  ],
  /* ---------- MATHEMATICS: Pair of Linear Equations ---------- */
  "t-6-graphical-method": [
    {
      id: "r-learn-graph",
      title: "Graphical method — consistent, inconsistent & dependent pairs",
      source: "cognify-original",
      sourceLabel: "COGNIFY lesson",
      durationMinutes: 20,
      format: "lecture",
      difficulty: "core",
      relevance: 85,
      whyRecommended: "You are developing here (73%).",
      dnaDimension: "Mastery gap",
    },
    {
      id: "r-diag-graph",
      title: "Plot & intersect — GeoGebra pairs you can drag yourself",
      source: "edu-website",
      sourceLabel: "GeoGebra classroom library",
      durationMinutes: 8,
      format: "diagram",
      difficulty: "foundational",
      relevance: 83,
      whyRecommended: "A diagram-native skill in your",
      dnaDimension: "Teaching format",
    },
    {
      id: "r-prac-graph",
      title: "Plotting exercise — 8 pairs on grid paper, timed",
      source: "cognify-original",
      sourceLabel: "COGNIFY practice engine",
      durationMinutes: 15,
      format: "practice",
      difficulty: "core",
      relevance: 81,
      whyRecommended: "Graph accuracy decides marks here.",
      dnaDimension: "Mastery gap",
    },
  ],
  "t-7-substitution-elimination-methods": [
    {
      id: "r-prac-se",
      title: "Timed elimination drill — sign-error focus, 10 questions",
      source: "cognify-original",
      sourceLabel: "COGNIFY practice engine",
      durationMinutes: 15,
      format: "practice",
      difficulty: "core",
      relevance: 94,
      whyRecommended: "Your elimination steps are right but sign errors appear in 3 of your last 8 attempts — a careless-error pattern.",
      dnaDimension: "Mistake pattern",
    },
    {
      id: "r-yt-se",
      title: "Substitution vs elimination — when to use which (worked)",
      source: "youtube",
      sourceLabel: "YouTube · Physics Wallah Foundation",
      durationMinutes: 13,
      format: "explanation",
      difficulty: "core",
      relevance: 85,
      whyRecommended: "Plateaued at 55%.",
      dnaDimension: "Mastery gap",
    },
    {
      id: "r-notes-se",
      title: "Sign-error checklist — one-page reference card",
      source: "cognify-original",
      sourceLabel: "COGNIFY study notes",
      durationMinutes: 8,
      format: "revision",
      difficulty: "foundational",
      relevance: 89,
      whyRecommended: "Your recurring careless errors match items on this checklist.",
      dnaDimension: "Mistake pattern",
    },
    {
      id: "r-ncert-se",
      title: "NCERT Ex 3.3 & 3.4 — substitution and elimination solved",
      source: "ncert",
      sourceLabel: "NCERT Official",
      durationMinutes: 18,
      format: "example",
      difficulty: "core",
      relevance: 82,
      whyRecommended: "Both methods are tested in NCERT exercises — these board-style solutions show the presentation full marks expect.",
      dnaDimension: null,
    },
  ],
  "t-8-cross-multiplication-word-problems": [
    {
      id: "r-learn-cm",
      title: "Cross-multiplication method — derivation and application",
      source: "cognify-original",
      sourceLabel: "COGNIFY lesson",
      durationMinutes: 20,
      format: "lecture",
      difficulty: "core",
      relevance: 92,
      whyRecommended: "New topic in your sequence.",
      dnaDimension: "Curriculum sequence",
    },
    {
      id: "r-yt-cm",
      title: "Word problems to equations — the 4-step translation method",
      source: "youtube",
      sourceLabel: "YouTube · Khan Academy India",
      durationMinutes: 15,
      format: "explanation",
      difficulty: "advanced",
      relevance: 84,
      whyRecommended: "Converting real situations into equations is the hardest part of this topic.",
      dnaDimension: "Mastery gap",
    },
    {
      id: "r-prac-cm",
      title: "Word problem set — age, digit, fraction and boat problems",
      source: "cognify-original",
      sourceLabel: "COGNIFY practice engine",
      durationMinutes: 20,
      format: "practice",
      difficulty: "advanced",
      relevance: 87,
      whyRecommended: "CBSE consistently sets 5-mark word problems from this topic.",
      dnaDimension: null,
    },
  ],
  /* ---------- MATHEMATICS: Quadratic Equations ---------- */
  "t-9-standard-form-factorisation": [
    {
      id: "r-learn-qf",
      title: "Factorisation methods — splitting the middle term, deep lesson",
      source: "cognify-original",
      sourceLabel: "COGNIFY lesson",
      durationMinutes: 20,
      format: "lecture",
      difficulty: "core",
      relevance: 88,
      whyRecommended: "You sit at 66% here — the factorisation mechanics are the remaining gap.",
      dnaDimension: "Mastery gap",
    },
    {
      id: "r-prac-qf",
      title: "Splitting the middle term — 12 quadratics, adaptive difficulty",
      source: "cognify-original",
      sourceLabel: "COGNIFY practice engine",
      durationMinutes: 15,
      format: "practice",
      difficulty: "core",
      relevance: 90,
      whyRecommended: "Factorisation is a mechanical skill — deliberate practice is the shortest path from 66% to proficient.",
      dnaDimension: "Mastery gap",
    },
    {
      id: "r-ncert-qf",
      title: "NCERT Ex 4.2 — factorisation solved in board style",
      source: "ncert",
      sourceLabel: "NCERT Official",
      durationMinutes: 15,
      format: "example",
      difficulty: "core",
      relevance: 84,
      whyRecommended: "Exercise 4.",
      dnaDimension: null,
    },
  ],
  "t-10-completing-the-square": [
    {
      id: "r-rev-cts",
      title: "Guided completing-the-square — worked-example revision",
      source: "cognify-original",
      sourceLabel: "COGNIFY revision guide",
      durationMinutes: 25,
      format: "revision",
      difficulty: "core",
      relevance: 96,
      whyRecommended: "Struggle analysis: you attempted this twice and paused 4+ minutes each time.",
      dnaDimension: "Attention",
    },
    {
      id: "r-yt-cts",
      title: "The geometry behind completing the square — visual intuition",
      source: "youtube",
      sourceLabel: "YouTube · 3Blue1Brown",
      durationMinutes: 9,
      format: "diagram",
      difficulty: "foundational",
      relevance: 85,
      whyRecommended: "Your, on the exact topic where you stall.",
      dnaDimension: "Teaching format",
    },
    {
      id: "r-diag-cts",
      title: "Interactive square completion — drag tiles to balance",
      source: "edu-website",
      sourceLabel: "GeoGebra classroom library",
      durationMinutes: 7,
      format: "diagram",
      difficulty: "core",
      relevance: 81,
      whyRecommended: "Hands-on diagram work before the guided revision lowers the frustration you recorded in your last two attempts.",
      dnaDimension: "Teaching format",
    },
    {
      id: "r-ncert-cts",
      title: "NCERT Ex 4.3 — completing the square solved",
      source: "ncert",
      sourceLabel: "NCERT Official",
      durationMinutes: 14,
      format: "example",
      difficulty: "core",
      relevance: 87,
      whyRecommended: "This is the second board-prescribed method for Chapter 4.",
      dnaDimension: null,
    },
  ],
  "t-11-nature-of-roots-discriminant": [
    {
      id: "r-learn-discriminant",
      title: "The discriminant — what b²−4ac actually tells you",
      source: "cognify-original",
      sourceLabel: "COGNIFY lesson",
      durationMinutes: 18,
      format: "lecture",
      difficulty: "core",
      relevance: 93,
      whyRecommended: "New topic.",
      dnaDimension: "Curriculum sequence",
    },
    {
      id: "r-diag-discriminant",
      title: "Discriminant sign vs graph intersections — one diagram",
      source: "edu-website",
      sourceLabel: "GeoGebra classroom library",
      durationMinutes: 5,
      format: "diagram",
      difficulty: "foundational",
      relevance: 88,
      whyRecommended: "Your second objective here is literally this diagram: relating D's sign to x-axis intersections.",
      dnaDimension: "Teaching format",
    },
    {
      id: "r-prac-discriminant",
      title: "Root nature exercises — predict before you solve",
      source: "cognify-original",
      sourceLabel: "COGNIFY practice engine",
      durationMinutes: 15,
      format: "practice",
      difficulty: "core",
      relevance: 86,
      whyRecommended: "Board questions ask for the nature of roots, not just the roots.",
      dnaDimension: null,
    },
  ],
  /* ---------- SCIENCE: Chemical Reactions ---------- */
  "t-0-writing-balancing-equations": [
    {
      id: "r-rev-balancing",
      title: "Balancing rapid review — 10 equations in 10 minutes",
      source: "cognify-original",
      sourceLabel: "COGNIFY revision engine",
      durationMinutes: 10,
      format: "revision",
      difficulty: "foundational",
      relevance: 90,
      whyRecommended: "and flagged for spaced review at day 10.",
      dnaDimension: "Spaced retention",
    },
    {
      id: "r-prac-balancing",
      title: "Equation balancing set — progressive difficulty",
      source: "cognify-original",
      sourceLabel: "COGNIFY practice engine",
      durationMinutes: 12,
      format: "practice",
      difficulty: "core",
      relevance: 85,
      whyRecommended: "Balancing is mechanical and practice-driven.",
      dnaDimension: "Mastery gap",
    },
    {
      id: "r-ncert-balancing",
      title: "NCERT Class 10 Science — Chapter 1, Activity 1.x & Ex 1",
      source: "ncert",
      sourceLabel: "NCERT Official",
      durationMinutes: 18,
      format: "example",
      difficulty: "core",
      relevance: 87,
      whyRecommended: "NCERT activities are the source of board activity-based questions.",
      dnaDimension: null,
    },
  ],
  "t-1-types-of-reactions": [
    {
      id: "r-prac-tor",
      title: "Reaction classification drill — 15 reactions, timer on",
      source: "cognify-original",
      sourceLabel: "COGNIFY practice engine",
      durationMinutes: 15,
      format: "practice",
      difficulty: "core",
      relevance: 95,
      whyRecommended: "You confuse displacement with double displacement in 4 of your last 10 classifications.",
      dnaDimension: "Mistake pattern",
    },
    {
      id: "r-notes-tor",
      title: "Reaction type comparison table — one-page reference",
      source: "cognify-original",
      sourceLabel: "COGNIFY study notes",
      durationMinutes: 10,
      format: "revision",
      difficulty: "foundational",
      relevance: 86,
      whyRecommended: "A visual-diagram format you excel with.",
      dnaDimension: "Teaching format",
    },
    {
      id: "r-yt-tor",
      title: "All reaction types with real-life examples — illustrated lecture",
      source: "youtube",
      sourceLabel: "YouTube · Magnet Brains",
      durationMinutes: 22,
      format: "lecture",
      difficulty: "core",
      relevance: 80,
      whyRecommended: "Chunk into two 11-minute watches (your 22-minute",
      dnaDimension: "Attention",
    },
    {
      id: "r-ncert-tor",
      title: "NCERT Chapter 1 — all in-text and exercise questions solved",
      source: "ncert",
      sourceLabel: "NCERT Official",
      durationMinutes: 16,
      format: "example",
      difficulty: "core",
      relevance: 84,
      whyRecommended: "CBSE draws classification questions straight from NCERT exercises.",
      dnaDimension: null,
    },
  ],
  "t-2-oxidation-reduction-corrosion": [
    {
      id: "r-learn-redox",
      title: "Redox fundamentals — oxygen & hydrogen transfer, first exposure",
      source: "cognify-original",
      sourceLabel: "COGNIFY lesson",
      durationMinutes: 20,
      format: "lecture",
      difficulty: "core",
      relevance: 94,
      whyRecommended: "Recommended action: Learn.",
      dnaDimension: "Rhythm",
    },
    {
      id: "r-yt-redox",
      title: "Corrosion & rancidity in the real world — documentary style",
      source: "youtube",
      sourceLabel: "YouTube · EduPoint Class 9 & 10",
      durationMinutes: 8,
      format: "explanation",
      difficulty: "foundational",
      relevance: 82,
      whyRecommended: "A short contextual primer before the full lesson — corrosion examples are your third learning objective, taught with real images.",
      dnaDimension: null,
    },
    {
      id: "r-diag-redox",
      title: "Oxidation/reduction flow diagram — who loses, who gains",
      source: "edu-website",
      sourceLabel: "Vedantu Visual Science",
      durationMinutes: 6,
      format: "diagram",
      difficulty: "foundational",
      relevance: 85,
      whyRecommended: "Your",
      dnaDimension: "Teaching format",
    },
  ],
  /* ---------- SCIENCE: Acids Bases ---------- */
  "t-3-properties-of-acids-bases": [
    {
      id: "r-notes-acid",
      title: "Indicator chart — colour changes at a glance",
      source: "cognify-original",
      sourceLabel: "COGNIFY study notes",
      durationMinutes: 10,
      format: "diagram",
      difficulty: "foundational",
      relevance: 88,
      whyRecommended: "with indicator questions as the thin spot.",
      dnaDimension: "Teaching format",
    },
    {
      id: "r-prac-acid",
      title: "Reaction prediction set — acids with metals, carbonates, oxides",
      source: "cognify-original",
      sourceLabel: "COGNIFY practice engine",
      durationMinutes: 12,
      format: "practice",
      difficulty: "core",
      relevance: 84,
      whyRecommended: "Prediction questions are where 76% stalls at proficiency.",
      dnaDimension: "Mastery gap",
    },
    {
      id: "r-ncert-acid",
      title: "NCERT Chapter 2 — activities and exercises solved",
      source: "ncert",
      sourceLabel: "NCERT Official",
      durationMinutes: 15,
      format: "example",
      difficulty: "core",
      relevance: 82,
      whyRecommended: "NCERT's acid-base activities (litmus, zinc + acid) are board favourites.",
      dnaDimension: null,
    },
  ],
  "t-4-ph-scale-strength": [
    {
      id: "r-prac-ph",
      title: "pH calculation set — logarithm conversions included",
      source: "cognify-original",
      sourceLabel: "COGNIFY practice engine",
      durationMinutes: 15,
      format: "practice",
      difficulty: "advanced",
      relevance: 93,
      whyRecommended: "Mastery plateauing at ~52%.",
      dnaDimension: "Mastery gap",
    },
    {
      id: "r-yt-ph",
      title: "pH explained without fear of logarithms — gentle walkthrough",
      source: "youtube",
      sourceLabel: "YouTube · Khan Academy India",
      durationMinutes: 11,
      format: "explanation",
      difficulty: "core",
      relevance: 87,
      whyRecommended: "The log step is the conceptual barrier holding you at 52%.",
      dnaDimension: "Mistake pattern",
    },
    {
      id: "r-notes-ph",
      title: "Strong vs weak acids — one-page comparison with examples",
      source: "cognify-original",
      sourceLabel: "COGNIFY study notes",
      durationMinutes: 8,
      format: "diagram",
      difficulty: "foundational",
      relevance: 83,
      whyRecommended: "Your second objective is this comparison.",
      dnaDimension: "Teaching format",
    },
    {
      id: "r-ncert-ph",
      title: "NCERT Chapter 2 — pH activities and Ex 2 solved",
      source: "ncert",
      sourceLabel: "NCERT Official",
      durationMinutes: 13,
      format: "example",
      difficulty: "core",
      relevance: 80,
      whyRecommended: "Indicator and pH activities from NCERT appear in board practical-based questions.",
      dnaDimension: null,
    },
  ],
  /* ---------- SCIENCE: Life Processes ---------- */
  "t-5-nutrition-in-plants": [
    {
      id: "r-rev-photo",
      title: "Spaced review — photosynthesis equation & stomata",
      source: "cognify-original",
      sourceLabel: "COGNIFY revision engine",
      durationMinutes: 10,
      format: "revision",
      difficulty: "foundational",
      relevance: 89,
      whyRecommended: "Mastered (95%) — just keep it that way.",
      dnaDimension: "Spaced retention",
    },
    {
      id: "r-diag-photo",
      title: "Stomata open/close — animated mechanism diagram",
      source: "edu-website",
      sourceLabel: "Byju's Visual Library",
      durationMinutes: 5,
      format: "diagram",
      difficulty: "foundational",
      relevance: 84,
      whyRecommended: "Stomatal mechanism is a diagram-mark question in CBSE.",
      dnaDimension: "Teaching format",
    },
  ],
  "t-6-nutrition-in-humans": [
    {
      id: "r-rev-digest",
      title: "Alimentary canal diagram revision — enzyme at each stage",
      source: "cognify-original",
      sourceLabel: "COGNIFY revision guide",
      durationMinutes: 20,
      format: "revision",
      difficulty: "core",
      relevance: 96,
      whyRecommended: "Revision due tomorrow, and your DNA shows diagram formats are your.",
      dnaDimension: "Teaching format",
    },
    {
      id: "r-yt-digest",
      title: "Digestion animation — food's journey mouth to intestine",
      source: "youtube",
      sourceLabel: "YouTube · Khan Academy India",
      durationMinutes: 7,
      format: "diagram",
      difficulty: "foundational",
      relevance: 88,
      whyRecommended: "Tracing food's pathway is your first objective — an animation makes the sequence unforgettable before the diagram revision.",
      dnaDimension: "Teaching format",
    },
    {
      id: "r-diag-digest",
      title: "Enzyme map — what acts where, one labelled diagram",
      source: "edu-website",
      sourceLabel: "Vedantu Visual Science",
      durationMinutes: 6,
      format: "diagram",
      difficulty: "core",
      relevance: 90,
      whyRecommended: "Your second objective is exactly this enzyme map.",
      dnaDimension: "Teaching format",
    },
    {
      id: "r-ncert-digest",
      title: "NCERT Chapter 6 — life processes activities and exercises",
      source: "ncert",
      sourceLabel: "NCERT Official",
      durationMinutes: 16,
      format: "example",
      difficulty: "core",
      relevance: 81,
      whyRecommended: "NCERT's chloroplast/starch and starch-iodine activities feed board activity-based questions.",
      dnaDimension: null,
    },
  ],
  "t-7-transportation-excretion": [
    {
      id: "r-learn-circ",
      title: "Double circulation in humans — first-exposure lesson",
      source: "cognify-original",
      sourceLabel: "COGNIFY lesson",
      durationMinutes: 20,
      format: "lecture",
      difficulty: "core",
      relevance: 93,
      whyRecommended: "New topic in your sequence.",
      dnaDimension: "Curriculum sequence",
    },
    {
      id: "r-yt-heart",
      title: "Human heart walkthrough — chambers, valves, flow",
      source: "youtube",
      sourceLabel: "YouTube · Magnet Brains",
      durationMinutes: 10,
      format: "explanation",
      difficulty: "core",
      relevance: 87,
      whyRecommended: "The heart diagram is the single highest-mark visual in this chapter.",
      dnaDimension: "Teaching format",
    },
    {
      id: "r-diag-circ",
      title: "Double circulation flow diagram — oxygenated vs deoxygenated",
      source: "edu-website",
      sourceLabel: "Byju's Visual Library",
      durationMinutes: 6,
      format: "diagram",
      difficulty: "foundational",
      relevance: 89,
      whyRecommended: "Your first objective is a diagram question.",
      dnaDimension: "Teaching format",
    },
    {
      id: "r-prac-circ",
      title: "Transportation & excretion problem set — 10 questions",
      source: "cognify-original",
      sourceLabel: "COGNIFY practice engine",
      durationMinutes: 15,
      format: "practice",
      difficulty: "core",
      relevance: 84,
      whyRecommended: "After the lesson, evidence requires a timed attempt.",
      dnaDimension: "Mastery gap",
    },
  ],
  /* ---------- SOCIAL SCIENCE ---------- */
  "t-0-french-revolution-idea-of-nation": [
    {
      id: "r-learn-fr",
      title: "The French Revolution & the idea of the nation — illustrated timeline",
      source: "cognify-original",
      sourceLabel: "COGNIFY lesson",
      durationMinutes: 20,
      format: "lecture",
      difficulty: "core",
      relevance: 86,
      whyRecommended: "Solid footing (70%) with Napoleon's Civil Code as the thin spot.",
      dnaDimension: "Mastery gap",
    },
    {
      id: "r-prac-fr",
      title: "Source analysis set — maps, decrees and revolutionary imagery",
      source: "cognify-original",
      sourceLabel: "COGNIFY practice engine",
      durationMinutes: 15,
      format: "practice",
      difficulty: "core",
      relevance: 88,
      whyRecommended: "CBSE sets source-based questions on this chapter.",
      dnaDimension: null,
    },
    {
      id: "r-yt-fr",
      title: "French Revolution in 20 minutes — story-first narration",
      source: "youtube",
      sourceLabel: "YouTube · Study Rankers",
      durationMinutes: 20,
      format: "explanation",
      difficulty: "core",
      relevance: 79,
      whyRecommended: "A narrative retelling cements chronology — useful before your unit revision, though it stays within one sitting.",
      dnaDimension: "Attention",
    },
    {
      id: "r-ncert-fr",
      title: "NCERT History Ch 1 — in-text questions and map work solved",
      source: "ncert",
      sourceLabel: "NCERT Official",
      durationMinutes: 18,
      format: "example",
      difficulty: "core",
      relevance: 84,
      whyRecommended: "NCERT's map work (1815 Europe) is a guaranteed board item.",
      dnaDimension: null,
    },
  ],
  "t-1-making-of-nationalism-italy-germany": [
    {
      id: "r-rev-ig",
      title: "Italy vs Germany — comparison-table revision module",
      source: "cognify-original",
      sourceLabel: "COGNIFY revision guide",
      durationMinutes: 25,
      format: "revision",
      difficulty: "core",
      relevance: 96,
      whyRecommended: "Your notes are flagged incomplete and unit-test performance was 58%.",
      dnaDimension: "Mastery gap",
    },
    {
      id: "r-ncert-ig",
      title: "NCERT History Ch 1 — unification of Italy & Germany solved",
      source: "ncert",
      sourceLabel: "NCERT Official",
      durationMinutes: 14,
      format: "example",
      difficulty: "core",
      relevance: 89,
      whyRecommended: "Board questions on Cavour, Garibaldi and Bismarck trace directly to NCERT.",
      dnaDimension: null,
    },
    {
      id: "r-diag-ig",
      title: "Unification timeline maps — Italy 1815→1871, Germany 1815→1871",
      source: "edu-website",
      sourceLabel: "LearnCBSE map library",
      durationMinutes: 8,
      format: "diagram",
      difficulty: "core",
      relevance: 85,
      whyRecommended: "A visual-diagram summary of both unifications — your",
      dnaDimension: "Teaching format",
    },
    {
      id: "r-yt-ig",
      title: "Cavour, Garibaldi, Bismarck — the three figures explained",
      source: "youtube",
      sourceLabel: "YouTube · EduPoint Class 9 & 10",
      durationMinutes: 12,
      format: "explanation",
      difficulty: "core",
      relevance: 82,
      whyRecommended: "You underperform on 'key figures' questions.",
      dnaDimension: "Mastery gap",
    },
  ],
  "t-2-nationalism-imperialism": [
    {
      id: "r-learn-balkans",
      title: "The Balkans — why Europe's powder keg exploded",
      source: "cognify-original",
      sourceLabel: "COGNIFY lesson",
      durationMinutes: 18,
      format: "lecture",
      difficulty: "core",
      relevance: 92,
      whyRecommended: "New topic in your sequence.",
      dnaDimension: "Curriculum sequence",
    },
    {
      id: "r-diag-balkans",
      title: "Europe 1914 — annotated map walkthrough",
      source: "edu-website",
      sourceLabel: "LearnCBSE map library",
      durationMinutes: 9,
      format: "diagram",
      difficulty: "core",
      relevance: 87,
      whyRecommended: "The map of 1914 Europe is the visual spine of this topic — learn it early and every later fact has somewhere to live.",
      dnaDimension: "Teaching format",
    },
    {
      id: "r-yt-balkans",
      title: "Imperialism and the road to war — documentary excerpt",
      source: "youtube",
      sourceLabel: "YouTube · Study Rankers",
      durationMinutes: 11,
      format: "explanation",
      difficulty: "advanced",
      relevance: 80,
      whyRecommended: "A narrative that connects the Balkans flashpoint to the war's outbreak — your second learning objective, told as a story.",
      dnaDimension: null,
    },
  ],
  /* ---------- SOCIAL SCIENCE: Nationalism in India ---------- */
  "t-3-first-world-war-non-cooperation": [
    {
      id: "r-prac-ncm",
      title: "Long-answer writing set — 'assess' and 'evaluate' prompts",
      source: "cognify-original",
      sourceLabel: "COGNIFY practice engine",
      durationMinutes: 20,
      format: "practice",
      difficulty: "advanced",
      relevance: 94,
      whyRecommended: "You recall facts well but struggle with 'assess/evaluate' answers.",
      dnaDimension: "Mistake pattern",
    },
    {
      id: "r-ncert-ncm",
      title: "NCERT History Ch 2 — Khilafat & Non-Cooperation solved",
      source: "ncert",
      sourceLabel: "NCERT Official",
      durationMinutes: 16,
      format: "example",
      difficulty: "core",
      relevance: 86,
      whyRecommended: "NCERT's treatment of Khilafat-Non-Cooperation is the board reference.",
      dnaDimension: null,
    },
    {
      id: "r-yt-ncm",
      title: "WWI's impact on India — economy, society, movements",
      source: "youtube",
      sourceLabel: "YouTube · Magnet Brains",
      durationMinutes: 14,
      format: "explanation",
      difficulty: "core",
      relevance: 83,
      whyRecommended: "Your first objective needs the economic-social chain of consequences — this narration builds it causally, not as a list.",
      dnaDimension: null,
    },
    {
      id: "r-diag-ncm",
      title: "Movement timeline 1915→1922 — one visual",
      source: "edu-website",
      sourceLabel: "LearnCBSE timeline library",
      durationMinutes: 6,
      format: "diagram",
      difficulty: "foundational",
      relevance: 81,
      whyRecommended: "Your",
      dnaDimension: "Teaching format",
    },
  ],
  "t-4-civil-disobedience-collective-belonging": [
    {
      id: "r-learn-salt",
      title: "The Salt March — narrative lesson with significance analysis",
      source: "cognify-original",
      sourceLabel: "COGNIFY lesson",
      durationMinutes: 22,
      format: "lecture",
      difficulty: "core",
      relevance: 93,
      whyRecommended: "Recommended action: Learn, next topic in sequence.",
      dnaDimension: "Curriculum sequence",
    },
    {
      id: "r-yt-dandi",
      title: "Dandi March documentary excerpt — primary footage",
      source: "youtube",
      sourceLabel: "YouTube · National Film Archive",
      durationMinutes: 12,
      format: "explanation",
      difficulty: "core",
      relevance: 84,
      whyRecommended: "Primary footage makes 'describe the Salt March' answers vivid and specific — exactly what examiners reward over generic answers.",
      dnaDimension: null,
    },
    {
      id: "r-diag-salt",
      title: "Folklore, flags & icons — collective belonging visual set",
      source: "edu-website",
      sourceLabel: "LearnCBSE visual library",
      durationMinutes: 8,
      format: "diagram",
      difficulty: "foundational",
      relevance: 88,
      whyRecommended: "Your second objective is visual by nature.",
      dnaDimension: "Teaching format",
    },
    {
      id: "r-ncert-salt",
      title: "NCERT History Ch 2 — Civil Disobedience solved",
      source: "ncert",
      sourceLabel: "NCERT Official",
      durationMinutes: 15,
      format: "example",
      difficulty: "core",
      relevance: 85,
      whyRecommended: "NCERT's Civil Disobedience section is the direct source for board questions on the Salt March's significance.",
      dnaDimension: null,
    },
  ],
  /* ---------- ENGLISH ---------- */
  "t-0-a-letter-to-god": [
    {
      id: "r-learn-letter",
      title: "A Letter to God — story walkthrough with theme analysis",
      source: "cognify-original",
      sourceLabel: "COGNIFY lesson",
      durationMinutes: 18,
      format: "lecture",
      difficulty: "core",
      relevance: 88,
      whyRecommended: "This lesson covers plot, character of Lencho and the faith-vs-institution theme — the three angles CBSE asks from this prose",
      dnaDimension: null,
    },
    {
      id: "r-prac-letter",
      title: "Reading-comprehension set — unseen-style questions on the text",
      source: "cognify-original",
      sourceLabel: "COGNIFY practice engine",
      durationMinutes: 15,
      format: "practice",
      difficulty: "core",
      relevance: 85,
      whyRecommended: "English marks live and die on answer precision.",
      dnaDimension: "Mastery gap",
    },
    {
      id: "r-notes-letter",
      title: "Character & theme map — one-page revision sheet",
      source: "cognify-original",
      sourceLabel: "COGNIFY study notes",
      durationMinutes: 8,
      format: "diagram",
      difficulty: "foundational",
      relevance: 83,
      whyRecommended: "Your",
      dnaDimension: "Teaching format",
    },
    {
      id: "r-ncert-letter",
      title: "NCERT English Ch 1 — think-about-it & grammar work solved",
      source: "ncert",
      sourceLabel: "NCERT Official",
      durationMinutes: 14,
      format: "example",
      difficulty: "core",
      relevance: 82,
      whyRecommended: "NCERT's think-about-it questions frequently reappear in boards.",
      dnaDimension: null,
    },
  ],
  "t-1-nelson-mandela": [
    {
      id: "r-learn-mandela",
      title: "Long Walk to Freedom — extract walkthrough & themes",
      source: "cognify-original",
      sourceLabel: "COGNIFY lesson",
      durationMinutes: 18,
      format: "lecture",
      difficulty: "core",
      relevance: 87,
      whyRecommended: "Covers Mandela's 'courage is not absence of fear' and the twin obligations theme — the two most-tested ideas from this extract.",
      dnaDimension: null,
    },
    {
      id: "r-prac-mandela",
      title: "Short-answer set — Mandela extract, board-style",
      source: "cognify-original",
      sourceLabel: "COGNIFY practice engine",
      durationMinutes: 12,
      format: "practice",
      difficulty: "core",
      relevance: 84,
      whyRecommended: "Two- and three-mark extract questions are the bulk of English Section A.",
      dnaDimension: "Mastery gap",
    },
    {
      id: "r-yt-mandela",
      title: "Nelson Mandela — life in 12 minutes (context for the extract)",
      source: "youtube",
      sourceLabel: "YouTube · Study Rankers",
      durationMinutes: 12,
      format: "explanation",
      difficulty: "foundational",
      relevance: 80,
      whyRecommended: "Knowing the real history deepens every answer you write about the extract — context is what separates 2-mark and 3-mark responses.",
      dnaDimension: null,
    },
  ],
  "t-2-two-stories-about-flying": [
    {
      id: "r-learn-flying",
      title: "The Black Aeroplane — story, symbols and the ending explained",
      source: "cognify-original",
      sourceLabel: "COGNIFY lesson",
      durationMinutes: 16,
      format: "lecture",
      difficulty: "core",
      relevance: 86,
      whyRecommended: "The supernatural ending is the most-asked question from this story.",
      dnaDimension: null,
    },
    {
      id: "r-prac-flying",
      title: "Extract & inference set — The Black Aeroplane",
      source: "cognify-original",
      sourceLabel: "COGNIFY practice engine",
      durationMinutes: 12,
      format: "practice",
      difficulty: "core",
      relevance: 83,
      whyRecommended: "Inference questions on the story's ending decide English marks.",
      dnaDimension: "Mastery gap",
    },
    {
      id: "r-notes-flying",
      title: "Plot & symbol map — one-page revision sheet",
      source: "cognify-original",
      sourceLabel: "COGNIFY study notes",
      durationMinutes: 7,
      format: "diagram",
      difficulty: "foundational",
      relevance: 81,
      whyRecommended: "Your",
      dnaDimension: "Teaching format",
    },
  ],
  /* ---------- HINDI ---------- */
  "t-0-maa-ki-chitthi": [
    {
      id: "r-learn-maa",
      title: "माँ की चिट्ठी — कहानी सार एवं प्रश्न-उत्तर",
      source: "cognify-original",
      sourceLabel: "COGNIFY पाठ",
      durationMinutes: 15,
      format: "lecture",
      difficulty: "core",
      relevance: 85,
      whyRecommended: "कहानी का सार, किरदार विश्लेषण और 'माँ के ममत्व' की भूमिका — बोर्ड के प्रमुख प्रश्नों की कवच।.",
      dnaDimension: null,
    },
    {
      id: "r-prac-maa",
      title: "प्रश्नावली — बोर्ड-शैली प्रश्न एवं उत्तर",
      source: "cognify-original",
      sourceLabel: "COGNIFY अभ्यास",
      durationMinutes: 12,
      format: "practice",
      difficulty: "core",
      relevance: 83,
      whyRecommended: "हिंदी में उत्तर की सटीकता अंक तय करती है। बोर्ड-शैली प्रश्नों का समयबद्ध अभ्यास।.",
      dnaDimension: "Mastery gap",
    },
    {
      id: "r-ncert-maa",
      title: "NCERT कृतिका — माँ की चिट्ठी प्रश्नोत्तर",
      source: "ncert",
      sourceLabel: "NCERT आधिकारिक",
      durationMinutes: 10,
      format: "example",
      difficulty: "core",
      relevance: 82,
      whyRecommended: "NCERT के विचार-विमर्श प्रश्न अक्सर बोर्ड में दोहराए जाते हैं — हल सहित।.",
      dnaDimension: null,
    },
  ],
  "t-1-lhasa-ki-or": [
    {
      id: "r-rev-lhasa",
      title: "ल्हासा की ओर — सारांश पुनरावलोकन",
      source: "cognify-original",
      sourceLabel: "COGNIFY पुनरावलोकन",
      durationMinutes: 18,
      format: "revision",
      difficulty: "core",
      relevance: 86,
      whyRecommended: "दिन-7 पुनरावलोकन निर्धारित। कहानी का सार और प्रमुख प्रश्न एक बार फिर — स्पेस्ड रिटेंशन के अनुसार।.",
      dnaDimension: "Spaced retention",
    },
    {
      id: "r-ncert-lhasa",
      title: "NCERT कृतिका — ल्हासा की ओर हल सहित",
      source: "ncert",
      sourceLabel: "NCERT आधिकारिक",
      durationMinutes: 12,
      format: "example",
      difficulty: "core",
      relevance: 81,
      whyRecommended: "बोर्ड प्रश्न NCERT के विचार-विमर्श से सीधे आते हैं — उत्तरों की प्रस्तुति बोर्ड-शैली में।.",
      dnaDimension: null,
    },
  ],
  /* ---------- SANSKRIT ---------- */
  "t-0-achha-vakt-mein-bhale-kaam": [
    {
      id: "r-rev-skt",
      title: "शब्दार्थ एवं कथावस्तु पुनरावलोकन",
      source: "cognify-original",
      sourceLabel: "COGNIFY पुनरावलोकन",
      durationMinutes: 12,
      format: "revision",
      difficulty: "foundational",
      relevance: 84,
      whyRecommended: "दिन-7 स्पेस्ड रिव्यू। शब्दार्थ और कथावस्तु — बोर्ड में सबसे ज्यादा पूछे जाने वाले अंश।.",
      dnaDimension: "Spaced retention",
    },
  ],
};

/* ------------------------------------------------------------------
 * Transcript segments — per resource, curriculum-accurate content
 * ---------------------------------------------------------------- */
export const TRANSCRIPTS: Record<string, TranscriptSegment[]> = {
  "r-rev-proof": [
    { startSec: 0, endSec: 24, text: "Welcome back. Today we rebuild one proof — the proof that √2 is irrational — because your last two attempts both broke at the same step, and that step is the heart of the whole argument." },
    { startSec: 24, endSec: 60, text: "Step one: assume the opposite. Suppose √2 is rational. Then, by definition, it can be written as a fraction p over q — where p and q are integers with no common factor other than one. Write that down; it is your working hypothesis." },
    { startSec: 60, endSec: 105, text: "Step two: square both sides. √2 squared is 2, so p² over q² equals 2. Multiply across: p² equals 2q². Now notice what this tells us — p² is two times an integer, so p² is even." },
    { startSec: 105, endSec: 150, text: "Step three — this is where your proofs have been breaking. If p squared is even, then p itself must be even. Why? Because the square of an odd number is always odd. So p is even, which means p equals 2k for some integer k." },
    { startSec: 150, endSec: 200, text: "Step four: substitute back. Replace p with 2k in p² equals 2q². We get 4k² equals 2q², so q² equals 2k². And now the mirror image appears — q² is even, so q is even." },
    { startSec: 200, endSec: 245, text: "Step five: the contradiction. We have shown both p and q are even — so they share the common factor 2. But that contradicts our opening assumption that p over q was in lowest terms. The assumption must be false. √2 is irrational." },
    { startSec: 245, endSec: 290, text: "Pause here and answer this yourself: why did we need the lowest-terms assumption? Without it, the contradiction has no force. That single sentence is where most lost marks come from — your notes should end with it." },
    { startSec: 290, endSec: 330, text: "Final check, because CBSE marks the closing statement. End every such proof with: 'Therefore our assumption that √2 is rational is incorrect. Hence √2 is irrational.' Full marks live in that last sentence as much as in the algebra." },
  ],
  "r-rev-zc": [
    { startSec: 0, endSec: 30, text: "This is your weakest tracked topic, so we move carefully. The two formulas you need today: for a quadratic a x² + b x + c, the sum of the zeros α plus β equals negative b over a, and the product α times β equals c over a." },
    { startSec: 30, endSec: 75, text: "Before trusting the formulas, sanity-check them with a graph. If the parabola crosses the x-axis twice, you expect two real zeros — and the discriminant b² minus 4ac being positive confirms it. The formulas and the graph must always agree; when they disagree, you have found your error." },
    { startSec: 75, endSec: 130, text: "Worked example one: x² minus 5x plus 6. Here a is 1, b is negative 5, c is 6. Sum of zeros: negative of negative 5 over 1 — that is positive 5. Product: 6 over 1 — that is 6. The zeros are 2 and 3; check — 2 plus 3 is 5, 2 times 3 is 6. Both hold." },
    { startSec: 130, endSec: 190, text: "Worked example two — the direction examiners like: given zeros 3 and negative 2, form the quadratic. Sum is 1, product is negative 6. The quadratic is x² minus (sum) x plus product — x² minus x minus 6. Notice the sign in the middle flips; that is the single most-missed detail." },
    { startSec: 190, endSec: 240, text: "Now the confidence check, because your calibration shows you overestimate this topic. Before continuing, predict your own score on the next five problems — then attempt them. If your prediction and your actual score differ by more than 20 percent, mark this topic for another revision cycle before Friday's test." },
    { startSec: 240, endSec: 295, text: "Problem set follows. Problem one: verify that 1, 2 and negative 3 are zeros of x² minus x minus 6 is wrong — that is a quadratic, it has exactly two zeros. Which two of the three numbers actually are zeros? This trap mirrors exactly what your last test asked." },
  ],
  "r-learn-da": [
    { startSec: 0, endSec: 30, text: "New topic in your sequence: the division algorithm for polynomials. It mirrors what you already know from numbers — dividend equals divisor times quotient plus remainder. Today we make that identity work for polynomials." },
    { startSec: 30, endSec: 80, text: "Set up the problem: divide 2x² plus 3x plus 1 by x plus 2. First step — divide the leading term of the dividend by the leading term of the divisor. 2x² divided by x gives 2x. That is the first term of the quotient. Write it above." },
    { startSec: 80, endSec: 140, text: "Multiply back: 2x times x plus 2 gives 2x² plus 4x. Subtract — and mind the sign: 3x minus 4x is negative x. Bring down the plus 1. This sign step is where procedural errors live; slow down here deliberately." },
    { startSec: 140, endSec: 195, text: "Repeat: negative x divided by x gives negative 1 — second term of the quotient. Multiply back: negative 1 times x plus 2 is negative x minus 2. Subtract again: 1 minus negative 2 is plus 3. The remainder is 3, a constant, and its degree is less than the divisor's degree — so we stop." },
    { startSec: 195, endSec: 250, text: "Quotient is 2x minus 1, remainder is 3. Now the verification identity — CBSE requires it: divisor times quotient plus remainder — (x plus 2)(2x minus 1) plus 3 — expand: 2x² minus x plus 4x minus 2 plus 3 — that is 2x² plus 3x plus 1. The original dividend. Verified." },
    { startSec: 250, endSec: 295, text: "Exit check before your practice set: divide x² plus 5x plus 6 by x plus 2 yourself. Quotient should be x plus 3, remainder 0 — which also tells you x plus 2 is a factor. If you got that, you are ready for the timed set." },
  ],
  "r-rev-digest": [
    { startSec: 0, endSec: 25, text: "Revision due today, so we move quickly and precisely. The alimentary canal, mouth to anus, in one pass — then enzymes at each stage, which is where your marks actually come from." },
    { startSec: 25, endSec: 70, text: "Mouth: salivary amylase — also called ptyalin — begins starch digestion the moment food enters. This is why chewing starchy food long enough makes it taste sweet. Two marks, one sentence." },
    { startSec: 70, endSec: 120, text: "Stomach: gastric juice — hydrochloric acid, pepsin and mucus. Pepsin is the protease; it works only in acid. HCl kills bacteria and creates the acidic medium. Mucus protects the stomach wall — a three-part answer examiners score in three parts." },
    { startSec: 120, endSec: 170, text: "Small intestine — the main site. Bile from the liver emulsifies fat; pancreatic juice brings amylase, lipase and trypsin; intestinal juice finishes the job. Enzymes complete: starch to glucose, protein to amino acids, fat to fatty acids and glycerol." },
    { startSec: 170, endSec: 215, text: "The villi deserve a full sentence of their own: finger-like projections that increase surface area for absorption of the digested products into blood. Surface-area reasoning is a favourite CBSE follow-up." },
    { startSec: 215, endSec: 250, text: "Large intestine: water absorption, nothing else. Anus: egestion. Now self-quiz — name the enzyme acting on each substrate at each site, out loud, without looking. That retrieval, not re-reading, is what tomorrow's retention depends on." },
  ],
};

/* ------------------------------------------------------------------
 * Raw inventory export — used by the Day 5 knowledge-engine search so
 * it can iterate the canonical inventory alongside discoverResources().
 * The Day 4+ pages keep using discoverResources() as before.
 * ---------------------------------------------------------------- */
export const INVENTORY_EXPORT: Record<string, RawResource[]> = INVENTORY;

/* ------------------------------------------------------------------
 * Discovery engine
 * ---------------------------------------------------------------- */
const ALL_FORMATS: ResourceFormat[] = [
  "lecture",
  "revision",
  "explanation",
  "example",
  "practice",
  "diagram",
];

/**
 * Discover resources for a topic — simulates
 * GET /api/discovery/resources?topicId=&formats=&difficulty=
 */
export function discoverResources(
  topicId: string,
  options: { formats?: ResourceFormat[]; difficulty?: Difficulty | "all" } = {}
): ResourceDiscoveryResult | null {
  const resolvedId = resolveAlias(topicId);
  const raw = resolvedId ? INVENTORY[resolvedId] : undefined;
  if (!raw) return null;

  const formats = options.formats ?? ALL_FORMATS;
  let filtered = raw.filter((r) => formats.includes(r.format));
  if (options.difficulty && options.difficulty !== "all") {
    filtered = filtered.filter((r) => r.difficulty === options.difficulty);
  }

  const rankingNote =
    "Picked from NCERT, board-aligned channels and free educational sites — sorted by what fits your level and your week.";

  const resolved = filtered.map(
    (r): LearningResource => ({
      id: r.id,
      title: r.title,
      source: r.source,
      sourceLabel: r.sourceLabel,
      url: "#",
      durationMinutes: r.durationMinutes,
      format: r.format,
      topicId,
      topicTitle: "", // filled by enrichResourceTopicContext()
      chapterId: "",
      subjectCode: "",
      difficulty: r.difficulty,
      relevance: r.relevance,
      whyRecommended: r.whyRecommended,
      dnaDimension: r.dnaDimension,
      resourceType: classifyType(r),
      description: describe(r),
      isFreeWeb: FREE_SOURCES.includes(r.source),
    })
  );

  resolved.sort((a, b) => b.relevance - a.relevance);

  return {
    topicId,
    resources: resolved,
    appliedFilters: formats,
    rankingNote,
  };
}

export function getTranscript(resourceId: string): TranscriptSegment[] {
  return TRANSCRIPTS[resourceId] ?? [];
}

/**
 * Enrich a LearningResource with curriculum context (topicTitle,
 * chapterTitle, chapterId, subjectCode, subjectLabel, classLabel,
 * learningObjective, chapterTitle).
 * Simulates the backend joining /api/discovery/resources with the
 * curriculum service. The inventory only stores the stable alias slug;
 * this resolves it to the live Topic record.
 */
const SUBJECT_ID_TO_CODE: Record<string, string> = {
  math: "MATH",
  science: "SCI",
  social: "SST",
  english: "ENG",
  hindi: "HIN",
  sanskrit: "SKT",
};

/** The board · class line for the student's active context. */
function classContextFor(_subjectId: string): { boardName: string; className: string } {
  try {
    const raw = localStorage.getItem("cognify.profile-context.v1");
    if (!raw) return { boardName: "CBSE", className: "Class 10" };
    const c = JSON.parse(raw) as { boardId?: string; classId?: string };
    const boardId = c.boardId ?? "cbse";
    const classId = c.classId ?? "cbse-10";
    const board = boards.find((b) => b.id === boardId);
    const cls = board?.classes.find((cl) => cl.id === classId);
    return { boardName: board?.name ?? "CBSE", className: cls?.name ?? "Class 10" };
  } catch {
    return { boardName: "CBSE", className: "Class 10" };
  }
}

/** Subject code of the active focus, null when browsing everything. */
function focusedSubjectCode(): string | null {
  try {
    const raw = localStorage.getItem("cognify.profile-context.v1");
    if (!raw) return null;
    const c = JSON.parse(raw) as { subjectFocus?: string | null };
    return c.subjectFocus ? SUBJECT_ID_TO_CODE[c.subjectFocus] ?? null : null;
  } catch {
    return null;
  }
}

export function enrichResourceTopicContext(
  resource: LearningResource
): LearningResource {
  const resolved = findTopicByIdOrAlias(resource.topicId);
  if (!resolved) return resource;
  const { subject, chapter, topic } = resolved;
  const classCtx = classContextFor(subject.id);
  return {
    ...resource,
    topicTitle: topic.title,
    chapterId: chapter.id,
    chapterTitle: chapter.title,
    subjectCode: subject.code,
    subjectLabel: subject.name,
    classLabel: `${classCtx.boardName} · ${classCtx.className}`,
    board: classCtx.boardName,
    learningObjective:
      topic.objectives[0]?.text ?? `Master ${topic.title.toLowerCase()}`,
  };
}

/* ------------------------------------------------------------------
 * Library / search surface — flat views of the whole inventory
 * ---------------------------------------------------------------- */

/** Every resource in the inventory, enriched like a discovery result.
 *  Simulates GET /api/library?formats=&difficulty=&isFreeWeb= */
export function discoverAll(
  options: {
    formats?: ResourceFormat[];
    difficulty?: Difficulty | "all";
    isFreeWeb?: boolean;
    topicId?: string;
  } = {}
): LearningResource[] {
  const out: LearningResource[] = [];
  for (const [topicSlug, raw] of Object.entries(INVENTORY)) {
    if (options.topicId && resolveAlias(options.topicId) !== topicSlug) continue;
    const result = discoverResources(topicSlug, options);
    if (!result) continue;
    const focused = focusedSubjectCode();
    const enriched = result.resources.map(enrichResourceTopicContext);
    if (focused && enriched.some((r) => r.subjectCode === focused)) {
      out.push(...enriched.filter((r) => r.subjectCode === focused));
    } else {
      out.push(...enriched);
    }
  }
  if (options.isFreeWeb) out.filter(Boolean);
  out.sort((a, b) => b.relevance - a.relevance);
  return out;
}

/** Cross-inventory free-text search over titles and topic names.
 *  Simulates GET /api/discovery/search?q= */
export function searchResources(query: string): LearningResource[] {
  const q = query.trim().toLowerCase();
  if (q.length < 2) return [];
  const out: LearningResource[] = [];
  const seen = new Set<string>();
  for (const topicSlug of Object.keys(INVENTORY)) {
    const found = discoverResources(topicSlug)?.resources;
    if (!found) continue;
    for (const r of found) {
      if (seen.has(r.id)) continue;
      if (r.title.toLowerCase().includes(q) || topicSlug.includes(q)) {
        seen.add(r.id);
        out.push(r);
      }
    }
  }
  out.sort((a, b) => b.relevance - a.relevance);
  return out.slice(0, 24);
}

/** Per-topic meta for library indexes (subject, chapter, mastery). */
export interface TopicIndexMeta {
  alias: string;
  subjectCode: string;
  subjectName: string;
  chapterTitle: string;
  topicTitle: string;
  masteryPercent: number;
  masteryLabel: string;
}

/* Topic indexes are built below from the imported curriculum data. */

export function topicIndexes(): TopicIndexMeta[] {
  const out: TopicIndexMeta[] = [];
  for (const board of boards) {
    for (const cls of board.classes) {
      for (const subject of cls.subjects) {
        for (const chapter of subject.chapters) {
          for (const topic of chapter.topics) {
            const alias = aliasForTopicId(topic.id);
            if (!alias) continue;
            out.push({
              alias,
              subjectCode: subject.code,
              subjectName: subject.name,
              chapterTitle: chapter.title,
              topicTitle: topic.title,
              masteryPercent: Math.round(topic.mastery ?? 0),
              masteryLabel: masteryLabelFor(topic.mastery ?? 0),
            });
          }
        }
      }
    }
  }
  return out;
}

function aliasForTopicId(topicId: string): string | null {
  const aliasKey = Object.entries(TOPIC_ALIASES).find(
    ([alias, realId]) => realId === topicId
  );
  if (!aliasKey) return null;
  return aliasKey[0];
}

function masteryLabelFor(pct: number): string {
  if (pct >= 85) return "Proficient";
  if (pct >= 65) return "Developing";
  return "Needs attention";
}

/** DNA-aware: what a future backend would explain about ranking */
export const discoveryMeta = {
  dnaTopFormat: DNA.topFormat,
  attentionNote: DNA.attention,
  confidenceNote: DNA.confidenceCalibration,
};
