/**
 * COGNIFY — Lecture Player
 * Style: Scholar's Atelier. The player is an instrument: deep-ink stage with
 * hairline controls, and a right-hand ledger column for transcript, notes,
 * replay marks, related resources and "Ask Cognify". Every interaction emits
 * a typed analytics event (PLAY/PAUSE/REWIND/FAST_FORWARD/SKIP/SPEED_CHANGE/
 * COMPLETE/DROP_OFF) for the future backend. Mock video: simulated timeline
 * with realistic tick — no real media file required.
 */
import AppShell from "@/components/cognify/AppShell";
import {
  Hairline,
  Marginalia,
  MasteryBar,
} from "@/components/cognify/Primitives";
import { answer, quickPicks } from "@/lib/askCognify";
import { discoverResources, getTranscript } from "@/lib/resourceDiscovery";
import { findTopicByIdOrAlias } from "@/lib/curriculum";
import { topicBreadcrumb } from "@/lib/curriculumEngine";
import { eventsForSession, eventLabel, logEvent } from "@/lib/playerEvents";
import { anotherExplanation } from "@/lib/recommendations";
import { addSaved, isSaved, removeSaved, updateProgress } from "@/lib/savedResources";
import { cn } from "@/lib/utils";
import type { PlayerEvent, TranscriptSegment } from "@/lib/types";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  Bookmark,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Clock,
  FlaskConical,
  MessageCircleQuestion,
  MicOff,
  PencilLine,
  RotateCcw,
  Send,
  SkipForward,
  StickyNote,
  X,
} from "lucide-react";
import { Link, useLocation, useRoute } from "wouter";

const NOTES_KEY = "cognify.session-notes.v1";

const SPEEDS = [0.75, 1, 1.25, 1.5, 2];
const TICK_MS = 1000;

interface Note {
  sec: number;
  text: string;
  at: string;
}

function loadNotes(resourceId: string): Note[] {
  try {
    const all = JSON.parse(localStorage.getItem(NOTES_KEY) ?? "{}");
    return all[resourceId] ?? [];
  } catch {
    return [];
  }
}
function saveNotes(resourceId: string, notes: Note[]) {
  try {
    const all = JSON.parse(localStorage.getItem(NOTES_KEY) ?? "{}");
    all[resourceId] = notes;
    localStorage.setItem(NOTES_KEY, JSON.stringify(all));
  } catch {
    /* ignore */
  }
}

export default function Player() {
  const [match, params] = useRoute("/player/:resourceId");
  const resourceId = match ? params.resourceId : "";
  const [, navigate] = useLocation();
  const query = useMemo(() => new URLSearchParams(window.location.search), []);
  const sessionId = query.get("sessionId") ?? "sess-unknown";
  const topicId = query.get("topic") ?? "";
  const resolved = findTopicByIdOrAlias(topicId);
  const resolvedSubjectContext = topicBreadcrumb(topicId);
  const discovery = discoverResources(topicId);
  const resource = discovery?.resources.find((r) => r.id === resourceId) ?? null;
  const rawTranscript = getTranscript(resourceId);

  const totalSec = useMemo(
    () =>
      Math.max(
        (resource?.durationMinutes ?? 20) * 60,
        rawTranscript.length > 0
          ? rawTranscript[rawTranscript.length - 1].endSec
          : (resource?.durationMinutes ?? 20) * 60
      ),
    [resource, rawTranscript]
  );

  const [elapsed, setElapsed] = useState(() => {
    // Resume from the last persisted position for this resource, if any
    try {
      const stored = JSON.parse(localStorage.getItem("cognify.progress.v1") ?? "{}")[resourceId];
      if (stored?.lastAtSec) return Math.round(stored.lastAtSec);
    } catch {
      /* ignore */
    }
    return 0;
  });
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [, forceRender] = useState(0);
  const [segments, setSegments] = useState<TranscriptSegment[]>(rawTranscript);
  const [confusing, setConfusing] = useState<Record<number, string>>({});
  const [tab, setTab] = useState<"transcript" | "notes" | "replay" | "related" | "ask">("transcript");
  const [events, setEvents] = useState<PlayerEvent[]>(() => eventsForSession(sessionId));
  const [messages, setMessages] = useState<{ role: "user" | "cognify"; text: string }[]>([
    { role: "cognify", text: "Observing your session. Playback events are being logged — ask me about the recommendation, your DNA, timing, confusing marks, or what to do next." },
  ]);
  const [noteDraft, setNoteDraft] = useState("");
  const [askDraft, setAskDraft] = useState("");

  const playingRef = useRef(playing);
  const speedRef = useRef(speed);
  const elapsedRef = useRef(elapsed);
  playingRef.current = playing;
  speedRef.current = speed;
  elapsedRef.current = elapsed;

  /* ---------- simulated playback tick ---------- */
  useEffect(() => {
    if (!playing) return;
    const t = setInterval(() => {
      setElapsed((e) => {
        const next = e + speedRef.current;
        if (next >= totalSec) {
          clearInterval(t);
          logEvent({ type: "COMPLETE", atSec: e, sessionId, resourceId });
          setEvents((ev) => [...ev, { type: "COMPLETE", atSec: e, sessionId, resourceId }]);
          setPlaying(false);
          return totalSec;
        }
        return next;
      });
    }, TICK_MS);
    return () => clearInterval(t);
  }, [playing, totalSec, sessionId, resourceId]);

  /* ---------- progress persistence (continue-learning ledger) ---------- */
  useEffect(() => {
    if (elapsed <= 0) return;
    updateProgress(resourceId, { fraction: Math.min(1, elapsed / totalSec), lastAtSec: elapsed });
  }, [elapsed, resourceId, totalSec]);

  const emit = (type: PlayerEvent["type"], payload?: PlayerEvent["payload"]) => {
    const evt = { type, atSec: elapsedRef.current, sessionId, resourceId, payload };
    logEvent(evt);
    setEvents((ev) => [...ev, evt]);
  };

  const markConfusing = () => {
    const seg = currentSegment();
    if (!seg) return;
    setConfusing((c) => ({ ...c, [seg.startSec]: c[seg.startSec] ?? "Confusing point" }));
    setSegments((s) =>
      s.map((x) => (x.startSec === seg.startSec ? { ...x, confusing: true } : x))
    );
    emit("PAUSE");
    setPlaying(false);
  };

  const seek = (sec: number) => {
    setElapsed(Math.min(totalSec, Math.max(0, sec)));
    emit("SKIP", { seconds: Math.round(sec) });
  };

  const rewind = () => {
    setElapsed((e) => Math.max(0, e - 10));
    emit("REWIND", { seconds: 10 });
  };
  const forward = () => {
    setElapsed((e) => Math.min(totalSec, e + 10));
    emit("FAST_FORWARD", { seconds: 10 });
  };
  const toggle = () => {
    if (playing) {
      setPlaying(false);
      emit("PAUSE");
    } else {
      setPlaying(true);
      emit("PLAY");
    }
  };
  const changeSpeed = (s: number) => {
    setSpeed(s);
    emit("SPEED_CHANGE", { speed: s });
  };

  const currentSegment = (): TranscriptSegment | null => {
    return segments.find((s) => elapsed >= s.startSec && elapsed < s.endSec) ?? null;
  };

  const ask = (text: string) => {
    if (!resource) return;
    const userMsg = { role: "user" as const, text };
    const reply = answer(
      {
        resource,
        elapsedSec: elapsedRef.current,
        totalSec,
        speed: speedRef.current,
        confusingCount: Object.keys(confusing).length,
        transcriptText: segments.map((s) => s.text).join(" "),
      },
      text
    );
    setMessages((m) => [...m, userMsg, { role: "cognify", text: reply }]);
  };

  const progress = Math.min(100, Math.round((elapsed / totalSec) * 100));
  const notes = loadNotes(resourceId);
  const confusingMarks = Object.entries(confusing);

  if (!resource || !resolved) {
    return (
      <AppShell>
        <div className="border-b border-ink/10 px-5 py-6 sm:px-8 lg:px-10">
          <Marginalia>Lecture Player</Marginalia>
          <h1 className="mt-2 text-2xl font-bold text-ink">Session not found</h1>
          <Link href="/curriculum" className="mt-3 inline-block font-mono text-[14px] uppercase tracking-[0.1em] text-teal">
            ← Back to curriculum
          </Link>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      {/* Top bar */}
      <header className="flex flex-wrap items-center gap-3 border-b border-ink/10 px-5 py-4 sm:px-8 lg:px-10">
        <button
          onClick={() => navigate(`/session/${resourceId}?topic=${topicId}`)}
          className="flex items-center gap-1.5 border border-ink/15 bg-card px-3 py-1.5 font-mono text-[14px] uppercase tracking-[0.1em] text-ink/70 transition-colors hover:border-teal hover:text-teal"
        >
          <ChevronLeft className="h-3.5 w-3.5" /> Exit session
        </button>
        <div className="min-w-0 flex-1">
          <div className="truncate font-serif text-[15px] font-bold text-ink">{resource.title}</div>
          <div className="font-mono text-[12px] uppercase tracking-wider text-muted-foreground">
            {resolved.subject.name} · Chapter {String(resolved.chapter.index).padStart(2, "0")} {resolved.chapter.title} · {resource.sourceLabel}
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-4">
          <div className="hidden text-right sm:block">
            <div className="font-mono text-[9px] uppercase tracking-[0.08em] text-muted-foreground">Session</div>
            <div className="font-mono text-[14px] font-medium text-ink">{sessionId.slice(0, 24)}</div>
          </div>
          <div className="hidden items-center gap-3 sm:flex">
            <button
              onClick={() => {
                if (isSaved(resourceId)) {
                  removeSaved(resourceId);
                } else {
                  addSaved(resource);
                }
                forceRender((v) => v + 1);
              }}
              className={cn(
                "flex items-center gap-1.5 border px-2.5 py-1.5 font-mono text-[9px] font-bold uppercase tracking-[0.1em] transition-colors active:scale-[0.97]",
                isSaved(resourceId)
                  ? "border-amber bg-amber/10 text-amber-dark"
                  : "border-ink/20 text-ink/55 hover:border-teal hover:text-teal"
              )}
              title="Add to My Saved Resources"
            >
              <Bookmark className={cn("h-3 w-3", isSaved(resourceId) && "fill-current")} />
              {isSaved(resourceId) ? "Saved" : "Save"}
            </button>
            <div className="border border-amber/40 bg-amber/5 px-2.5 py-1 font-mono text-[9px] font-bold uppercase tracking-[0.1em] text-amber-dark">
              Analytics ON · {events.length} events
            </div>
          </div>
        </div>
      </header>

      <div className="flex flex-col gap-0 px-5 py-6 sm:px-8 lg:flex-row lg:gap-8 lg:px-10">
        {/* ===================== Left: video stage ===================== */}
        <section className="min-w-0 flex-1">
          {/* Stage */}
          <div className="border border-ink bg-ink text-ivory">
            <div className="relative flex aspect-video flex-col items-center justify-center gap-4 bg-gradient-to-b from-ink via-[#14314e] to-ink p-8">
              <div className="font-mono text-[12px] uppercase tracking-[0.22em] text-teal">
                {resource.format} · {resource.sourceLabel}
              </div>
              <div className="max-w-xl text-center font-display text-[20px] font-bold leading-snug sm:text-2xl">
                {resource.title}
              </div>
              <div className="font-mono text-[14px] text-ivory/60">
                {resolved.topic.title} — {resolvedSubjectContext ? `${resolvedSubjectContext.board} · ${resolvedSubjectContext.className}` : "CBSE · Class 10"}
              </div>
              {!playing && elapsed < totalSec && (
                <button
                  onClick={() => {
                    setPlaying(true);
                    emit("PLAY");
                  }}
                  className="mt-2 border border-teal bg-teal px-6 py-2.5 font-mono text-[14px] uppercase tracking-[0.08em] text-white transition-all duration-150 hover:bg-teal-dark active:scale-[0.97]"
                >
                  {elapsed > 0 ? "Resume" : "Play"}
                </button>
              )}
              {progress >= 100 && (
                <div className="mt-2 flex items-center gap-2 border border-teal px-4 py-2 font-mono text-[14px] uppercase tracking-[0.08em] text-teal">
                  <CheckCircle2 className="h-4 w-4" /> Session complete — mastery evidence queued
                </div>
              )}
            </div>

            {/* Scrubber + controls */}
            <div className="border-t border-ivory/10 px-5 py-4">
              <div className="flex items-center justify-between font-mono text-[12px] uppercase tracking-wider text-ivory/55">
                <span>{formatTime(elapsed)}</span>
                <div className="flex items-center gap-2">
                  <span className={cn("h-1.5 w-1.5 rounded-full", playing ? "bg-teal" : "bg-ivory/30")} />
                  <span>{playing ? `Playing @ ${speed}x` : "Paused"}</span>
                </div>
                <span>{formatTime(totalSec)}</span>
              </div>
              <input
                type="range"
                min={0}
                max={totalSec}
                step={1}
                value={Math.round(elapsed)}
                onChange={(e) => seek(Number(e.target.value))}
                className="mt-2 h-1 w-full cursor-pointer accent-teal"
              />
              <div className="mt-3 flex flex-wrap items-center gap-1.5">
                <button onClick={rewind} className="ctrl-btn" title="Rewind 10s">
                  <RotateCcw className="h-4 w-4" />
                </button>
                <button onClick={toggle} className="ctrl-btn ctrl-btn-primary">
                  {playing ? <MicOff className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                </button>
                <button onClick={forward} className="ctrl-btn" title="Forward 10s">
                  <SkipForward className="h-4 w-4" />
                </button>
                <span className="mx-1 h-5 w-px bg-ivory/15" />
                {SPEEDS.map((s) => (
                  <button
                    key={s}
                    onClick={() => changeSpeed(s)}
                    className={cn(
                      "border px-2 py-1 font-mono text-[12px] transition-colors",
                      speed === s
                        ? "border-teal bg-teal text-white"
                        : "border-ivory/20 text-ivory/70 hover:border-ivory/40"
                    )}
                  >
                    {s}x
                  </button>
                ))}
                <span className="mx-1 hidden h-5 w-px bg-ivory/15 sm:block" />
                <button
                  onClick={markConfusing}
                  disabled={progress >= 100}
                  className="border border-amber bg-amber px-3 py-1.5 font-mono text-[12px] font-bold uppercase tracking-[0.1em] text-ink transition-all duration-150 hover:bg-amber-dark hover:text-white disabled:opacity-40 active:scale-[0.97]"
                >
                  Mark confusing
                </button>
                {elapsed < totalSec && progress < 100 && (
                  <button
                    onClick={() => {
                      emit("DROP_OFF");
                      navigate(`/session/${resourceId}?topic=${topicId}`);
                    }}
                    className="ml-auto border border-ivory/20 px-3 py-1.5 font-mono text-[12px] uppercase tracking-[0.1em] text-ivory/60 transition-colors hover:border-ivory/40 hover:text-ivory"
                  >
                    End session early
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Another explanation — surfaces when the first pass resists */}
          {anotherExplanation(topicId, resourceId).length > 0 && (
            <div className="mt-6 border border-teal/30 bg-teal/5 px-4 py-3">
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-2">
                  <FlaskConical className="h-4 w-4 text-teal" />
                  <span className="font-mono text-[12px] font-bold uppercase tracking-[0.08em] text-teal-dark">
                    Another explanation available
                  </span>
                </div>
                <p className="w-full text-[12.5px] leading-relaxed text-dark-text/75 sm:w-auto">
                  If this pass does not hold, Cognify keeps a differently-framed alternative
                  ready — same topic, different format.
                </p>
                <Link
                  href={`/resources/${topicId}`}
                  className="ml-auto h-8 whitespace-nowrap border border-teal bg-teal px-3 font-mono text-[10.5px] uppercase tracking-[0.1em] text-white transition-all hover:bg-teal-dark active:scale-[0.97]"
                >
                  View alternatives →
                </Link>
              </div>
            </div>
          )}

          {/* Objective strip + next activity */}
          <div className="mt-6 grid gap-px border border-ink/10 bg-ink/10 sm:grid-cols-2">
            <div className="bg-card p-5">
              <div className="marginalia [&::before]:hidden">Current objective</div>
              <p className="mt-2 text-[14px] leading-relaxed text-dark-text/80">
                {resolved.topic.objectives[0]?.text ?? `Master: ${resolved.topic.title}`}
              </p>
            </div>
            <div className="bg-card p-5">
              <div className="marginalia amber [&::before]:hidden">Next activity</div>
              <p className="mt-2 text-[14px] leading-relaxed text-dark-text/80">
                {progress >= 100
                  ? "Great job! Now, try some practice problems to see how well you've learned this."
                  : "Practice problems will be available once you finish this video."}
              </p>
            </div>
          </div>

          {/* Event ledger */}
          <div className="mt-6">
            <div className="flex items-center justify-between">
              <Marginalia className="[&::before]:hidden">Session Activity</Marginalia>
              <span className="font-mono text-[12px] text-muted-foreground">
                Tracking your learning journey
              </span>
            </div>
            <Hairline className="mt-3" />
            <div className="mt-2 max-h-40 overflow-y-auto divide-y divide-ink/6 border border-ink/10 bg-card">
              {events.length === 0 ? (
                <p className="footnote p-4">Start watching to see your activity log here.</p>
              ) : (
                [...events]
                  .reverse()
                  .slice(0, 15)
                  .map((e, i) => (
                    <div key={i} className="flex items-center gap-3 px-4 py-2">
                      <span className="w-14 shrink-0 font-mono text-[12px] text-muted-foreground">
                        {formatTime(e.atSec)}
                      </span>
                      <span className="font-mono text-[12px] uppercase tracking-wider text-ink/70">
                        {e.type === 'PLAY' ? 'Started' : e.type === 'PAUSE' ? 'Paused' : e.type === 'COMPLETE' ? 'Finished' : e.type}
                      </span>
                      <span className="text-[12px] text-dark-text/70">{eventLabel(e)}</span>
                    </div>
                  ))
              )}
            </div>
          </div>
        </section>

        {/* ===================== Right: ledger tabs ===================== */}
        <aside className="mt-8 w-full shrink-0 lg:mt-0 lg:w-[380px]">
          <div className="border border-ink bg-ink">
            <div className="flex border-b border-ivory/15">
              {(
                [
                  ["transcript", "Transcript", MessageCircleQuestion],
                  ["notes", "Notes", PencilLine],
                  ["replay", "Replay", RotateCcw],
                  ["related", "Related", Clock],
                  ["ask", "Ask Cognify", MessageCircleQuestion],
                ] as const
              ).map(([key, label, Icon]) => (
                <button
                  key={key}
                  onClick={() => setTab(key)}
                  className={cn(
                    "flex flex-1 flex-col items-center gap-1 px-1 py-2.5 font-mono text-[9px] uppercase tracking-[0.08em] transition-colors",
                    tab === key ? "border-b-2 border-teal bg-white/[0.06] text-white" : "text-ivory/45 hover:text-ivory/75"
                  )}
                >
                  <Icon className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">{label}</span>
                </button>
              ))}
            </div>

            <div className="max-h-[560px] overflow-y-auto bg-card">
              {/* ---------- Transcript ---------- */}
              {tab === "transcript" && (
                <div className="divide-y divide-ink/8">
                  {segments.length === 0 ? (
                    <p className="footnote p-5">
                      Transcript will be provided with the resource file. While playing, note
                      confusing points — they become your replay list.
                    </p>
                  ) : (
                    segments.map((s) => {
                      const active = elapsed >= s.startSec && elapsed < s.endSec;
                      const marked = !!confusing[s.startSec];
                      return (
                        <button
                          key={s.startSec}
                          onClick={() => {
                            seek(s.startSec);
                            setPlaying(true);
                            emit("PLAY");
                          }}
                          className={cn(
                            "w-full px-4 py-3 text-left transition-colors",
                            active ? "bg-teal/8" : "hover:bg-ivory-deep/70"
                          )}
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-mono text-[12px] text-muted-foreground">
                              {formatTime(s.startSec)}–{formatTime(s.endSec)}
                            </span>
                            {marked && (
                              <span className="border border-amber/50 bg-amber/8 px-1.5 py-0.5 font-mono text-[8px] uppercase tracking-wider text-amber-dark">
                                Confusing
                              </span>
                            )}
                          </div>
                          <p className={cn("mt-1 font-serif text-[14px] leading-relaxed", active ? "font-bold text-ink" : "text-dark-text/80")}>
                            {s.text}
                          </p>
                        </button>
                      );
                    })
                  )}
                </div>
              )}

              {/* ---------- Notes ---------- */}
              {tab === "notes" && (
                <div className="p-4">
                  <p className="footnote">
                    Notes are saved with timestamps so you can easily jump back to the right moment.
                  </p>
                  <div className="mt-3">
                    <textarea
                      value={noteDraft}
                      onChange={(e) => setNoteDraft(e.target.value)}
                      placeholder="Write in your own words at current position…"
                      className="w-full resize-none border border-ink/15 bg-ivory-deep/50 p-3 font-serif text-[14px] leading-relaxed outline-none focus:border-teal"
                      rows={4}
                    />
                    <button
                      onClick={() => {
                        if (!noteDraft.trim()) return;
                        const note: Note = {
                          sec: elapsedRef.current,
                          text: noteDraft.trim(),
                          at: new Date().toISOString(),
                        };
                        const next = [note, ...notes];
                        saveNotes(resourceId, next);
                        setNoteDraft("");
                        setMessages((m) => m); // re-render
                      }}
                      className="mt-2 h-9 border border-ink bg-ink px-4 font-mono text-[10.5px] uppercase tracking-[0.12em] text-ivory transition-all duration-150 hover:bg-teal hover:border-teal active:scale-[0.97]"
                    >
                      Save note
                    </button>
                  </div>
                  <div className="mt-4 space-y-2">
                    {notes.length === 0 && (
                      <p className="footnote">No notes yet. The act of re-phrasing is retrieval practice itself.</p>
                    )}
                    {notes.map((n, i) => (
                      <div key={i} className="border-l-2 border-teal/40 bg-ivory-deep/40 p-3">
                        <div className="flex items-center justify-between">
                          <span className="font-mono text-[12px] text-muted-foreground">{formatTime(n.sec)}</span>
                          <span className="font-mono text-[9px] uppercase tracking-wider text-muted-foreground">
                            {new Date(n.at).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}
                          </span>
                        </div>
                        <p className="mt-1 font-serif text-[14px] leading-relaxed text-ink">{n.text}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ---------- Replay ---------- */}
              {tab === "replay" && (
                <div className="p-4">
                  {confusingMarks.length === 0 ? (
                    <p className="footnote">
                    No confusing points marked yet. Click "Mark confusing" during the video to save points you want to review.
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {confusingMarks.map(([sec, note]) => {
                        const seg = segments.find((s) => s.startSec === Number(sec));
                        return (
                          <div key={sec} className="border border-amber/30 bg-amber/5 p-3">
                            <div className="flex items-center justify-between">
                              <span className="font-mono text-[12px] font-bold uppercase tracking-wider text-amber-dark">
                                {formatTime(Number(sec))}–{seg ? formatTime(seg.endSec) : ""}
                              </span>
                              <button
                                onClick={() => {
                                  seek(Number(sec));
                                  setPlaying(true);
                                  emit("PLAY");
                                }}
                                className="h-7 border border-teal bg-teal px-2.5 font-mono text-[9px] uppercase tracking-[0.1em] text-white transition-all active:scale-[0.97]"
                              >
                                Replay
                              </button>
                            </div>
                            <p className="mt-1.5 font-serif text-[14px] italic leading-relaxed text-dark-text/80">
                              {note}
                            </p>
                          </div>
                        );
                      })}
                      <p className="footnote">
                        Reviewing these points later is a great way to make sure you've fully understood the topic.
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* ---------- Related resources ---------- */}
              {tab === "related" && (
                <div className="divide-y divide-ink/8">
                  {(discovery?.resources.filter((r) => r.id !== resourceId) ?? []).length === 0 ? (
                    <p className="footnote p-4">No related resources surfaced for this topic yet.</p>
                  ) : (
                    discovery?.resources
                      .filter((r) => r.id !== resourceId)
                      .map((r) => (
                        <Link
                          key={r.id}
                          href={`/session/${r.id}?topic=${topicId}`}
                          onClick={() => {
                            logEvent({
                              type: "SKIP",
                              atSec: elapsedRef.current,
                              sessionId,
                              resourceId,
                              payload: { switchedTo: r.id },
                            });
                          }}
                          className="block p-4 transition-colors hover:bg-ivory-deep/60"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-mono text-[9px] uppercase tracking-wider text-muted-foreground">{r.format}</span>
                            <span className="font-mono text-[12px] text-muted-foreground">{r.durationMinutes} min</span>
                          </div>
                          <div className="mt-1 font-serif text-[13.5px] font-bold leading-snug text-ink">{r.title}</div>
                          <p className="mt-1 text-[12px] leading-relaxed text-dark-text/70">{r.whyRecommended}</p>
                          <span className="mt-2 inline-flex items-center gap-1 font-mono text-[9px] uppercase tracking-[0.1em] text-teal">
                            Open in player <ChevronRight className="h-3 w-3" />
                          </span>
                        </Link>
                      ))
                  )}
                </div>
              )}

              {/* ---------- Ask Cognify ---------- */}
              {tab === "ask" && (
                <div className="flex min-h-[480px] flex-col">
                  <div className="flex-1 space-y-3 p-4">
                    {messages.map((m, i) => (
                      <div
                        key={i}
                        className={cn(
                          "max-w-[92%] rounded-sm border p-3 text-[12.5px] leading-relaxed",
                          m.role === "cognify"
                            ? "border-teal/30 bg-teal/5 text-dark-text/85"
                            : "border-ink/15 bg-ink/5 text-ink"
                        )}
                      >
                        {m.role === "cognify" && (
                          <span className="mb-1 block font-mono text-[9px] font-bold uppercase tracking-[0.08em] text-teal-dark">
                            Cognify
                          </span>
                        )}
                        {m.text}
                      </div>
                    ))}
                  </div>
                  <div className="border-t border-ink/10 p-3">
                    <div className="flex flex-wrap gap-1.5">
                      {quickPicks({
                        resource,
                        elapsedSec: elapsedRef.current,
                        totalSec,
                        speed: speedRef.current,
                        confusingCount: confusingMarks.length,
                        transcriptText: segments.map((s) => s.text).join(" "),
                        confusingMarks: confusingMarks.map(([sec, note]) => ({
                          sec: Number(sec),
                          note,
                        })),
                      }).map((q) => (
                        <button
                          key={q}
                          onClick={() => ask(q)}
                          className="border border-ink/15 bg-ivory-deep/60 px-2 py-1 font-mono text-[10.5px] text-ink/70 transition-colors hover:border-teal/50 hover:text-ink"
                        >
                          {q}
                        </button>
                      ))}
                    </div>
                    <div className="mt-2.5 flex gap-2">
                      <input
                        value={askDraft}
                        onChange={(e) => setAskDraft(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && askDraft.trim()) {
                            ask(askDraft);
                            setAskDraft("");
                          }
                        }}
                        placeholder="Ask about this session…"
                        className="h-9 flex-1 border border-ink/15 bg-ivory-deep/50 px-3 font-mono text-[12px] outline-none focus:border-teal"
                      />
                      <button
                        onClick={() => {
                          if (!askDraft.trim()) return;
                          ask(askDraft);
                          setAskDraft("");
                        }}
                        className="h-9 w-9 shrink-0 border border-ink bg-ink text-ivory transition-all hover:bg-teal hover:border-teal active:scale-[0.95]"
                      >
                        <Send className="h-3.5 w-3.5 mx-auto" />
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* DNA hint */}
          <div className="mt-4 border border-ink/10 bg-card p-4">
            <div className="marginalia [&::before]:hidden">DNA · what Cognify is watching</div>
            <div className="mt-3 space-y-2">
              <div>
                <div className="flex justify-between font-mono text-[12px] uppercase tracking-wider text-muted-foreground">
                  <span>Session completion</span>
                  <span className="text-ink">{progress}%</span>
                </div>
                <MasteryBar value={progress} className="mt-1.5" />
              </div>
              <div className="grid grid-cols-3 gap-2 pt-1">
                <div className="border border-ink/10 p-2 text-center">
                  <div className="font-mono text-[16px] font-medium text-ink">{confusingMarks.length}</div>
                  <div className="font-mono text-[8px] uppercase tracking-wider text-muted-foreground">Confusing</div>
                </div>
                <div className="border border-ink/10 p-2 text-center">
                  <div className="font-mono text-[16px] font-medium text-ink">{speed}x</div>
                  <div className="font-mono text-[8px] uppercase tracking-wider text-muted-foreground">Speed</div>
                </div>
                <div className="border border-ink/10 p-2 text-center">
                  <div className="font-mono text-[16px] font-medium text-ink">{notes.length}</div>
                  <div className="font-mono text-[8px] uppercase tracking-wider text-muted-foreground">Notes</div>
                </div>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </AppShell>
  );
}

function formatTime(sec: number): string {
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${String(s).padStart(2, "0")}`;
}
