/**
 * COGNIFY — Curriculum Helpers
 *
 * Small lookup layer over the mock curriculum. Extracted from mockData so
 * downstream modules (resource discovery, player, session views) can resolve
 * board → class → subject → chapter → topic without re-importing the whole
 * dataset. When the backend ships, this becomes the API client's resolver.
 */
import { boards } from "./mockData";
import { getStudyContextSafe } from "./curriculumEngine";
import type { Chapter, Subject, Topic } from "./types";

export function findSubject(
  boardId: string,
  classId: string,
  subjectId: string
): Subject | null {
  const board = boards.find((b) => b.id === boardId);
  const cls = board?.classes.find((c) => c.id === classId);
  return cls?.subjects.find((s) => s.id === subjectId) ?? null;
}

/** Stable alias slugs — duplicated here (vs resourceDiscovery) so that
 *  curriculum lookups never create a circular import at load time. Both
 *  copies are kept identical by hand; the resolution logic lives in one
 *  place per module. */
/* Stable alias slugs → generated runtime topic ids (mkTopic rule:
   t-{index}-{title lowercase, non-alnum → "-", slice 0..28}).
   KEPT IDENTICAL to TOPIC_ALIASES in resourceDiscovery.ts — single source
   of truth lives there; this copy only exists to avoid a circular import. */
const CANONICAL_TOPIC_SLUGS: Record<string, string> = {
  "t-0-irrational-numbers-proofs": "t-1-irrational-numbers-proofs",
  "t-0-fundamental-theorem-of-arith": "t-2-fundamental-theorem-of-arith",
  "t-0-relationship-between-zeros-c": "t-1-relationship-between-zeros-c",
  "t-0-division-algorithm-for-polyn": "t-2-division-algorithm-for-polyn",
  "t-0-substitution-elimination-met": "t-1-substitution-elimination-met",
  "t-0-cross-multiplication-word-pr": "t-2-cross-multiplication-word-pr",
  "t-0-completing-the-square": "t-1-completing-the-square",
  "t-0-nature-of-roots-discriminant": "t-2-nature-of-roots-discriminant",
  "t-0-types-of-reactions": "t-1-types-of-reactions",
  "t-0-oxidation-reduction-corrosio": "t-2-oxidation-reduction-corrosio",
  "t-0-ph-scale-strength": "t-1-ph-scale-strength",
  "t-0-nutrition-in-humans": "t-1-nutrition-in-humans",
  "t-0-transportation-excretion": "t-2-transportation-excretion",
  "t-1-making-of-nationalism-italy-germany": "t-1-making-of-nationalism-in-ita",
  "t-3-first-world-war-non-cooperation": "t-0-the-first-world-war-non-coop",
  "t-2-nationalism-imperialism": "t-2-nationalism-imperialism",
  "t-0-the-french-revolution-idea-of-nation": "t-0-the-french-revolution-the-id",
  "t-0-nationalism-imperialism": "t-2-nationalism-imperialism",
  "t-0-civil-disobedience-sense-of-": "t-1-civil-disobedience-sense-of-",
  "t-0-nelson-mandela-long-walk-to-": "t-1-nelson-mandela-long-walk-to-",
  "t-0-two-stories-about-flying": "t-2-two-stories-about-flying",
  "t-3-zeros-of-a-polynomial": "t-0-zeros-of-a-polynomial",
  "t-5-division-algorithm-for-polynomials": "t-2-division-algorithm-for-polyn",
  "t-2-relationship-between-zeros-coefficients": "t-1-relationship-between-zeros-c",
  "t-4-relationship-between-zeros-coefficients": "t-1-relationship-between-zeros-c",
  "t-1-substitution-elimination-methods": "t-1-substitution-elimination-met",
  "t-4-civil-disobedience-collective-belonging": "t-1-civil-disobedience-sense-of-",
  "t-0-french-revolution-idea-of-nation": "t-0-the-french-revolution-the-id",
  "t-2-oxidation-reduction-corrosion": "t-2-oxidation-reduction-corrosio",
  "t-6-quadratic-formula-applications": "t-2-nature-of-roots-discriminant",
};

/** Accepts either a runtime topic id or a stable alias slug */
export function findTopicByIdOrAlias(topicId: string): {
  subject: Subject;
  chapter: Chapter;
  topic: Topic;
} | null {
  if (!topicId) return null;
  const direct = findTopic(topicId);
  if (direct) return direct;
  // fall back to stable aliases (e.g. "t-4-relationship-between-zeros-coefficients")
  const realId = CANONICAL_TOPIC_SLUGS[topicId] ?? topicId;
  const aliasHit = findTopic(realId);
  if (aliasHit) return aliasHit;
  // Class 8/9 students land here when the dashboard points at a variant
  // topic: map by subject + title instead of returning a dead end.
  const ctx = getStudyContextSafe();
  if (ctx) {
    const byTitle = findTopicByTitleInSubject(ctx.subjectId, topicId);
    if (byTitle) return byTitle;
  }
  return null;
}

/** Find a topic by a fuzzy title match inside one subject only — used to
 *  map a Class 8/9 student onto Class 10 discovery content when the
 *  exact runtime id does not exist in the Class-10 resource inventory.
 *  The backend will do this properly per-class; this keeps the demo path
 *  honest (same topic name, matched within the subject). */
export function findTopicByTitleInSubject(
  subjectId: string,
  title: string
): {
  subject: Subject;
  chapter: Chapter;
  topic: Topic;
} | null {
  const needle = normalize(title);
  for (const e of allTopics()) {
    if (e.subject.id !== subjectId) continue;
    if (normalize(e.topic.title) === needle) return e;
  }
  for (const e of allTopics()) {
    if (e.subject.id !== subjectId) continue;
    if (normalize(e.topic.title).includes(needle) || normalize(e.topic.title).includes(splitTitle(needle))) return e;
  }
  return null;
}

function normalize(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

function splitTitle(s: string): string {
  const words = normalize(s).split(" ");
  if (words.length < 3) return "";
  // first two words capture the core concept, e.g. "Light Reflection" from
  // "Light — Reflection and Refraction"
  return words.slice(0, 2).join(" ");
}

/** The canonical list of stable alias slugs for links and UIs. */
export const ALIAS_IDS: string[] = Object.keys(CANONICAL_TOPIC_SLUGS);

/** Resolve the stable alias slug for any topic identifier (or null). */
export function topicAlias(topicId: string): string | null {
  if (!topicId) return null;
  if (topicId in CANONICAL_TOPIC_SLUGS) return topicId;
  return (
    Object.entries(CANONICAL_TOPIC_SLUGS).find(([, realId]) => realId === topicId)?.[0] ?? null
  );
}

/** Full breadcrumb for a topic: board → class → subject → chapter → topic */
export function topicPath(topicId: string): {
  subject: Subject;
  chapter: Chapter;
  topic: Topic;
} | null {
  return findTopicByIdOrAlias(topicId);
}

/** All topics flattened — for library indexes, search and discovery. */
export function allTopics(): {
  subject: Subject;
  chapter: Chapter;
  topic: Topic;
}[] {
  const out: { subject: Subject; chapter: Chapter; topic: Topic }[] = [];
  for (const board of boards) {
    for (const cls of board.classes) {
      for (const subject of cls.subjects) {
        for (const chapter of subject.chapters) {
          for (const topic of chapter.topics) {
            out.push({ subject, chapter, topic });
          }
        }
      }
    }
  }
  return out;
}

export function findTopic(topicId: string): {
  subject: Subject;
  chapter: Chapter;
  topic: Topic;
} | null {
  for (const board of boards) {
    for (const cls of board.classes) {
      for (const subject of cls.subjects) {
        for (const chapter of subject.chapters) {
          const topic = chapter.topics.find((t) => t.id === topicId);
          if (topic) return { subject, chapter, topic };
        }
      }
    }
  }
  return null;
}

export function findChapter(chapterId: string): {
  subject: Subject;
  chapter: Chapter;
} | null {
  for (const board of boards) {
    for (const cls of board.classes) {
      for (const subject of cls.subjects) {
        const chapter = subject.chapters.find((c) => c.id === chapterId);
        if (chapter) return { subject, chapter };
      }
    }
  }
  return null;
}

/** Pretty subject name from code, e.g. MATH → Mathematics */
export function subjectName(code: string): string {
  for (const board of boards) {
    for (const cls of board.classes) {
      const subject = cls.subjects.find((s) => s.code === code);
      if (subject) return subject.name;
    }
  }
  return code;
}
