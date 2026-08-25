/**
 * COGNIFY — Video Learning Page (session briefing + active learning loop)
 * Style: Scholar's Atelier. The page frames what the student is about to
 * learn (objective, topic mastery, estimated time, learning context), runs
 * the Day 5 loop — WATCH → RETRIEVE → CONFIDENCE → DNA UPDATE → NEXT —
 * and logs every interaction for analytics. Instrument briefing sheet,
 * not a video website.
 */
import AppShell, { PageHeader } from "@/components/cognify/AppShell";
import {
  ActionChip,
  Hairline,
  Marginalia,
  MasteryBar,
} from "@/components/cognify/Primitives";
import {
  discoverResources,
  enrichResourceTopicContext,
  getTranscript,
} from "@/lib/resourceDiscovery";
import { findTopicByIdOrAlias } from "@/lib/curriculum";
import {
  composeDnaUpdate,
  flowStateFor,
  markWatched,
  recordConfidence,
  recordRetrieval,
  resetFlow,
  retrievalQuestionsFor,
  type SessionFlowState,
} from "@/lib/learningSessionFlow";
import { JourneyLink, WhyInteraction } from "@/components/cognify/JourneyLinks";
import { why, whyResource, whyTopic } from "@/lib/whyEngine";
import { Link, useLocation, useRoute } from "wouter";
import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  ChevronLeft,
  Clock,
  Dna,
  FlaskConical,
  SkipForward,
  Target,
  Timer,
  X,
} from "lucide-react";
import { startSession, logEvent } from "@/lib/playerEvents";
import { useEffect, useMemo, useState } from "react";
import { addSaved, isSaved, removeSaved } from "@/lib/savedResources";
import { toast } from "sonner";

export default function Session() {
  const [match, params] = useRoute("/session/:resourceId");
  const [, navigate] = useLocation();
  const resourceId = match ? params.resourceId : "";

  const queryTopic = useMemo(() => {
    if (typeof window === "undefined") return null;
    return new URLSearchParams(window.location.search).get("topic");
  }, []);

  const resolved = queryTopic ? findTopicByIdOrAlias(queryTopic) : null;
  const topicId = resolved?.topic.id ?? "";
  const discovery = discoverResources(topicId, { formats: undefined, difficulty: undefined });
  const raw = discovery?.resources.find((r) => r.id === resourceId) ?? null;
  const resource = raw ? enrichResourceTopicContext(raw) : null;
  const transcript = getTranscript(resourceId ?? "");
  const minutes =
    transcript.length > 0
      ? Math.ceil(transcript[transcript.length - 1].endSec / 60)
      : (resource?.durationMinutes ?? 20);

  const objective = resource?.learningObjective ?? resolved?.topic.objectives[0]?.text ?? null;

  const [flow, setFlow] = useState<SessionFlowState>(() => flowStateFor(resourceId));
  const [retrievalOpen, setRetrievalOpen] = useState(false);
  const [confidenceOpen, setConfidenceOpen] = useState(false);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [saved, setSaved] = useState(() => isSaved(resourceId));

  const questions = useMemo(() => retrievalQuestionsFor(resourceId), [resourceId]);

  useEffect(() => {
    setFlow(flowStateFor(resourceId));
  }, [resourceId]);

  const beginSession = () => {
    const sessionId = startSession(resourceId);
    navigate(`/player/${resourceId}?sessionId=${sessionId}&topic=${topicId}`);
  };

  const handleMarkWatched = () => {
    logEvent({ type: "COMPLETE", atSec: 0, sessionId: "watch-loop", resourceId, payload: { source: "learning-page" } });
    setFlow(markWatched(resourceId));
    toast.success("Progress updated!", {
      description: "You've finished the video. Now, let's see what you remember!",
    });
  };

  const submitRetrieval = () => {
    const answered = questions.length;
    const correct = questions.filter(
      (q, i) => answers[q.id] === q.correctIndex
    ).length;
    const confidence = Math.round(
      (correct / Math.max(1, answered)) * 100 + 5
    );
    setFlow(recordRetrieval(resourceId, { answered, correct, confidence }));
    setRetrievalOpen(false);
    setConfidenceOpen(true);
    toast.success(`You got ${correct}/${answered} correct!`, {
      description:
        correct === answered
          ? "Excellent! You've got a great handle on this."
          : correct >= questions.length / 2
            ? "Good start! A little more practice will help you master it."
            : "This is a tough one. We'll try a different way to explain it next time.",
    });
  };

  const submitConfidence = (rating: number) => {
    setFlow(recordConfidence(resourceId, rating));
    setConfidenceOpen(false);
    toast.success("Progress saved!", {
      description:
        "We've updated your learning path based on today's session. Check your dashboard for what's next.",
    });
  };

  const alternatives = useMemo(
    () => discovery?.resources.filter((r) => r.id !== resourceId) ?? [],
    [discovery, resourceId]
  );
  const weakTopicSuggestion = resolved?.topic.recommendedAction
    ? `${resolved.topic.title} — your DNA flags this topic for ${resolved.topic.recommendedAction}.`
    : null;

  const dnaUpdate = flow.confidenceRating !== null ? composeDnaUpdate(resourceId, resolved?.topic.title ?? "this topic") : null;

  if (!resource || !resolved) {
    return (
      <AppShell>
        <PageHeader
          title="Session not found"
          subtitle="Open this route from Resource Discovery with a valid resource."
        />
      </AppShell>
    );
  }

  return (
    <AppShell>
      <PageHeader
        title={resource.title}
        subtitle={`${resource.subjectLabel ?? resolved.subject.name} · ${resource.chapterTitle ?? resolved.chapter.title} · ${resource.sourceLabel}`}
        actions={
          <button
            onClick={() => navigate(`/resources/${queryTopic ?? ""}`)}
            className="flex items-center gap-1.5 border border-ink/15 bg-card px-3 py-1.5 font-mono text-[14px] uppercase tracking-[0.1em] text-ink/70 transition-colors hover:border-teal hover:text-teal"
          >
            <ChevronLeft className="h-3.5 w-3.5" /> Back to discovery
          </button>
        }
      />

      <div className="flex flex-col gap-8 px-5 py-7 sm:px-8 lg:flex-row lg:px-10">
        {/* Main column */}
        <section className="min-w-0 flex-1">
          {/* Objective */}
          <div className="border border-ink/10 bg-card p-6">
            <div className="flex items-center gap-2">
              <Target className="h-4 w-4 text-teal" />
              <Marginalia className="[&::before]:hidden">Current objective</Marginalia>
            </div>
            <p className="mt-3 font-serif text-lg leading-relaxed text-ink">
              {objective ?? resolved.topic.objectives[0]?.text ?? `Master: ${resolved.topic.title}`}
            </p>
            <WhyInteraction
              reason={whyTopic(topicId)}
              label="Why this topic now?"
              className="mt-3"
            />
            <p className="mt-3 footnote">
              Cognify observes your attempts during this session. Every interaction — play, pause,
              rewind, speed change — becomes learning data that refines your next recommendation.
            </p>
          </div>

          {/* Session stats grid */}
          <div className="mt-6 grid grid-cols-2 gap-px border border-ink/10 bg-ink/10 sm:grid-cols-4">
            <div className="bg-card p-5">
              <div className="font-mono text-[9px] uppercase tracking-[0.08em] text-muted-foreground">Topic mastery</div>
              <div className="mt-1 font-mono text-xl font-medium text-ink">{resolved.topic.mastery}%</div>
              <MasteryBar value={resolved.topic.mastery} className="mt-2" />
            </div>
            <div className="bg-card p-5">
              <div className="font-mono text-[9px] uppercase tracking-[0.08em] text-muted-foreground">Estimated time</div>
              <div className="mt-1 flex items-center gap-1.5 font-mono text-xl font-medium text-ink">
                <Timer className="h-4 w-4 text-teal" /> {minutes} min
              </div>
              <div className="mt-2 font-mono text-[12px] text-muted-foreground">
                {transcript.length} transcript segments
              </div>
            </div>
            <div className="bg-card p-5">
              <div className="font-mono text-[9px] uppercase tracking-[0.08em] text-muted-foreground">Format</div>
              <div className="mt-1">
                <ActionChip action={resource.format} />
              </div>
              <div className="mt-2 font-mono text-[12px] text-muted-foreground">{resource.difficulty} difficulty</div>
            </div>
            <div className="bg-card p-5">
              <div className="font-mono text-[9px] uppercase tracking-[0.08em] text-muted-foreground">Status</div>
              <div className="mt-1 font-mono text-[14px] font-medium uppercase tracking-[0.1em] text-teal">
                {flow.stage === 'complete' ? 'Completed' : 'In Progress'}
              </div>
              <div className="mt-2 font-mono text-[12px] text-muted-foreground">
                Progress tracked
              </div>
            </div>
          </div>

          {/* Transcript preview */}
          {transcript.length > 0 && (
            <div className="mt-6">
              <div className="flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-teal" />
                <Marginalia className="[&::before]:hidden">Transcript preview — first segment</Marginalia>
              </div>
              <Hairline className="mt-3" />
              <blockquote className="mt-4 border-l-2 border-teal/40 pl-4">
                <p className="font-serif text-[14px] italic leading-relaxed text-dark-text/80">
                  “{transcript[0].text}”
                </p>
                <footer className="mt-2 font-display text-xs uppercase tracking-[0.08em] text-muted-foreground">
                  00:00 – {formatTime(transcript[0].endSec)}
                </footer>
              </blockquote>
            </div>
          )}

          {/* DNA update note — the loop's visible moment */}
          {dnaUpdate && (
            <div className="mt-6 border border-teal/40 bg-teal/5 p-6">
              <div className="flex items-center gap-2">
                <Dna className="h-4 w-4 text-teal" />
                <Marginalia className="[&::before]:hidden">Progress Update</Marginalia>
              </div>
              <p className="mt-3 font-serif text-[15px] leading-relaxed text-ink">
                {dnaUpdate.finding}
              </p>
              <p className="mt-2 font-mono text-[11.5px] uppercase tracking-[0.06em] text-teal-dark">
                → {dnaUpdate.implication}
              </p>
              <div className="mt-4">
                <Link
                  href="/adaptive"
                  className="border border-ink bg-ink px-4 py-2 font-mono text-[10.5px] uppercase tracking-[0.12em] text-ivory transition-colors hover:bg-teal hover:border-teal"
                >
                  See what's next →
                </Link>
              </div>
            </div>
          )}

          {/* After this resource rail */}
          <div className="mt-6">
            <Marginalia>After this resource</Marginalia>
            <Hairline className="mt-3" />
            <ul className="mt-4 space-y-2">
              {!flow.retrieval && (
                <li className="flex items-start justify-between gap-4 border border-dashed border-ink/25 bg-card p-4">
                  <div>
                    <div className="font-serif text-[14px] font-bold text-ink">Quick check</div>
                    <p className="mt-1 text-[12.5px] leading-relaxed text-dark-text/70">
                      Five questions to see how much you remember.
                    </p>
                  </div>
                  <button
                    onClick={() => setRetrievalOpen(true)}
                    className="shrink-0 border border-teal px-4 py-2 font-mono text-[12px] uppercase tracking-[0.12em] text-teal transition-colors hover:bg-teal hover:text-white active:scale-[0.97]"
                  >
                    Start check
                  </button>
                </li>
              )}
              {flow.retrieval && !flow.confidenceRating && (
                <li className="flex items-start justify-between gap-4 border border-dashed border-ink/25 bg-card p-4">
                  <div>
                    <div className="font-serif text-[14px] font-bold text-ink">How do you feel?</div>
                    <p className="mt-1 text-[12.5px] leading-relaxed text-dark-text/70">
                      Tell us how confident you feel about this topic so we can adjust your next session.
                    </p>
                  </div>
                  <button
                    onClick={() => setConfidenceOpen(true)}
                    className="shrink-0 border border-teal px-4 py-2 font-mono text-[12px] uppercase tracking-[0.12em] text-teal transition-colors hover:bg-teal hover:text-white active:scale-[0.97]"
                  >
                    Rate now
                  </button>
                </li>
              )}
              <li className="flex items-start justify-between gap-4 border border-dashed border-ink/25 bg-card p-4">
                <div>
                  <div className="font-serif text-[14px] font-bold text-ink">Practice problems</div>
                  <p className="mt-1 text-[12.5px] leading-relaxed text-dark-text/70">
                    Exercises focused on the parts you found most interesting today.
                  </p>
                </div>
                <button
                  onClick={() => navigate(`/resources/${queryTopic ?? ""}`)}
                  className="shrink-0 border border-ink/30 px-4 py-2 font-mono text-[12px] uppercase tracking-[0.12em] text-ink/70 transition-colors hover:border-ink hover:text-ink active:scale-[0.97]"
                >
                  Open practice
                </button>
              </li>
              {weakTopicSuggestion && (
                <li className="flex items-start justify-between gap-4 border border-dashed border-amber/40 bg-amber/5 p-4">
                  <div>
                    <div className="font-serif text-[14px] font-bold text-ink">Recommended for you</div>
                    <p className="mt-1 text-[12.5px] leading-relaxed text-dark-text/70">{weakTopicSuggestion}</p>
                  </div>
                  <button
                    onClick={() => navigate("/adaptive")}
                    className="shrink-0 border border-amber/50 px-4 py-2 font-mono text-[12px] uppercase tracking-[0.12em] text-amber-dark transition-colors hover:bg-amber/10 active:scale-[0.97]"
                  >
                    View path
                  </button>
                </li>
              )}
            </ul>
          </div>
        </section>

        {/* Begin column */}
        <aside className="w-full shrink-0 lg:w-80">
          <div className="sticky top-6 border border-ink bg-ink p-6 text-ivory">
            <div className="font-mono text-[12px] uppercase tracking-[0.08em] text-teal">
              {resolved.subject.code} · {resolved.topic.title}
            </div>
            <div className="mt-3 font-display text-[20px] font-bold leading-snug">
              {resource.title}
            </div>
            <div className="mt-2 flex items-center gap-3 font-mono text-[14px] text-ivory/60">
              <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {minutes} min</span>
              <span>{resource.sourceLabel}</span>
            </div>

            <div className="mt-3">
              <WhyInteraction
                reason={whyResource(topicId, resource.format)}
                label="Why this resource?"
                className="mt-0"
              />
            </div>

            <Hairline className="!bg-ivory/15 my-5" />

            {!flow.watched && (
              <button
                onClick={beginSession}
                className="group flex w-full items-center justify-between border border-teal bg-teal px-5 py-3.5 font-mono text-[12px] uppercase tracking-[0.08em] text-white transition-all duration-150 hover:bg-teal-dark active:scale-[0.98]"
              >
                <span>Begin session</span>
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </button>
            )}

            <div className={flow.watched ? "mt-3 space-y-2" : "mt-3"}>
              {!flow.watched ? (
                <button
                  onClick={handleMarkWatched}
                  className="w-full border border-ivory/25 px-3 py-2.5 font-mono text-[12px] uppercase tracking-[0.08em] text-ivory/75 transition-all hover:border-teal hover:text-teal active:scale-[0.97]"
                >
                  Mark as watched (no player)
                </button>
              ) : (
                <>
                  <div className="border border-teal/40 bg-teal/10 p-3 font-mono text-[12px] uppercase tracking-[0.08em] text-teal">
                    ✓ Watched · stage {flow.stage}
                  </div>
                  {!flow.retrieval && (
                    <button
                      onClick={() => setRetrievalOpen(true)}
                      className="w-full border border-amber bg-amber px-3 py-2.5 font-mono text-[12px] uppercase tracking-[0.08em] text-white transition-all hover:bg-amber-dark active:scale-[0.97]"
                    >
                      Start quick check →
                    </button>
                  )}
                  {flow.retrieval && (
                    <p className="border border-ivory/15 p-3 font-mono text-[10.5px] leading-relaxed text-ivory/70">
                      Retrieved {flow.retrieval.correct}/{flow.retrieval.answered} —{" "}
                      {flow.confidenceRating !== null ? `confidence ${flow.confidenceRating}%, DNA updated.` : "rate confidence to complete the loop."}
                    </p>
                  )}
                </>
              )}
              <button
                onClick={() => endSession("understood", resourceId, alternatives[0]?.id ?? null, topicId, queryTopic, navigate)}
                className="flex w-full items-center justify-center gap-1.5 border border-ivory/25 px-2 py-2 font-mono text-[10.5px] uppercase tracking-[0.08em] text-ivory/75 transition-all hover:border-teal hover:text-teal active:scale-[0.97]"
              >
                <CheckCircle2 className="h-3 w-3" /> I understood it
              </button>
              {alternatives[0] && (
                <button
                  onClick={() => endSession("need-more", resourceId, alternatives[0].id, topicId, queryTopic, navigate)}
                  className="flex w-full items-center justify-center gap-1.5 border border-ivory/25 px-2 py-2 font-mono text-[10.5px] uppercase tracking-[0.08em] text-ivory/75 transition-all hover:border-amber hover:text-amber active:scale-[0.97]"
                >
                  <FlaskConical className="h-3 w-3" /> Another explanation
                </button>
              )}
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    if (saved) removeSaved(resourceId);
                    else if (resource) addSaved(resource);
                    setSaved((v) => !v);
                  }}
                  className="flex-1 border border-ivory/25 px-2 py-2 font-mono text-[10.5px] uppercase tracking-[0.08em] text-ivory/75 transition-all hover:border-amber hover:text-amber active:scale-[0.97]"
                >
                  {saved ? "Saved ✓" : "Save to library"}
                </button>
                <Link
                  href={`/resources/${queryTopic ?? ""}`}
                  className="flex flex-1 items-center justify-center gap-1 border border-ivory/25 px-2 py-2 font-mono text-[10.5px] uppercase tracking-[0.08em] text-ivory/75 transition-all hover:border-ivory/50 hover:text-ivory active:scale-[0.97]"
                >
                  <SkipForward className="h-3 w-3" /> Skip topic
                </Link>
              </div>
            </div>

            <p className="mt-4 font-mono text-[12px] leading-relaxed text-ivory/50">
              Transcript, notes, replay marks and “Ask Cognify” are available inside the player.
              Playback events are logged for your analytics file.
            </p>
            <JourneyLink href={`/resources/${queryTopic ?? ""}`} className="mt-3 text-ivory/60 hover:text-teal">
              Explore other formats for this topic
            </JourneyLink>
          </div>
        </aside>
      </div>

      {/* Retrieval dialog */}
      {retrievalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/60 p-4 backdrop-blur-sm">
          <div className="max-h-[85vh] w-full max-w-2xl overflow-y-auto border border-ink bg-card p-6 shadow-xl">
            <div className="flex items-start justify-between">
              <div>
                <Marginalia>Retrieval check — no notes allowed</Marginalia>
                <div className="mt-1 font-serif text-lg font-bold text-ink">{resolved.topic.title}</div>
              </div>
              <button onClick={() => setRetrievalOpen(false)} className="border border-ink/20 p-1.5 text-ink/50 transition-colors hover:text-ink">
                <X className="h-4 w-4" />
              </button>
            </div>
            <Hairline className="my-4" />
            <ol className="space-y-5">
              {questions.map((q, qi) => (
                <li key={q.id}>
                  <div className="mb-2 flex gap-2">
                    <span className="index-num">{String(qi + 1).padStart(2, "0")}</span>
                    <p className="font-serif text-[14.5px] font-bold leading-snug text-ink">{q.question}</p>
                  </div>
                  <div className="ml-8 space-y-1.5">
                    {q.options.map((opt, oi) => (
                      <button
                        key={oi}
                        onClick={() => setAnswers((a) => ({ ...a, [q.id]: oi }))}
                        className={cn(
                          "block w-full border px-3 py-2 text-left font-mono text-[11.5px] transition-colors",
                          answers[q.id] === oi
                            ? "border-teal bg-teal/10 text-teal"
                            : "border-ink/15 text-ink/70 hover:border-ink/40"
                        )}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </li>
              ))}
            </ol>
            <div className="mt-6 flex items-center justify-between">
              <p className="footnote max-w-md">
                Answering all {questions.length} unlocks your DNA update — every answer is
                calibration data, even the wrong ones.
              </p>
              <button
                onClick={submitRetrieval}
                disabled={Object.keys(answers).length < questions.length}
                className="border border-ink bg-ink px-5 py-2.5 font-mono text-[10.5px] uppercase tracking-[0.12em] text-ivory transition-all hover:bg-teal hover:border-teal active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-40"
              >
                Submit ({Object.keys(answers).length}/{questions.length})
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confidence dialog */}
      {confidenceOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md border border-ink bg-card p-6 shadow-xl">
            <Marginalia>Self-assessment calibration</Marginalia>
            <p className="mt-3 font-serif text-[15px] leading-relaxed text-ink">
              How confident are you — <em>before checking</em> — that you could explain{" "}
              {resolved.topic.title} to someone right now?
            </p>
            <div className="mt-5 grid grid-cols-3 gap-2">
              {[
                { value: 25, label: "Shaky" },
                { value: 50, label: "Familiar" },
                { value: 75, label: "Confident" },
              ].map((c) => (
                <button
                  key={c.value}
                  onClick={() => submitConfidence(c.value)}
                  className="border border-ink/25 p-3 transition-all hover:border-teal active:scale-[0.97]"
                >
                  <div className="font-mono text-lg font-medium text-teal">{c.value}%</div>
                  <div className="mt-1 font-mono text-[12px] uppercase tracking-[0.1em] text-ink/60">{c.label}</div>
                </button>
              ))}
            </div>
            <p className="footnote mt-4">
              Cognify compares this rating with your recall score. The gap — calibration —
              tells the engine whether you overestimate weak topics or underestimate strong ones.
            </p>
          </div>
        </div>
      )}
    </AppShell>
  );
}

function endSession(
  verdict: "understood" | "need-more",
  resourceId: string,
  switchedTo: string | null,
  topicId: string,
  queryTopic: string | null,
  navigate: (to: string) => void
) {
  const sessionId = startSession(resourceId);
  logEvent({
    type: "COMPLETE",
    atSec: 0,
    sessionId,
    resourceId,
    payload: {
      verdict: verdict as string,
      switchedTo: verdict === "need-more" && switchedTo ? switchedTo : "",
    },
  });
  if (verdict === "need-more" && switchedTo) {
    navigate(`/session/${switchedTo}?topic=${queryTopic ?? topicId}`);
  } else if (verdict === "understood") {
    navigate(`/topic/${queryTopic ?? topicId}`);
  } else {
    navigate(`/resources/${queryTopic ?? topicId}`);
  }
}

function cn(...parts: (string | false | null | undefined)[]): string {
  return parts.filter(Boolean).join(" ");
}

function formatTime(sec: number): string {
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${String(s).padStart(2, "0")}`;
}
