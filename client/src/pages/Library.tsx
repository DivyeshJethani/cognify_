/**
 * COGNIFY — Resource Discovery (Library)
 * The catalogue room, now driven by the Day 5 knowledge engine:
 * discoverAll() + enrichResourceTopicContext() + filterAndSort().
 * Scholar's Atelier — index tabs along the margin, ledger rows,
 * hairline rules, honest footnote. Same visual identity as Day 2.
 */
import AppShell, { PageHeader } from "@/components/cognify/AppShell";
import { ActionChip, Hairline, Marginalia } from "@/components/cognify/Primitives";
import {
  discoverAll,
  enrichResourceTopicContext,
  RESOURCE_TYPES,
  topicIndexes,
} from "@/lib/resourceDiscovery";
import { filterAndSort, type LibraryFilters, type SortKey } from "@/lib/discoverySearch";
import type { Difficulty, LearningResource, ResourceFormat, ResourceType } from "@/lib/types";
import { learningDNA } from "@/lib/mockData";
import { continueLearning } from "@/lib/savedResources";
import { cn } from "@/lib/utils";
import { getStudyContext } from "@/lib/studyContext";
import { BookOpenText, Clock, ExternalLink, SearchX, SlidersHorizontal } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link, useLocation } from "wouter";
import { toast } from "sonner";

const subjectNames: Record<string, string> = {
  MATH: "Mathematics",
  SCI: "Science",
  SST: "Social Science",
  ENG: "English",
  HIN: "Hindi",
  SKT: "Sanskrit",
};

const SUBJECT_ID_TO_CODE: Record<string, string> = {
  math: "MATH",
  science: "SCI",
  social: "SST",
  english: "ENG",
  hindi: "HIN",
  sanskrit: "SKT",
};

const SUBJECT_CODE_TO_ID: Record<string, string> = {
  MATH: "math",
  SCI: "science",
  SST: "social",
  ENG: "english",
  HIN: "hindi",
  SKT: "sanskrit",
};

const ALL_FORMATS: { key: ResourceFormat | "all"; label: string }[] = [
  { key: "all", label: "All formats" },
  { key: "lecture", label: "Lecture" },
  { key: "revision", label: "Revision" },
  { key: "explanation", label: "Explanation" },
  { key: "example", label: "Example" },
  { key: "practice", label: "Practice" },
  { key: "diagram", label: "Diagram / visual" },
];

const SORT_OPTIONS: { key: SortKey; label: string }[] = [
  { key: "most-relevant", label: "Most relevant" },
  { key: "recommended-for-me", label: "Recommended for me" },
  { key: "highest-evidence", label: "Highest evidence" },
  { key: "shortest", label: "Shortest first" },
  { key: "recently-added", label: "Recently added" },
];

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

const DIFFICULTY_COLORS: Record<string, string> = {
  foundational: "#4c83b5",
  core: "#2b9c8c",
  advanced: "#132b3b",
  stretch: "#b8772a",
};

export default function Library() {
  const [, navigate] = useLocation();
  const [formatFilter, setFormatFilter] = useState<ResourceFormat | "all">("all");
  const [typeFilter, setTypeFilter] = useState<ResourceType | "all">("all");
  const [subjectFilter, setSubjectFilter] = useState<string>(() => {
    const sf = getStudyContext().subjectFocus;
    return sf ? SUBJECT_ID_TO_CODE[sf] ?? "all" : "all";
  });
  const [lastFocus, setLastFocus] = useState<string | null>(() => getStudyContext().subjectFocus);
  const [durationFilter, setDurationFilter] = useState<LibraryFilters["duration"]>("any");
  const [difficultyFilter, setDifficultyFilter] = useState<Difficulty | "all">("all");
  const [freeWebOnly, setFreeWebOnly] = useState(false);
  const [sort, setSort] = useState<SortKey>("recommended-for-me");
  const [expandedWhy, setExpandedWhy] = useState<string | null>(null);

  // Stay in sync with the sidebar's subject switcher.
  useEffect(() => {
    const handler = () => {
      const sf = getStudyContext().subjectFocus;
      setSubjectFilter((prev) => {
        const prevId = prev === "all" ? null : SUBJECT_CODE_TO_ID[prev];
        if (prev !== "all" && prevId === lastFocus && !sf) return "all";
        if (sf && prev === "all") return SUBJECT_ID_TO_CODE[sf] ?? "all";
        return prev;
      });
      setLastFocus(getStudyContext().subjectFocus);
    };
    window.addEventListener("cognify:context-change", handler);
    return () => window.removeEventListener("cognify:context-change", handler);
  }, [lastFocus]);

  const indexes = useMemo(() => topicIndexes(), []);
  const subjectOptions = useMemo(
    () => Array.from(new Set(indexes.map((i) => i.subjectCode))),
    [indexes]
  );

  const resources = useMemo(() => {
    const raw = discoverAll({
      formats: formatFilter === "all" ? undefined : [formatFilter],
      difficulty: difficultyFilter,
      isFreeWeb: freeWebOnly,
    }).map(enrichResourceTopicContext);
    const filters: LibraryFilters = {
      types: typeFilter === "all" ? undefined : [typeFilter],
      duration: durationFilter,
      freeWebOnly: freeWebOnly,
      ...(subjectFilter !== "all" ? { subject: subjectFilter } : {}),
    };
    return filterAndSort(raw, filters, sort);
  }, [formatFilter, typeFilter, subjectFilter, durationFilter, difficultyFilter, freeWebOnly, sort]);

  const continuedIds = new Set(continueLearning().map((p) => p.resourceId));

  return (
    <AppShell>
      <PageHeader
        title="The catalogue"
        subtitle={`${resources.length} resources across your subjects — picked for what you are working on right now.`}
        actions={
          <Link
            href="/dashboard"
            className="border border-ink/15 bg-card px-3 py-1.5 font-mono text-[14px] uppercase tracking-[0.1em] text-ink/70 transition-colors hover:border-teal hover:text-teal"
          >
            ← Command Center
          </Link>
        }
      />

      {subjectFilter !== "all" && (
        <div className="flex items-center justify-between gap-3 border-b border-amber/30 bg-amber/5 px-5 py-2.5 sm:px-8 lg:px-10">
          <span className="font-display text-xs uppercase tracking-[0.08em] text-amber-dark">
            Focused on {subjectNames[subjectFilter] ?? subjectFilter}
          </span>
          <button
            onClick={() => setSubjectFilter("all")}
            className="font-display text-xs uppercase tracking-[0.08em] text-ink/55 hover:text-teal"
          >
            Show all subjects ←
          </button>
        </div>
      )}

      {/* Filter strip */}
      <div className="flex flex-wrap items-center gap-2 border-b border-ink/10 px-5 py-3.5 sm:px-8 lg:px-10">
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
        {/* Subject select */}
        <select
          value={subjectFilter}
          onChange={(e) => setSubjectFilter(e.target.value)}
          className="h-7 border border-ink/25 bg-card px-2 font-mono text-[10.5px] uppercase tracking-[0.08em] text-ink/70 outline-none transition-colors hover:border-ink/50 focus:border-teal"
        >
          <option value="all">All subjects</option>
          {subjectOptions.map((code) => (
            <option key={code} value={code}>
              {code}
            </option>
          ))}
        </select>
        {/* Duration select */}
        <select
          value={durationFilter}
          onChange={(e) => setDurationFilter(e.target.value as LibraryFilters["duration"])}
          className="h-7 border border-ink/25 bg-card px-2 font-mono text-[10.5px] uppercase tracking-[0.08em] text-ink/70 outline-none transition-colors hover:border-ink/50 focus:border-teal"
        >
          <option value="any">Any length</option>
          <option value="under15">Under 15 min</option>
          <option value="15to30">15–30 min</option>
          <option value="over30">Over 30 min</option>
        </select>
        <span className="mx-1 hidden h-4 w-px bg-ink/15 sm:block" />
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            onClick={() => setTypeFilter("all")}
            className={cn(
              "border px-2.5 py-1 font-mono text-[10.5px] uppercase tracking-[0.08em] transition-colors",
              typeFilter === "all"
                ? "border-ink bg-ink text-ivory"
                : "border-ink/15 bg-card text-ink/60 hover:border-ink/40 hover:text-ink"
            )}
          >
            All types
          </button>
          {RESOURCE_TYPES.map((t) => (
            <button
              key={t.id}
              onClick={() => setTypeFilter(t.id as ResourceType)}
              className={cn(
                "border px-2.5 py-1 font-mono text-[10.5px] uppercase tracking-[0.08em] transition-colors",
                typeFilter === t.id
                  ? "border-ink bg-ink text-ivory"
                  : "border-ink/15 bg-card text-ink/60 hover:border-ink/40 hover:text-ink"
              )}
            >
              {t.label}
            </button>
          ))}
        </div>
        <span className="mx-1 hidden h-4 w-px bg-ink/15 sm:block" />
        <button
          onClick={() => setFreeWebOnly(!freeWebOnly)}
          className={cn(
            "flex items-center gap-1.5 border px-2.5 py-1 font-mono text-[10.5px] uppercase tracking-[0.08em] transition-colors",
            freeWebOnly
              ? "border-amber bg-amber/10 text-amber-dark"
              : "border-ink/15 bg-card text-ink/60 hover:border-ink/40 hover:text-ink"
          )}
        >
          <ExternalLink className="h-3 w-3" /> Free web sources only
        </button>
        {/* Sort select */}
        <span className="mx-1 hidden h-4 w-px bg-ink/15 sm:block" />
        <div className="flex items-center gap-1.5">
          <SlidersHorizontal className="h-3 w-3 text-muted-foreground" />
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as SortKey)}
            className="h-7 border border-ink/25 bg-card px-2 font-mono text-[10.5px] uppercase tracking-[0.08em] text-ink/70 outline-none transition-colors hover:border-ink/50 focus:border-teal"
          >
            {SORT_OPTIONS.map((s) => (
              <option key={s.key} value={s.key}>
                {s.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex flex-col gap-8 px-5 py-7 sm:px-8 lg:flex-row lg:px-10">
        {/* Ledger */}
        <section className="min-w-0 flex-1">
          {resources.length > 0 ? (
            <ul className="divide-y divide-ink/8 border-y border-ink/10">
              {resources.map((r, i) => (
                <li key={r.id}>
                  <div className="grid grid-cols-[2.5rem_1fr_auto] gap-4 py-4">
                    <span className="index-num">{String(i + 1).padStart(2, "0")}</span>
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className="flex h-5 w-5 items-center justify-center border font-mono text-[8px] font-bold"
                          style={{ borderColor: DIFFICULTY_COLORS[r.difficulty], color: DIFFICULTY_COLORS[r.difficulty] }}
                          title={r.sourceLabel}
                        >
                          {sourceGlyph(r.source)}
                        </span>
                        <span className="font-mono text-[12px] text-ink/55">{r.sourceLabel}</span>
                        <ActionChip action={actionForFormat(r.format)} />
                        <span
                          className="border px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-wider"
                          style={{ borderColor: DIFFICULTY_COLORS[r.difficulty], color: DIFFICULTY_COLORS[r.difficulty] }}
                        >
                          {r.difficulty}
                        </span>
                        <span className="border border-amber/30 bg-amber/5 px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-[0.1em] text-amber-dark">
                          {r.resourceType.replace("-", " ")}
                        </span>
                        {r.isFreeWeb && (
                          <span className="flex items-center gap-1 font-mono text-[9px] uppercase tracking-[0.1em] text-dark-text/50">
                            <ExternalLink className="h-3 w-3" /> free web
                          </span>
                        )}
                        <span className="flex items-center gap-1 font-mono text-[12px] text-muted-foreground">
                          <Clock className="h-3 w-3" /> {r.durationMinutes} min
                        </span>
                        {continuedIds.has(r.id) && (
                          <span className="font-mono text-[9px] uppercase tracking-[0.1em] text-teal">
                            ● in progress
                          </span>
                        )}
                      </div>
                      <div className="mt-1.5 font-serif text-[16px] font-bold leading-snug text-ink">
                        {r.title}
                      </div>
                      <div className="mt-2 flex flex-wrap items-center gap-3">
                        {r.chapterTitle && (
                          <span className="font-mono text-[12px] uppercase tracking-wider text-muted-foreground">
                            {r.subjectLabel} · {r.chapterTitle}
                          </span>
                        )}
                        {r.topicTitle && (
                          <>
                            <span className="hidden h-1 w-1 rounded-full bg-ink/20 sm:block" />
                            <Link
                              href={`/topic/${r.topicId}`}
                              className="border-b border-dotted border-teal/60 font-mono text-[12px] uppercase tracking-wider text-teal transition-colors hover:border-teal"
                            >
                              {r.topicTitle}
                            </Link>
                          </>
                        )}
                        <span className="hidden h-1 w-1 rounded-full bg-ink/20 sm:block" />
                        <span className="font-mono text-[12px] uppercase tracking-wider text-muted-foreground">
                          Relevance {r.relevance}
                        </span>
                      </div>
                      {r.learningObjective && (
                        <p className="mt-1.5 flex gap-1.5 text-[12.5px] italic text-dark-text/70">
                          <BookOpenText className="mt-0.5 h-3.5 w-3.5 shrink-0 text-teal" />
                          Objective — {r.learningObjective}
                        </p>
                      )}
                      {/* Progressive disclosure: one line, evidence behind a toggle */}
                      <div className="mt-2 max-w-3xl">
                        {expandedWhy === r.id ? (
                          <div className="border-l border-dotted border-ink/15 pl-3">
                            <span className="font-mono text-[12px] font-bold uppercase tracking-[0.1em] text-teal-dark">
                              Why Cognify recommends
                            </span>
                            <p className="mt-1 text-[14px] leading-relaxed text-dark-text/75">{r.whyRecommended}</p>
                            <button
                              onClick={() => setExpandedWhy(null)}
                              className="mt-1 font-display text-xs uppercase tracking-[0.08em] text-ink/55 hover:text-teal"
                            >
                              Hide details ←
                            </button>
                          </div>
                        ) : (
                          <p className="text-[14px] leading-relaxed text-dark-text/75">
                            <span className="font-mono text-[12px] font-bold uppercase tracking-[0.1em] text-teal-dark">
                              Why recommended{" "}
                            </span>
                            {r.whyRecommended.split(".").slice(0, 1).join("")}.
                            <button
                              onClick={() => setExpandedWhy(r.id)}
                              className="ml-2 border-b border-teal/50 pb-0.5 font-display text-xs uppercase tracking-[0.08em] text-teal transition-colors hover:border-teal"
                            >
                              Learn more →
                            </button>
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <button
                        onClick={() => navigate(`/session/${r.id}?topic=${r.topicId}`)}
                        className="h-9 whitespace-nowrap border border-ink bg-ink px-4 font-mono text-[10.5px] uppercase tracking-[0.12em] text-ivory transition-all duration-150 hover:bg-teal hover:border-teal active:scale-[0.97]"
                      >
                        Begin session
                      </button>
                      <button
                        onClick={() => {
                          toast("Saved to your shelf");
                          import("@/lib/savedResources").then((m) => m.addSaved(r));
                        }}
                        className="h-9 whitespace-nowrap border border-ink/25 bg-card px-3 font-mono text-[12px] uppercase tracking-[0.12em] text-ink/70 transition-all duration-150 hover:border-teal hover:text-teal active:scale-[0.97]"
                      >
                        Save
                      </button>
                    </div>
                  </div>
                  <Hairline className="-mb-1" />
                </li>
              ))}
            </ul>
          ) : (
            <div className="mt-10 flex flex-col items-center gap-3 border border-dashed border-ink/20 py-14 text-center">
              <SearchX className="h-6 w-6 text-ink/30" />
              <div className="font-serif text-lg font-bold text-ink">
                No resources match these filters
              </div>
              <p className="footnote max-w-md">
              Try adjusting your filters to see more resources.
              </p>
            </div>
          )}

          <p className="footnote mt-6 max-w-2xl border-l-2 border-teal/40 pl-4">
            Our library is curated from NCERT, CBSE, and other trusted educational sources. 
            Recommendations are tailored to your learning style and recent progress to help you study more effectively.
          </p>
        </section>

        {/* Margin panel */}
        <aside className="w-full shrink-0 space-y-6 lg:w-80">
          <div className="border border-ink/10 bg-card p-5">
            <Marginalia>Index — subjects</Marginalia>
            <ul className="mt-3 space-y-1.5">
              {Array.from(new Set(indexes.map((i) => i.subjectName)))
                .filter((name) => {
                  if (subjectFilter === "all") return true;
                  return name === (subjectNames[subjectFilter] ?? "");
                })
                .map((name) => {
                  const count = indexes.filter((i) => i.subjectName === name).length;
                  return (
                    <li key={name} className="flex items-baseline justify-between border-b border-dotted border-ink/15 pb-1">
                      <span className="font-serif text-[14px] text-ink">{name}</span>
                      <span className="font-mono text-[12px] text-muted-foreground">{count} topics</span>
                    </li>
                  );
                })}
            </ul>
          </div>

          <div className="border border-ink/10 bg-card p-5">
            <Marginalia>Type legend</Marginalia>
            <ul className="mt-3 space-y-2">
              {RESOURCE_TYPES.map((t, i) => (
                <li key={t.id} className="flex items-center gap-2 text-[12px] text-dark-text/75">
                  <span className="index-num">{String(i + 1).padStart(2, "0")}</span>
                  <span className="font-mono text-[10.5px] uppercase tracking-wider">{t.label}</span>
                  <span className="ml-auto font-mono text-[9px] text-muted-foreground">{t.id}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="border border-ink/10 bg-card p-5">
            <Marginalia amber>Before you open a resource</Marginalia>
            <ol className="mt-3 space-y-3">
              <li>
                <div className="font-mono text-[9px] uppercase tracking-[0.08em] text-teal">1 · Understand</div>
                <p className="mt-1 text-[12.5px] leading-relaxed text-dark-text/75">
                  Each row states what the resource is and what objective it serves —
                  read the “why recommended” line before beginning.
                </p>
              </li>
              <li>
                <div className="font-mono text-[9px] uppercase tracking-[0.08em] text-teal">2 · Learn at your pace</div>
                <p className="mt-1 text-[12.5px] leading-relaxed text-dark-text/75">
                  We follow your progress as you learn, adjusting your path based on what you find easy or challenging.
                </p>
              </li>
              <li>
                <div className="font-mono text-[9px] uppercase tracking-[0.08em] text-teal">3 · After this</div>
                <p className="mt-1 text-[12.5px] leading-relaxed text-dark-text/75">
                  A watched resource is followed by a retrieval check and a practice set —
                  the session never ends at the video.
                </p>
              </li>
            </ol>
          </div>

          <div className="border border-ink bg-ink p-5 text-ivory">
            <div className="font-mono text-[9px] uppercase tracking-[0.08em] text-teal">Observation</div>
            <p className="mt-2 font-serif text-[15px] leading-relaxed">
              A catalogue is only useful if it is consulted. Finish a started pass before
              opening a fresh resource — the data favours depth over breadth.
            </p>
          </div>
        </aside>
      </div>
    </AppShell>
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
    default:
      return "learn";
  }
}
