/**
 * COGNIFY — Resource Explorer (topic resource page)
 * Style: Scholar's Atelier. Ivory reading plane, marginalia labels, hairline
 * rules, ledger rows with evidence-strength relevance scores. Each resource
 * carries title, source, duration, format, topic, difficulty, relevance and a
 * per-student "why recommended" note. Never implies the whole internet was
 * searched — provenance is explained in a ranking footnote.
 */
import AppShell, { PageHeader } from "@/components/cognify/AppShell";
import {
  ActionChip,
  Hairline,
  Marginalia,
} from "@/components/cognify/Primitives";
import { discoverResources } from "@/lib/resourceDiscovery";
import { findTopicByIdOrAlias } from "@/lib/curriculum";
import { cn } from "@/lib/utils";
import type { Difficulty, LearningResource, ResourceFormat } from "@/lib/types";
import { useLocation, useRoute } from "wouter";
import { useState } from "react";
import { Clock, FlaskConical, LayoutGrid, SearchX, SlidersHorizontal } from "lucide-react";
import { Link } from "wouter";

const ALL_FORMATS: { key: ResourceFormat | "all"; label: string }[] = [
  { key: "all", label: "All formats" },
  { key: "lecture", label: "Lecture" },
  { key: "revision", label: "Revision" },
  { key: "explanation", label: "Explanation" },
  { key: "example", label: "Example" },
  { key: "practice", label: "Practice" },
  { key: "diagram", label: "Diagram / visual" },
];

const DIFFICULTIES: { key: Difficulty | "all"; label: string }[] = [
  { key: "all", label: "All levels" },
  { key: "foundational", label: "Foundational" },
  { key: "core", label: "Core" },
  { key: "advanced", label: "Advanced" },
  { key: "stretch", label: "Stretch" },
];

const DIFFICULTY_COLORS: Record<Difficulty, string> = {
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
  }
}

export default function Resources() {
  const [match, params] = useRoute("/resources/:topicId");
  const topicId = match ? params.topicId : "";
  const [, navigate] = useLocation();

  const [formatFilter, setFormatFilter] = useState<ResourceFormat | "all">("all");
  const [difficultyFilter, setDifficultyFilter] = useState<Difficulty | "all">("all");

  const resolved = findTopicByIdOrAlias(topicId);
  const discovery = discoverResources(topicId, {
    formats: formatFilter === "all" ? undefined : [formatFilter],
    difficulty: difficultyFilter === "all" ? undefined : difficultyFilter,
  });

  return (
    <AppShell>
      {!resolved ? (
        <PageHeader
          title="Topic not found"
          subtitle="Select a topic from the Curriculum Explorer to discover its resources."
        />
      ) : (
        <>
          <PageHeader
            title={`${resolved.topic.title}`}
            subtitle={`${resolved.subject.name} · Chapter ${String(resolved.chapter.index).padStart(2, "0")} — ${resolved.chapter.title} · ${discovery?.resources.length ?? 0} resources surfaced for this topic`}
            actions={
              <Link
                href="/curriculum"
                className="border border-ink/15 bg-card px-3 py-1.5 font-mono text-[14px] uppercase tracking-[0.1em] text-ink/70 transition-colors hover:border-teal hover:text-teal"
              >
                ← Back to explorer
              </Link>
            }
          />

          {/* Filter strip */}
          <div className="flex flex-wrap items-center gap-2 border-b border-ink/10 px-5 py-3.5 sm:px-8 lg:px-10">
            <SlidersHorizontal className="h-3.5 w-3.5 text-teal" />
            <div className="flex flex-wrap items-center gap-1.5">
              {ALL_FORMATS.map((f) => (
                <button
                  key={f.key}
                  onClick={() => setFormatFilter(f.key)}
                  className={cn(
                    "border px-2.5 py-1 font-mono text-[10.5px] uppercase tracking-[0.08em] transition-colors",
                    formatFilter === f.key
                      ? "border-teal bg-teal text-white"
                      : "border-ink/15 bg-card text-ink/60 hover:border-teal/50 hover:text-ink"
                  )}
                >
                  {f.label}
                </button>
              ))}
            </div>
            <span className="mx-1 hidden h-4 w-px bg-ink/15 sm:block" />
            <div className="flex items-center gap-1.5">
              {DIFFICULTIES.map((d) => (
                <button
                  key={d.key}
                  onClick={() => setDifficultyFilter(d.key)}
                  className={cn(
                    "border px-2.5 py-1 font-mono text-[10.5px] uppercase tracking-[0.08em] transition-colors",
                    difficultyFilter === d.key
                      ? "border-ink bg-ink text-ivory"
                      : "border-ink/15 bg-card text-ink/60 hover:border-ink/40 hover:text-ink"
                  )}
                >
                  {d.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-8 px-5 py-7 sm:px-8 lg:flex-row lg:px-10">
            {/* Resource ledger */}
            <section className="min-w-0 flex-1">
              {discovery && discovery.resources.length > 0 ? (
                <ul className="divide-y divide-ink/8 border-y border-ink/10">
                  {discovery.resources.map((r, i) => (
                    <ResourceRow
                      key={r.id}
                      resource={r}
                      index={i}
                      subjectCode={resolved.subject.code}
                      onOpen={() => navigate(`/session/${r.id}?topic=${topicId}`)}
                    />
                  ))}
                </ul>
              ) : (
                <div className="mt-10 flex flex-col items-center gap-3 border border-dashed border-ink/20 py-14 text-center">
                  <SearchX className="h-6 w-6 text-ink/30" />
                  <div className="font-serif text-lg font-bold text-ink">
                    No resources match these filters
                  </div>
                  <p className="footnote max-w-md">
                    Broaden the format or difficulty filter — Cognify ranks what exists rather
                    than inventing material.
                  </p>
                </div>
              )}

              {/* Provenance footnote */}
              {discovery && discovery.resources.length > 0 && (
                <p className="footnote mt-6 max-w-2xl border-l-2 border-teal/40 pl-4">
                  {discovery.rankingNote}
                </p>
              )}
            </section>

            {/* Margin panel */}
            <aside className="w-full shrink-0 space-y-6 lg:w-80">
              <div className="border border-ink/10 bg-card p-5">
                <div className="marginalia [&::before]:hidden">This session</div>
                <div className="mt-4 font-serif text-lg font-bold leading-snug text-ink">
                  {resolved.topic.title}
                </div>
                <p className="mt-2 text-[14px] leading-relaxed text-dark-text/75">
                  {resolved.topic.actionReason ??
                    `A topic in ${resolved.chapter.title}. Choose a resource to begin a guided learning session.`}
                </p>
                <div className="mt-4 grid grid-cols-2 gap-px bg-ink/10">
                  <div className="bg-card p-3">
                    <div className="font-mono text-[9px] uppercase tracking-[0.08em] text-muted-foreground">Mastery</div>
                    <div className="mt-1 font-mono text-sm font-medium text-ink">{resolved.topic.mastery}%</div>
                  </div>
                  <div className="bg-card p-3">
                    <div className="font-mono text-[9px] uppercase tracking-[0.08em] text-muted-foreground">Est. time</div>
                    <div className="mt-1 font-mono text-sm font-medium text-ink">{resolved.topic.estimatedMinutes} min</div>
                  </div>
                </div>
              </div>

              <div className="border border-ink/10 bg-card p-5">
                <div className="marginalia [&::before]:hidden">Format legend</div>
                <ul className="mt-3 space-y-2">
                  <li className="flex items-center gap-2 text-[12px] text-dark-text/75">
                    <LayoutGrid className="h-3 w-3 text-teal" /> Lecture — full guided teaching
                  </li>
                  <li className="flex items-center gap-2 text-[12px] text-dark-text/75">
                    <Clock className="h-3 w-3 text-teal" /> Revision — spaced-retention review
                  </li>
                  <li className="flex items-center gap-2 text-[12px] text-dark-text/75">
                    <FlaskConical className="h-3 w-3 text-teal" /> Explanation — one idea, clearly
                  </li>
                  <li className="flex items-center gap-2 text-[12px] text-dark-text/75">
                    <span className="h-3 w-3 border border-teal/60 text-center font-mono text-[8px] leading-3 text-teal">Ex</span> Example — worked problems
                  </li>
                  <li className="flex items-center gap-2 text-[12px] text-dark-text/75">
                    <span className="h-3 w-3 border border-teal/60 text-center font-mono text-[8px] leading-3 text-teal">Px</span> Practice — timed drills
                  </li>
                  <li className="flex items-center gap-2 text-[12px] text-dark-text/75">
                    <span className="h-3 w-3 border border-teal/60 text-center font-mono text-[8px] leading-3 text-teal">◫</span> Diagram — visual / visualised
                  </li>
                </ul>
              </div>
            </aside>
          </div>
        </>
      )}
    </AppShell>
  );
}

function ResourceRow({
  resource,
  index,
  subjectCode,
  onOpen,
}: {
  resource: LearningResource;
  index: number;
  subjectCode: string;
  onOpen: () => void;
}) {
  const [whyOpen, setWhyOpen] = useState(false);
  return (
    <li>
      <div className="grid grid-cols-[2.5rem_1fr_auto] gap-4 py-4">
        <span className="index-num">{String(index + 1).padStart(2, "0")}</span>
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className="flex h-5 w-5 items-center justify-center border font-mono text-[8px] font-bold"
              style={{ borderColor: DIFFICULTY_COLORS[resource.difficulty], color: DIFFICULTY_COLORS[resource.difficulty] }}
              title={resource.sourceLabel}
            >
              {sourceGlyph(resource.source)}
            </span>
            <span className="font-mono text-[12px] text-ink/55">{resource.sourceLabel}</span>
            <ActionChip action={actionForFormat(resource.format)} />
            <span
              className="border px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-wider"
              style={{ borderColor: DIFFICULTY_COLORS[resource.difficulty], color: DIFFICULTY_COLORS[resource.difficulty] }}
            >
              {resource.difficulty}
            </span>
            <span className="flex items-center gap-1 font-mono text-[12px] text-muted-foreground">
              <Clock className="h-3 w-3" /> {resource.durationMinutes} min
            </span>
          </div>

          <div className="mt-1.5 font-serif text-[16px] font-bold leading-snug text-ink">
            {resource.title}
          </div>

          {/* Relevance + why */}
          <div className="mt-2.5 flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="font-mono text-[12px] uppercase tracking-wider text-muted-foreground">Relevance</span>
              <div className="flex w-28 items-center">
                <div className="h-1.5 w-full border border-ink/15 bg-ivory-deep">
                  <div className="h-full bg-teal" style={{ width: `${resource.relevance}%` }} />
                </div>
                <span className="ml-1.5 font-mono text-[14px] font-medium text-dark-text/70">
                  {resource.relevance}
                </span>
              </div>
            </div>
            {resource.dnaDimension && (
              <span className="border border-amber/40 bg-amber/5 px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-[0.1em] text-amber-dark">
                Fits your learning style
              </span>
            )}
          </div>

          <div className="mt-2 max-w-3xl">
            {whyOpen ? (
              <div className="border-l border-dotted border-ink/15 pl-3">
                <span className="font-mono text-[12px] font-bold uppercase tracking-[0.1em] text-teal-dark">
                  Why this one
                </span>
                <p className="mt-1 text-[14px] leading-relaxed text-dark-text/75">{resource.whyRecommended}</p>
                <button
                  onClick={() => setWhyOpen(false)}
                  className="mt-1 font-display text-xs uppercase tracking-[0.08em] text-ink/55 hover:text-teal"
                >
                  Hide ←
                </button>
              </div>
            ) : (
              <p className="text-[14px] leading-relaxed text-dark-text/75">
                <span className="font-mono text-[12px] font-bold uppercase tracking-[0.1em] text-teal-dark">
                  Why this one{" "}
                </span>
                {resource.whyRecommended.split(".").slice(0, 1).join("")}.
                <button
                  onClick={() => setWhyOpen(true)}
                  className="ml-2 border-b border-teal/50 pb-0.5 font-display text-xs uppercase tracking-[0.08em] text-teal transition-colors hover:border-teal"
                >
                  Read more →
                </button>
              </p>
            )}
          </div>
        </div>

        <div className="flex flex-col items-end gap-2">
          <button
            onClick={onOpen}
            className="h-9 whitespace-nowrap border border-ink bg-ink px-4 font-mono text-[10.5px] uppercase tracking-[0.12em] text-ivory transition-all duration-150 hover:bg-teal hover:border-teal active:scale-[0.97]"
          >
            Begin session
          </button>
          <span className="font-mono text-[9px] uppercase tracking-wider text-muted-foreground">
            {subjectCode} · {resource.topicTitle}
          </span>
        </div>
      </div>
      <Hairline className="-mb-1" />
    </li>
  );
}

function actionForFormat(format: ResourceFormat): string {
  switch (format) {
    case "lecture":
      return "learn";
    case "revision":
      return "revise";
    case "practice":
      return "practice";
    case "explanation":
    case "example":
    case "diagram":
      return "learn";
  }
}

