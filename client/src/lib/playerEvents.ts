/**
 * COGNIFY — Player Analytics Event Store (mock)
 *
 * Captures player interaction events and persists them locally so the UI can
 * show an "observing" audit trail. When the NestJS backend ships, this module
 * becomes an axios client POSTing to /api/analytics/player-events in batches.
 *
 * Emitted event types (contract for the backend aggregation service):
 *   PLAY, PAUSE, REWIND, FAST_FORWARD, SKIP, SPEED_CHANGE, COMPLETE, DROP_OFF
 */
import type { PlayerEvent, PlayerEventType } from "./types";

const STORAGE_KEY = "cognify.player-events.v1";

function newSessionId(): string {
  return `sess-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

export function startSession(resourceId: string): string {
  const sessionId = newSessionId();
  logEvent({ type: "PLAY", atSec: 0, sessionId, resourceId });
  return sessionId;
}

export function logEvent(event: Omit<PlayerEvent, "sessionId"> & { sessionId: string }) {
  const queue = loadQueue();
  queue.push({ ...event, recordedAt: new Date().toISOString() });
  // Cap local buffer at 500 events to bound storage.
  persist(queue.slice(-500));
  window.dispatchEvent(new CustomEvent("cognify:player-event", { detail: event }));
}

export function loadQueue(): (PlayerEvent & { recordedAt?: string })[] {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]");
  } catch {
    return [];
  }
}

function persist(queue: (PlayerEvent & { recordedAt?: string })[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(queue));
  } catch {
    /* storage unavailable — degrade silently */
  }
}

export function eventsForSession(sessionId: string) {
  return loadQueue().filter((e) => e.sessionId === sessionId);
}

export function eventsForResource(resourceId: string) {
  return loadQueue().filter((e) => e.resourceId === resourceId);
}

export function clearPlayerEvents() {
  persist([]);
}

/** Human labels for the event ledger shown in the session panel */
const EVENT_LABELS: Record<PlayerEventType, string> = {
  PLAY: "Playback started",
  PAUSE: "Paused",
  REWIND: "Rewound",
  FAST_FORWARD: "Fast-forwarded",
  SKIP: "Skipped",
  SPEED_CHANGE: "Speed changed",
  COMPLETE: "Completed",
  DROP_OFF: "Dropped off",
};

export function eventLabel(e: PlayerEvent): string {
  const base = EVENT_LABELS[e.type];
  const extra: string[] = [];
  if (e.payload?.speed) extra.push(`→ ${e.payload.speed}x`);
  if (e.payload?.seconds !== undefined) extra.push(`${e.payload.seconds}s`);
  return extra.length ? `${base} (${extra.join(", ")})` : base;
}
