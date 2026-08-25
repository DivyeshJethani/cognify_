/**
 * COGNIFY — Revision Hub (Day 4)
 * Spaced repetition schedule: due today / tomorrow / upcoming / mastered.
 * Each entry carries a retention estimate from the student's decay curve.
 *
 * Style: Scholar's Atelier — ledger, marginalia, mono stats, hairline rules.
 */
import AppShell, { PageHeader } from "@/components/cognify/AppShell";
import {
  Marginalia,
  MasteryBar,
  StatCell,
} from "@/components/cognify/Primitives";
import { Button } from "@/components/ui/button";
import { buckets, bucketLabel, revisionEntriesByBucket, revisionResultFor } from "@/lib/revision";
import { topicAlias } from "@/lib/curriculum";
import { ArrowRight, CalendarClock, Clock, RotateCcw, Sparkles } from "lucide-react";
import { useMemo, useState } from "react";
import { Link } from "wouter";

const slugOf = (id: string) => topicAlias(id) ?? id;

const subjectNames: Record<string, string> = {
  MATH: "Mathematics",
  SCI: "Science",
  SST: "Social Science",
  ENG: "English",
  HIN: "Hindi",
  SKT: "Sanskrit",
};

const formatLabels: Record<string, string> = {
  "worked-example": "Worked examples",
  "step-by-step": "Step-by-step walkthrough",
  "verbal-explanation": "Verbal explanation",
  analogy: "Analogy-based review",
};

export default function Revision() {
  const bucketList = buckets();
  const [activeBucket, setActiveBucket] = useState<string>(bucketList[0]);
  const entries = useMemo(() => revisionEntriesByBucket(activeBucket as any), [activeBucket]);
  const all = useMemo(() => buckets().flatMap(revisionEntriesByBucket), []);
  const dueToday = revisionEntriesByBucket("due-today");
  const demo = revisionResultFor(entries[0]?.topicId ?? "t-1-irrational-numbers-proofs");

  return (
    <AppShell>
      <PageHeader
        title="Your Personalized Revision Schedule"
        subtitle="We help you review topics at just the right time to keep them fresh in your memory. These are your scheduled refreshers."
        actions={
          <Button
            asChild
            variant="outline"
            className="border-ink/25 bg-transparent text-ink hover:bg-ink/5"
          >
            <Link href="/adaptive">
              Adaptive Lab <ArrowRight className="ml-1 h-3.5 w-3.5" />
            </Link>
          </Button>
        }
      />

      <div className="px-5 py-7 sm:px-8 lg:px-10">
        {/* Stats ledger */}
        <div className="rise-in grid grid-cols-2 gap-y-6 border-b border-ink/10 pb-7 sm:grid-cols-4">
          <StatCell
            label="Due today"
            value={`${dueToday.length}`}
            sub="spaced-revision entries"
          />
          <StatCell
            label="Upcoming (7 days)"
            value={`${all.filter((e) => e.bucket === "upcoming").length}`}
            sub="scheduled in advance"
          />
          <StatCell
            label="Mastered &amp; maintained"
            value={`${all.filter((e) => e.mastery >= 90).length}`}
            sub="monthly checks only"
          />
          <StatCell
            label="Memory Strength"
            value="Good"
            sub="Based on your recent reviews"
          />
        </div>

        <div className="mt-10 grid gap-10 lg:grid-cols-[1.6fr_1fr]">
          {/* ---------- Main column ---------- */}
          <div className="min-w-0 space-y-10">
            {/* Bucket tabs */}
            <section>
              <div className="flex flex-wrap items-baseline justify-between gap-3">
                <Marginalia amber>Scheduler — reviews grouped by when they land</Marginalia>
              </div>
              <div className="mt-5 flex flex-wrap gap-2 border-b border-ink/10 pb-4">
                {bucketList.map((b) => {
                  const n = revisionEntriesByBucket(b).length;
                  const active = activeBucket === b;
                  return (
                    <button
                      key={b}
                      onClick={() => setActiveBucket(b)}
                      className={
                        active
                          ? "border border-ink bg-ink px-3.5 py-2 font-mono text-[14px] uppercase tracking-[0.1em] text-ivory"
                          : "border border-ink/20 bg-ivory px-3.5 py-2 font-mono text-[14px] uppercase tracking-[0.1em] text-ink/70 transition-colors hover:border-ink/50"
                      }
                    >
                      {bucketLabel(b)} <span className="text-ink/40">· {n}</span>
                    </button>
                  );
                })}
              </div>

              {entries.length === 0 ? (
                <p className="mt-6 footnote">Nothing scheduled in this bucket right now.</p>
              ) : (
                <div className="mt-0 divide-y divide-ink/10 border-y border-ink/10">
                  {entries.map((e, i) => (
                    <div
                      key={e.topicId}
                      className="rise-in grid gap-4 py-6 sm:grid-cols-[2.5rem_1fr]"
                    >
                      <div className="index-num pt-0.5">{String(i + 1).padStart(2, "0")}</div>
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-mono text-[12px] font-medium uppercase tracking-wider text-ink/50">
                            {subjectNames[e.subjectCode] ?? e.subjectCode}
                          </span>
                          <span className="font-mono text-[9px] uppercase tracking-wider text-muted-foreground">
                            {e.chapterTitle}
                          </span>
                          {e.priority === "high" && (
                            <span className="font-mono text-[9px] font-bold uppercase tracking-[0.08em] text-amber-dark">
                              ● High priority
                            </span>
                          )}
                          <span className="font-mono text-[9px] uppercase tracking-wider text-muted-foreground">
                            <Clock className="mr-0.5 inline h-2.5 w-2.5" />
                            {e.estimatedMinutes} min · next review {e.nextReview}
                          </span>
                        </div>
                        <h3 className="mt-1.5 font-display text-[20px] font-bold text-ink">{e.topicTitle}</h3>
                        <div className="mt-3 flex items-start gap-2">
                          <span className="mt-1 shrink-0 font-mono text-[12px] font-bold uppercase tracking-[0.12em] text-amber">
                            Why now
                          </span>
                          <p className="footnote">{e.priorityReason}</p>
                        </div>
                        <div className="mt-3 grid gap-4 sm:grid-cols-2">
                          <div>
                            <div className="flex items-baseline justify-between">
                              <span className="font-mono text-[12px] uppercase tracking-wider text-ink/60">
                                Mastery
                              </span>
                              <span className="font-mono text-[14px] text-ink/70">{e.mastery}%</span>
                            </div>
                            <MasteryBar value={e.mastery} className="mt-1.5" trackClassName="border-ink/20" />
                          </div>
                          <div>
                            <div className="flex items-baseline justify-between">
                              <span className="font-mono text-[12px] uppercase tracking-wider text-ink/60">
                                Memory Strength
                              </span>
                              <span className="font-mono text-[14px] text-amber-dark">
                                {e.retentionEstimate < 50 ? 'Needs Review' : e.retentionEstimate < 80 ? 'Developing' : 'Strong'}
                              </span>
                            </div>
                            <MasteryBar value={e.retentionEstimate} className="mt-1.5" trackClassName="border-amber/40" />
                          </div>
                        </div>
                        <div className="mt-4 flex flex-wrap items-center gap-3">
                          <span className="border border-teal/30 px-2 py-0.5 font-mono text-[12px] uppercase tracking-wider text-teal">
                            {formatLabels[e.recommendedFormat] ?? e.recommendedFormat}
                          </span>
                          <Link
                            href={`/topic/${slugOf(e.topicId)}`}
                            className="border-b border-teal/50 pb-0.5 font-mono text-[14px] uppercase tracking-wider text-teal transition-colors hover:border-teal"
                          >
                            Start review
                          </Link>
                          <span className="font-mono text-[12px] text-muted-foreground">
                            last studied {e.lastStudied}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* Sample session result */}
            {entries.length > 0 && (
              <section className="border border-ink/12 bg-card">
                <div className="border-b border-ink/10 px-5 py-4">
                    <Marginalia className="[&::before]:hidden">
                      How your progress is tracked
                    </Marginalia>
                </div>
                <div className="px-5 py-5">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-serif text-[16px] font-bold text-ink">{demo.topicTitle}</span>
                    <span className="font-mono text-[12px] uppercase tracking-wider text-muted-foreground">
                      three-round reading
                    </span>
                  </div>
                  <div className="mt-4 grid gap-4 sm:grid-cols-3">
                    {[
                      { label: "Step 1 · understanding", value: demo.recallRound1 },
                      { label: "Step 2 · practice", value: demo.recallRound2 },
                      { label: "Step 3 · confidence", value: demo.confidenceRound3 },
                    ].map((r) => (
                      <div key={r.label}>
                        <div className="flex items-baseline justify-between">
                          <span className="font-mono text-[12px] uppercase tracking-wider text-ink/60">
                            {r.label}
                          </span>
                          <span className="font-mono text-[14px] text-teal-dark">{r.value}%</span>
                        </div>
                        <MasteryBar value={r.value} className="mt-1.5" />
                      </div>
                    ))}
                  </div>
                  <p className="mt-4 footnote">
                    <Sparkles className="mr-1.5 inline h-3.5 w-3.5 text-teal" />
                    {demo.decision} Next review in {demo.nextReviewIn}.
                  </p>
                  <p className="mt-1.5 font-mono text-[12px] uppercase tracking-wider text-teal">
                    {demo.dnaNote}
                  </p>
                </div>
              </section>
            )}
          </div>

          {/* ---------- Rail ---------- */}
          <div className="space-y-10">
            <section className="border border-ink/12 bg-card">
              <div className="border-b border-ink/10 px-5 py-4">
                <Marginalia className="[&::before]:hidden">Your Memory Strength</Marginalia>
              </div>
              <div className="px-5 py-5">
                <p className="footnote">
                  Most students start to forget concepts after about <strong className="text-ink">7 days</strong>. We schedule your reviews to help you keep that knowledge fresh and strong.
                </p>
                <div className="mt-4 flex items-end gap-1.5">
                  {[88, 84, 78, 71, 63, 54, 45, 38, 31, 26, 22, 19].map((v, i) => (
                    <div key={i} className="flex-1">
                      <div
                        className={i < 7 ? "bg-teal" : "bg-amber"}
                        style={{ height: `${v * 0.9}px`, opacity: 0.45 + i * 0.04 }}
                      />
                    </div>
                  ))}
                </div>
                <div className="mt-1.5 flex justify-between font-mono text-[9px] uppercase tracking-wider text-muted-foreground">
                  <span>Day 0</span>
                  <span>Day 12</span>
                </div>
                <p className="mt-2 font-mono text-[12px] uppercase tracking-wider text-amber-dark">
                  We schedule refreshers just when you need them
                </p>
              </div>
            </section>

            <section className="border border-ink/12 bg-card p-5">
              <Marginalia className="[&::before]:hidden">Your Study Schedule</Marginalia>
              <div className="mt-3 space-y-3">
                {[
                  {
                    icon: CalendarClock,
                    title: "Topics to focus on",
                    note: "Frequent refreshers for topics that need a bit more attention.",
                  },
                  {
                    icon: Clock,
                    title: "Regular reviews",
                    note: "Scheduled every few days to keep your understanding solid.",
                  },
                  {
                    icon: RotateCcw,
                    title: "Mastered topics",
                    note: "Occasional check-ins to ensure you still remember the core ideas.",
                  },
                ].map((r) => (
                  <div key={r.title} className="flex items-start gap-3">
                    <r.icon className="mt-0.5 h-4 w-4 shrink-0 text-teal" />
                    <div>
                      <div className="font-serif text-[14px] font-bold text-ink">{r.title}</div>
                      <p className="footnote">{r.note}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section>
              <Marginalia>Due today — quick actions</Marginalia>
              <ul className="mt-4 space-y-3">
                {dueToday.slice(0, 4).map((e) => (
                  <li key={e.topicId} className="border-l-2 border-amber/60 pl-3">
                    <Link href={`/topic/${slugOf(e.topicId)}`} className="group">
                      <span className="font-mono text-[9px] font-medium uppercase tracking-wider text-ink/50">
                        {subjectNames[e.subjectCode] ?? e.subjectCode}
                      </span>
                      <div className="mt-0.5 font-serif text-[14px] font-bold leading-snug text-ink">
                        {e.topicTitle}
                      </div>
                      <span className="mt-1 inline-block font-mono text-[12px] uppercase tracking-wider text-teal opacity-0 transition-opacity group-hover:opacity-100">
                        Begin review →
                      </span>
                    </Link>
                  </li>
                ))}
                {dueToday.length === 0 && (
                  <li className="footnote">Nothing due today — schedule is clear.</li>
                )}
              </ul>
            </section>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
