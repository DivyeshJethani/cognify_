/**
 * COGNIFY — Adaptive Lab (Day 4)
 * The core loop made visible: activity → analysis → weakness detected →
 * DNA updated → changed WHAT / HOW / WHEN.
 *
 * Style: Scholar's Atelier — ledger layout, marginalia, mono stats, hairline
 * rules, serif headers. Not a dashboard grid.
 */
import AppShell, { PageHeader } from "@/components/cognify/AppShell";
import {
  ActionChip,
  Marginalia,
  MasteryBar,
  StatCell,
} from "@/components/cognify/Primitives";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  ClipboardCheck,
  GitBranch,
  Sparkles,
  TrendingDown,
  TrendingUp,
  Users,
  Zap,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Link } from "wouter";

import { todayAdaptivePath } from "@/lib/adaptive";
import { calibrationSummary } from "@/lib/confidence";
import { interventionCount } from "@/lib/interventions";
import { mistakeAnalytics } from "@/lib/mistakes";
import { topicAlias } from "@/lib/curriculum";
import { buckets, revisionEntriesByBucket } from "@/lib/revision";
import { myGroup, openTeachRequests } from "@/lib/studyGroups";
import { cn } from "@/lib/utils";

const subjectNames: Record<string, string> = {
  MATH: "Mathematics",
  SCI: "Science",
  SST: "Social Science",
  ENG: "English",
  HIN: "Hindi",
  SKT: "Sanskrit",
};

const slugOf = (id: string) => topicAlias(id) ?? id;

export default function Adaptive() {
  const path = todayAdaptivePath();
  const mistakes = mistakeAnalytics();
  const calib = calibrationSummary();
  const dueToday = revisionEntriesByBucket(buckets()[0]);
  const teachRequests = openTeachRequests();
  const [expandedRec, setExpandedRec] = useState<string | null>(null);

  return (
    <AppShell>
      <PageHeader
        title="Your Personalized Learning Path"
        subtitle="We personalize your study sessions based on how you learn, what you've mastered, and when you need a refresher. Here's a look at your current path."
      />

      <div className="px-5 py-7 sm:px-8 lg:px-10">
        {/* The loop — header stats */}
        <div className="rise-in grid grid-cols-2 gap-y-6 border-b border-ink/10 pb-7 sm:grid-cols-4">
          <StatCell
            label="Personalizations"
            value={`${interventionCount()}`}
            sub="tailored to your style"
          />
          <StatCell
            label="Current Focus"
            value={`${mistakes[0]?.percentage ?? 0}%`}
            sub="Focusing on core concepts"
            className="relative"
          >
          </StatCell>
          <StatCell
            label="Learning Confidence"
            value="Strong"
            sub="You're building steady progress"
          />
          <StatCell
            label="Due today"
            value={`${dueToday.length}`}
            sub="refreshers to keep sharp"
          />
        </div>

        {/* The loop diagram strip */}
        <section className="mt-8 border border-ink/12 bg-card">
          <div className="border-b border-ink/10 px-5 py-3">
            <Marginalia amber className="[&::before]:hidden">
              The adaptive loop — live
            </Marginalia>
          </div>
          <div className="flex flex-wrap items-center gap-x-2 gap-y-3 px-5 py-5">
            {[
              { label: "Learning", detail: "your study sessions", icon: BookOpen },
              { label: "Insight", detail: "understanding your style", icon: ClipboardCheck },
              { label: "Discovery", detail: "finding areas to grow", icon: TrendingDown },
              { label: "Personalizing", detail: "updating your path", icon: Sparkles },
              { label: "Adaptive Path", detail: "your custom journey", icon: GitBranch },
            ].map((step, i) => (
              <div key={step.label} className="flex items-center gap-x-2">
                <div className="flex items-center gap-2.5 border border-ink/15 bg-ivory px-3 py-2.5">
                  <step.icon className="h-3.5 w-3.5 text-teal" />
                  <div>
                    <div className="font-serif text-[14px] font-bold text-ink">{step.label}</div>
                    <div className="font-mono text-[9px] uppercase tracking-wider text-muted-foreground">
                      {step.detail}
                    </div>
                  </div>
                </div>
                {i < 4 && <ArrowRight className="h-3.5 w-3.5 shrink-0 text-amber" />}
              </div>
            ))}
            <span className="ml-auto hidden font-display text-xs uppercase tracking-[0.08em] text-muted-foreground lg:inline">
              loops continuously · evidence stored per session
            </span>
          </div>
        </section>

        <div className="mt-10 grid gap-10 lg:grid-cols-[1.6fr_1fr]">
          {/* ---------- Main column ---------- */}
          <div className="min-w-0 space-y-10">
            {/* Today's adaptive path */}
            <section>
              <div className="flex flex-wrap items-baseline justify-between gap-3">
                <Marginalia amber>
                  Today's study plan — picked just for you
                </Marginalia>
                <span className="font-mono text-[12px] uppercase tracking-wider text-muted-foreground">
                  ranked by evidence
                </span>
              </div>
              <div className="mt-5 divide-y divide-ink/10 border-y border-ink/10">
                {path.map((rec, i) => {
                  const expanded = expandedRec === rec.topicId;
                  return (
                  <div key={rec.topicId} className="rise-in grid gap-4 py-6 sm:grid-cols-[2.5rem_1fr]">
                    <div className="index-num pt-0.5">{String(rec.rank).padStart(2, "0")}</div>
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-mono text-[12px] font-medium uppercase tracking-wider text-ink/50">
                          {rec.subjectLabel}
                        </span>
                        {rec.priority === "high" && (
                          <span className="font-mono text-[9px] font-bold uppercase tracking-[0.08em] text-amber-dark">
                            ● High priority
                          </span>
                        )}
                        <span className="font-mono text-[12px] text-teal-dark">
                          evidence {rec.evidenceStrength}%
                        </span>
                      </div>
                      <h3 className="mt-1.5 font-display text-[20px] font-bold text-ink">{rec.topicTitle}</h3>
                      {/* Progressive disclosure: one human line first, full
                          evidence hidden behind "See evidence" */}
                      <div className="mt-2.5 space-y-1.5">
                        <div className="flex items-start gap-2">
                          <span className="mt-1 shrink-0 font-mono text-[12px] font-bold uppercase tracking-[0.12em] text-teal">
                            Why
                          </span>
                          <p className="footnote">{rec.reason}</p>
                        </div>
                        {expanded ? (
                          <div className="space-y-1.5 border-l border-dotted border-ink/15 pl-3">
                            <div className="flex items-start gap-2">
                              <span className="mt-1 shrink-0 font-mono text-[12px] font-bold uppercase tracking-[0.12em] text-teal">
                                Evidence
                              </span>
                              <p className="footnote">{rec.whyChoseThis}</p>
                            </div>
                            <div className="flex items-start gap-2">
                              <span className="mt-1 shrink-0 font-mono text-[12px] font-bold uppercase tracking-[0.12em] text-amber">
                                How
                              </span>
                              <p className="footnote">
                                <ActionChip action={rec.format} /> {rec.formatDetail}
                              </p>
                            </div>
                          </div>
                        ) : (
                          <button
                            onClick={() => setExpandedRec(expanded ? null : rec.topicId)}
                            className="mt-1 font-display text-xs uppercase tracking-[0.08em] text-ink/55 hover:text-teal"
                          >
                            See evidence →
                          </button>
                        )}
                      </div>
                      <div className="mt-4 flex flex-wrap items-center gap-3">
                        <span className="font-mono text-[14px] text-dark-text/60">
                          {rec.estimatedMinutes} min · {rec.dnaLink}
                        </span>
                        <Link
                          href={`/topic/${slugOf(rec.topicId)}`}
                          className="border-b border-teal/50 pb-0.5 font-mono text-[14px] uppercase tracking-wider text-teal transition-colors hover:border-teal"
                        >
                          Open in explorer
                        </Link>
                      </div>
                    </div>
                  </div>
                  );
                })}
              </div>
            </section>

            {/* Mistake clusters */}
            <section>
              <div className="flex flex-wrap items-baseline justify-between gap-3">
                <Marginalia>Learning Insights — your patterns & progress</Marginalia>
                <Link
                  href="/mistakes"
                  className="font-display text-xs uppercase tracking-[0.08em] text-teal hover:underline"
                >
                  View details →
                </Link>
              </div>
              <div className="mt-5 grid gap-px border border-ink/12 bg-ink/10 sm:grid-cols-2">
                {mistakes.map((m) => (
                  <div key={m.category} className="bg-card p-5">
                    <div className="flex items-baseline justify-between gap-3">
                      <span className="font-serif text-[15px] font-bold text-ink">{m.label}</span>
                      <span className="flex items-center gap-1.5 font-mono text-[14px] text-amber-dark">
                        {m.trend === "rising" ? (
                          <TrendingUp className="h-3 w-3" />
                        ) : m.trend === "falling" ? (
                          <TrendingDown className="h-3 w-3 text-teal-dark" />
                        ) : null}
                        {m.percentage}%
                      </span>
                    </div>
                    <p className="mt-2 footnote">{m.pattern}</p>
                    <p className="mt-2 font-mono text-[12px] uppercase tracking-wider text-teal">
                      {m.trendNote}
                    </p>
                  </div>
                ))}
              </div>
            </section>

            {/* Interventions */}
            <section>
              <div className="flex flex-wrap items-baseline justify-between gap-3">
                <Marginalia>Personalized Adjustments — how we're helping you learn</Marginalia>
                <span className="font-mono text-[12px] uppercase tracking-wider text-muted-foreground">
                  each change is made to fit your learning style
                </span>
              </div>
              <ol className="mt-4 space-y-0">
                <li className="grid grid-cols-[1.5rem_1fr] gap-4 border-l border-ink/10 pb-5 pl-4">
                  <div className="relative">
                    <div className="absolute -left-[1.5625rem] top-1.5 h-2 w-2 border border-teal bg-ivory" />
                    <span className="font-mono text-[12px] text-muted-foreground">format</span>
                  </div>
                  <div>
                    <span className="font-serif text-[15px] font-bold text-ink">
                      Visual-first approach for Math
                    </span>
                    <p className="mt-1 footnote">
                      We've noticed you learn much faster when concepts are explained with diagrams, so we're prioritizing those for you.
                    </p>
                  </div>
                </li>
                <li className="grid grid-cols-[1.5rem_1fr] gap-4 border-l border-ink/10 pb-5 pl-4">
                  <div className="relative">
                    <div className="absolute -left-[1.5625rem] top-1.5 h-2 w-2 border border-amber bg-ivory" />
                    <span className="font-mono text-[12px] text-muted-foreground">revision</span>
                  </div>
                  <div>
                    <span className="font-serif text-[15px] font-bold text-ink">
                      Timely refreshers for tricky topics
                    </span>
                    <p className="mt-1 footnote">
                      We've adjusted your schedule to revisit certain topics a bit sooner, ensuring they stay fresh in your memory.
                    </p>
                  </div>
                </li>
                <li className="grid grid-cols-[1.5rem_1fr] gap-4 border-l border-ink/10 pb-5 pl-4">
                  <div className="relative">
                    <div className="absolute -left-[1.5625rem] top-1.5 h-2 w-2 border border-ink/40 bg-ivory" />
                    <span className="font-mono text-[12px] text-muted-foreground">sequence</span>
                  </div>
                  <div>
                    <span className="font-serif text-[15px] font-bold text-ink">
                      Building solid foundations
                    </span>
                    <p className="mt-1 footnote">
                      We're making sure you've mastered the basics before moving on to more complex problems, so you always feel confident.
                    </p>
                  </div>
                </li>
              </ol>
            </section>
          </div>

          {/* ---------- Rail ---------- */}
          <div className="space-y-10">
            {/* Calibration */}
            <section className="border border-ink/12 bg-card">
              <div className="border-b border-ink/10 px-5 py-4">
                <div className="flex items-center justify-between">
                  <Marginalia className="[&::before]:hidden">
                    Confidence calibration
                  </Marginalia>
                  <Link href="/confidence" className="font-display text-xs uppercase tracking-[0.08em] text-teal hover:underline">
                    Readings →
                  </Link>
                </div>
              </div>
              <div className="divide-y divide-ink/8 px-5">
                <div className="py-4">
                  <div className="flex items-baseline justify-between">
                    <span className="font-mono text-[12px] uppercase tracking-[0.12em] text-ink/60">
                      Avg self-report gap
                    </span>
                    <span className="font-display text-[20px] font-bold text-amber-dark">+{calib.avgGap}</span>
                  </div>
                  <p className="mt-2 footnote">{calib.dnaNote}</p>
                </div>
                <div className="py-4">
                  <span className="font-mono text-[12px] uppercase tracking-[0.12em] text-ink/60">
                    Overestimating
                  </span>
                  <div className="mt-2 flex items-center gap-3">
                    <MasteryBar value={(calib.overCount / calib.total) * 100} className="max-w-[160px]" />
                    <span className="font-mono text-[14px] text-amber-dark">
                      {calib.overCount} of {calib.total}
                    </span>
                  </div>
                </div>
              </div>
            </section>

            {/* Due today */}
            <section>
              <div className="flex items-center justify-between">
                <Marginalia>Due today — spaced revision</Marginalia>
                <Link href="/revision" className="font-display text-xs uppercase tracking-[0.08em] text-teal hover:underline">
                  Revision hub →
                </Link>
              </div>
              <ul className="mt-4 space-y-3">
                {dueToday.slice(0, 4).map((e) => (
                  <li key={e.topicId} className="border-l-2 border-teal/60 pl-3">
                    <Link href={`/topic/${slugOf(e.topicId)}`} className="group">
                      <span className="font-mono text-[9px] font-medium uppercase tracking-wider text-ink/50">
                        {subjectNames[e.subjectCode] ?? e.subjectCode}
                      </span>
                      <div className="mt-0.5 font-serif text-[14px] font-bold leading-snug text-ink">
                        {e.topicTitle}
                      </div>
                      <div className="mt-1.5 flex items-center gap-3">
                        <span className="font-mono text-[12px] text-muted-foreground">
                          retention ~{e.retentionEstimate}%
                        </span>
                        {e.priority === "high" && (
                          <span className="font-mono text-[9px] font-bold uppercase tracking-[0.08em] text-amber-dark">
                            ● High
                          </span>
                        )}
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>

            {/* Quick links */}
            <section className="grid gap-px border border-ink/12 bg-ink/10">
              {[
                {
                  href: "/mistakes",
                  icon: ClipboardCheck,
                  label: "Mistake analysis",
                  detail: `${mistakes.reduce((s, m) => s + m.count, 0)} classified mistakes`,
                },
                {
                  href: "/confidence",
                  icon: TrendingUp,
                  label: "Confidence calibration",
                  detail: `${calib.total} readings on file`,
                },
                {
                  href: "/timetable",
                  icon: Zap,
                  label: "Your timetable",
                  detail: "generated from the loop above",
                },
                {
                  href: "/teach",
                  icon: BookOpen,
                  label: "Teach Cognify",
                  detail: "strongest mastery signal",
                },
                {
                  href: "/community",
                  icon: Users,
                  label: "Study groups",
                  detail: `${myGroup().memberCount} members · ${teachRequests.length} open teach requests`,
                },
              ].map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  className="group flex items-center gap-3 bg-card px-5 py-3.5 transition-colors hover:bg-ink/[0.03]"
                >
                  <l.icon className="h-4 w-4 shrink-0 text-teal" />
                  <div className="min-w-0 flex-1">
                    <div className="font-serif text-[14px] font-bold text-ink">{l.label}</div>
                    <div className="font-mono text-[12px] text-muted-foreground">{l.detail}</div>
                  </div>
                  <ArrowUpRight className="h-3.5 w-3.5 shrink-0 text-ink/30 transition-colors group-hover:text-teal" />
                </Link>
              ))}
            </section>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
