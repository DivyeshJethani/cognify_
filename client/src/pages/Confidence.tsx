/**
 * COGNIFY — Confidence Calibration (Day 4)
 * Self-reported confidence vs measured performance.
 * Overestimate → checks added. Underestimate → promoted early.
 *
 * Style: Scholar's Atelier — ledger, marginalia, mono stats, hairline rules.
 */
import AppShell, { PageHeader } from "@/components/cognify/AppShell";
import {
  ActionChip,
  Marginalia,
  MasteryBar,
  StatCell,
} from "@/components/cognify/Primitives";
import { Button } from "@/components/ui/button";
import { confidenceReadings, calibrationSummary } from "@/lib/confidence";
import { topicAlias } from "@/lib/curriculum";
import { AlertTriangle, ArrowRight, Gauge, ShieldCheck, TrendingDown } from "lucide-react";
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Link } from "wouter";

const slugOf = (id: string) => topicAlias(id) ?? id;

export default function Confidence() {
  const readings = confidenceReadings();
  const summary = calibrationSummary();

  const verdictMeta: Record<string, { icon: typeof Gauge; tone: string; label: string }> = {
    overestimating: { icon: AlertTriangle, tone: "#d9912f", label: "Overestimating" },
    underestimating: { icon: TrendingDown, tone: "#2b9c8c", label: "Underestimating" },
    calibrated: { icon: ShieldCheck, tone: "#132b3b", label: "Calibrated" },
  };

  const chartData = readings
    .slice()
    .reverse()
    .map((r, i) => ({
      name: r.topicTitle.length > 22 ? r.topicTitle.slice(0, 22) + "…" : r.topicTitle,
      self: r.selfReported,
      actual: r.actualPerformance,
    }));

  return (
    <AppShell>
      <PageHeader
        title="What you believe vs what you can do"
        subtitle="After significant sessions, Cognify asks how confident you feel — then compares that against measured performance. Sustained gaps change how the engine treats your self-report."
        actions={
          <Button
            asChild
            variant="outline"
            className="border-ink/25 bg-transparent text-ink hover:bg-ink/5"
          >
            <Link href="/mistakes">
              Mistake analysis <ArrowRight className="ml-1 h-3.5 w-3.5" />
            </Link>
          </Button>
        }
      />

      <div className="px-5 py-7 sm:px-8 lg:px-10">
        {/* Stats ledger */}
        <div className="rise-in grid grid-cols-2 gap-y-6 border-b border-ink/10 pb-7 sm:grid-cols-3">
          <StatCell
            label="Average confidence gap"
            value={`+${summary.avgGap} pts`}
            sub="self-report minus measured"
          />
          <StatCell
            label="Overestimating"
            value={`${summary.overCount} / ${summary.total}`}
            sub="readings on file"
          />
          <StatCell
            label="Calibration status"
            value={summary.avgGap > 10 ? "Flagged" : summary.avgGap < -10 ? "Underselling" : "Healthy"}
            sub="across recorded topics"
          />
        </div>

        <div className="mt-10 grid gap-10 lg:grid-cols-[1.6fr_1fr]">
          {/* ---------- Main column ---------- */}
          <div className="min-w-0 space-y-10">
            {/* Chart */}
            <section className="border border-ink/12 bg-card p-5">
              <div className="marginalia [&::before]:hidden">Calibration readings — self vs measured</div>
              <div className="mt-4 h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData} margin={{ top: 8, right: 8, bottom: 24, left: -20 }}>
                    <CartesianGrid strokeDasharray="2 4" vertical={false} stroke="rgba(16,42,67,0.1)" />
                    <XAxis
                      dataKey="name"
                      tick={{ fontSize: 10, fontFamily: "IBM Plex Mono" }}
                      axisLine={false}
                      tickLine={false}
                      angle={-20}
                      textAnchor="end"
                      height={48}
                    />
                    <YAxis
                      tick={{ fontSize: 10, fontFamily: "IBM Plex Mono" }}
                      axisLine={false}
                      tickLine={false}
                      domain={[0, 100]}
                    />
                    <Tooltip
                      cursor={{ stroke: "rgba(16,42,67,0.15)" }}
                      contentStyle={{
                        background: "#fdfbf5",
                        border: "1px solid rgba(16,42,67,0.2)",
                        borderRadius: 0,
                        fontFamily: "IBM Plex Mono",
                        fontSize: 11,
                      }}
                    />
                    <Legend
                      wrapperStyle={{ fontFamily: "IBM Plex Mono", fontSize: 10, textTransform: "uppercase", letterSpacing: "0.1em" }}
                      iconType="plainline"
                    />
                    <Line
                      type="monotone"
                      dataKey="self"
                      name="Self-reported"
                      stroke="#d9912f"
                      strokeWidth={1.5}
                      dot={{ r: 3, fill: "#d9912f" }}
                    />
                    <Line
                      type="monotone"
                      dataKey="actual"
                      name="Measured"
                      stroke="#2b9c8c"
                      strokeWidth={1.5}
                      dot={{ r: 3, fill: "#2b9c8c" }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </section>

            {/* Readings ledger */}
            <section>
              <Marginalia amber>Calibration readings — one per significant session</Marginalia>
              <div className="mt-5 divide-y divide-ink/10 border-y border-ink/10">
                {readings.map((r, i) => {
                  const meta = verdictMeta[r.verdict];
                  const Icon = meta.icon;
                  return (
                    <div key={r.topicId} className="rise-in grid gap-4 py-6 sm:grid-cols-[2.5rem_1fr]">
                      <div className="index-num pt-0.5">{String(i + 1).padStart(2, "0")}</div>
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-mono text-[12px] font-medium uppercase tracking-wider text-ink/50">
                            {r.subjectCode}
                          </span>
                          <span
                            className="inline-flex items-center gap-1 border px-1.5 py-0.5 font-mono text-[9px] font-medium uppercase tracking-wider"
                            style={{ borderColor: meta.tone, color: meta.tone }}
                          >
                            <Icon className="h-3 w-3" /> {meta.label}
                          </span>
                          <span
                            className="font-mono text-[12px] font-bold"
                            style={{ color: meta.tone }}
                          >
                            {r.gap > 0 ? "+" : ""}
                            {r.gap} pts
                          </span>
                        </div>
                        <h3 className="mt-1.5 font-display text-[20px] font-bold text-ink">{r.topicTitle}</h3>
                        <div className="mt-4 grid gap-4 sm:grid-cols-2">
                          <div>
                            <div className="flex items-baseline justify-between">
                              <span className="font-mono text-[12px] uppercase tracking-wider text-ink/60">
                                You felt
                              </span>
                              <span className="font-mono text-[14px] text-amber-dark">
                                {r.selfReported}%
                              </span>
                            </div>
                            <MasteryBar value={r.selfReported} className="mt-1.5" trackClassName="border-amber/40" />
                          </div>
                          <div>
                            <div className="flex items-baseline justify-between">
                              <span className="font-mono text-[12px] uppercase tracking-wider text-ink/60">
                                You scored
                              </span>
                              <span className="font-mono text-[14px] text-teal-dark">
                                {r.actualPerformance}%
                              </span>
                            </div>
                            <MasteryBar value={r.actualPerformance} className="mt-1.5" />
                          </div>
                        </div>
                        <p className="mt-3 footnote">{r.observation}</p>
                        <div className="mt-2 flex items-start gap-2">
                          <span className="mt-1 shrink-0 font-mono text-[12px] font-bold uppercase tracking-[0.12em] text-teal">
                            Engine response
                          </span>
                          <p className="footnote">{r.recommendation}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          </div>

          {/* ---------- Rail ---------- */}
          <div className="space-y-10">
            <section className="border border-ink/12 bg-card">
              <div className="border-b border-ink/10 px-5 py-4">
                <Marginalia className="[&::before]:hidden">What the gap means</Marginalia>
              </div>
              <div className="divide-y divide-ink/8 px-5">
                <div className="py-4">
                  <div className="flex items-center gap-2 font-mono text-[12px] uppercase tracking-[0.12em] text-amber-dark">
                    <AlertTriangle className="h-3.5 w-3.5" /> Overestimate (&gt;+15)
                  </div>
                  <p className="mt-1.5 text-[12.5px] leading-relaxed text-ink/80">
                    Confidence ahead of performance. Cognify inserts retrieval checks and weights
                    measured evidence over self-report until the gap closes.
                  </p>
                </div>
                <div className="py-4">
                  <div className="flex items-center gap-2 font-mono text-[12px] uppercase tracking-[0.12em] text-teal">
                    <TrendingDown className="h-3.5 w-3.5" /> Underestimate (&lt;−15)
                  </div>
                  <p className="mt-1.5 text-[12.5px] leading-relaxed text-ink/80">
                    Performance ahead of confidence. Cognify converts checks into stretch
                    invitations and promotes you one stage early.
                  </p>
                </div>
                <div className="py-4">
                  <div className="flex items-center gap-2 font-mono text-[12px] uppercase tracking-[0.12em] text-ink/60">
                    <ShieldCheck className="h-3.5 w-3.5" /> Calibrated (±5)
                  </div>
                  <p className="mt-1.5 text-[12.5px] leading-relaxed text-ink/80">
                    Self-assessment matches evidence. Normal revision schedule applies — the
                    topic is left to your judgment.
                  </p>
                </div>
              </div>
            </section>

            <section className="border border-ink/12 bg-card p-5">
              <Marginalia className="[&::before]:hidden">The DNA trail</Marginalia>
              <p className="mt-2 footnote">{summary.dnaNote}</p>
              <div className="mt-4 space-y-1">
                {["Calibration accuracy", "Confidence bias direction", "Evidence weighting"].map(
                  (d) => (
                    <div key={d} className="flex items-center gap-2 py-1">
                      <span className="h-1 w-1 bg-teal" />
                      <span className="font-mono text-[10.5px] uppercase tracking-wider text-ink/70">
                        {d}
                      </span>
                    </div>
                  )
                )}
              </div>
            </section>

            <section>
              <Marginalia>Next confidence check</Marginalia>
              <div className="mt-4 border border-ink/12 bg-card p-5">
                <ActionChip action="practice" />
                <p className="mt-2 font-serif text-[15px] font-bold leading-snug text-ink">
                  Zeros &amp; Coefficients
                </p>
                <p className="mt-1.5 footnote">
                  Three consecutive overestimations on this topic — a 5-question check is queued
                  at the end of your next session.
                </p>
                <Link
                  href={`/topic/${slugOf("t-1-relationship-between-zeros-c")}`}
                  className="mt-3 inline-flex items-center gap-1.5 border-b border-teal/50 pb-0.5 font-mono text-[14px] uppercase tracking-wider text-teal transition-colors hover:border-teal"
                >
                  Open topic →
                </Link>
              </div>
            </section>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
