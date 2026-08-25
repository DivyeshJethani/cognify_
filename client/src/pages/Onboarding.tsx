/**
 * COGNIFY — Student onboarding
 * Four numbered steps: Board → Class → Subjects → Learning goals.
 * Full school curriculum coverage; editorial stepper with hairline progress.
 */
import { Button } from "@/components/ui/button";
import { PublicLayout } from "@/components/cognify/PublicLayout";
import { useApp } from "@/contexts/AppContext";
import { boards, findSubject } from "@/lib/mockData";
import { cn } from "@/lib/utils";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";
import { useEffect, useState } from "react";
import { useLocation } from "wouter";

const steps = ["Board", "Class", "Subjects", "Learning goals"];

const goalOptions = [
  {
    id: "mastery",
    title: "Deep mastery",
    desc: "Understand every topic properly — build for exams and beyond.",
  },
  {
    id: "boards",
    title: "Board exam readiness",
    desc: "Focus on your syllabus and practice with past papers to be fully prepared.",
  },
  {
    id: "conceptual",
    title: "Conceptual clarity",
    desc: "Strengthen your basics and build a solid understanding of every concept.",
  },
  {
    id: "confidence",
    title: "Confidence & consistency",
    desc: "Build a daily rhythm, a streak and belief that the work compounds.",
  },
];

export default function Onboarding() {
  const { auth, onboarding, setOnboarding, completeOnboarding } = useApp();
  const [, navigate] = useLocation();
  const [step, setStep] = useState(0);
  const [selectedGoals, setSelectedGoals] = useState<string[]>([]);
  const [goalText, setGoalText] = useState("");

  useEffect(() => {
    if (auth.kind === "logged-out") navigate("/signup");
  }, [auth, navigate]);

  const board = boards.find((b) => b.id === onboarding.boardId);
  const cls = board?.classes.find((c) => c.id === onboarding.classId);

  const boardDone = !!onboarding.boardId;
  const classDone = !!onboarding.classId;
  const subjectsDone = onboarding.subjectIds.length > 0;
  const goalsDone = selectedGoals.length > 0 || goalText.trim().length > 0;
  const canAdvance = [boardDone, classDone, subjectsDone, goalsDone][step];

  const next = () => {
    if (step === steps.length - 1) {
      const goalLabel = selectedGoals
        .map((g) => goalOptions.find((o) => o.id === g)?.title)
        .filter(Boolean)
        .join(" · ");
      setOnboarding({ learningGoal: goalText.trim() || goalLabel });
      completeOnboarding();
      navigate("/today");
    } else {
      setStep(step + 1);
    }
  };

  if (auth.kind === "logged-out") return null;

  return (
    <PublicLayout>
      <div className="mx-auto max-w-3xl px-6 py-14 sm:px-8">
        {/* Stepper */}
        <div className="flex items-center gap-0">
          {steps.map((s, i) => (
            <div key={s} className="flex flex-1 items-center">
              <div className="flex flex-col items-center gap-2">
                <div
                  className={cn(
                    "flex h-9 w-9 items-center justify-center border font-mono text-xs transition-colors duration-300",
                    i < step
                      ? "border-teal bg-teal text-white"
                      : i === step
                        ? "border-ink bg-ink text-ivory"
                        : "border-ink/20 bg-card text-muted-foreground"
                  )}
                >
                  {i < step ? <Check className="h-4 w-4" /> : <span>{String(i + 1).padStart(2, "0")}</span>}
                </div>
                <span
                  className={cn(
                    "font-mono text-[9px] uppercase tracking-[0.08em]",
                    i <= step ? "text-ink" : "text-muted-foreground"
                  )}
                >
                  {s}
                </span>
              </div>
              {i < steps.length - 1 && (
                <div className={cn("mb-6 ml-2 h-px flex-1", i < step ? "bg-teal" : "bg-ink/12")} />
              )}
            </div>
          ))}
        </div>

        <div className="hairline mt-2" />

        <div className="rise-in mt-10 min-h-[340px]">
          {/* Step 1: Board */}
          {step === 0 && (
            <div>
              <div className="marginalia">Setup — step 1 of 4</div>
              <h1 className="mt-3 font-display text-3xl font-bold text-ink">Which board do you study under?</h1>
              <p className="mt-2 text-[14px] text-dark-text/70">COGNIFY supports the complete school curriculum.</p>
              <div className="mt-8 grid gap-3 sm:grid-cols-3">
                {boards.map((b) => {
                  const active = onboarding.boardId === b.id;
                  return (
                    <button
                      key={b.id}
                      onClick={() => {
                        setOnboarding({ boardId: b.id, classId: null, subjectIds: [] });
                      }}
                      className={cn(
                        "border p-5 text-left transition-all duration-150 active:scale-[0.98]",
                        active ? "border-teal bg-teal/5 shadow-[4px_4px_0_0_rgba(31,157,139,0.15)]" : "border-ink/15 bg-card hover:border-ink/35"
                      )}
                    >
                      <div className="font-display text-[20px] font-bold text-ink">{b.name}</div>
                      <div className="mt-1 font-mono text-[14px] uppercase tracking-wider text-muted-foreground">
                        {b.classes.length} classes mapped · {b.classes.reduce((n, c) => n + c.subjects.length, 0)} subjects
                      </div>
                    </button>
                  );
                })}
              </div>
              <p className="mt-4 footnote">More boards and curricula are added continuously.</p>
            </div>
          )}

          {/* Step 2: Class */}
          {step === 1 && board && (
            <div>
              <div className="marginalia">Setup — step 2 of 4</div>
              <h1 className="mt-3 font-display text-3xl font-bold text-ink">Which class are you in?</h1>
              <p className="mt-2 text-[14px] text-dark-text/70">
                {board.name} — pick the class that matches your current year.
              </p>
              <div className="mt-8 grid gap-3 sm:grid-cols-3">
                {board.classes.map((c) => {
                  const active = onboarding.classId === c.id;
                  return (
                    <button
                      key={c.id}
                      onClick={() => {
                        setOnboarding({ classId: c.id, subjectIds: [] });
                      }}
                      className={cn(
                        "border p-5 text-left transition-all duration-150 active:scale-[0.98]",
                        active ? "border-teal bg-teal/5 shadow-[4px_4px_0_0_rgba(31,157,139,0.15)]" : "border-ink/15 bg-card hover:border-ink/35"
                      )}
                    >
                      <div className="font-display text-[20px] font-bold text-ink">{c.name}</div>
                      <div className="mt-1 font-mono text-[14px] uppercase tracking-wider text-muted-foreground">
                        {c.subjects.length} subjects · full chapter mapping
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Step 3: Subjects */}
          {step === 2 && board && cls && (
            <div>
              <div className="marginalia">Setup — step 3 of 4</div>
              <h1 className="mt-3 font-display text-3xl font-bold text-ink">Choose your subjects.</h1>
              <p className="mt-2 text-[14px] text-dark-text/70">
                {board.name} · {cls.name} — select all that apply. You can change this later.
              </p>
              <div className="mt-8 grid gap-3 sm:grid-cols-2">
                {cls.subjects.map((s) => {
                  const active = onboarding.subjectIds.includes(s.id);
                  return (
                    <button
                      key={s.id}
                      onClick={() => {
                        setOnboarding({
                          subjectIds: active
                            ? onboarding.subjectIds.filter((id) => id !== s.id)
                            : [...onboarding.subjectIds, s.id],
                        });
                      }}
                      className={cn(
                        "flex items-center gap-4 border p-4 text-left transition-all duration-150 active:scale-[0.98]",
                        active ? "border-teal bg-teal/5" : "border-ink/15 bg-card hover:border-ink/35"
                      )}
                    >
                      <div
                        className={cn(
                          "flex h-8 w-8 shrink-0 items-center justify-center border font-mono text-[12px] font-bold",
                          active ? "border-teal bg-teal text-white" : "border-ink/25 text-ink/60"
                        )}
                      >
                        {s.code}
                      </div>
                      <div>
                        <div className="font-serif text-lg font-bold text-ink">{s.name}</div>
                        <div className="font-mono text-[12px] uppercase tracking-wider text-muted-foreground">
                          {s.chapters.length} chapters · {s.chapters.reduce((n, c) => n + c.topics.length, 0)} topics
                        </div>
                      </div>
                      {active && <Check className="ml-auto h-4 w-4 text-teal" />}
                    </button>
                  );
                })}
              </div>
              <p className="mt-4 footnote">
                We've mapped out the entire curriculum for these subjects to guide you step-by-step.
              </p>
            </div>
          )}

          {/* Step 4: Goals */}
          {step === 3 && (
            <div>
              <div className="marginalia">Setup — step 4 of 4</div>
              <h1 className="mt-3 font-display text-3xl font-bold text-ink">What are you working towards?</h1>
              <p className="mt-2 text-[14px] text-dark-text/70">Choose what you want to achieve — we'll tailor your experience to match.</p>
              <div className="mt-8 grid gap-3 sm:grid-cols-2">
                {goalOptions.map((g) => {
                  const active = selectedGoals.includes(g.id);
                  return (
                    <button
                      key={g.id}
                      onClick={() => {
                        setSelectedGoals(
                          active
                            ? selectedGoals.filter((x) => x !== g.id)
                            : [...selectedGoals, g.id]
                        );
                      }}
                      className={cn(
                        "border p-5 text-left transition-all duration-150 active:scale-[0.98]",
                        active ? "border-teal bg-teal/5 shadow-[4px_4px_0_0_rgba(31,157,139,0.15)]" : "border-ink/15 bg-card hover:border-ink/35"
                      )}
                    >
                      <div className="flex items-center justify-between">
                        <div className="font-serif text-lg font-bold text-ink">{g.title}</div>
                        {active && <Check className="h-4 w-4 text-teal" />}
                      </div>
                      <div className="mt-1.5 text-[14px] leading-relaxed text-dark-text/70">{g.desc}</div>
                    </button>
                  );
                })}
              </div>
              <div className="mt-6">
                <label className="font-display text-xs uppercase tracking-[0.08em] text-muted-foreground" htmlFor="own-goal">
                  Or write your own goal <span className="text-ink/30">(optional)</span>
                </label>
                <input
                  id="own-goal"
                  value={goalText}
                  onChange={(e) => setGoalText(e.target.value)}
                  placeholder="e.g. Score 95% in Mathematics without cramming"
                  className="mt-2 w-full border border-ink/20 bg-card px-4 py-3 font-sans text-[14px] outline-none transition-colors focus:border-teal"
                />
              </div>
            </div>
          )}
        </div>

        {/* Controls */}
        <div className="mt-12 flex items-center justify-between border-t border-ink/10 pt-6">
          <button
            onClick={() => (step > 0 ? setStep(step - 1) : navigate("/signup"))}
            className="inline-flex items-center gap-2 font-mono text-[14px] uppercase tracking-[0.08em] text-muted-foreground transition-colors hover:text-ink"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Back
          </button>
          <Button
            onClick={next}
            disabled={!canAdvance}
            className="h-11 bg-ink px-6 text-[14px] text-ivory hover:bg-ink/90 disabled:opacity-40"
          >
            {step === steps.length - 1 ? (
              <>Open my study space <ArrowRight className="ml-1.5 h-4 w-4" /></>
            ) : (
              <>Continue <ArrowRight className="ml-1.5 h-3.5 w-3.5" /></>
            )}
          </Button>
        </div>
      </div>
    </PublicLayout>
  );
}
