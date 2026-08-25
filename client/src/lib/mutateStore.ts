/**
 * COGNIFY — tiny localStorage mutation store
 * Shared helper for Day-4 stores that need local user mutations
 * (timetable status changes, goal progress, teach-back submissions) which the
 * future backend will persist. Every store keeps its own key; mutations are
 * appended so defaults + overrides compose cleanly.
 */
export interface BaseMutation {
  sessionId?: string;
  goalId?: string;
  topicId?: string;
  submittedAt?: string;
}

export function mutate<M extends BaseMutation>(key: string, payload: M): void {
  try {
    const raw = localStorage.getItem(key);
    const list = raw ? (JSON.parse(raw) as M[]) : [];
    list.push({ ...payload, submittedAt: new Date().toISOString() } as unknown as M);
    localStorage.setItem(key, JSON.stringify(list));
  } catch {
    localStorage.setItem(key, JSON.stringify([payload]));
  }
}

export function listMutations<M extends BaseMutation>(key: string): M[] {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as M[]) : [];
  } catch {
    return [];
  }
}
