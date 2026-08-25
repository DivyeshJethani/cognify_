/**
 * COGNIFY — Subject page (/subject/:subjectId) (Day 12 Redesign)
 * High-fidelity redesign with rounded cards and modern typography.
 */
import { useMemo, useState } from "react";
import AppShell, { PageHeader } from "@/components/cognify/AppShell";
import {
  ActionChip,
  MasteryBar,
  RevisionChip,
  StateBadge,
} from "@/components/cognify/Primitives";
import { contextLabel, getStudyContext, subjectFor } from "@/lib/studyContext";
import { subjectOverview, chapterPriority } from "@/lib/curriculumEngine";
import { topicAlias } from "@/lib/curriculum";
import { cn } from "@/lib/utils";
import { 
  BookOpen, 
  CalendarClock, 
  Flame, 
  SearchX, 
  ArrowRight,
  ChevronRight,
  Target,
  Clock,
  Zap,
  ChevronDown
} from "lucide-react";
import { useLocation, useRoute } from "wouter";
import { Button } from "@/components/ui/button";

type SortKey = "order" | "priority" | "mastery" | "revision";

export default function SubjectPage() {
  const [match, params] = useRoute("/subject/:subjectId");
  const subjectId = match ? params.subjectId : "";
  const [, navigate] = useLocation();
  const [sortKey, setSortKey] = useState<SortKey>("order");

  const ctx = getStudyContext();
  const subject = subjectFor(ctx.boardId, ctx.classId, subjectId);
  const overview = useMemo(() => (subject ? subjectOverview(subject.id) : null), [subject]);

  if (!subject) {
    return (
      <AppShell>
        <PageHeader
          title="Subject not found"
          subtitle="Select a subject from the Curriculum Explorer to open its ledger."
          actions={
            <Button
              onClick={() => navigate("/curriculum")}
              variant="outline"
              className="rounded-xl border-slate-200"
            >
              ← Curriculum Explorer
            </Button>
          }
        />
      </AppShell>
    );
  }

  const chaptersWithTopics = (overview?.chapters ?? []).map((co, i) => ({
    co,
    ch: co.chapter,
    priority: chapterPriority(co),
    mastery: co.mastery,
    weak: co.topicsNeedingAttention,
    due: co.nextRevision ? 1 : 0,
    order: i,
  })).filter(({ ch }) => subject.chapters.some((s) => s.id === ch.id));

  const PRIORITY_RANK: Record<string, number> = { high: 3, medium: 2, low: 1, stable: 0 };
  const sorted = [...chaptersWithTopics];
  if (sortKey === "priority") sorted.sort((a, b) => PRIORITY_RANK[b.priority] - PRIORITY_RANK[a.priority]);
  if (sortKey === "mastery") sorted.sort((a, b) => a.mastery - b.mastery);
  if (sortKey === "revision") sorted.sort((a, b) => b.due - a.due);

  const totalMastery = overview?.mastery ?? Math.round(subject.chapters.flatMap((c) => c.topics).reduce((n, t) => n + t.mastery, 0) / subject.chapters.flatMap((c) => c.topics).length);
  const topicsTotal = subject.chapters.reduce((n, c) => n + c.topics.length, 0);

  const sortButtons: [SortKey, string][] = [
    ["order", "Order"],
    ["priority", "Priority"],
    ["mastery", "Mastery"],
    ["revision", "Revision"],
  ];

  return (
    <AppShell>
      <div className="py-6 animate-fade-in">
        <PageHeader
          title={subject.name}
          subtitle={`${contextLabel()} · ${subject.chapters.length} Chapters · ${topicsTotal} Topics`}
          actions={
            <Button
              onClick={() => navigate("/curriculum")}
              variant="outline"
              className="rounded-xl border-slate-200 bg-white shadow-soft"
            >
              ← All subjects
            </Button>
          }
        />

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-8">
          {/* Main Content Area */}
          <div className="space-y-8">
             {/* Subject Stats */}
             <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div className="card-rounded p-6 bg-white border border-slate-100 shadow-soft">
                   <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal/10 text-teal mb-4">
                      <Target className="h-5 w-5" />
                   </div>
	                   <div className="text-2xl font-bold text-navy">{totalMastery}%</div>
	                   <div className="text-[10px] font-bold text-slate-light uppercase tracking-widest">Understanding</div>
                   <div className="mt-4 h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-teal" style={{ width: `${totalMastery}%` }} />
                   </div>
                </div>
                <div className="card-rounded p-6 bg-white border border-slate-100 shadow-soft">
                   <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple/10 text-purple mb-4">
                      <Clock className="h-5 w-5" />
                   </div>
                   <div className="text-2xl font-bold text-navy">{overview?.upcomingRevisions.length || 0}</div>
                   <div className="text-[10px] font-bold text-slate-light uppercase tracking-widest">Revisions Due</div>
                   <div className="mt-2 text-[10px] text-slate-light italic">Next 7 days</div>
                </div>
                <div className="card-rounded p-6 bg-white border border-slate-100 shadow-soft">
                   <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange/10 text-orange mb-4">
                      <Zap className="h-5 w-5" />
                   </div>
                   <div className="text-2xl font-bold text-navy">{chaptersWithTopics.filter(c => c.priority === 'high').length}</div>
                   <div className="text-[10px] font-bold text-slate-light uppercase tracking-widest">High Priority</div>
                   <div className="mt-2 text-[10px] text-slate-light italic">Chapters to focus on</div>
                </div>
             </div>

             {/* Chapter List */}
             <section>
                <div className="flex items-center justify-between mb-6">
                   <h2 className="text-lg font-bold text-navy">Curriculum Ledger</h2>
                   <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-slate-100 shadow-soft">
                      {sortButtons.map(([key, label]) => (
                        <button
                          key={key}
                          onClick={() => setSortKey(key)}
                          className={cn(
                            "px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all",
                            sortKey === key ? "bg-navy text-white" : "text-slate-light hover:bg-slate-50"
                          )}
                        >
                          {label}
                        </button>
                      ))}
                   </div>
                </div>

                <div className="space-y-4">
                   {sorted.map(({ ch, priority, mastery, weak, due }, idx) => (
                     <div key={ch.id} className="card-rounded bg-white border border-slate-100 shadow-soft overflow-hidden group">
                        <div className="p-6">
                           <div className="flex items-start justify-between gap-4 mb-4">
                              <div className="flex items-start gap-4">
                                 <div className="h-10 w-10 shrink-0 flex items-center justify-center rounded-xl bg-slate-50 text-slate-400 font-bold">
                                    {String(ch.index).padStart(2, "0")}
                                 </div>
                                 <div>
                                    <div className="flex flex-wrap items-center gap-2 mb-1">
                                       <span className={cn(
                                         "px-2 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-widest border",
                                         priority === "high" ? "bg-orange/5 border-orange/20 text-orange" :
                                         priority === "medium" ? "bg-teal/5 border-teal/20 text-teal" :
                                         "bg-slate-50 border-slate-200 text-slate-light"
                                       )}>
                                          {priority} Priority
                                       </span>
                                       {weak > 0 && (
                                         <span className="px-2 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-widest bg-orange/5 border border-orange/20 text-orange">
                                            {weak} Weak
                                         </span>
                                       )}
                                       {due > 0 && (
                                         <span className="px-2 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-widest bg-teal/5 border border-teal/20 text-teal">
                                            Revision Due
                                         </span>
                                       )}
                                    </div>
                                    <h3 className="text-xl font-bold text-navy leading-tight">{ch.title}</h3>
                                 </div>
                              </div>
                              <div className="text-right">
	                                 <div className="text-2xl font-bold text-navy">{mastery}%</div>
	                                 <div className="text-[10px] font-bold text-slate-light uppercase tracking-widest">Understanding</div>
                              </div>
                           </div>

                           <div className="space-y-2 mt-6">
                              {ch.topics.map((t) => (
                                <button
                                  key={t.id}
                                  onClick={() => navigate(`/topic/${topicAlias(t.id)}`)}
                                  className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 transition-colors text-left group/topic"
                                >
                                   <div className="flex items-center gap-3">
                                      <div className="h-2 w-2 rounded-full bg-slate-200 group-hover/topic:bg-teal transition-colors" />
                                      <span className="text-sm font-medium text-navy">{t.title}</span>
                                      <div className="flex gap-2">
                                         <StateBadge state={t.state} />
                                         <RevisionChip dueInDays={t.revisionDueInDays} status={t.revisionStatus} />
                                      </div>
                                   </div>
                                   <div className="flex items-center gap-3">
                                      <MasteryBar value={t.mastery} className="w-16 h-1" />
                                      <ChevronRight className="h-4 w-4 text-slate-300 group-hover/topic:text-teal transition-colors" />
                                   </div>
                                </button>
                              ))}
                           </div>
                           
                           <div className="mt-6 pt-6 border-t border-slate-50 flex justify-end">
                              <Button 
                                onClick={() => ch.topics[0] && navigate(`/topic/${topicAlias(ch.topics[0].id)}`)}
                                variant="ghost" 
                                className="text-teal text-xs font-bold uppercase tracking-widest hover:bg-teal/5"
                              >
                                 Open Chapter <ArrowRight className="ml-2 h-4 w-4" />
                              </Button>
                           </div>
                        </div>
                     </div>
                   ))}
                </div>
             </section>
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
             <div className="card-rounded p-6 bg-white border border-slate-100 shadow-soft">
                <h3 className="text-sm font-bold text-navy mb-4">Subject Recommendation</h3>
                <div className="p-4 rounded-xl bg-teal/5 border border-teal/10 mb-6">
                   <p className="text-xs text-navy font-bold leading-relaxed">
                      {overview?.recommendedActionReason || "Focus on high-priority chapters to maintain a balanced learning path."}
                   </p>
                </div>
                <Button className="w-full rounded-xl bg-teal text-white shadow-lg shadow-teal/20 hover:bg-teal/90 text-xs font-bold uppercase tracking-widest h-11">
                   {overview?.recommendedAction || "Start Learning"}
                </Button>
             </div>

             {overview && overview.upcomingRevisions.length > 0 && (
               <div className="card-rounded p-6 bg-white border border-slate-100 shadow-soft">
                  <h3 className="text-sm font-bold text-navy mb-4 flex items-center gap-2">
                     <CalendarClock className="h-4 w-4 text-orange" />
                     Revision Due
                  </h3>
                  <div className="space-y-4">
                     {overview.upcomingRevisions.slice(0, 5).map((title, i) => (
                       <div key={i} className="flex items-start gap-3 group cursor-pointer">
                          <div className="h-2 w-2 rounded-full bg-orange/40 mt-1.5 group-hover:bg-orange" />
                          <span className="text-xs text-slate-600 leading-tight group-hover:text-navy transition-colors">{title}</span>
                       </div>
                     ))}
                  </div>
               </div>
             )}

             <div className="card-rounded p-6 bg-slate-50 border border-slate-100">
                <h3 className="text-xs font-bold text-navy mb-4">Learning Tips</h3>
                <div className="space-y-4">
                   <div className="flex gap-3">
                      <div className="h-5 w-5 shrink-0 rounded-full bg-white flex items-center justify-center text-[10px] font-bold shadow-sm">1</div>
                      <p className="text-[10px] text-slate-light leading-relaxed">
                         Prioritize chapters marked in orange — these are topics that need a bit more attention right now.
                      </p>
                   </div>
                   <div className="flex gap-3">
                      <div className="h-5 w-5 shrink-0 rounded-full bg-white flex items-center justify-center text-[10px] font-bold shadow-sm">2</div>
                      <p className="text-[10px] text-slate-light leading-relaxed">
                         Revise topics as soon as they are due to help keep the concepts fresh in your mind.
                      </p>
                   </div>
                </div>
             </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
