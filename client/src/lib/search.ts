/**
 * COGNIFY — Global search (mock)
 *
 * Indexes the whole shelf — topics, resources, and the student's own
 * timeline notes — so the Command Palette (⌘K) returns a unified result
 * list. Simulates GET /api/search?q=
 *
 * Style: Scholar's Atelier — the palette is the card catalogue of the
 * learning laboratory.
 */
import type { SearchResult, SearchResultKind } from "./types";
import { allTopics, topicAlias } from "./curriculum";
import { discoverAll, getTranscript } from "./resourceDiscovery";

/** Student notes saved across player sessions (keyed per student). */
const NOTES_KEY = "cognify.timeline-notes.v1";

interface StoredNote {
  id: string;
  resourceId: string;
  atSec: number;
  text: string;
  createdAt: string;
}

function loadNotes(): StoredNote[] {
  try {
    return JSON.parse(localStorage.getItem(NOTES_KEY) ?? "[]") as StoredNote[];
  } catch {
    return [];
  }
}

/** Unified search across topics, resources and the student's notes. */
export function searchAll(query: string): SearchResult[] {
  const q = query.trim().toLowerCase();
  if (q.length < 2) return [];
  const out: SearchResult[] = [];
  const seen = new Set<string>();

  const push = (r: SearchResult) => {
    const key = `${r.kind}:${r.id}`;
    if (seen.has(key)) return;
    seen.add(key);
    out.push(r);
  };

  // Topics
  for (const { subject, chapter, topic } of allTopics()) {
    const alias = topicAlias(topic.id);
    const hay = `${topic.title} ${chapter.title} ${subject.name}`.toLowerCase();
    if (hay.includes(q)) {
      push({
        kind: "topic",
        id: alias ?? topic.id,
        title: topic.title,
        context: `${subject.name} · ${chapter.title}`,
        href: `/topic/${alias ?? topic.id}`,
        relevance: topicTitleScore(topic.title, q),
      });
    }
  }

  // Resources
  const resources = discoverAll();
  for (const r of resources) {
    if (r.title.toLowerCase().includes(q)) {
      push({
        kind: "resource",
        id: r.id,
        title: r.title,
        context: `${r.sourceLabel} · ${r.format} · ${r.durationMinutes} min`,
        href: `/resources/${r.topicId}`,
        relevance: Math.max(40, Math.min(90, r.relevance - 5)),
      });
    }
  }

  // Transcript segments (searchable lecture content)
  for (const r of resources) {
    const segments = getTranscript(r.id);
    for (const seg of segments) {
      if (seg.text.toLowerCase().includes(q)) {
        push({
          kind: "lecture",
          id: `${r.id}:${seg.startSec}`,
          title: `${r.title} — ${fmtTime(seg.startSec)}`,
          context: trimText(seg.text, 90),
          href: `/player/${r.id}?topic=${r.topicId}`,
          relevance: 60,
        });
        break; // one hit per resource keeps the palette readable
      }
    }
  }

  // Student's own notes
  for (const n of loadNotes()) {
    if (n.text.toLowerCase().includes(q)) {
      push({
        kind: "note",
        id: n.id,
        title: `Your note — ${fmtTime(n.atSec)}`,
        context: `${n.text.slice(0, 90)}…`,
        href: `/player/${n.resourceId}`,
        relevance: 55,
      });
    }
  }

  out.sort((a, b) => b.relevance - a.relevance);
  return out.slice(0, 20);
}

function topicTitleScore(title: string, q: string): number {
  if (title.toLowerCase().startsWith(q)) return 98;
  if (title.toLowerCase().includes(q)) return 85;
  return 60;
}

function fmtTime(sec: number): string {
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

function trimText(t: string, max: number): string {
  return t.length <= max ? t : t.slice(0, max) + "…";
}
