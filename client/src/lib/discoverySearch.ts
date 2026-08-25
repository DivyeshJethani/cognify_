/**
 * COGNIFY — Knowledge Engine Search & Discovery Filters (mock)
 *
 * Two jobs:
 * 1. searchKnowledge(query) — a grouped, knowledge-engine style search.
 *    Results are bucketed into TOPICS / RESOURCES / REVISION / PRACTICE /
 *    LEARNING PATHS, so "factorisation" returns the topic, its resources,
 *    its revision status and its practice sets in one view.
 * 2. filterAndSort(resources, opts) — the Resource Library filter/sort
 *    engine (subject, chapter, type, duration, difficulty, free-web-only;
 *    most relevant / recommended for me / shortest / recently added /
 *    highest evidence).
 *
 * Simulates GET /api/search/knowledge?q= and
 * GET /api/library?filters=&sort= — the UI layer consumes both directly.
 */
import type {
  Difficulty,
  LearningFormat,
  LearningResource,
  ResourceType,
} from "./types";
import { allTopics, topicAlias } from "./curriculum";
import { discoverResources, typeMeta, classifyType, INVENTORY_EXPORT } from "./resourceDiscovery";
import { revisionSchedule } from "./revision";
import { todayAdaptivePath } from "./adaptive";
import { learningDNA } from "./mockData";
import { subjectNames as subjectNameMap } from "./curriculumEngine";

const SUBJECT_ID_TO_CODE: Record<string, string> = {
  math: "MATH",
  science: "SCI",
  social: "SST",
  english: "ENG",
  hindi: "HIN",
  sanskrit: "SKT",
};

/** Read the active subject focus (null when browsing everything). */
function getSubjectFocus(): string | null {
  try {
    const raw = localStorage.getItem("cognify.profile-context.v1");
    if (!raw) return null;
    const c = JSON.parse(raw) as { subjectFocus?: string | null };
    return c.subjectFocus ? SUBJECT_ID_TO_CODE[c.subjectFocus] ?? null : null;
  } catch {
    return null;
  }
}

export type SearchGroup =
  | "topics"
  | "resources"
  | "revision"
  | "practice"
  | "paths"
  | "subjects"
  | "chapters";

export interface GroupedSearchResult {
  query: string;
  groups: {
    key: SearchGroup;
    label: string;
    items: GroupedSearchItem[];
  }[];
}

export interface GroupedSearchItem {
  kind: "topic" | "resource" | "revision" | "practice" | "path" | "subject" | "chapter";
  id: string;
  title: string;
  context: string; // e.g. "Mathematics · Quadratic Equations"
  detail: string;
  href: string;
  score: number; // 0–100
  meta?: string;
}

/* ------------------------------------------------------------------
 * Grouped knowledge search
 * ---------------------------------------------------------------- */

const SCORE_THRESHOLD = 38;

export function searchKnowledge(query: string): GroupedSearchResult {
  // Scope every group to the active subject focus when one is set.
  const focusCode = getSubjectFocus();
  const q = query.trim().toLowerCase();
  const out: GroupedSearchResult = {
    query,
    groups: [
      { key: "topics", label: "Topics", items: [] },
      { key: "subjects", label: "Subjects", items: [] },
      { key: "chapters", label: "Chapters", items: [] },
      { key: "resources", label: "Resources", items: [] },
      { key: "revision", label: "Revision", items: [] },
      { key: "practice", label: "Practice", items: [] },
      { key: "paths", label: "Learning Paths", items: [] },
    ],
  };
  if (q.length < 2) return out;

  const byGroup = new Map<SearchGroup, typeof out.groups[0]>();
  out.groups.forEach((g) => byGroup.set(g.key, g));

  // ---- SUBJECTS: match subject names and codes ----
  const seenSubjects = new Set<string>();
  for (const { subject } of allTopics()) {
    if (focusCode && subject.code !== focusCode) continue;
    const hay = `${subject.name} ${subject.id}`.toLowerCase();
    if (!hay.includes(q)) continue;
    if (seenSubjects.has(subject.id)) continue;
    seenSubjects.add(subject.id);
    byGroup.get("subjects")!.items.push({
      kind: "subject",
      id: subject.id,
      title: subject.name,
      context: `CBSE · Class 10`,
      detail: `${subject.chapters.length} chapters`,
      href: `/subject/${subject.id}`,
      score: 88,
    });
  }

  // ---- CHAPTERS: chapter titles within matching subjects ----
  const seenChapters = new Set<string>();
  for (const { subject, chapter } of allTopics()) {
    if (focusCode && subject.code !== focusCode) continue;
    if (!chapter.title.toLowerCase().includes(q)) continue;
    const key = `${subject.id}-${chapter.id}`;
    if (seenChapters.has(key)) continue;
    seenChapters.add(key);
    byGroup.get("chapters")!.items.push({
      kind: "chapter",
      id: chapter.id,
      title: chapter.title,
      context: subject.name,
      detail: `${chapter.topics.length} topics`,
      href: `/subject/${subject.id}#${chapter.id}`,
      score: 80,
    });
  }

  // ---- TOPICS: fuzzy match on title, objectives, chapter ----
  const seenTopics = new Set<string>();
  for (const { subject, chapter, topic } of allTopics()) {
    if (focusCode && subject.code !== focusCode) continue;
    const hay = `${topic.title} ${chapter.title} ${subject.name} ${topic.objectives.map((o) => o.text).join(" ")}`.toLowerCase();
    if (!hay.includes(q)) continue;
    if (seenTopics.has(topic.id)) continue;
    seenTopics.add(topic.id);
    const alias = topicAlias(topic.id);
    const score = topicMatchScore(topic.title, q) * 0.6 + objectiveMatchScore(topic.objectives.map((o) => o.text), q) * 0.4;
    if (score < SCORE_THRESHOLD) continue;
    byGroup.get("topics")!.items.push({
      kind: "topic",
      id: alias ?? topic.id,
      title: topic.title,
      context: `${subject.name} · ${chapter.title}`,
      detail: `${topic.mastery}% mastery${topic.revisionStatus === "due" || topic.revisionStatus === "overdue" ? " · revision due" : ""}`,
      href: `/topic/${alias ?? topic.id}`,
      score: Math.round(score),
    });
  }

  // ---- RESOURCES: inventory-wide title + topic search ----
  const seen = new Set<string>();
  for (const [topicSlug, raw] of Object.entries(INVENTORY_EXPORT)) {
    for (const r of raw) {
      if (seen.has(r.id)) continue;
      const topicTitle = rawTitleOf(r.id);
      const hay = `${r.title} ${topicTitle}`.toLowerCase();
      if (!hay.includes(q) && !topicSlug.includes(q)) continue;
      seen.add(r.id);
      const score = Math.max(r.relevance * 0.8, hay.includes(q) ? 70 : 40);
      const meta = typeMeta(classifyType(r)).label;
      byGroup.get("resources")!.items.push({
        kind: "resource",
        id: r.id,
        title: r.title,
        context: topicLabel(topicSlug),
        detail: `${r.durationMinutes} min · ${meta}`,
        href: `/session/${r.id}`,
        score: Math.round(score),
        meta,
      });
    }
  }

  // ---- REVISION: spaced-schedule entries whose topic matches ----
  const seenRev = new Set<string>();
  for (const e of revisionSchedule()) {
    const hay = `${e.topicTitle} ${e.chapterTitle}`.toLowerCase();
    if (!hay.includes(q)) continue;
    if (seenRev.has(e.topicId)) continue;
    seenRev.add(e.topicId);
    byGroup.get("revision")!.items.push({
      kind: "revision",
      id: `rev-${e.topicId}`,
      title: e.topicTitle,
      context: `${subjectNameMap[e.subjectCode] ?? e.subjectLabel} · ${e.chapterTitle}`,
      detail: `${e.bucket.replace("-", " ")} · ~${e.estimatedMinutes} min · ${e.retentionEstimate}% estimated retention`,
      href: `/revision`,
      score: e.bucket === "due-today" ? 92 : e.bucket === "due-tomorrow" ? 78 : 55,
      meta: e.bucket,
    });
  }

  // ---- PRACTICE: practice-type resources on matching topics ----
  const seenPractice = new Set<string>();
  for (const { subject, chapter, topic } of allTopics()) {
    const hay = `${topic.title} ${chapter.title} ${subject.name}`.toLowerCase();
    if (!hay.includes(q)) continue;
    const alias = topicAlias(topic.id);
    if (!alias || seenPractice.has(alias)) continue;
    seenPractice.add(alias);
    const discovery = discoverResources(alias, { formats: ["practice"] });
    if (discovery?.resources.length) {
        byGroup.get("practice")!.items.push({
          kind: "practice",
          id: `prac-${alias}`,
          title: `${discovery.resources[0].title}`,
          context: `${subject.name} · ${chapter.title}`,
          detail: `${discovery.resources.length} practice set${discovery.resources.length > 1 ? "s" : ""} matched to your error pattern`,
          href: `/resources/${alias}`,
          score: 74,
          meta: `${discovery.resources.length} set${discovery.resources.length > 1 ? "s" : ""}`,
        });
    }
  }

  // ---- LEARNING PATHS: adaptive path recommendations mentioning the query ----
  const path = todayAdaptivePath();
  const seenPaths = new Set<string>();
  for (const rec of path.slice(0, 5)) {
    if (seenPaths.has(rec.topicId)) continue;
    seenPaths.add(rec.topicId);
    const hay = `${rec.topicTitle} ${rec.subjectLabel} ${rec.reason}`.toLowerCase();
    if (!hay.includes(q)) continue;
    byGroup.get("paths")!.items.push({
      kind: "path",
      id: `path-${rec.topicId}`,
      title: rec.topicTitle,
      context: rec.subjectLabel,
      detail: `${rec.estimatedMinutes} min · ${rec.priority} priority · ${rec.format}`,
      href: `/adaptive`,
      score: Math.round(85 - (rec.rank - 1) * 10),
      meta: rec.priority,
    });
  }

  // keep only non-empty groups, sort items by score desc
  out.groups = out.groups
    .filter((g) => g.items.length > 0)
    .map((g) => ({
      ...g,
      items: g.items.sort((a, b) => b.score - a.score).slice(0, 6),
    }));
  return out;
}

function topicMatchScore(title: string, q: string): number {
  const t = title.toLowerCase();
  if (t.includes(q)) return q.length >= 6 ? 95 : 85;
  // word overlap
  const tw = t.split(/[^a-z]+/);
  const qw = q.split(/[^a-z]+/);
  const hits = qw.filter((w) => w.length > 2 && tw.some((x) => x.includes(w) || w.includes(x))).length;
  return Math.min(90, 55 + hits * 18);
}

function objectiveMatchScore(objectives: string[], q: string): number {
  for (const o of objectives) if (o.toLowerCase().includes(q)) return 80;
  return 0;
}

/* ------------------------------------------------------------------
 * Filter + sort engine for the Resource Library
 * ---------------------------------------------------------------- */

export type SortKey =
  | "most-relevant"
  | "recommended-for-me"
  | "shortest"
  | "recently-added"
  | "highest-evidence";

export interface LibraryFilters {
  subject?: string; // subject id or code
  class?: string;
  chapter?: string;
  topic?: string; // topic alias
  types?: ResourceType[];
  duration?: "any" | "under15" | "15to30" | "over30";
  difficulty?: Difficulty | "all";
  freeWebOnly?: boolean;
}

/**
 * Sort per the Library sort options. "recommended-for-me" weights the
 * student's Learning DNA top format; "highest-evidence" weights evidence
 * strength (why-recommended specificity + dnaDimension signal).
 */
export function filterAndSort(
  resources: LearningResource[],
  filters: LibraryFilters,
  sort: SortKey = "most-relevant"
): LearningResource[] {
  let list = resources.filter((r) => {
    if (filters.subject && r.subjectCode !== filters.subject && r.subjectCode.toLowerCase() !== filters.subject) return false;
    if (filters.chapter && (r.chapterTitle ?? "").toLowerCase() !== filters.chapter.toLowerCase()) return false;
    if (filters.topic && r.topicId !== filters.topic && topicAlias(r.topicId) !== filters.topic) return false;
    if (filters.types && filters.types.length && !filters.types.includes(r.resourceType)) return false;
    if (filters.difficulty && filters.difficulty !== "all" && r.difficulty !== filters.difficulty) return false;
    if (filters.duration && filters.duration !== "any") {
      const m = r.durationMinutes;
      if (filters.duration === "under15" && m >= 15) return false;
      if (filters.duration === "15to30" && (m < 15 || m > 30)) return false;
      if (filters.duration === "over30" && m <= 30) return false;
    }
    if (filters.freeWebOnly && !r.isFreeWeb) return false;
    return true;
  });

  switch (sort) {
    case "most-relevant":
      list.sort((a, b) => b.relevance - a.relevance);
      break;
    case "recommended-for-me":
      // DNA-aware: visual-diagram learners rank visuals higher; practice
      // ranks higher when action is practice; weak topics rank higher.
      const topFormat: LearningFormat = learningDNA.topFormat;
      list.sort((a, b) => {
        const aBoost = dnaBoost(a, topFormat);
        const bBoost = dnaBoost(b, topFormat);
        return b.relevance + bBoost - (a.relevance + aBoost);
      });
      break;
    case "shortest":
      list.sort((a, b) => a.durationMinutes - b.durationMinutes);
      break;
    case "recently-added":
      // inventory order is treated as recency; stable by id hash
      list.sort((a, b) => hashId(a.id) - hashId(b.id));
      break;
    case "highest-evidence":
      list.sort((a, b) => evidenceScore(b) - evidenceScore(a));
      break;
  }
  return list;
}

function dnaBoost(r: LearningResource, topFormat: LearningFormat): number {
  let boost = 0;
  const meta = typeMeta(r.resourceType);
  if (topFormat === "visual-diagram" && (r.resourceType === "diagram" || r.resourceType === "animation-visual")) boost += 14;
  if (topFormat === "worked-example" && r.resourceType === "solved-example") boost += 14;
  if (topFormat === "step-by-step" && r.resourceType === "video-lecture") boost += 10;
  if (r.resourceType === "practice-set") boost += 8; // practice always moves the record
  if (r.dnaDimension) boost += 6;
  return boost;
}

function evidenceScore(r: LearningResource): number {
  let score = 0;
  // specificity of the why-recommended text: mentions of concrete data
  const why = r.whyRecommended.toLowerCase();
  if (/%/.test(why)) score += 25;
  if (/error|mistake|pattern/i.test(why)) score += 20;
  if (/(visual|diagram|format)/i.test(why)) score += 15;
  if (r.dnaDimension) score += 20;
  score += r.relevance * 0.2;
  return score;
}

function hashId(id: string): number {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) >>> 0;
  return h;
}

/* ------------------------------------------------------------------
 * Small lookups — INVENTORY_EXPORT bridges resourceDiscovery.ts
 * ---------------------------------------------------------------- */

function rawTitleOf(resourceId: string): string {
  for (const raw of Object.values(INVENTORY_EXPORT)) {
    const found = raw.find((r) => r.id === resourceId);
    if (found) return found.title;
  }
  return "";
}

function topicLabel(topicId: string): string {
  for (const { subject, chapter, topic } of allTopics()) {
    const alias = topicAlias(topic.id);
    if (alias === topicId || topic.id === topicId) {
      return `${subject.name} · ${chapter.title}`;
    }
  }
  // fallback: derive from known inventory keys
  return "CBSE curriculum";
}
