/**
 * COGNIFY — Shared primitives (Day 8 refinement: calm, warm, modern education feel).
 * Semantic colour: teal = action/learning, green = healthy, amber = attention,
 * ink = neutral info. Manrope values, Inter body, mono only for metadata.
 */
import { cn } from "@/lib/utils";
import type { TopicState } from "@/lib/types";

export const LOGO_URL = "/manus-storage/cognify-logo-mark_070389eb.png";

/* ---------- Marginalia section label ---------- */
export function Marginalia({
  children,
  amber = false,
  className,
}: {
  children: React.ReactNode;
  amber?: boolean;
  className?: string;
}) {
  return (
    <div className={cn("marginalia", amber && "marginalia-amber", className)}>
      {children}
    </div>
  );
}

/* ---------- Hairline ---------- */
export function Hairline({ className }: { className?: string }) {
  return <div className={cn("hairline", className)} />;
}

/* ---------- Mastery bar (hairline track) ---------- */
export function MasteryBar({
  value,
  className,
  trackClassName,
  animate = true,
}: {
  value: number;
  className?: string;
  trackClassName?: string;
  animate?: boolean;
}) {
  return (
    <div className={cn("h-1.5 w-full border border-ink/15 bg-ivory-deep", trackClassName)}>
      <div
        className={cn("h-full bg-teal transition-[width] duration-700", animate && "rise-in")}
        style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
      />
    </div>
  );
}

/* ---------- Topic state → colour & label ---------- */
export function stateColor(state: TopicState): string {
  switch (state) {
    case "mastered":
      return "#3d8f6b"; // restrained green — completed / healthy
    case "proficient":
      return "#2b9c8c"; // muted teal — learning
    case "developing":
      return "#4c83b5"; // soft blue — supporting info
    case "weak":
      return "#d9912f"; // warm amber — needs attention
    case "learning":
      return "#132b3b"; // deep ink-charcoal — neutral info
    case "new":
      return "#8b949e";
  }
}

export function stateLabel(state: TopicState): string {
  switch (state) {
    case "mastered":
      return "Excellent";
    case "proficient":
      return "Strong";
    case "developing":
      return "Improving";
    case "weak":
      return "Needs focus";
    case "learning":
      return "In progress";
    case "new":
      return "Not started";
  }
}

export function StateBadge({ state }: { state: TopicState }) {
  const color = stateColor(state);
  return (
    <span
      className="inline-flex items-center gap-1.5 border px-2 py-0.5 font-mono text-[12px] font-medium uppercase tracking-[0.08em]"
      style={{ borderColor: color, color }}
    >
      <span className="h-1.5 w-1.5 rounded-full" style={{ background: color }} />
      {stateLabel(state)}
    </span>
  );
}

/* ---------- Revision chip ---------- */
export function RevisionChip({ dueInDays, status }: { dueInDays: number | null; status: string }) {
  if (status === "not-started")
    return (
      <span className="font-mono text-[12px] uppercase tracking-wider text-muted-foreground">
        Not scheduled
      </span>
    );
  if (status === "overdue")
    return (
      <span className="inline-flex items-center gap-1 font-mono text-[12px] font-medium uppercase tracking-wider text-amber-dark">
        <span className="h-1.5 w-1.5 rounded-full bg-amber" />
        Overdue {dueInDays !== null && dueInDays < 0 ? `${Math.abs(dueInDays)}d` : ""}
      </span>
    );
  if (status === "due")
    return (
      <span className="inline-flex items-center gap-1 font-mono text-[12px] font-medium uppercase tracking-wider text-amber-dark">
        <span className="h-1.5 w-1.5 rounded-full bg-amber" />
        Due {dueInDays === 0 ? "today" : `in ${dueInDays}d`}
      </span>
    );
  return (
    <span className="inline-flex items-center gap-1 font-mono text-[12px] uppercase tracking-wider text-blue-soft">
      <span className="h-1.5 w-1.5 rounded-full bg-blue-soft" />
      On track · {dueInDays}d
    </span>
  );
}

/* ---------- Recommendation action label ---------- */
const actionMeta: Record<string, { label: string; color: string }> = {
  learn: { label: "Learn", color: "#132b3b" },
  practice: { label: "Practice", color: "#2b9c8c" },
  revise: { label: "Revise", color: "#d9912f" },
  "teach-back": { label: "Teach Back", color: "#3d8f6b" },
  stretch: { label: "Stretch", color: "#132b3b" },
};

export function ActionChip({ action }: { action: string }) {
  const meta = actionMeta[action] ?? { label: action, color: "#8b949e" };
  return (
    <span
      className="border-l-2 px-1.5 py-0.5 font-mono text-[12px] font-medium uppercase tracking-[0.1em]"
      style={{ borderLeftColor: meta.color, color: meta.color }}
    >
      {meta.label}
    </span>
  );
}

/* ---------- Stat cell ---------- */
export function StatCell({
  label,
  value,
  sub,
  className,
}: {
  label: string;
  value: string;
  sub?: string;
  className?: string;
}) {
  return (
    <div className={cn("border-l border-ink/10 pl-4", className)}>
      <div className="font-mono text-[12px] font-medium uppercase tracking-[0.08em] text-muted-foreground">
        {label}
      </div>
      <div className="mt-1 font-display text-[26px] font-bold leading-none text-ink">{value}</div>
      {sub && <div className="mt-0.5 font-mono text-[14px] text-muted-foreground">{sub}</div>}
    </div>
  );
}
