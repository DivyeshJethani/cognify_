/**
 * COGNIFY — Curriculum Explorer (Day 12 Redesign)
 * High-fidelity curriculum map.
 */
import { useEffect, useMemo, useState } from "react";
import AppShell, { PageHeader } from "@/components/cognify/AppShell";
import {
  ActionChip,
  MasteryBar,
  RevisionChip,
  StateBadge,
} from "@/components/cognify/Primitives";
import { boards } from "@/lib/mockData";
import { classSubjects, getStudyContext, onContextChange, subjectFor } from "@/lib/studyContext";
import { topicAlias } from "@/lib/curriculum";
import { subjectOverview } from "@/lib/curriculumEngine";
import { cn } from "@/lib/utils";
import { 
  BookOpen, 
  ChevronRight, 
  Search, 
  Filter, 
  Layers, 
  BarChart3, 
  History,
  Play,
  Lightbulb,
  PenLine
} from "lucide-react";
import { useLocation } from "wouter";
import type { Subject, Topic } from "@/lib/types";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const subjectIcons: Record<string, string> = {
  MATH: "📐",
  SCI: "⚛️",
  SST: "🧪",
  ENG: "📖",
  HIN: "📝",
  SKT: "📜",
};

const subjectColors: Record<string, string> = {
  MATH: "bg-blue-500",
  SCI: "bg-green-500",
  SST: "bg-amber-500",
  ENG: "bg-purple-500",
  HIN: "bg-rose-500",
  SKT: "bg-teal-500",
};

type ViewMode = "outline" | "mastery" | "revision";

export default function Curriculum() {
  const [, navigate] = useLocation();
  const [boardId, setBoardId] = useState(() => getStudyContext().boardId);
  const [classId, setClassId] = useState(() => getStudyContext().classId);
  const [subjectId, setSubjectId] = useState("__all__");
  const [activeChapter, setActiveChapter] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>("outline");

  const board = boards.find((b) => b.id === boardId)!;
  const cls = board.classes.find((c) => c.id === classId)!;
  const subject = subjectFor(boardId, classId, subjectId);
  const variantSubjects = useMemo(
    () => classSubjects(boardId, classId),
    [boardId, classId]
  );

  useEffect(() => {
    const c = getStudyContext();
    setBoardId(c.boardId);
    setClassId(c.classId);
    return onContextChange(() => {
      const next = getStudyContext();
      setBoardId(next.boardId);
      setClassId(next.classId);
    });
  }, []);

  useEffect(() => {
    if (subject && !subject.chapters.find((c) => c.id === activeChapter)) {
      setActiveChapter(subject.chapters[0]?.id ?? null);
    }
  }, [subjectId, classId, boardId]);

  const chapter = subject?.chapters.find((c) => c.id === activeChapter);
  const allTopicEntries = useMemo(
    () =>
      subject
        ? subject.chapters.flatMap((ch) => ch.topics.map((t) => ({ chapter: ch, topic: t })))
        : [],
    [subject]
  );

  const dueForRevision = allTopicEntries.filter(
    (e) => e.topic.revisionStatus === "due" || e.topic.revisionStatus === "overdue"
  );

  const isTopLevel = subjectId === "__all__";

  return (
    <AppShell>
      <div className="py-6 animate-fade-in">
        <PageHeader
          title={isTopLevel ? "Curriculum Explorer" : subject?.name || "Subject"}
          subtitle={isTopLevel 
            ? `Browse your ${board.name} Class ${cls.name} curriculum`
            : `${subject?.chapters.length} chapters · ${allTopicEntries.length} topics`
          }
          actions={
            <div className="flex items-center gap-2">
               {!isTopLevel && (
                 <button 
                   onClick={() => setSubjectId("__all__")}
                   className="btn-rounded bg-white text-navy border border-slate-200 text-xs py-2"
                 >
                   Back to all
                 </button>
               )}
               <Select value={classId} onValueChange={setClassId}>
                 <SelectTrigger className="h-9 w-32 rounded-xl border-slate-200 bg-white text-xs">
                   <SelectValue />
                 </SelectTrigger>
                 <SelectContent>
                   {board.classes.map((c) => (
                     <SelectItem key={c.id} value={c.id}>Class {c.name}</SelectItem>
                   ))}
                 </SelectContent>
               </Select>
            </div>
          }
        />

        {isTopLevel ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {variantSubjects.map((s) => {
              const overview = subjectOverview(s.id, boardId, classId);
              if (!overview) return null;
              const colorClass = subjectColors[s.code] || "bg-teal-500";
              const icon = subjectIcons[s.code] || "📚";
              
              return (
                <div
                  key={s.id}
                  onClick={() => setSubjectId(s.id)}
                  className="card-rounded p-6 card-hover group cursor-pointer flex flex-col"
                >
                  <div className={cn("mb-4 flex h-12 w-12 items-center justify-center rounded-2xl text-2xl shadow-sm", colorClass + "/10")}>
                    {icon}
                  </div>
                  <h3 className="text-lg font-bold text-navy">{s.name}</h3>
                  <p className="mt-2 text-xs text-slate-light leading-relaxed">
                    {overview.recommendedAction ?? `Explore ${s.chapters.length} chapters and ${overview.topicCount} topics.`}
                  </p>
                  
                  <div className="mt-6 grid grid-cols-2 gap-4">
                    <div className="rounded-xl bg-slate-50 p-3">
                      <div className="text-sm font-bold text-navy">{overview.mastery}%</div>
                      <div className="text-[9px] font-bold text-slate-light uppercase">Mastery</div>
                    </div>
                    <div className="rounded-xl bg-slate-50 p-3">
                      <div className="text-sm font-bold text-navy">{s.chapters.length}</div>
                      <div className="text-[9px] font-bold text-slate-light uppercase">Chapters</div>
                    </div>
                  </div>
                  
                  <div className="mt-6 flex items-center justify-between pt-4 border-t border-slate-100">
                    <span className="text-[11px] font-bold text-teal group-hover:underline">Open subject</span>
                    <ChevronRight className="h-4 w-4 text-teal group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-[280px_1fr]">
            {/* Sidebar Chapters */}
            <aside className="space-y-4">
              <div className="card-rounded p-2 bg-white/50 backdrop-blur-sm">
                <div className="px-4 py-3 border-b border-slate-100 mb-2">
                   <h3 className="text-[11px] font-bold uppercase tracking-widest text-slate-light">Chapters</h3>
                </div>
                <div className="space-y-1">
                  {subject?.chapters.map((ch) => {
                    const active = activeChapter === ch.id;
                    const mastery = Math.round(
                      ch.topics.reduce((n, t) => n + t.mastery, 0) / ch.topics.length
                    );
                    return (
                      <button
                        key={ch.id}
                        onClick={() => setActiveChapter(ch.id)}
                        className={cn(
                          "flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left transition-all",
                          active 
                            ? "bg-teal text-white shadow-lg shadow-teal/20" 
                            : "text-navy hover:bg-white hover:shadow-soft"
                        )}
                      >
                        <div className={cn(
                          "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-xs font-bold",
                          active ? "bg-white/20" : "bg-slate-100 text-slate-light"
                        )}>
                          {ch.index}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="truncate text-sm font-bold leading-tight">{ch.title}</div>
                          <div className={cn("mt-0.5 text-[10px]", active ? "text-white/70" : "text-slate-light")}>
                            {ch.topics.length} topics · {mastery}%
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </aside>

            {/* Topic Content */}
            <div className="space-y-6">
               <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 bg-white p-1 rounded-xl shadow-soft border border-slate-100">
                     {[
                       { id: "outline", label: "Chapter Index", icon: Layers },
	                       { id: "mastery", label: "Understanding", icon: BarChart3 },
                       { id: "revision", label: "Revision Due", icon: History },
                     ].map((mode) => (
                       <button
                         key={mode.id}
                         onClick={() => setViewMode(mode.id as ViewMode)}
                         className={cn(
                           "flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-bold transition-all",
                           viewMode === mode.id 
                             ? "bg-teal text-white shadow-sm" 
                             : "text-slate-light hover:bg-slate-50 hover:text-navy"
                         )}
                       >
                         <mode.icon className="h-3.5 w-3.5" />
                         {mode.label}
                       </button>
                     ))}
                  </div>
               </div>

               <div className="space-y-4">
                  {viewMode === "outline" && chapter && (
                    <div className="space-y-4">
                      {chapter.topics.map((t, i) => (
                        <TopicCard key={t.id} topic={t} index={i} />
                      ))}
                    </div>
                  )}

                  {viewMode === "mastery" && (
                    <div className="space-y-4">
                      {[...allTopicEntries]
                        .sort((a, b) => a.topic.mastery - b.topic.mastery)
                        .map((e, i) => (
                          <TopicCard key={e.topic.id} topic={e.topic} index={i} chapterTitle={e.chapter.title} />
                        ))}
                    </div>
                  )}

                  {viewMode === "revision" && (
                    <div className="space-y-4">
                      {dueForRevision.length === 0 ? (
                        <div className="card-rounded p-12 text-center">
                           <History className="mx-auto h-12 w-12 text-slate-200 mb-4" />
                           <h3 className="text-lg font-bold text-navy">All caught up!</h3>
                           <p className="text-sm text-slate-light">No topics are due for revision in this subject.</p>
                        </div>
                      ) : (
                        dueForRevision.map((e, i) => (
                          <TopicCard key={e.topic.id} topic={e.topic} index={i} chapterTitle={e.chapter.title} />
                        ))
                      )}
                    </div>
                  )}
               </div>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}

function TopicCard({ 
  topic, 
  index, 
  chapterTitle 
}: { 
  topic: Topic; 
  index: number;
  chapterTitle?: string;
}) {
  const [, navigate] = useLocation();
  const slug = topicAlias(topic.id) ?? topic.id;

  return (
    <div className="card-rounded p-5 card-hover group">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
             {chapterTitle && (
               <span className="text-[10px] font-bold text-slate-light uppercase tracking-wider">{chapterTitle}</span>
             )}
             <StateBadge state={topic.state} />
             <RevisionChip dueInDays={topic.revisionDueInDays} status={topic.revisionStatus} />
          </div>
          <h3 className="text-lg font-bold text-navy group-hover:text-teal transition-colors">
            {topic.title}
          </h3>
          <div className="mt-4 flex items-center gap-6">
             <div className="flex-1 max-w-[200px]">
                <div className="flex items-center justify-between mb-1.5">
                   <span className="text-[10px] font-bold text-slate-light uppercase">Mastery</span>
                   <span className="text-[10px] font-bold text-navy">{topic.mastery}%</span>
                </div>
                <MasteryBar value={topic.mastery} className="h-1.5" />
             </div>
             {topic.recommendedAction && (
               <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold text-slate-light uppercase">Next:</span>
                  <ActionChip action={topic.recommendedAction} />
               </div>
             )}
          </div>
        </div>
        
        <div className="flex shrink-0 items-center gap-2 self-center">
           <button 
             onClick={() => navigate(`/topic/${slug}`)}
             className="h-10 w-10 rounded-xl bg-teal/10 text-teal flex items-center justify-center hover:bg-teal hover:text-white transition-all shadow-sm"
             title="Watch Video"
           >
             <Play className="h-4 w-4 fill-current" />
           </button>
           <button 
             onClick={() => navigate(`/practice?topic=${slug}`)}
             className="h-10 w-10 rounded-xl bg-orange/10 text-orange flex items-center justify-center hover:bg-orange hover:text-white transition-all shadow-sm"
             title="Practice"
           >
             <PenLine className="h-4 w-4" />
           </button>
                 <button 
                   onClick={() => navigate(`/teach?topic=${slug}`)}
                   className="h-10 w-10 rounded-xl bg-purple/10 text-purple flex items-center justify-center hover:bg-purple hover:text-white transition-all shadow-sm"
                   title="Teach Back"
                 >
                   <Lightbulb className="h-4 w-4" />
                 </button>
        </div>
      </div>
    </div>
  );
}
