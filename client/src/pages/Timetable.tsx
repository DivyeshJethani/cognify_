/**
 * COGNIFY — Timetable (Day 12 Redesign)
 * High-fidelity adaptive study plan.
 */
import AppShell, { PageHeader } from "@/components/cognify/AppShell";
import { ActionChip } from "@/components/cognify/Primitives";
import { Button } from "@/components/ui/button";
import {
  timetableSessions,
  todaySessionCount,
  completeSession,
  skipSession,
  rescheduleSession,
  startSession,
} from "@/lib/timetable";
import { topicAlias } from "@/lib/curriculum";
import { 
  Check, 
  RotateCw, 
  SkipForward, 
  X, 
  Calendar, 
  Clock, 
  Zap, 
  AlertCircle,
  Play,
  Target
} from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { useLocation } from "wouter";
import { cn } from "@/lib/utils";

const slugOf = (id: string) => topicAlias(id) ?? id;

const subjectNames: Record<string, string> = {
  MATH: "Mathematics",
  SCI: "Science",
  SST: "Social Science",
  ENG: "English",
  HIN: "Hindi",
  SKT: "Sanskrit",
};

type Status =
  | "scheduled"
  | "in-progress"
  | "completed"
  | "skipped"
  | "rescheduled";

export default function TimetablePage() {
  const seed = timetableSessions();
  const [statusMap, setStatusMap] = useState<Record<string, Status>>({});
  const [, navigate] = useLocation();
  const periods = useMemo(() => ["today", "week", "upcoming"] as const, []);
  const sessions = seed.map((s) => ({
    ...s,
    status: (statusMap[s.id] ?? s.status) as Status,
  }));

  const completed = Object.values(statusMap).filter((s) => s === "completed").length;
  const todayTotal = todaySessionCount();
  const todayMinutes = sessions
    .filter((s) => s.period === "today" && s.status === "scheduled")
    .reduce((n, s) => n + s.durationMinutes, 0);

  function handleStart(id: string) {
    startSession(id);
    setStatusMap((m) => ({ ...m, [id]: "in-progress" }));
    toast.info("Session started");
  }
  function handleComplete(id: string) {
    completeSession(id);
    setStatusMap((m) => ({ ...m, [id]: "completed" }));
    toast.success("Session completed!");
  }
  function handleSkip(id: string) {
    skipSession(id);
    setStatusMap((m) => ({ ...m, [id]: "skipped" }));
    toast.warning("Session skipped");
  }
  function handleReschedule(id: string) {
    rescheduleSession(id, "tomorrow");
    setStatusMap((m) => ({ ...m, [id]: "rescheduled" }));
    toast.info("Rescheduled to tomorrow");
  }

  return (
    <AppShell>
      <div className="py-6 animate-fade-in">
        <PageHeader
          title="Study Planner"
          subtitle="Your adaptive schedule, balanced for growth"
          actions={
            <div className="flex items-center gap-2">
               <Button variant="outline" size="sm" className="rounded-xl border-slate-200 bg-white text-xs h-9">
                  <Calendar className="mr-2 h-4 w-4" /> Calendar View
               </Button>
            </div>
          }
        />

        {/* Stats Overview */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
           {[
             { label: "Today's Goal", value: `${todayTotal} Sessions`, sub: `${todayMinutes} min total`, icon: Target, color: "bg-teal" },
             { label: "Completed", value: completed, sub: "sessions done", icon: Check, color: "bg-green-500" },
             { label: "Next Session", value: sessions.find(s => s.period === 'today' && s.status === 'scheduled')?.startTime || 'None', sub: "scheduled time", icon: Clock, color: "bg-purple" },
             { label: "Focus Score", value: "92%", sub: "vs yesterday", icon: Zap, color: "bg-orange" },
           ].map((stat, i) => (
             <div key={i} className="card-rounded p-6 bg-white shadow-soft border border-slate-100">
                <div className={cn("mb-4 flex h-10 w-10 items-center justify-center rounded-xl text-white shadow-lg", stat.color)}>
                   <stat.icon className="h-5 w-5" />
                </div>
                <div className="text-2xl font-bold text-navy">{stat.value}</div>
                <div className="text-[10px] font-bold text-slate-light uppercase tracking-widest">{stat.label}</div>
                <div className="mt-1 text-[10px] text-slate-light italic">{stat.sub}</div>
             </div>
           ))}
        </div>

        <div className="space-y-12">
          {periods.map((p) => {
            const rows = sessions.filter((s) => s.period === p);
            return (
              <section key={p}>
                <div className="flex items-center justify-between mb-6">
                   <h2 className="text-lg font-bold text-navy flex items-center gap-2 capitalize">
                      {p === 'today' && <div className="h-2 w-2 rounded-full bg-teal animate-pulse" />}
                      {p} Plan
                   </h2>
                   <span className="text-xs font-bold text-slate-light uppercase tracking-widest">
                      {rows.length} {rows.length === 1 ? "session" : "sessions"}
                   </span>
                </div>

                <div className="space-y-4">
                  {rows.map((s) => {
                    const isLive = s.period === "today";
                    const done = s.status === "completed";
                    const off = s.status === "skipped" || s.status === "rescheduled";
                    const inProgress = s.status === "in-progress";

                    return (
                      <div
                        key={s.id}
                        className={cn(
                          "card-rounded p-5 transition-all duration-300",
                          done ? "bg-slate-50 border-slate-200 opacity-80" : "bg-white border-slate-100 shadow-soft",
                          off && "opacity-50 grayscale"
                        )}
                      >
                        <div className="flex flex-wrap items-center justify-between gap-4">
                           <div className="flex items-start gap-4 flex-1 min-w-0">
                              <div className={cn(
                                "flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl font-bold shadow-sm",
                                done ? "bg-slate-200 text-slate-500" : "bg-navy text-white"
                              )}>
                                 {s.startTime.split(':')[0]}
                              </div>
                              <div className="flex-1 min-w-0">
                                 <div className="flex items-center gap-2 mb-1">
                                    <span className="text-[10px] font-bold text-slate-light uppercase tracking-wider">
                                       {subjectNames[s.subjectCode] || s.subjectCode}
                                    </span>
                                    <ActionChip action={s.activityType} />
                                    {s.priority === "high" && (
                                      <span className="flex items-center gap-1 text-[9px] font-bold text-orange uppercase tracking-widest">
                                         <AlertCircle className="h-3 w-3" /> High Priority
                                      </span>
                                    )}
                                 </div>
                                 <h3 className="text-lg font-bold text-navy leading-tight">{s.topicTitle}</h3>
                                 <p className="mt-2 text-xs text-slate-light italic leading-relaxed">
                                    " {s.reason} "
                                 </p>
                              </div>
                           </div>

                           <div className="flex items-center gap-4">
                              <div className="text-right hidden sm:block">
                                 <div className="text-sm font-bold text-navy">{s.startTime} – {s.endTime}</div>
                                 <div className="text-[10px] font-bold text-slate-light uppercase">{s.durationMinutes} mins</div>
                              </div>
                              
                              <div className="flex items-center gap-2">
                                 {isLive && !done && s.status === "scheduled" && (
                                   <>
                                     <Button 
                                       size="sm" 
                                       className="h-9 rounded-xl bg-teal text-white shadow-lg shadow-teal/20 hover:bg-teal/90"
                                       onClick={() => handleStart(s.id)}
                                     >
                                        <Play className="mr-2 h-3.5 w-3.5 fill-current" /> Start
                                     </Button>
                                     <Button 
                                       variant="outline" 
                                       size="sm" 
                                       className="h-9 w-9 rounded-xl border-slate-200 p-0"
                                       onClick={() => handleReschedule(s.id)}
                                       title="Reschedule"
                                     >
                                        <RotateCw className="h-4 w-4 text-slate-light" />
                                     </Button>
                                     <Button 
                                       variant="outline" 
                                       size="sm" 
                                       className="h-9 w-9 rounded-xl border-slate-200 p-0"
                                       onClick={() => handleSkip(s.id)}
                                       title="Skip"
                                     >
                                        <X className="h-4 w-4 text-slate-light" />
                                     </Button>
                                   </>
                                 )}
                                 
                                 {inProgress && (
                                   <Button 
                                     size="sm" 
                                     className="h-9 rounded-xl bg-green-500 text-white shadow-lg shadow-green-500/20 hover:bg-green-600"
                                     onClick={() => handleComplete(s.id)}
                                   >
                                      <Check className="mr-2 h-3.5 w-3.5" /> Complete
                                   </Button>
                                 )}
                                 
                                 {done && (
                                   <div className="flex h-9 items-center gap-2 px-4 rounded-xl bg-green-50 text-green-600 text-xs font-bold">
                                      <Check className="h-4 w-4" /> Done
                                   </div>
                                 )}
                                 
                                 {s.status === 'rescheduled' && (
                                   <div className="text-[10px] font-bold text-orange uppercase tracking-widest">
                                      Rescheduled
                                   </div>
                                 )}
                                 
                                 {s.status === 'skipped' && (
                                   <div className="text-[10px] font-bold text-slate-light uppercase tracking-widest">
                                      Skipped
                                   </div>
                                 )}
                              </div>
                           </div>
                        </div>
                      </div>
                    );
                  })}
                  {rows.length === 0 && (
                    <div className="card-rounded p-8 text-center border border-dashed border-slate-200">
                       <p className="text-sm text-slate-light">Nothing scheduled for this period.</p>
                    </div>
                  )}
                </div>
              </section>
            );
          })}
        </div>
      </div>
    </AppShell>
  );
}
