/**
 * COGNIFY — Study Context
 *
 * Global context layer: BOARD → CLASS → SUBJECT → CHAPTER → TOPIC.
 *
 * The whole UI reads content through this module so that a student's
 * classLevel and subjectFocus control what is displayed everywhere —
 * curriculum, resources, practice, revision, recommendations, search.
 *
 * When a real backend arrives, the UI keeps these selectors and the
 * backend filters replace the localStorage profile reads.
 */
import { boards, findSubjectForClass } from "./mockData";
import type { Subject } from "./types";

const PROFILE_KEY = "cognify.profile-context.v1";

interface StoredContext {
  boardId: string;
  classId: string;
  subjectFocus: string | null; // null = global overview
}

/* ---------- read / write ---------- */

function load(): StoredContext {
  try {
    const raw = localStorage.getItem(PROFILE_KEY);
    if (raw) return JSON.parse(raw) as StoredContext;
  } catch {
    /* fall through */
  }
  // Demo default: CBSE Class 10 (judge demo path)
  return { boardId: "cbse", classId: "cbse-10", subjectFocus: null };
}

export function saveContext(next: Partial<StoredContext>) {
  const merged = { ...load(), ...next };
  localStorage.setItem(PROFILE_KEY, JSON.stringify(merged));
  window.dispatchEvent(new CustomEvent("cognify:context-change"));
}

export function getStudyContext(): StoredContext & {
  classLevel: number;
  className: string;
  boardName: string;
} {
  const c = load();
  const board = boards.find((b) => b.id === c.boardId) ?? boards[0];
  const cls = board.classes.find((cl) => cl.id === c.classId) ?? board.classes[0];
  return {
    ...c,
    classLevel: classLevelOf(cls.id),
    className: cls.name,
    boardName: board.name,
  };
}

export function classLevelOf(classId: string): number {
  const m = classId.match(/-(\d+)$/);
  return m ? Number(m[1]) : 10;
}

/* ---------- subject helpers ---------- */

export function classSubjects(boardId: string, classId: string): Subject[] {
  const board = boards.find((b) => b.id === boardId);
  const cls = board?.classes.find((c) => c.id === classId);
  if (!cls) return [];
  // Swap in the class-appropriate variant (Class 8/9) where available.
  return cls.subjects.map((s) => findSubjectForClass(boardId, classId, s.id) ?? s);
}

export function subjectFor(
  boardId: string,
  classId: string,
  subjectId: string
): Subject | null {
  return findSubjectForClass(boardId, classId, subjectId);
}

export function classLevelLabel(level: number): string {
  return `Class ${level}`;
}

/** Human context line, e.g. "CBSE · Class 10" */
export function contextLabel(): string {
  const c = getStudyContext();
  return `${c.boardName} · ${c.className}`;
}

/** Subscribe to context changes from anywhere (e.g. subject switcher). */
export function onContextChange(fn: () => void): () => void {
  const handler = () => fn();
  window.addEventListener("cognify:context-change", handler);
  return () => window.removeEventListener("cognify:context-change", handler);
}
