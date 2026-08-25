/**
 * COGNIFY — Saved Resources + Continue Learning store (mock)
 *
 * Persists the student's shelf — resources they bookmarked during discovery
 * or while learning — and the partial-progress record that drives the
 * "Continue learning" rail. When the backend ships:
 *   POST   /api/library/saved        (add)
 *   DELETE /api/library/saved/:id    (remove)
 *   GET    /api/library/saved        (list)
 *   GET    /api/library/continue     (continue-learning rail)
 *
 * Style: Scholar's Atelier — ledger-like records with honest provenance.
 * This module is a service, not a UI, so it carries no styling.
 */
import type { LearningResource, ResourceProgress, SavedResource } from "./types";

const SAVED_KEY = "cognify.saved-resources.v1";
const PROGRESS_KEY = "cognify.progress.v1";

function loadList<T>(key: string): T[] {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as T[]) : [];
  } catch {
    return [];
  }
}

function saveList<T>(key: string, list: T[]) {
  localStorage.setItem(key, JSON.stringify(list));
}

/* ------------------------------------------------------------------
 * Saved shelf
 * ---------------------------------------------------------------- */
export function listSaved(): SavedResource[] {
  return loadList<SavedResource>(SAVED_KEY);
}

export function addSaved(resource: LearningResource, note: string = ""): SavedResource {
  const list = listSaved();
  const existing = list.find((s) => s.resourceId === resource.id);
  if (existing) {
    existing.savedAt = new Date().toISOString();
    saveList(SAVED_KEY, list);
    return existing;
  }
  const saved: SavedResource = {
    resourceId: resource.id,
    savedAt: new Date().toISOString(),
    note,
  };
  saveList(SAVED_KEY, [saved, ...list]);
  return saved;
}

export function removeSaved(resourceId: string): void {
  saveList(
    SAVED_KEY,
    listSaved().filter((s) => s.resourceId !== resourceId)
  );
}

export function isSaved(resourceId: string): boolean {
  return listSaved().some((s) => s.resourceId === resourceId);
}

/* ------------------------------------------------------------------
 * Progress (continue-learning) record
 * ---------------------------------------------------------------- */
export function listProgress(): ResourceProgress[] {
  return loadList<ResourceProgress>(PROGRESS_KEY);
}

export function updateProgress(
  resourceId: string,
  update: Partial<Omit<ResourceProgress, "resourceId">>
): ResourceProgress {
  const list = listProgress();
  const existing = list.find((p) => p.resourceId === resourceId);
  const entry: ResourceProgress = {
    resourceId,
    fraction: existing ? Math.max(existing.fraction, update.fraction ?? 0) : update.fraction ?? 0,
    lastAtSec: update.lastAtSec,
    updatedAt: new Date().toISOString(),
  };
  saveList(
    PROGRESS_KEY,
    existing
      ? list.map((p) => (p.resourceId === resourceId ? entry : p))
      : [entry, ...list]
  );
  return entry;
}

/** Continue-learning rail: resources touched but not finished. */
export function continueLearning(): ResourceProgress[] {
  return listProgress()
    .filter((p) => p.fraction > 0 && p.fraction < 1)
    .sort((a, b) => (a.updatedAt < b.updatedAt ? 1 : -1));
}

export function progressFor(resourceId: string): ResourceProgress | null {
  return listProgress().find((p) => p.resourceId === resourceId) ?? null;
}

export function markCompleted(resourceId: string): void {
  updateProgress(resourceId, { fraction: 1 });
}
