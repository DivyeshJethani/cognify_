/**
 * COGNIFY — Practice (Day 10 core feature)
 *
 * Style: Scholar's Atelier — ivory ground, deep ink text, teal actions,
 * Manrope headings, generous whitespace. One screen, three doors:
 * QUICK QUIZ / TOPIC PRACTICE / SHORT TEST.
 *
 * Practice is the evidence engine of the product: questions come from the
 * real curriculum retrieval banks, results are recorded silently (the
 * intelligence layer reads them behind the scenes — nothing here shows a
 * Learning DNA readout). Feedback is plain and human.
 */
import AppShell, { PageHeader } from "@/components/cognify/AppShell";
import { Button } from "@/components/ui/button";
import { useApp } from "@/contexts/AppContext";
import { retrievalQuestionsFor } from "@/lib/learningSessionFlow";
import {
  getPracticeResults,
  questionsForTopic,
  recordPractice,
  scoreLabel,
  verdictFor,
  type PracticeAttempt,
} from "@/lib/practice";
import { topicAlias } from "@/lib/curriculum";
import { classSubjects, getStudyContext, onContextChange } from "@/lib/studyContext";
import { cn } from "@/lib/utils";
import { PenLine, RefreshCw, Target, Timer } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link, useSearch } from "wouter";

type Mode = "home" | "quick" | "topic" | "test";

const SUBJECT_NAME: Record<string, string> = {
  math: "Mathematics",
  science: "Science",
  social: "Social Science",
  english: "English",
  hindi: "Hindi",
  sanskrit: "Sanskrit",
};

const QUICK_BANK_KEYS = [
  { id: "r-yt-factorisation-concept", title: "Polynomials — factorisation", subject: "math" },
  { id: "r-khan-reactions", title: "Reactions & equations", subject: "science" },
  { id: "r-yt-wwi-nationalism", title: "Nationalism in India", subject: "social" },
  { id: "r-khan-nutrition", title: "Nutrition in humans", subject: "science" },
];

function pickTopicPracticeIds(): { topicId: string; title: string; subjectId: string }[] {
  const ctx = getStudyContext();
  return classSubjects(ctx.boardId, ctx.classId)
    .flatMap((s) =>
      (s.chapters ?? []).flatMap((c) =>
        (c.topics ?? []).map((t) => ({ topicId: t.id, title: t.title, subjectId: s.id }))
      )
    )
    .slice(0, 8);
}

export default function Practice() {
  const { profile } = useApp();
  const [, rerender] = useState(0);
  useEffect(() => onContextChange(() => rerender((n) => n + 1)), []);
  const search = useSearch();

  const [mode, setMode] = useState<Mode>("home");
  const [bankId, setBankId] = useState<string | null>(null);
  const [topicPick, setTopicPick] = useState<{ topicId: string; title: string; subjectId: string } | null>(null);
  const [attempt, setAttempt] = useState<PracticeAttempt | null>(null);
  const [index, setIndex] = useState(0);
  const [done, setDone] = useState(false);
  const [results] = useState(() => getPracticeResults());

  /* /practice?topic={id} → jump straight into topic practice */
  useEffect(() => {
    const q = new URLSearchParams(search).get("topic");
    if (q && !topicPick && !attempt) {
      const picks = pickTopicPracticeIds();
      // q may be a canonical id (t-0-…) or a display slug (nature-of-roots-…)
      const canonical = picks.find((p) => p.topicId === q);
      const byAlias = canonical ?? picks.find((p) => topicAlias(p.topicId) === q);
      if (byAlias) {
        setTopicPick(byAlias);
        setMode("topic");
      }
    }
  }, [search]);

  useEffect(() => {
    if (mode !== "home" && !attempt) {
      setAttempt({
        kind: mode === "quick" ? "quick" : mode === "test" ? "short-test" : "topic",
        title: attemptTitle,
        topicId: topicPick?.topicId,
        answers: [],
        startedAt: new Date().toISOString(),
      });
    }
  }, [mode]);

  const attemptCorrect = attempt?.answers.filter((a) => a.correct).length ?? 0;
  const attemptAnswered = attempt?.answers.length ?? 0;

  const questions = useMemo(() => {
    if (mode === "quick" && bankId) return retrievalQuestionsFor(bankId);
    if (mode === "topic" && topicPick) return questionsForTopic(topicPick.topicId).slice(0, 5);
    if (mode === "test") {
      const ids = QUICK_BANK_KEYS.slice(0, 2).map((k) => retrievalQuestionsFor(k.id).slice(0, 5));
      return ids.flat();
    }
    return [];
  }, [mode, bankId, topicPick]);

  const attemptTitle =
    mode === "quick"
      ? QUICK_BANK_KEYS.find((k) => k.id === bankId)?.title ?? "Quick Quiz"
      : mode === "topic"
        ? topicPick?.title ?? "Topic Practice"
        : "Short Test — 2 topics";

  const answered = attempt?.answers ?? [];
  const current = questions[index];
  const chosen = answered.find((a) => a.questionId === current?.id);

  /* ----------------------------- home ----------------------------- */
  if (mode === "home") {
    return (
      <AppShell>
        <PageHeader
          title="Show what you know."
          subtitle="Short, focused quizzes built from your curriculum. Each quiz helps us personalize your learning journey."
        />
        <div className="mx-auto max-w-3xl px-5 py-8 sm:px-8">
          <div className="rise-in grid gap-4 sm:grid-cols-3">
            <button
              onClick={() => {
                setMode("quick");
                setBankId(QUICK_BANK_KEYS[Math.floor(Math.random() * QUICK_BANK_KEYS.length)].id);
              }}
              className="group border border-teal/40 bg-teal/[0.04] p-6 text-left transition-colors hover:border-teal"
            >
              <Timer className="h-5 w-5 text-teal" />
              <h3 className="mt-3 font-display text-lg font-bold text-ink">Quick Quiz</h3>
              <p className="mt-1 text-[14px] leading-relaxed text-ink/65">
                5 questions, one topic. Under 10 minutes.
              </p>
              <span className="mt-4 inline-block font-mono text-[12px] uppercase tracking-wider text-teal">
                Start →
              </span>
            </button>
            <button
              onClick={() => {
                setMode("topic");
              }}
              className="group border border-ink/12 bg-card p-6 text-left transition-colors hover:border-teal"
            >
              <Target className="h-5 w-5 text-teal" />
              <h3 className="mt-3 font-display text-lg font-bold text-ink">Topic Practice</h3>
              <p className="mt-1 text-[14px] leading-relaxed text-ink/65">
                Pick a topic from your class and drill it.
              </p>
              <span className="mt-4 inline-block font-mono text-[12px] uppercase tracking-wider text-teal">
                Choose topic →
              </span>
            </button>
            <button
              onClick={() => {
                setMode("test");
              }}
              className="group border border-ink/12 bg-card p-6 text-left transition-colors hover:border-teal"
            >
              <PenLine className="h-5 w-5 text-teal" />
              <h3 className="mt-3 font-display text-lg font-bold text-ink">Short Test</h3>
              <p className="mt-1 text-[14px] leading-relaxed text-ink/65">
                10 questions across two topics. Board-style.
              </p>
              <span className="mt-4 inline-block font-mono text-[12px] uppercase tracking-wider text-teal">
                Begin →
              </span>
            </button>
          </div>

          {results.length > 0 && (
            <div className="rise-in mt-8 border-t border-ink/10 pt-6" style={{ animationDelay: "80ms" }}>
              <span className="font-display text-sm font-bold uppercase tracking-[0.08em] text-ink">
                Your recent attempts
              </span>
              <ul className="mt-3 divide-y divide-ink/8">
                {results.slice(0, 4).map((r) => (
                  <li key={r.id} className="flex items-center justify-between py-2.5">
                    <span className="font-display text-[15px] text-ink">{r.title}</span>
                    <span className="font-mono text-[13px] text-ink/50">{scoreLabel(r.correct, r.answered)}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </AppShell>
    );
  }

  /* -------------------------- topic picker -------------------------- */
  if (mode === "topic" && !topicPick) {
    const picks = pickTopicPracticeIds();
    return (
      <AppShell>
        <PageHeader title="Pick a topic to drill." />
        <div className="mx-auto max-w-2xl px-5 py-6 sm:px-8">
          <div className="rise-in grid gap-2">
            {picks.map((p) => (
              <button
                key={p.topicId}
                onClick={() => {
                  setTopicPick(p);
                }}
                className="flex items-center justify-between border border-ink/12 bg-card px-4 py-3 text-left transition-colors hover:border-teal"
              >
                <span className="font-display text-[15px] text-ink">{p.title}</span>
                <span className="font-mono text-[11px] uppercase tracking-wider text-ink/40">
                  {SUBJECT_NAME[p.subjectId] ?? p.subjectId}
                </span>
              </button>
            ))}
          </div>
        </div>
      </AppShell>
    );
  }

  /* -------------------------- quiz runner --------------------------- */
  if (!attempt) {
    return (
      <AppShell>
        <PageHeader title="Starting your quiz…" />
      </AppShell>
    );
  }
  if (!current) {
    return (
      <AppShell>
        <PageHeader title="No questions available." />
      </AppShell>
    );
  }

  if (!done) {
    return (
      <AppShell>
        <div className="mx-auto max-w-2xl px-5 py-10 sm:px-8">
          <div className="mb-6 flex items-center justify-between">
            <span className="font-display text-sm font-bold uppercase tracking-[0.08em] text-teal">
              {attemptTitle}
            </span>
            <span className="font-mono text-[13px] text-ink/45">
              {index + 1} / {questions.length}
            </span>
          </div>
          <div className="h-1 w-full bg-ink/8">
            <div className="h-full bg-teal transition-all duration-300" style={{ width: `${((index + (chosen ? 1 : 0)) / questions.length) * 100}%` }} />
          </div>
          <div className="rise-in mt-8 border border-ink/12 bg-card p-6 sm:p-8">
            <h2 className="font-display text-[20px] font-bold leading-snug text-ink">{current.question}</h2>
            <div className="mt-5 space-y-2.5">
              {current.options.map((opt, oi) => {
                const isChosen = chosen?.chosenIndex === oi;
                return (
                  <button
                    key={oi}
                    disabled={!!chosen}
                    onClick={() => {
                      const ans = {
                        questionId: current.id,
                        chosenIndex: oi,
                        correct: oi === current.correctIndex,
                      };
                      const next = { ...attempt, answers: [...attempt.answers, ans] };
                      setAttempt(next);
                      recordPractice(next);
                      setTimeout(() => {
                        if (index + 1 >= questions.length) setDone(true);
                        else setIndex(index + 1);
                      }, 350);
                    }}
                    className={cn(
                      "w-full border px-4 py-3 text-left text-[15px] transition-colors duration-150",
                      isChosen
                        ? chosen.correct
                          ? "border-green/60 bg-green/10 text-ink"
                          : "border-amber/60 bg-amber/10 text-ink"
                        : chosen
                          ? oi === current.correctIndex
                            ? "border-green/60 bg-green/10 text-ink"
                            : "border-ink/12 bg-card text-ink/50"
                          : "border-ink/20 bg-card text-ink hover:border-teal"
                    )}
                  >
                    <span className="font-mono text-[12px] uppercase tracking-wider text-ink/45">
                      {String.fromCharCode(65 + oi)}.{" "}
                    </span>
                    {opt}
                  </button>
                );
              })}
            </div>
            {chosen && (
              <p className="mt-4 border-t border-ink/8 pt-3 text-[14px] leading-relaxed text-ink/70">
                {current.explanation}
              </p>
            )}
          </div>
        </div>
      </AppShell>
    );
  }

  /* ----------------------------- result ----------------------------- */
  if (!attempt) return null;
  const verdict = verdictFor(attempt);
  return (
    <AppShell>
      <div className="mx-auto max-w-2xl px-5 py-10 sm:px-8">
        <div className="rise-in border border-ink/12 bg-card p-8 sm:p-10">
          <div className="flex items-center justify-between">
            <span className="font-display text-sm font-bold uppercase tracking-[0.08em] text-teal">
              {attemptTitle}
            </span>
              <span className="font-mono text-2xl font-bold text-ink">{scoreLabel(attemptCorrect, attemptAnswered)}</span>
          </div>
            <h2 className={cn(
            "mt-5 font-display text-2xl font-bold text-ink",
            verdict.tone === "celebrate" && "text-green-dark",
            verdict.tone === "retry" && "text-amber-dark",
          )}>
            {verdict.headline}
          </h2>
          <p className="mt-2 max-w-lg text-[15px] leading-relaxed text-ink/70">{verdict.detail}</p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Button
              onClick={() => {
                setMode("home");
                setTopicPick(null);
                setBankId(null);
                setAttempt(null);
                setIndex(0);
                setDone(false);
              }}
              variant="outline"
              className="h-11 border-ink/25 bg-transparent text-ink hover:bg-ink/5"
            >
              <RefreshCw className="mr-1.5 h-4 w-4" /> Back to Practice
            </Button>
            <Button
              asChild
              className="h-11 bg-teal text-white hover:bg-teal-dark"
            >
              <Link href="/teach">
                Teach it back <PenLine className="ml-1.5 h-4 w-4" />
              </Link>
            </Button>
          </div>
            <p className="mt-6 font-mono text-[11.5px] uppercase tracking-wider text-ink/40">
            Quiz complete! We've updated your learning path based on your results.
          </p>
        </div>
      </div>
    </AppShell>
  );
}

