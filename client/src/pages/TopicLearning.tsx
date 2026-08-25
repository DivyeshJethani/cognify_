/**
 * COGNIFY — Topic Learning page (/topic/:topicId)
 * The full dossier for one topic: what it is, how strong the student is,
 * what to learn first, another explanation if the first pass fails, and the
 * DNA note. Scholar's Atelier — marginalia, ledger, hairlines, observation.
 */
import AppShell, { PageHeader } from "@/components/cognify/AppShell";
import {
  ActionChip,
  Hairline,
  Marginalia,
  MasteryBar,
} from "@/components/cognify/Primitives";
import { anotherExplanation, buildRails } from "@/lib/recommendations";
import { discoverResources } from "@/lib/resourceDiscovery";
import { findTopicByIdOrAlias, topicAlias } from "@/lib/curriculum";
import { buildTopicSequence, type StageKey } from "@/lib/topicSequence";
import type { LearningResource } from "@/lib/types";
import { BookOpen, ChevronDown, Clock, FlaskConical, Lightbulb, ListChecks, SearchX, Sparkles, Video } from "lucide-react";
import { useLocation, useRoute } from "wouter";
import { useEffect, useMemo, useState } from "react";
import { cn } from "@/lib/utils";

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

const STAGE_GLYPH: Record<StageKey, React.ReactNode> = {
  concept: <ListChecks className="h-3.5 w-3.5" />,
  visual: <BookOpen className="h-3.5 w-3.5" />,
  "worked-example": <Sparkles className="h-3.5 w-3.5" />,
  video: <Video className="h-3.5 w-3.5" />,
  retrieval: <ListChecks className="h-3.5 w-3.5" />,
  practice: <FlaskConical className="h-3.5 w-3.5" />,
  "teach-back": <Sparkles className="h-3.5 w-3.5" />,
};

function stageDoneKey(topicId: string, key: StageKey): string {
  return `cognify.stage-done.v1::${topicId}::${key}`;
}

export default function TopicLearning() {
  const [match, params] = useRoute("/topic/:topicId");
  const topicId = match ? params.topicId : "";
  const [, navigate] = useLocation();
  const resolved = findTopicByIdOrAlias(topicId);
  const sequence = useMemo(() => buildTopicSequence(topicId), [topicId]);
  const [done, setDone] = useState<Record<string, boolean>>(() => {
    if (!sequence) return {};
    const acc: Record<string, boolean> = {};
    sequence.stages.forEach((s) => {
      acc[s.key] = typeof localStorage !== "undefined" && localStorage.getItem(stageDoneKey(topicId, s.key)) === "1";
    });
    return acc;
  });
  const [expandedStage, setExpandedStage] = useState<StageKey | null>(null);

  useEffect(() => {
    // refresh done-state when the topic changes
    if (sequence) {
      const acc: Record<string, boolean> = {};
      sequence.stages.forEach((s) => {
        acc[s.key] = typeof localStorage !== "undefined" && localStorage.getItem(stageDoneKey(topicId, s.key)) === "1";
      });
      setDone(acc);
    }
  }, [topicId, sequence]);

  const toggleStageDone = (key: StageKey) => {
    setDone((d) => {
      const next = { ...d, [key]: !d[key] };
      localStorage.setItem(stageDoneKey(topicId, key), next[key] ? "1" : "0");
      return next;
    });
  };
  const doneCount = Object.values(done).filter(Boolean).length;

  if (!resolved) {
    return (
      <AppShell>
        <PageHeader
          title="Topic not found"
          subtitle="Select a topic from the Curriculum Explorer to open its dossier."
        />
      </AppShell>
    );
  }

  const { subject, chapter, topic } = resolved;
  const discovery = discoverResources(topicId);
  const resources = discovery?.resources ?? [];
  const alts = anotherExplanation(topicId);
  const rails = buildRails();
  const dnaRail = rails.find((r) => r.id === "recommended")?.items ?? [];

  const firstRecommended = resources[0];
  const topicSlug = topicAlias(topicId) ?? topicId;
  const dnaItems = dnaRail.filter((d) => d.resource?.topicId === topicId).slice(0, 2);

  return (
    <AppShell>
      <PageHeader
        title={topic.title}
        subtitle={`${subject.name} · ${chapter.title} · about ${topic.estimatedMinutes} minutes to master this topic`}
        actions={
          <button
            onClick={() => navigate("/curriculum")}
            className="border border-ink/15 bg-card px-3 py-1.5 font-mono text-[14px] uppercase tracking-[0.1em] text-ink/70 transition-colors hover:border-teal hover:text-teal"
          >
            ← Curriculum Explorer
          </button>
        }
      />

      <div className="flex flex-col gap-8 px-5 py-7 sm:px-8 lg:flex-row lg:px-10">
        {/* Main ledger */}
        <section className="min-w-0 flex-1">
          {/* Five doors: what do you want to do with this topic */}
          {firstRecommended && (
            <div className="rise-in grid grid-cols-2 gap-2.5 sm:grid-cols-4">
              <button
                onClick={() => navigate(`/session/${firstRecommended.id}?topic=${topicId}`)}
                className="flex flex-col items-start gap-1 border border-teal/40 bg-teal/[0.04] px-4 py-3.5 text-left transition-colors hover:border-teal"
              >
                <Video className="h-4 w-4 text-teal" />
                <span className="font-display text-[14px] font-bold text-ink">Watch</span>
                <span className="font-mono text-[10px] uppercase tracking-wider text-ink/45">Start the lecture</span>
              </button>
              <button
                onClick={() => navigate(`/session/${firstRecommended.id}?topic=${topicId}`)}
                className="flex flex-col items-start gap-1 border border-ink/12 bg-card px-4 py-3.5 text-left transition-colors hover:border-teal"
              >
                <BookOpen className="h-4 w-4 text-teal" />
                <span className="font-display text-[14px] font-bold text-ink">Read</span>
                <span className="font-mono text-[10px] uppercase tracking-wider text-ink/45">Notes & transcript</span>
              </button>
              <button
                onClick={() => navigate(`/practice?topic=${topicSlug}`)}
                className="flex flex-col items-start gap-1 border border-ink/12 bg-card px-4 py-3.5 text-left transition-colors hover:border-teal"
              >
                <FlaskConical className="h-4 w-4 text-teal" />
                <span className="font-display text-[14px] font-bold text-ink">Quick test</span>
                <span className="font-mono text-[10px] uppercase tracking-wider text-ink/45">5 questions</span>
              </button>
              <button
                onClick={() => navigate(`/teach?topic=${topicSlug}`)}
                className="flex flex-col items-start gap-1 border border-ink/12 bg-card px-4 py-3.5 text-left transition-colors hover:border-teal"
              >
                <Lightbulb className="h-4 w-4 text-teal" />
                <span className="font-display text-[14px] font-bold text-ink">Teach Back</span>
                <span className="font-mono text-[10px] uppercase tracking-wider text-ink/45">Explain in your words</span>
              </button>
            </div>
          )}
          {/* Dossier summary */}
          <div className="border border-ink/10 bg-card p-5">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="min-w-0 flex-1">
                <div className="marginalia [&::before]:hidden">Where you stand</div>
                <p className="mt-3 text-[14px] leading-relaxed text-dark-text/75">
                  {topic.mastery < 50
                    ? "This idea needs building from the ground up — start with the first pick below and work through the stages."
                    : topic.mastery < 85
                      ? "You have the basics — the resources below target the specific gaps."
                      : "Nearly there — short revision and practice will close it."}
                </p>
              </div>
              <div className="w-full shrink-0 sm:w-56">
	                <div className="font-mono text-[9px] uppercase tracking-[0.08em] text-muted-foreground">
	                  Understanding — {topic.mastery}%
	                </div>
	                <MasteryBar value={topic.mastery} className="mt-2" />
                <div className="mt-3 grid grid-cols-2 gap-px bg-ink/10">
                  <div className="bg-ivory p-2.5">
                    <div className="font-mono text-[9px] uppercase tracking-[0.08em] text-muted-foreground">Est. time</div>
                    <div className="mt-0.5 font-mono text-sm font-medium text-ink">{topic.estimatedMinutes} min</div>
                  </div>
                  <div className="bg-ivory p-2.5">
                    <div className="font-mono text-[9px] uppercase tracking-[0.08em] text-muted-foreground">Status</div>
	                    <div className="mt-0.5 font-mono text-sm font-medium text-ink">{topic.mastery < 50 ? "Learning" : topic.mastery < 85 ? "Improving" : "Strong"}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Day 5 — the learning arc: seven stages from concept to teach-back */}
          {sequence && (
            <div className="mt-7">
              <div className="flex flex-wrap items-baseline justify-between gap-3">
                <div className="marginalia">The learning arc — {sequence.totalMinutes} minutes from first look to teaching it</div>
                <span className="font-mono text-[10.5px] uppercase tracking-[0.1em] text-ink/60">
                  {doneCount}/{sequence.stages.length} complete
                </span>
              </div>
              <ol className="mt-4 divide-y divide-ink/8 border-y border-ink/10">
                {sequence.stages.map((s) => {
                  const isDone = !!done[s.key];
                  const isExpanded = expandedStage === s.key;
                  const hasResource = !!s.resourceId;
                  return (
                    <li key={s.key}>
                      <button
                        onClick={() => setExpandedStage(isExpanded ? null : s.key)}
                        className="grid w-full grid-cols-[2.5rem_1fr_auto] items-start gap-4 py-4 text-left"
                      >
                        <span className={cn("index-num", isDone && "text-teal")}>{s.numeral}</span>
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="flex items-center gap-1 border border-ink/20 bg-card px-2 py-0.5 font-mono text-[9.5px] uppercase tracking-[0.1em] text-ink/70">
                              {STAGE_GLYPH[s.key]}
                              {s.label}
                            </span>
                            <span className="font-mono text-[12px] uppercase tracking-wider text-muted-foreground">
                              {s.purpose}
                            </span>
                            <span className="flex items-center gap-1 font-mono text-[12px] text-muted-foreground">
                              <Clock className="h-3 w-3" /> {s.timeMinutes} min
                            </span>
                          </div>
                          {(s.body || s.resourceId) && (
                            <p className="mt-1.5 max-w-2xl text-[12.5px] leading-relaxed text-dark-text/70">
                              {s.body ??
                                (hasResource
                                  ? "A focused resource is picked for this stage — expand to begin."
                                  : "Use the resources below to complete this stage.")}
                            </p>
                          )}
                        </div>
                        <div className="flex flex-col items-end gap-1.5">
                          {isDone ? (
                            <span className="font-mono text-[9px] uppercase tracking-[0.1em] text-teal">✓ done</span>
                          ) : (
                            <ChevronDown
                              className={cn("h-4 w-4 text-ink/40 transition-transform", isExpanded && "rotate-180")}
                            />
                          )}
                        </div>
                      </button>
                      {isExpanded && (
                        <div className="ml-8 border-l border-ink/15 pb-4 pl-5">
                          {(s.teachPrompt || s.practiceNote || (s.resourceId && s.body == null)) && (
                            <p className="mb-3 text-[14px] leading-relaxed text-dark-text/75">
                              {s.teachPrompt ?? s.practiceNote ?? "Begin a focused session below and return to mark it complete."}
                            </p>
                          )}
                          {s.teachPoints && (
                            <div className="mb-3">
                              <div className="font-mono text-[9.5px] uppercase tracking-[0.08em] text-muted-foreground">Key points to cover</div>
                              <ol className="mt-2 space-y-1.5">
                                {s.teachPoints.map((p, i) => (
                                  <li key={i} className="flex gap-2 text-[12.5px] leading-relaxed text-dark-text/75">
                                    <span className="font-mono text-[12px] text-teal">{String(i + 1).padStart(2, "0")}</span>
                                    {p}
                                  </li>
                                ))}
                              </ol>
                            </div>
                          )}
                          <div className="flex flex-wrap gap-2">
                            {s.resourceId && s.key !== "retrieval" && s.key !== "teach-back" && (
                              <button
                                onClick={() => navigate(`/session/${s.resourceId}?topic=${topicId}`)}
                                className="border border-ink bg-ink px-4 py-2 font-mono text-[12px] uppercase tracking-[0.12em] text-ivory transition-colors hover:bg-teal hover:border-teal active:scale-[0.97]"
                              >
                                Begin stage session →
                              </button>
                            )}
                            {s.key === "retrieval" && (
                              <button
                                onClick={() => navigate(`/teach`)}
                                className="border border-amber bg-amber px-4 py-2 font-mono text-[12px] uppercase tracking-[0.12em] text-white transition-colors hover:bg-amber-dark active:scale-[0.97]"
                              >
                                Start the retrieval check →
                              </button>
                            )}
                            {s.key === "teach-back" && (
                              <button
                                onClick={() => navigate(`/teach`)}
                                className="border border-teal px-4 py-2 font-mono text-[12px] uppercase tracking-[0.12em] text-teal transition-colors hover:bg-teal hover:text-white active:scale-[0.97]"
                              >
                                Teach Cognify →
                              </button>
                            )}
                            <button
                              onClick={() => toggleStageDone(s.key)}
                              className={cn(
                                "border px-4 py-2 font-mono text-[12px] uppercase tracking-[0.12em] transition-colors active:scale-[0.97]",
                                isDone
                                  ? "border-ink/25 bg-card text-ink/60 hover:border-teal hover:text-teal"
                                  : "border-teal/50 bg-teal/5 text-teal hover:bg-teal/10"
                              )}
                            >
                              {isDone ? "Unmark complete" : "Mark stage complete"}
                            </button>
                          </div>
                          {s.key === "teach-back" && (
                            <p className="footnote mt-3 max-w-xl">
                              Teaching the idea back is the surest way to make it stick — the explanation you write is checked against these key points.
                            </p>
                          )}
                        </div>
                      )}
                      <Hairline className="-mb-1" />
                    </li>
                  );
                })}
              </ol>
            </div>
          )}

          {/* Recommended first pass */}
          {resources.length > 0 && (
            <div className="mt-7">
              <div className="marginalia">Resources — three picks, in order</div>
              <p className="mt-1 max-w-2xl text-[12.5px] leading-relaxed text-ink/60">
                If the first doesn't click, the second explains the same idea differently.
              </p>
              <ul className="mt-3 divide-y divide-ink/8 border-y border-ink/10">
                {resources.slice(0, 3).map((r, i) => (
                  <li key={r.id}>
                    <div className="grid grid-cols-[2.5rem_1fr_auto] items-center gap-4 py-4">
                      <span className="index-num">{String(i + 1).padStart(2, "0")}</span>
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <span
                            className="flex h-5 w-5 items-center justify-center border font-mono text-[8px] font-bold"
                            style={{ borderColor: DIFFICULTY_COLORS[r.difficulty], color: DIFFICULTY_COLORS[r.difficulty] }}
                            title={r.sourceLabel}
                          >
                            {sourceGlyph(r.source)}
                          </span>
                          <span className="font-mono text-[12px] text-ink/55">{r.sourceLabel}</span>
                          <ActionChip action={r.format === "practice" ? "practice" : r.format === "revision" ? "revise" : "learn"} />
                          <span
                            className="border px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-wider"
                            style={{ borderColor: DIFFICULTY_COLORS[r.difficulty], color: DIFFICULTY_COLORS[r.difficulty] }}
                          >
                            {r.difficulty}
                          </span>
                          <span className="flex items-center gap-1 font-mono text-[12px] text-muted-foreground">
                            <Clock className="h-3 w-3" /> {r.durationMinutes} min
                          </span>
                          {i === 0 && (
                            <span className="flex items-center gap-1 border border-amber/40 bg-amber/5 px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-[0.1em] text-amber-dark">
                              <Sparkles className="h-3 w-3" /> best first pick
                            </span>
                          )}
                        </div>
                        <div className="mt-1.5 font-serif text-[15px] font-bold leading-snug text-ink">
                          {r.title}
                        </div>
                        <p className="mt-1.5 max-w-2xl text-[12.5px] leading-relaxed text-dark-text/70">
                          <span className="font-mono text-[9.5px] font-bold uppercase tracking-[0.1em] text-teal-dark">
                            Why —{" "}
                          </span>
                          {r.whyRecommended}
                        </p>
                      </div>
                      <button
                        onClick={() => navigate(`/session/${r.id}?topic=${topicId}`)}
                        className="h-9 whitespace-nowrap border border-ink bg-ink px-4 font-mono text-[10.5px] uppercase tracking-[0.12em] text-ivory transition-all duration-150 hover:bg-teal hover:border-teal active:scale-[0.97]"
                      >
                        {i === 0 ? "Begin here" : "Begin session"}
                      </button>
                    </div>
                    <Hairline className="-mb-1" />
                  </li>
                ))}
              </ul>
              {resources.length > 3 && (
                <button
                  onClick={() => navigate(`/resources/${topicId}`)}
                  className="mt-3 h-9 border border-ink/25 bg-card px-4 font-mono text-[10.5px] uppercase tracking-[0.12em] text-ink/70 transition-all duration-150 hover:border-teal hover:text-teal active:scale-[0.97]"
                >
                  Browse all {resources.length} resources →
                </button>
              )}
            </div>
          )}

          {/* Another explanation — appears after the first pass fails to stick */}
          {alts.length > 0 && (
            <div className="mt-8">
              <div className="marginalia">Another explanation</div>
              <p className="mt-2 max-w-2xl text-[13px] leading-relaxed text-dark-text/70">
                If the first pass didn't hold, don't repeat it — meet the idea in a different format instead.
              </p>
              <ul className="mt-3 divide-y divide-ink/8 border-y border-ink/10">
                {alts.map((a, i) => (
                  <li key={a.title + i}>
                    <div className="grid grid-cols-[2.5rem_1fr_auto] items-center gap-4 py-3.5">
                      <FlaskConical className="h-4 w-4 shrink-0 text-teal" />
                      <div className="min-w-0">
                        <div className="font-serif text-[15px] font-bold leading-snug text-ink">
                          {a.title}
                        </div>
                        <div className="mt-1 font-mono text-[12px] uppercase tracking-wider text-muted-foreground">
                          {a.context}
                        </div>
                      </div>
                      <button
                        onClick={() => a.resource && navigate(`/session/${a.resource.id}?topic=${topicId}`)}
                        className="h-9 whitespace-nowrap border border-teal/60 bg-transparent px-4 font-mono text-[10.5px] uppercase tracking-[0.12em] text-teal transition-all duration-150 hover:bg-teal hover:text-white active:scale-[0.97]"
                      >
                        Try this one
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {resources.length === 0 && (
            <div className="mt-10 flex flex-col items-center gap-3 border border-dashed border-ink/20 py-14 text-center">
              <SearchX className="h-6 w-6 text-ink/30" />
              <div className="font-serif text-lg font-bold text-ink">No resources indexed yet</div>
              <p className="footnote max-w-md">
                This topic awaits its first resource pass from the discovery pipeline.
              </p>
            </div>
          )}
        </section>

        {/* Margin */}
        <aside className="w-full shrink-0 space-y-6 lg:w-80">
          <div className="border border-ink bg-ink p-5 text-ivory">
            <div className="font-mono text-[9px] uppercase tracking-[0.08em] text-teal">A nudge for you</div>
            <p className="mt-2 font-serif text-[15px] leading-relaxed">
              {dnaItems[0]?.why ??
                topic.mastery < 50
                  ? "Start with a video walkthrough to build your understanding before trying practice problems."
                  : "Short, focused sessions are best for mastering the remaining parts of this topic."}
            </p>
          </div>

          {sequence && (
            <div className="border border-ink/10 bg-card p-5">
              <Marginalia>The arc — live</Marginalia>
              <ol className="mt-3 space-y-2">
                {sequence.stages.map((s) => (
                  <li key={s.key} className="flex items-center gap-2.5">
                    <span className={cn("index-num", !!done[s.key] && "text-teal")}>{s.numeral}</span>
                    <span className={cn("text-[12.5px] uppercase tracking-wider", !!done[s.key] ? "font-mono text-teal line-through decoration-1" : "font-mono text-ink/60")}>
                      {s.label}
                    </span>
                    {!!done[s.key] && <span className="ml-auto font-mono text-[9px] text-teal">✓</span>}
                  </li>
                ))}
              </ol>
              <p className="mt-4 text-[12px] leading-relaxed text-ink/55">
                Each step you complete helps us personalize your learning journey.
              </p>
            </div>
          )}

          <div className="border border-ink/10 bg-card p-5">
            <Marginalia>What you'll get</Marginalia>
            <div className="mt-3 space-y-2">
              {["Personalized learning path", "Points you've marked to review", "Your own study notes", "Topic mastery progress"].map((item, i) => (
                <div key={item} className="flex items-center gap-2 border-b border-dotted border-ink/15 pb-1.5 last:border-0">
                  <Lightbulb className="h-3 w-3 shrink-0 text-teal" />
                  <span className="text-[12.5px] text-dark-text/75">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </AppShell>
  );
}
