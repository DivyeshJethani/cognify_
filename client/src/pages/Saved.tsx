/**
 * COGNIFY — My Saved Resources (the shelf)
 * Scholar's Atelier: a student's personal shelf keeps the same ledger
 * discipline as the catalogue — each entry carries provenance, format,
 * difficulty and the note the student attached when saving it.
 */
import AppShell, { PageHeader } from "@/components/cognify/AppShell";
import { ActionChip, Marginalia } from "@/components/cognify/Primitives";
import { discoverAll } from "@/lib/resourceDiscovery";
import { listSaved, removeSaved } from "@/lib/savedResources";
import type { LearningResource } from "@/lib/types";
import { Bookmark, Clock, SearchX } from "lucide-react";
import { useState } from "react";
import { useLocation } from "wouter";
import { toast } from "sonner";

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

export default function Saved() {
  const [, navigate] = useLocation();
  const [version, setVersion] = useState(0);
  const saved = listSaved();
  const all = discoverAll();

  const entries = saved
    .map((s) => {
      const r = all.find((res) => res.id === s.resourceId);
      return { saved: s, resource: r ?? null };
    })
    .filter((e) => e.resource !== null)
    .sort((a, b) => (b.saved.savedAt > a.saved.savedAt ? 1 : -1));

  const refresh = () => setVersion((v) => v + 1);

  return (
    <AppShell key={version}>
      <PageHeader
        title="The shelf"
        subtitle={`${entries.length} resources saved for later — each item includes your personal notes to help you study.`}
      />

      <div className="px-5 py-7 sm:px-8 lg:px-10">
        {entries.length > 0 ? (
          <ul className="divide-y divide-ink/8 border-y border-ink/10">
            {entries.map(({ saved: s, resource: r }, i) => (
              <li key={s.resourceId}>
                <div className="grid grid-cols-[2.5rem_1fr_auto] gap-4 py-4">
                  <span className="index-num">{String(i + 1).padStart(2, "0")}</span>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className="flex h-5 w-5 items-center justify-center border font-mono text-[8px] font-bold"
                        style={{ borderColor: DIFFICULTY_COLORS[r!.difficulty], color: DIFFICULTY_COLORS[r!.difficulty] }}
                        title={r!.sourceLabel}
                      >
                        {sourceGlyph(r!.source)}
                      </span>
                      <span className="font-mono text-[12px] text-ink/55">{r!.sourceLabel}</span>
                      <ActionChip action={r!.format === "practice" ? "practice" : r!.format === "revision" ? "revise" : "learn"} />
                      <span
                        className="border px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-wider"
                        style={{ borderColor: DIFFICULTY_COLORS[r!.difficulty], color: DIFFICULTY_COLORS[r!.difficulty] }}
                      >
                        {r!.difficulty}
                      </span>
                      <span className="flex items-center gap-1 font-mono text-[12px] text-muted-foreground">
                        <Clock className="h-3 w-3" /> {r!.durationMinutes} min
                      </span>
                      <span className="font-mono text-[9px] uppercase tracking-[0.1em] text-muted-foreground">
                        Saved {new Date(s.savedAt).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="mt-1.5 font-serif text-[16px] font-bold leading-snug text-ink">
                      {r!.title}
                    </div>
                    <div className="mt-1 font-mono text-[12px] uppercase tracking-wider text-muted-foreground">
                      {r!.topicTitle}
                    </div>
                    {s.note && (
                      <p className="mt-2 max-w-2xl border-l-2 border-amber/50 bg-amber/5 px-3 py-1.5 text-[14px] italic leading-relaxed text-dark-text/75">
                        “{s.note}”
                      </p>
                    )}
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <button
                      onClick={() => navigate(`/session/${r!.id}?topic=${r!.topicId}`)}
                      className="h-9 whitespace-nowrap border border-ink bg-ink px-4 font-mono text-[10.5px] uppercase tracking-[0.12em] text-ivory transition-all duration-150 hover:bg-teal hover:border-teal active:scale-[0.97]"
                    >
                      Begin session
                    </button>
                    <button
                      onClick={() => {
                        removeSaved(s.resourceId);
                        toast("Removed from the shelf");
                        refresh();
                      }}
                      className="h-9 whitespace-nowrap border border-ink/25 bg-card px-3 font-mono text-[12px] uppercase tracking-[0.12em] text-ink/60 transition-all duration-150 hover:border-destructive hover:text-destructive active:scale-[0.97]"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <div className="flex flex-col items-center gap-3 border border-dashed border-ink/20 py-16 text-center">
            <Bookmark className="h-6 w-6 text-ink/30" />
            <div className="font-serif text-lg font-bold text-ink">Your shelf is empty</div>
            <p className="footnote max-w-md">
              Your shelf is currently empty. You can save any resource from the library to view it here later.
            </p>
            <div className="mt-3 flex flex-wrap justify-center gap-2">
              <button
                onClick={() => navigate("/library")}
                className="h-9 border border-ink bg-ink px-5 font-mono text-[10.5px] uppercase tracking-[0.12em] text-ivory transition-all duration-150 hover:bg-teal hover:border-teal active:scale-[0.97]"
              >
                Open the catalogue
              </button>
              <button
                onClick={() => navigate("/continue")}
                className="h-9 border border-ink/25 bg-card px-5 font-mono text-[10.5px] uppercase tracking-[0.12em] text-ink/70 transition-all duration-150 hover:border-teal hover:text-teal active:scale-[0.97]"
              >
                Continue learning instead
              </button>
            </div>
          </div>
        )}

        <aside className="mt-8 grid gap-6 lg:grid-cols-3">
          <div className="border border-ink/10 bg-card p-5">
            <Marginalia>How the shelf is used</Marginalia>
            <p className="mt-3 text-[14px] leading-relaxed text-dark-text/75">
              The Command Center draws a <span className="font-semibold text-ink">Continue
              learning</span> rail from started sessions, and the catalogue marks them with a
              progress tick. The shelf is the same discipline, manually curated.
            </p>
          </div>
          <div className="border border-ink/10 bg-card p-5">
            <Marginalia>Your Study Notes</Marginalia>
            <p className="mt-3 text-[14px] leading-relaxed text-dark-text/75">
              Any notes you make when saving a resource are kept here, so you can remember why you wanted to review it.
            </p>
          </div>
          <div className="border border-ink bg-ink p-5 text-ivory">
            <div className="font-mono text-[9px] uppercase tracking-[0.08em] text-teal">Observation</div>
            <p className="mt-2 font-serif text-[15px] leading-relaxed">
              Curated beats collected. A shelf of ten consulted items outperforms a shelf of
              fifty untouched ones.
            </p>
          </div>
        </aside>
      </div>
    </AppShell>
  );
}
