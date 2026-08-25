/**
 * COGNIFY — Learning Command Center (dashboard)
 * Style: ledger layout — main column (2/3) + rail (1/3), hairline rules,
 * marginalia labels, mono data. NOT a bento grid. Serif headers.
 */
import AppShell, { PageHeader } from "@/components/cognify/AppShell";
import { getStudyContext, onContextChange } from "@/lib/studyContext";
import {
  ActionChip,
  Hairline,
  Marginalia,
  MasteryBar,
  RevisionChip,
  StatCell,
  stateColor,
  stateLabel,
} from "@/components/cognify/Primitives";
import { useApp } from "@/contexts/AppContext";
import { allTopics, boards } from "@/lib/mockData";
import { topicAlias } from "@/lib/curriculum";
import { activeInterventions, featuredIntervention } from "@/lib/interventions";
import { calibrationSummary } from "@/lib/confidence";
import { timetableSessions, todaySessionCount } from "@/lib/timetable";
import { stretchGoals } from "@/lib/goals";
import { openTeachRequests, myGroup } from "@/lib/studyGroups";
import { cn } from "@/lib/utils";
import { todaySequence, continuationItems } from "@/lib/journeyData";
import { Flame, TrendingUp } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link } from "wouter";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const subjectNames: Record<string, string> = {
  MATH: "Mathematics",
  SCI: "Science",
  SST: "Social Science",
  ENG: "English",
  HIN: "Hindi",
  SKT: "Sanskrit",
};

// The subject switcher stores the subject id (e.g. "math"); the ledger rows
// carry the subject code (e.g. "MATH"). Resolve between the two.
const SUBJECT_ID_TO_NAME: Record<string, string> = {
  math: "Mathematics",
  science: "Science",
  social: "Social Science",
  english: "English",
  hindi: "Hindi",
  sanskrit: "Sanskrit",
};

const SUBJECT_ID_TO_CODE: Record<string, string> = {
  math: "MATH",
  science: "SCI",
  social: "SST",
  english: "ENG",
  hindi: "HIN",
  sanskrit: "SKT",
};

/* topicAlias() from curriculum.ts resolves runtime ids → stable alias slug;
   falls back to the runtime id so links never break */
const slugOf = (t: { id: string }): string => topicAlias(t.id) ?? t.id;

function todayDateString() {
  return new Date().toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default function Dashboard() {
  const { profile, todayPath, weakTopicsList, revisionDueList, activity, dna, goalsList, credits } =
    useApp();

  // Keep the header synced with the sidebar's class + subject focus.
  const [, rerender] = useState(0);
  useEffect(() => onContextChange(() => rerender((n) => n + 1)), []);
  const ctx = getStudyContext();
  const focusName = ctx.subjectFocus ? SUBJECT_ID_TO_NAME[ctx.subjectFocus] ?? "" : "";
  const focusCode = ctx.subjectFocus ? SUBJECT_ID_TO_CODE[ctx.subjectFocus] ?? "" : "";
  const subjectFocus = focusCode || null;
  const focusSubject = focusName || null;

  const pathMinutes = todayPath.reduce((n, p) => n + p.minutes, 0);
  const overallMastery = useMemo(() => {
    let total = 0;
    let count = 0;
    for (const b of boards) {
      for (const c of b.classes) {
        for (const s of c.subjects) {
          for (const { topic } of allTopics(s)) {
            if (topic.state !== "new") {
              total += topic.mastery;
              count += 1;
            }
          }
        }
      }
    }
    return count ? Math.round(total / count) : 0;
  }, []);

  return (
    <AppShell>
      <PageHeader
        title={`Good ${greeting()}, ${profile.name.split(" ")[0]}.`}
        subtitle={
          subjectFocus
            ? `Everything below is filtered to ${subjectFocus} — tap a different subject in the sidebar to shift focus.`
            : `${todayDateString()} · ${pathMinutes} minutes planned for today — most of it focused on what you need most`
        }
      />

      {/* Single primary action — the one thing to do right now */}
      {!subjectFocus && todaySequence().items.length > 0 && (
        <PrimaryActionBanner
          key={todaySequence().items[0].topicId}
          item={todaySequence().items[0]}
        />
      )}

      {subjectFocus && (
        <div className="mt-6 flex items-center gap-3 border border-teal/30 bg-teal/5 px-5 py-4">
          <span className="font-display text-xs uppercase tracking-[0.08em] text-teal-dark">
            Focused
          </span>
          <span className="font-serif text-[15px] font-bold text-ink">
            Viewing only {subjectFocus} — weak topics, revision and today's plan for this subject appear below.
          </span>
        </div>
      )}

      <div className="px-5 py-7 sm:px-8 lg:px-10">
        {/* Header stats ledger */}
        <div className="rise-in grid grid-cols-2 gap-y-6 border-b border-ink/10 pb-7 sm:grid-cols-4">
          <StatCell label="Overall mastery" value={`${overallMastery}%`} sub="weighted, tracked topics" />
          <StatCell
            label="Streak"
            value={`${profile.streakDays}d`}
            sub="longest this term: 11d"
            className="relative"
          />
          <StatCell label="Credits" value={`${credits.balance}`} sub={`+${credits.earnedThisWeek} earned this week`} />
          <StatCell
            label="Adaptive interventions"
            value={`${activeInterventions().filter((i) => i.status === "active").length} active`}
            sub="adjustments in effect"
          />
          <StatCell
            label="Weekly target"
            value="3h 22m"
            sub={`of ${Math.round(profile.weeklyTargetMinutes / 60)}h 00m target`}
          />
        </div>

        {/* ---------- Today → Next ---------- */}
        <section className="mt-8 grid gap-8 border border-ink/12 bg-card lg:grid-cols-[1.1fr_1fr]">
          <div className="border-r border-ink/10 p-6 lg:p-7">
            <div className="flex items-center justify-between">
              <Marginalia amber className="[&::before]:hidden">Today — {todayDateString().split(", ").slice(0, 2).join(", ")}</Marginalia>
              <Link href="/timetable" className="font-display text-xs uppercase tracking-[0.08em] text-teal hover:underline">
                Full plan →
              </Link>
            </div>
            <ol className="mt-4 divide-y divide-ink/10">
              {todaySequence().items
                .filter((it) => (subjectFocus ? it.subjectCode === subjectFocus : true))
                .map((it) => (
                <li key={`${it.kind}-${it.topicId}-${it.number}`} className="rise-in grid grid-cols-[2rem_1fr] gap-4 py-4">
                  <div className="index-num pt-0.5">{String(it.number).padStart(2, "0")}</div>
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="border-l-2 px-1.5 py-0.5 font-mono text-[10.5px] font-medium uppercase tracking-[0.1em] text-teal" style={{ borderLeftColor: "#2b9c8c" }}>
                        {it.kind === "teach-back" ? "Teach back" : it.kind}
                      </span>
                      <span className="font-mono text-[10.5px] uppercase tracking-wider text-ink/50">
                        {subjectNames[it.subjectCode] ?? it.subjectCode}
                      </span>
                    </div>
                    <div className="mt-1.5 font-serif text-[16px] font-bold leading-snug text-ink">{it.topicTitle}</div>
                    <div className="mt-1.5 flex flex-wrap items-center gap-3">
                      <span className="font-mono text-[12px] text-muted-foreground">{it.minutes} min</span>
                      <span className="font-mono text-[12px] text-ink/45">{it.reason}</span>
                    </div>
                  </div>
                </li>
              ))}
            </ol>
          </div>
          <div className="p-6 lg:p-7">
            <Marginalia className="[&::before]:hidden">After today</Marginalia>
            <p className="mt-4 font-serif text-lg font-bold leading-snug text-ink">
              Your next recommended step:
            </p>
            <Link
              href={slugOf({ id: "t-1-types-of-reactions" }) ? `/topic/${slugOf({ id: "t-1-types-of-reactions" })}` : `/topic/t-1-types-of-reactions`}
              className="mt-2 inline-flex items-baseline gap-2 border-b border-teal/50 pb-0.5 font-display text-[20px] font-bold text-teal transition-colors hover:border-teal"
            >
              {todaySequence().afterToday.topicTitle}
              <span className="font-mono text-sm">→</span>
            </Link>
            <p className="mt-2 footnote">{todaySequence().afterToday.reason}</p>
            <div className="mt-3">
              <Link href="/adaptive" className="font-display text-xs uppercase tracking-[0.08em] text-ink/55 hover:text-teal">
                Why this step? SEE WHY →
              </Link>
            </div>
            <Hairline className="mt-5 mb-4" />
            <Marginalia className="[&::before]:hidden">Continue where you left off</Marginalia>
            <ul className="mt-3 space-y-2.5">
              {continuationItems()
                .slice(0, 3)
                .map((c) => (
                  <li key={c.id} className="flex flex-wrap items-baseline justify-between gap-2">
                    <Link href={c.href} className="font-serif text-[14px] font-bold leading-snug text-ink hover:text-teal">
                      {c.title}
                    </Link>
                    <span className="shrink-0 font-mono text-[10.5px] uppercase tracking-[0.12em] text-teal">{c.actionLabel} →</span>
                  </li>
                ))}
            </ul>
            <Link href="/continue" className="mt-3 inline-block border-b border-teal/50 pb-0.5 font-mono text-[12px] uppercase tracking-wider text-teal transition-colors hover:border-teal">
              Continue Learning →
            </Link>
          </div>
        </section>

        <div className="mt-10 grid gap-10 lg:grid-cols-[1.6fr_1fr]">
          {/* ---------- Main column ---------- */}
          <div className="min-w-0 space-y-10">
            {/* Today's learning path */}
            <section>
              <div className="flex flex-wrap items-baseline justify-between gap-3">
                <Marginalia amber>The path — {pathMinutes} min scheduled</Marginalia>
                <Link href="/adaptive" className="font-display text-xs uppercase tracking-[0.08em] text-teal hover:underline">
                  What did Cognify learn about me? →
                </Link>
              </div>
              <div className="mt-5 divide-y divide-ink/10 border-y border-ink/10">
                {todayPath
                  .filter((p) => (subjectFocus ? p.subject === subjectFocus : true))
                  .map((item, i) => (
                  <div key={item.topicId} className="rise-in grid gap-4 py-6 sm:grid-cols-[2.5rem_1fr]">
                    <div className="index-num pt-0.5">{String(i + 1).padStart(2, "0")}</div>
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-mono text-[12px] font-medium uppercase tracking-wider text-ink/50">
                          {subjectNames[item.subject] ?? item.subject}
                        </span>
                        <ActionChip action={item.action} />
                        {item.urgency === "high" && (
                          <span className="font-mono text-[10.5px] font-bold uppercase tracking-[0.08em] text-amber-dark">
                            ● High impact
                          </span>
                        )}
                      </div>
                      <h3 className="mt-1.5 font-display text-[20px] font-bold text-ink">{item.topicTitle}</h3>
                      <div className="mt-2.5 flex items-start gap-2">
                        <span className="mt-1 shrink-0 font-mono text-[12px] font-bold uppercase tracking-[0.12em] text-teal">
                          Why
                        </span>
                        <p className="footnote">{item.reason}</p>
                      </div>
                      <div className="mt-4 flex flex-wrap items-center gap-3">
                        <span className="font-mono text-[14px] text-dark-text/60">
                          {item.minutes} min · timed block
                        </span>
                        <Link
                          href={`/topic/${slugOf({ id: item.topicId })}`}
                          className="border-b border-teal/50 pb-0.5 font-mono text-[14px] uppercase tracking-wider text-teal transition-colors hover:border-teal"
                        >
                          Open in explorer
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Weak topics + revision (two-column ledger) */}
            <section className="grid gap-10 md:grid-cols-2">
              <div>
                <Marginalia amber>Weak & developing topics</Marginalia>
                <ul className="mt-4 space-y-3">
                  {weakTopicsList
                    .filter((w) => (subjectFocus ? w.subject.code === subjectFocus : true))
                    .slice(0, 5)
                    .map((w) => (
                    <>
                    <li key={w.topic.id} className="border-l-2 border-amber/60 pl-3">
                      <Link href={`/topic/${slugOf(w.topic)}`} className="group">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-mono text-[10.5px] font-medium uppercase tracking-wider text-ink/50">
                            {subjectNames[w.subject.code] ?? w.subject.code}
                          </span>
                          <span className="font-mono text-[10.5px] uppercase tracking-wider text-muted-foreground">
                            {w.chapterTitle}
                          </span>
                          <span className="font-mono text-[10.5px] uppercase tracking-wider text-teal opacity-0 transition-opacity group-hover:opacity-100">
                            Open topic →
                          </span>
                        </div>
                      <div className="mt-1 font-serif text-[15px] font-bold leading-snug text-ink">
                        {w.topic.title}
                      </div>
                      <div className="mt-2 flex items-center gap-3">
                        <MasteryBar value={w.topic.mastery} className="max-w-[120px]" />
                        <span className="font-mono text-[14px] font-medium text-amber-dark">
                          {w.topic.mastery}%
                        </span>
                      </div>
                      </Link>
                    </li>
                    </>
                  ))}
                  {weakTopicsList.filter((w) => (subjectFocus ? w.subject.code === subjectFocus : true)).length === 0 && (
                    <li className="footnote">
                      {subjectFocus
                        ? `Nothing flagged weak in ${subjectFocus} right now.`
                        : "Nothing flagged weak right now."}
                    </li>
                  )}
                </ul>
              </div>

              <div>
                <Marginalia>Due for revision</Marginalia>
                <ul className="mt-4 space-y-3">
                  {revisionDueList
                    .filter((r) => (subjectFocus ? r.subject.code === subjectFocus : true))
                    .slice(0, 5)
                    .map((r) => (
                    <>
                    <li key={r.topic.id} className="border-l-2 border-teal/60 pl-3">
                      <Link href={`/topic/${slugOf(r.topic)}`} className="group">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-mono text-[10.5px] font-medium uppercase tracking-wider text-ink/50">
                            {subjectNames[r.subject.code] ?? r.subject.code}
                          </span>
                          <RevisionChip dueInDays={r.topic.revisionDueInDays} status={r.topic.revisionStatus} />
                          <span className="font-mono text-[10.5px] uppercase tracking-wider text-teal opacity-0 transition-opacity group-hover:opacity-100">
                            Open topic →
                          </span>
                        </div>
                      <div className="mt-1 font-serif text-[15px] font-bold leading-snug text-ink">
                        {r.topic.title}
                      </div>
                      <div className="mt-1.5 font-mono text-[14px] text-muted-foreground">
                        Time for a quick refresh
                      </div>
                      </Link>
                    </li>
                    </>
                  ))}
                  {revisionDueList.filter((r) => (subjectFocus ? r.subject.code === subjectFocus : true)).length === 0 && (
                    <li className="footnote">
                      {subjectFocus
                        ? `Nothing due in ${subjectFocus} — your spaced schedule for this subject is clear.`
                        : "Nothing due — your spaced-retention schedule is clear today."}
                    </li>
                  )}
                </ul>
                <a
                  href="/revision"
                  className="mt-3 inline-block border-b border-teal/50 pb-0.5 font-mono text-[12px] uppercase tracking-wider text-teal transition-colors hover:border-teal"
                >
                  Open Revision Hub →
                </a>
              </div>
            </section>

            {/* Recent activity — timeline */}
            <section>
              <Marginalia>Recent learning activity</Marginalia>
              <ol className="mt-4 space-y-0">
                {activity
                  .filter((a) => (subjectFocus ? a.subject === subjectFocus : true))
                  .map((a, i) => (
                  <>
                  <li
                    key={a.id}
                    className="grid grid-cols-[1.5rem_1fr] gap-4 border-l border-ink/10 pb-5 pl-4 last:pb-0"
                  >
                    <div className="relative">
                      <div className="absolute -left-[1.5625rem] top-1.5 h-2 w-2 border border-teal bg-ivory" />
                      <span className="font-mono text-[12px] text-muted-foreground">{a.when}</span>
                    </div>
                    <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                      <div>
                        <span className="font-mono text-[10.5px] font-medium uppercase tracking-wider text-ink/50">
                          {subjectNames[a.subject] ?? a.subject}
                        </span>
                        <span className="ml-2 font-serif text-[15px] font-bold text-ink">{a.topic}</span>
                      </div>
                      <span
                        className={cn(
                          "font-mono text-[14px]",
                          a.result.startsWith("+") ? "text-teal-dark" : "text-muted-foreground"
                        )}
                      >
                        {a.result}
                      </span>
                    </div>
                  </li>
                  </>
                ))}
                {activity.filter((a) => (subjectFocus ? a.subject === subjectFocus : true)).length === 0 && (
                  <li className="footnote">
                    {subjectFocus
                      ? `No recent activity recorded for ${subjectFocus} yet.`
                      : "No recent activity recorded yet."}
                  </li>
                )}
              </ol>
            </section>
          </div>

          {/* ---------- Rail ---------- */}
          <div className="space-y-10">
            {/* Learning DNA preview */}
            <section className="border border-ink/12 bg-card">
              <div className="border-b border-ink/10 px-5 py-4">
                <div className="flex items-center justify-between">
                  <Marginalia className="[&::before]:hidden">Your learning style</Marginalia>
                  <Link href="/profile" className="font-display text-xs uppercase tracking-[0.08em] text-teal hover:underline">
                    Full analysis →
                  </Link>
                </div>
              </div>
              <div className="divide-y divide-ink/8 px-5">
                {dna.insights.slice(0, 3).map((ins) => (
                  <div key={ins.id} className="py-4">
                    <div className="flex items-center justify-between gap-3">
                      <span className="font-mono text-[12px] uppercase tracking-[0.12em] text-ink/60">
                        {ins.dimension}
                      </span>
                      <span className="font-mono text-[12px] text-teal-dark">well-supported</span>
                    </div>
                    <p className="mt-1.5 text-[14px] font-medium leading-relaxed text-ink">{ins.finding}</p>
                    <p className="mt-1 footnote">{ins.implication}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* Streak & peak focus */}
            <section className="grid grid-cols-2 gap-px border border-ink/12 bg-ink/10">
              <div className="bg-card p-5">
                <Flame className="h-4 w-4 text-amber" />
                <div className="mt-2 font-display text-xs uppercase tracking-[0.08em] text-muted-foreground">
                  Current streak
                </div>
                <div className="mt-1 font-display text-3xl font-bold text-ink">{profile.streakDays}d</div>
                <div className="mt-1 font-mono text-[12px] text-teal-dark">Keep the chain unbroken</div>
              </div>
              <div className="bg-card p-5">
                <TrendingUp className="h-4 w-4 text-teal" />
                <div className="mt-2 font-display text-xs uppercase tracking-[0.08em] text-muted-foreground">
                  Peak focus
                </div>
                <div className="mt-1 font-serif text-2xl font-bold text-ink">{dna.peakFocusHour}</div>
                <div className="mt-1 font-mono text-[12px] text-muted-foreground">avg {dna.avgSessionMinutes}m sessions</div>
              </div>
            </section>

            {/* Mistake profile mini-chart */}
            <section className="border border-ink/12 bg-card p-5">
              <div className="marginalia [&::before]:hidden">Learning focus</div>
              <p className="mt-2 footnote">
                We're focusing on building your understanding of core concepts in Proofs and Algebra.
              </p>
              <div className="mt-4 h-36">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={[
                    { name: "Conceptual", value: dna.mistakeProfile.conceptual },
                    { name: "Careless", value: dna.mistakeProfile.careless },
                    { name: "Procedural", value: dna.mistakeProfile.procedural },
                  ]} margin={{ top: 4, right: 0, bottom: 0, left: -28 }}>
                    <CartesianGrid strokeDasharray="2 4" vertical={false} stroke="rgba(16,42,67,0.1)" />
                    <XAxis dataKey="name" tick={{ fontSize: 10, fontFamily: "IBM Plex Mono" }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 10, fontFamily: "IBM Plex Mono" }} axisLine={false} tickLine={false} domain={[0, 60]} />
                    <Tooltip
                      cursor={{ fill: "rgba(16,42,67,0.04)" }}
                      contentStyle={{ background: "#F7F5EF", border: "1px solid rgba(16,42,67,0.15)", borderRadius: 2, fontSize: 12 }}
                    />
                    <Bar dataKey="value" radius={[2, 2, 0, 0]}>
                      <Cell fill="#2b9c8c" />
                      <Cell fill="#d9912f" />
                      <Cell fill="#132b3b" />
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </section>

            {/* Timetable today */}
            <section className="border border-ink/12 bg-card">
              <div className="border-b border-ink/10 px-5 py-4">
                <div className="flex items-center justify-between">
                  <Marginalia className="[&::before]:hidden">Timetable — today</Marginalia>
                  <Link href="/timetable" className="font-display text-xs uppercase tracking-[0.08em] text-teal hover:underline">
                    Full plan →
                  </Link>
                </div>
              </div>
              <div className="divide-y divide-ink/8 px-5">
                {timetableSessions()
                  .filter((s) => s.period === "today" && s.status === "scheduled")
                  .slice(0, 3)
                  .map((s) => (
                    <div key={s.id} className="py-3.5">
                      <div className="flex items-baseline justify-between gap-2">
                        <span className="font-mono text-[12px] font-medium uppercase tracking-wider text-ink/50">
                          {subjectNames[s.subjectCode] ?? s.subjectCode}
                        </span>
                        <span className="font-mono text-[12px] text-muted-foreground">
                          {s.startTime} · {s.durationMinutes}m
                        </span>
                      </div>
                      <div className="mt-1 flex items-baseline justify-between gap-2">
                        <span className="text-[14px] font-semibold leading-snug text-ink">{s.topicTitle}</span>
                        {s.priority === "high" && (
                          <span className="shrink-0 font-mono text-[10.5px] font-bold uppercase tracking-[0.08em] text-amber-dark">High</span>
                        )}
                      </div>
                    </div>
                  ))}
                {todaySessionCount() === 0 && (
                  <p className="py-3.5 footnote">Today's plan is clear.</p>
                )}
              </div>
            </section>

            {/* Active interventions */}
            <section className="border border-ink/12 bg-card">
              <div className="border-b border-ink/10 px-5 py-4">
                <div className="flex items-center justify-between">
                  <Marginalia className="[&::before]:hidden">Engine is watching</Marginalia>
                  <Link href="/adaptive" className="font-display text-xs uppercase tracking-[0.08em] text-teal hover:underline">
                    Adaptive Lab →
                  </Link>
                </div>
              </div>
              <div className="px-5 py-4">
                {(() => {
                  const iv = featuredIntervention();
                  return (
                    <>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[12px] font-bold uppercase tracking-[0.12em] text-amber-dark">
                          ● {iv.label}
                        </span>
                      </div>
                      <p className="mt-1.5 footnote">{iv.action}</p>
                      <p className="mt-1 font-mono text-[12px] uppercase tracking-wider text-muted-foreground">
                        Evidence {iv.evidenceStrength}% · {iv.sessionsObserved} sessions observed
                      </p>
                    </>
                  );
                })()}
              </div>
            </section>

            {/* Calibration */}
            <section className="border border-ink/12 bg-card p-5">
              <div className="flex items-center justify-between">
                <Marginalia className="[&::before]:hidden">Confidence check</Marginalia>
                <Link href="/confidence" className="font-display text-xs uppercase tracking-[0.08em] text-teal hover:underline">
                  Calibration →
                </Link>
              </div>
              <div className="mt-3 flex items-baseline justify-between">
                <span className="font-mono text-[12px] uppercase tracking-wider text-ink/60">Avg self vs measured gap</span>
                <span className="font-display text-[26px] font-bold text-amber-dark">{calibrationSummary().avgGap} pts</span>
              </div>
              <p className="mt-2 footnote">{calibrationSummary().dnaNote}</p>
            </section>

            {/* Peer network */}
            <section className="border border-ink/12 bg-card p-5">
              <div className="flex items-center justify-between">
                <Marginalia className="[&::before]:hidden">Study group</Marginalia>
                <Link href="/community" className="font-display text-xs uppercase tracking-[0.08em] text-teal hover:underline">
                  Community →
                </Link>
              </div>
              <p className="mt-2 footnote">
                {openTeachRequests().length} open teach requests in your group · {myGroup().memberCount} members
              </p>
              <a
                href="/teach"
                className="mt-2 inline-block border-b border-teal/50 pb-0.5 font-mono text-[12px] uppercase tracking-wider text-teal transition-colors hover:border-teal"
              >
                Teach Cognify →
              </a>
            </section>

            {/* Current goals */}
            <section>
              <div className="flex items-center justify-between">
                <Marginalia>Current goals</Marginalia>
                <Link href="/goals" className="font-display text-xs uppercase tracking-[0.08em] text-teal hover:underline">
                  All goals →
                </Link>
              </div>
              <ul className="mt-4 space-y-4">
                {goalsList.map((g) => (
                  <li key={g.id}>
                    <div className="flex items-baseline justify-between gap-3">
                      <span className="font-serif text-[14px] font-bold text-ink">{g.title}</span>
                      <span className="font-mono text-[14px] text-teal-dark">{g.progress}%</span>
                    </div>
                    <MasteryBar value={g.progress} className="mt-2" />
                    <div className="mt-1 font-mono text-[12px] uppercase tracking-wider text-muted-foreground">
                      Due {g.dueDate}
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          </div>
        </div>
      </div>
    </AppShell>
  );
}

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return "morning";
  if (h < 17) return "afternoon";
  return "evening";
}

/** The ONE thing to do right now — surfaces before every other ledger so
 *  the Command Center answers "what should I do today?" in a glance. */
function PrimaryActionBanner({ item }: { item: NonNullable<ReturnType<typeof todaySequence>["items"]>[number] }) {
  const href = `/topic/${slugOf({ id: item.topicId })}`;
  return (
    <Link
      href={href}
      className="rise-in mt-6 flex flex-wrap items-center justify-between gap-4 border-l-4 border-amber bg-amber/5 px-5 py-4 transition-colors hover:bg-amber/10 sm:px-6"
    >
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-mono text-[12px] font-bold uppercase tracking-[0.08em] text-amber-dark">
            Start with this
          </span>
          <span className="font-mono text-[10.5px] uppercase tracking-wider text-ink/50">
            {subjectNames[item.subjectCode] ?? item.subjectCode} · {item.minutes} min
          </span>
        </div>
        <div className="mt-1 font-serif text-lg font-bold leading-snug text-ink sm:text-xl">
          {item.topicTitle}
        </div>
        <div className="mt-1 max-w-xl truncate font-mono text-[14px] text-ink/60">
          {item.reason}
        </div>
      </div>
      <span className="shrink-0 font-mono text-[14px] uppercase tracking-[0.08em] text-teal-dark">
        Begin →
      </span>
    </Link>
  );
}
