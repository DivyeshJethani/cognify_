/**
 * COGNIFY — Continue Learning
 * The workbench of started-but-unfinished passes. Scholar's Atelier: ledger
 * rows with progress bars, marginalia, and an honest observation card.
 * Progress is persisted via the progress store; completing a pass moves the
 * resource off this ledger and logs the session interaction.
 */
import AppShell, { PageHeader } from "@/components/cognify/AppShell";
import { Marginalia } from "@/components/cognify/Primitives";
import { JourneyLink } from "@/components/cognify/JourneyLinks";
import { discoverAll } from "@/lib/resourceDiscovery";
import { continueLearning, markCompleted } from "@/lib/savedResources";
import { logEvent, startSession } from "@/lib/playerEvents";
import { continuationItems, type ContinuationItem } from "@/lib/journeyData";
import type { LearningResource } from "@/lib/types";
import { Check, Clock, PlayCircle } from "lucide-react";
import { useState } from "react";
import { Link, useLocation } from "wouter";
import { toast } from "sonner";

const STATE_META: Record<ContinuationItem["state"], { glyph: string; color: string; label: string }> = {
  continue: { glyph: "▷", color: "#2b9c8c", label: "CONTINUE" },
  resume: { glyph: "⟳", color: "#4c83b5", label: "RESUME" },
  due: { glyph: "◐", color: "#d9912f", label: "REVISE" },
  retry: { glyph: "↺", color: "#132b3b", label: "RETRY" },
  saved: { glyph: "⌖", color: "#2b9c8c", label: "OPEN" },
};

function StateCell({ item }: { item: ContinuationItem }) {
  const meta = STATE_META[item.state];
  return (
    <div
      className="flex h-10 w-10 shrink-0 items-center justify-center border font-serif text-lg font-bold"
      style={{ borderColor: meta.color, color: meta.color }}
      title={meta.label}
    >
      {meta.glyph}
    </div>
  );
}

const DIFFICULTY_COLORS: Record<string, string> = {
  foundational: "#4c83b5",
  core: "#2b9c8c",
  advanced: "#132b3b",
  stretch: "#b8772a",
};

function sourceGlyph(source: LearningResource["source"]): string {
  switch (source) {
    case "youtube":
      return "▶";
    case "ncert":
      return "NC";
    case "cbse":
      return "CB";
    case "edu-website":
      return "W";
    case "cognify-original":
      return "◎";
    default:
      return "?";
  }
}

function fmtElapsed(iso: string): string {
  const ms = Date.now() - new Date(iso).getTime();
  const hr = Math.floor(ms / 3600000);
  if (hr < 24) {
    const min = Math.floor(ms / 60000);
    return min < 60 ? `${min} minute${min === 1 ? "" : "s"} ago` : `${hr} hour${hr === 1 ? "" : "s"} ago`;
  }
  const d = Math.floor(hr / 24);
  return `${d} day${d === 1 ? "" : "s"} ago`;
}

export default function Continue() {
  const [, navigate] = useLocation();
  const [version, setVersion] = useState(0);
  const progress = continueLearning();
  const all = discoverAll();

  const entries = progress
    .map((p) => {
      const r = all.find((res) => res.id === p.resourceId);
      return { p, resource: r ?? null };
    })
    .filter((e) => e.resource !== null)
    .sort((a, b) => (b.p.updatedAt > a.p.updatedAt ? 1 : -1));

  const refresh = () => setVersion((v) => v + 1);

  return (
    <AppShell key={version}>
      <PageHeader
        title="Work in progress"
        subtitle={`${entries.length} started passes awaiting completion — each entry resumes where you stopped, and completing one is logged as a finished session.`}
      />

      <div className="px-5 py-7 sm:px-8 lg:px-10">
        {/* ---------- Five continuation states — one clear action each ---------- */}
        <section className="mb-10">
          <div className="flex items-baseline justify-between">
            <Marginalia amber>Where you left off — five open threads</Marginalia>
          </div>
          <ol className="mt-4 divide-y divide-ink/10 border-y border-ink/10">
            {continuationItems().map((item) => {
              const meta = STATE_META[item.state];
              return (
                <li key={item.id} className="rise-in grid gap-4 py-5 sm:grid-cols-[3.5rem_1fr_auto]">
                  <StateCell item={item} />
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className="border-l-2 px-1.5 py-0.5 font-mono text-[9px] font-medium uppercase tracking-[0.1em]"
                        style={{ borderLeftColor: meta.color, color: meta.color }}
                      >
                        {meta.label}
                      </span>
                      <span className="font-mono text-[9px] uppercase tracking-wider text-ink/50">
                        {item.subtitle}
                      </span>
                    </div>
                    <h3 className="mt-1.5 font-serif text-lg font-bold leading-snug text-ink">{item.title}</h3>
                    <p className="mt-1 footnote">{item.detail}</p>
                  </div>
                  <div className="flex flex-col justify-center">
                    <Link
                      href={item.href}
                      className="shrink-0 border border-ink/25 bg-ivory-deep px-4 py-2 text-center font-mono text-[12px] font-medium uppercase tracking-[0.08em] text-ink transition-all duration-150 hover:border-teal hover:text-teal active:scale-[0.97]"
                    >
                      {item.actionLabel}
                    </Link>
                  </div>
                </li>
              );
            })}
          </ol>
          <JourneyLink href="/library" className="mt-4">
            Find the next topic to open
          </JourneyLink>
        </section>

        {/* ---------- Unfinished session passes (progress-store ledger) ---------- */}
        <section>
          <Marginalia>Started passes awaiting completion</Marginalia>
        {entries.length > 0 ? (
          <ul className="divide-y divide-ink/8 border-y border-ink/10">
            {entries.map(({ p, resource: r }, i) => (
              <li key={p.resourceId}>
                <div className="grid grid-cols-[2.5rem_1fr_auto] items-center gap-4 py-5">
                  <span className="index-num">{String(i + 1).padStart(2, "0")}</span>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className="flex h-5 w-5 items-center justify-center border font-mono text-[8px] font-bold"
                        style={{ borderColor: DIFFICULTY_COLORS[r!.difficulty], color: DIFFICULTY_COLORS[r!.difficulty] }}
                        title={r!.sourceLabel}
                      >
                        {sourceGlyph(r!.source)}
                      </span>
                      <span className="font-mono text-[12px] text-ink/55">{r!.sourceLabel}</span>
                      <span className="font-mono text-[9px] uppercase tracking-[0.1em] text-muted-foreground">
                        {r!.topicTitle}
                      </span>
                      <span className="flex items-center gap-1 font-mono text-[12px] text-muted-foreground">
                        <Clock className="h-3 w-3" /> {r!.durationMinutes} min
                      </span>
                      <span className="font-mono text-[9px] uppercase tracking-[0.1em] text-muted-foreground">
                        {fmtElapsed(p.updatedAt)}
                      </span>
                    </div>
                    <div className="mt-1.5 font-serif text-[16px] font-bold leading-snug text-ink">
                      {r!.title}
                    </div>

                    {/* Progress bar */}
                    <div className="mt-3 flex items-center gap-3">
                      <div className="flex w-56 items-center">
                        <div className="h-2 w-full border border-ink/15 bg-ivory-deep">
                          <div
                            className="h-full bg-teal transition-all duration-300"
                            style={{ width: `${Math.round(p.fraction * 100)}%` }}
                          />
                        </div>
                      </div>
                      <span className="font-mono text-[14px] font-medium text-dark-text/70">
                        {Math.round(p.fraction * 100)}% complete
                      </span>
                      {p.fraction > 0.85 && (
                        <span className="font-mono text-[9px] uppercase tracking-[0.1em] text-teal">
                          near completion
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-2">
                    <button
                      onClick={() => navigate(`/session/${r!.id}?topic=${r!.topicId}`)}
                      className="flex h-9 items-center gap-2 border border-ink bg-ink px-4 font-mono text-[10.5px] uppercase tracking-[0.12em] text-ivory transition-all duration-150 hover:bg-teal hover:border-teal active:scale-[0.97]"
                    >
                      <PlayCircle className="h-3.5 w-3.5" /> Resume
                    </button>
                    <button
                      onClick={() => {
                        markCompleted(p.resourceId);
                        const sess = startSession(p.resourceId);
                        logEvent({
                          type: "COMPLETE",
                          atSec: Math.round(p.lastAtSec ?? 0),
                          sessionId: sess,
                          resourceId: p.resourceId,
                          payload: { markedManually: 1 },
                        });
                        toast("Pass completed — logged as a finished session");
                        refresh();
                      }}
                      className="flex h-8 items-center gap-1.5 border border-ink/25 bg-card px-3 font-mono text-[12px] uppercase tracking-[0.12em] text-ink/60 transition-all duration-150 hover:border-teal hover:text-teal active:scale-[0.97]"
                    >
                      <Check className="h-3 w-3" /> Mark done
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <div className="flex flex-col items-center gap-3 border border-dashed border-ink/20 py-16 text-center">
            <PlayCircle className="h-6 w-6 text-ink/30" />
            <div className="font-serif text-lg font-bold text-ink">Nothing in progress</div>
            <p className="footnote max-w-md">
              Start a learning session from the catalogue or a topic page — unfinished
              passes reappear here so nothing you began is ever lost.
            </p>
            <button
              onClick={() => navigate("/library")}
              className="mt-2 h-9 border border-ink bg-ink px-5 font-mono text-[10.5px] uppercase tracking-[0.12em] text-ivory transition-all duration-150 hover:bg-teal hover:border-teal active:scale-[0.97]"
            >
              Open the catalogue
            </button>
          </div>
        )}
        </section>

        <aside className="mt-8 grid gap-6 md:grid-cols-2">
          <div className="border border-ink/10 bg-card p-5">
            <Marginalia>What Cognify watched while you were away</Marginalia>
            <ul className="mt-3 space-y-1.5 font-mono text-[12px] uppercase tracking-[0.06em] text-ink/60">
              <li>· watched fraction of each started lecture</li>
              <li>· retrieval attempts left unfinished</li>
              <li>· revision intervals on the spaced schedule</li>
              <li>· practice accuracy on your last set</li>
              <li>· resources you bookmarked manually</li>
            </ul>
          </div>
          <div className="border border-ink bg-ink p-5 text-ivory">
            <div className="font-mono text-[9px] uppercase tracking-[0.08em] text-teal">Observation</div>
            <p className="mt-2 font-serif text-[15px] leading-relaxed">
              The most instructive move after a pause is the return. One resumed pass beats
              three abandoned beginnings.
            </p>
            <JourneyLink href="/adaptive" className="mt-3 text-white/60 hover:text-teal">
              See how this shapes your plan
            </JourneyLink>
          </div>
        </aside>
      </div>
    </AppShell>
  );
}
