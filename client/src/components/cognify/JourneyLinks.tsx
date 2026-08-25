/**
 * COGNIFY Day 6 — Journey links + "WHY?" interaction primitives.
 *
 * Style: Scholar's Atelier. Monospace small-caps links with a quiet
 * arrow, subtle underline hover (200ms), no bouncing, no glow.
 *
 * Journey links make transitions between existing pages intentional:
 * OPEN TOPIC → · CONTINUE SESSION → · PRACTICE THIS → · SEE WHY → ·
 * VIEW LEARNING DNA → · WHAT NEXT? →
 *
 * The "WHY?" pattern is Cognify's signature explainability interaction:
 * a marginalia-style button that expands an evidence-backed reason.
 */
import { useState } from "react";
import { cn } from "@/lib/utils";
import type { WhyReason } from "@/lib/whyEngine";
import { Link } from "wouter";

/* ---------- Journey link ---------- */
const journeyLinkBase =
  "group inline-flex items-baseline gap-1.5 font-mono text-[12px] font-medium uppercase tracking-[0.08em] text-ink/70 transition-colors duration-200 hover:text-teal";

export function JourneyLink({
  href,
  children,
  className,
  onClick,
}: {
  href?: string;
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}) {
  if (href) {
    return (
      <Link href={href} className={cn(journeyLinkBase, "hover:underline", className)}>
        {children}
        <span className="transition-transform duration-200 group-hover:translate-x-0.5">→</span>
      </Link>
    );
  }
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(journeyLinkBase, "hover:underline", className)}
    >
      {children}
      <span className="transition-transform duration-200 group-hover:translate-x-0.5">→</span>
    </button>
  );
}

/* ---------- WHY? expandable marginalia ---------- */
export function WhyInteraction({
  reason,
  label = "Why?",
  className,
}: {
  reason: WhyReason;
  label?: string;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div className={cn("mt-2", className)}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "inline-flex items-center gap-2 border-b border-dashed border-ink/25 pb-0.5 font-mono text-[12px] font-medium uppercase tracking-[0.08em] text-ink/55",
          "transition-colors duration-200 hover:border-teal hover:text-teal",
        )}
        aria-expanded={open}
      >
        {label}
        <span
          className={cn(
            "transition-transform duration-200",
            open ? "rotate-90" : "",
          )}
        >
          →
        </span>
      </button>
      <div
        className={cn(
          "grid transition-all duration-200",
          open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0",
        )}
      >
        <div className="overflow-hidden">
          <div className="pt-3 pl-3 border-l border-ink/15">
            <p className="font-serif text-[14px] leading-snug text-ink">{reason.headline}</p>
            <p className="mt-1 font-sans text-[12px] leading-relaxed text-muted-foreground">
              {reason.detail}
            </p>
            {reason.evidence.length > 0 && (
              <p className="mt-1.5 flex flex-wrap gap-1.5">
                {reason.evidence.map((e) => (
                  <span
                    key={e}
                    className="border border-ink/10 bg-ivory-deep px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-[0.1em] text-ink/60"
                  >
                    {e}
                  </span>
                ))}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------- One-line WHY footer (always visible, quiet) ---------- */
export function WhyFootnote({ reason, className }: { reason: WhyReason; className?: string }) {
  return (
    <p className={cn("font-mono text-[12px] leading-relaxed uppercase tracking-[0.06em] text-ink/50", className)}>
      <span className="text-teal">Why — </span>
      {reason.headline.replace(/\.$/, "").toLowerCase()}
      <span className="text-ink/30">.</span>
    </p>
  );
}
