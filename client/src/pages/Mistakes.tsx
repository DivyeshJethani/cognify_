/**
 * COGNIFY — Mistake Analysis (Day 12 Redesign)
 * High-fidelity redesign with de-exposed DNA metrics.
 */
import AppShell, { PageHeader } from "@/components/cognify/AppShell";
import { MasteryBar } from "@/components/cognify/Primitives";
import { Button } from "@/components/ui/button";
import { mistakeAnalytics, categoryLabel, recentMistakes, mistakeTrendIcon } from "@/lib/mistakes";
import { topicAlias } from "@/lib/curriculum";
import {
  ArrowRight,
  ChevronDown,
  ChevronUp,
  Flame,
  Lightbulb,
  Sparkles,
  Brain,
  Zap,
  Clock,
  Info
} from "lucide-react";
import { useState } from "react";
import { Link } from "wouter";
import { cn } from "@/lib/utils";

const slugOf = (id: string) => topicAlias(id) ?? id;

const categoryMeta: Record<string, { icon: any, color: string, bg: string }> = {
  conceptual: { icon: Brain, color: "text-teal", bg: "bg-teal/10" },
  careless: { icon: Zap, color: "text-orange", bg: "bg-orange/10" },
  procedural: { icon: Clock, color: "text-navy", bg: "bg-navy/10" },
  recall: { icon: Flame, color: "text-purple", bg: "bg-purple/10" },
  interpretation: { icon: Lightbulb, color: "text-amber-500", bg: "bg-amber-500/10" },
};

export default function Mistakes() {
  const analytics = mistakeAnalytics();
  const mistakes = recentMistakes();
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const total = mistakes.length;

  return (
    <AppShell>
      <div className="py-6 animate-fade-in">
        <PageHeader
          title="Learning from Mistakes"
          subtitle="Every error is an opportunity to refine your understanding."
          actions={
            <Link href="/adaptive">
               <Button variant="outline" size="sm" className="rounded-xl border-slate-200 bg-white text-xs h-9">
                  Adaptive Lab <ArrowRight className="ml-2 h-4 w-4" />
               </Button>
            </Link>
          }
        />

        {/* Stats Overview */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
           {[
             { label: "Total Errors", value: total, sub: "last two weeks", icon: Info, color: "bg-navy" },
             { label: "Main Focus", value: categoryLabel("conceptual"), sub: "conceptual understanding", icon: Brain, color: "bg-teal" },
             { label: "Improvements", value: analytics.filter(a => a.trend === 'falling').length, sub: "patterns decreasing", icon: Zap, color: "bg-green-500" },
             { label: "New Patterns", value: analytics.filter(a => a.trend === 'rising').length, sub: "needs attention", icon: Flame, color: "bg-orange" },
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

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-8">
          {/* Main Analysis Column */}
          <div className="space-y-8">
            <section>
               <h2 className="text-lg font-bold text-navy mb-6">Error Patterns</h2>
               <div className="space-y-4">
                  {analytics.map((m) => {
                    const meta = categoryMeta[m.category] || categoryMeta.conceptual;
                    const Icon = meta.icon;
                    return (
                      <div key={m.category} className="card-rounded p-6 bg-white border border-slate-100 shadow-soft">
                         <div className="flex items-start gap-4">
                            <div className={cn("flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl", meta.bg, meta.color)}>
                               <Icon className="h-6 w-6" />
                            </div>
                            <div className="flex-1 min-w-0">
                               <div className="flex items-center justify-between mb-2">
                                  <h3 className="text-lg font-bold text-navy">{m.label}</h3>
                                  <div className="flex items-center gap-2">
                                     <span className={cn("text-xs font-bold", m.trend === 'rising' ? "text-orange" : "text-green-500")}>
                                        {mistakeTrendIcon(m.trend)} {m.percentage}%
                                     </span>
                                  </div>
                               </div>
                               <p className="text-sm text-slate-light leading-relaxed mb-4">{m.pattern}</p>
                               
                               <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 flex gap-3">
                                  <Lightbulb className="h-4 w-4 text-teal shrink-0 mt-0.5" />
                                  <div>
                                     <p className="text-[10px] font-bold text-navy uppercase tracking-widest mb-1">Our Adjustment</p>
                                     <p className="text-xs text-slate-600 leading-relaxed">{m.intervention}</p>
                                  </div>
                                </div>
                            </div>
                         </div>
                      </div>
                    );
                  })}
               </div>
            </section>

            <section>
               <h2 className="text-lg font-bold text-navy mb-6">Recent Review</h2>
               <div className="space-y-3">
                  {mistakes.map((m) => {
                    const open = expandedId === m.id;
                    const meta = categoryMeta[m.category] || categoryMeta.conceptual;
                    return (
                      <div key={m.id} className="card-rounded overflow-hidden border border-slate-100 shadow-soft bg-white">
                         <button 
                           onClick={() => setExpandedId(open ? null : m.id)}
                           className="w-full text-left p-5 flex items-center justify-between hover:bg-slate-50 transition-colors"
                         >
                            <div className="flex items-center gap-4">
                               <div className={cn("h-8 w-8 rounded-lg flex items-center justify-center", meta.bg, meta.color)}>
                                  <meta.icon className="h-4 w-4" />
                               </div>
                               <div>
                                  <h4 className="text-sm font-bold text-navy">{m.topicTitle}</h4>
                                  <p className="text-[10px] font-bold text-slate-light uppercase tracking-widest">{m.category}</p>
                               </div>
                            </div>
                            {open ? <ChevronUp className="h-4 w-4 text-slate-light" /> : <ChevronDown className="h-4 w-4 text-slate-light" />}
                         </button>
                         
                         {open && (
                           <div className="px-5 pb-5 animate-slide-down">
                              <div className="pt-4 border-t border-slate-50 space-y-4">
                                 <div className="p-4 rounded-xl bg-slate-50 text-xs font-medium text-navy leading-relaxed italic">
                                    "{m.question}"
                                 </div>
                                 
                                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="p-4 rounded-xl border border-orange/10 bg-orange/5">
                                       <p className="text-[9px] font-bold text-orange uppercase tracking-widest mb-1">Your Answer</p>
                                       <p className="text-xs text-navy font-bold">{m.studentAnswer}</p>
                                    </div>
                                    <div className="p-4 rounded-xl border border-teal/10 bg-teal/5">
                                       <p className="text-[9px] font-bold text-teal uppercase tracking-widest mb-1">Correct Answer</p>
                                       <p className="text-xs text-navy font-bold">{m.correctAnswer}</p>
                                    </div>
                                 </div>

                                 <div className="flex items-start gap-3 p-2">
                                    <Info className="h-4 w-4 text-navy shrink-0 mt-0.5" />
                                    <p className="text-xs text-slate-600 leading-relaxed">
                                       <span className="font-bold text-navy">Cause:</span> {m.likelyCause}
                                    </p>
                                 </div>

                                 <div className="flex justify-end">
                                    <Link href={`/topic/${slugOf(m.topicId)}`}>
                                       <Button variant="ghost" size="sm" className="text-teal text-[10px] font-bold uppercase tracking-widest hover:bg-teal/5">
                                          Fix this Topic <ArrowRight className="ml-2 h-3 w-3" />
                                       </Button>
                                    </Link>
                                 </div>
                              </div>
                           </div>
                         )}
                      </div>
                    );
                  })}
               </div>
            </section>
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
             <div className="card-rounded p-6 bg-navy text-white shadow-xl shadow-navy/20">
                <h3 className="text-sm font-bold mb-4">Why we classify errors</h3>
                <div className="space-y-6">
                   {[
                     { label: "Conceptual", desc: "We'll show you more diagrams and analogies." },
                     { label: "Careless", desc: "We'll add verification steps to your practice." },
                     { label: "Recall", desc: "We'll tighten your revision schedule." },
                   ].map((item) => (
                     <div key={item.label}>
                        <div className="text-[10px] font-bold text-teal uppercase tracking-widest mb-1">{item.label}</div>
                        <p className="text-xs text-slate-300 leading-relaxed">{item.desc}</p>
                     </div>
                   ))}
                </div>
             </div>

             <div className="card-rounded p-6 bg-white border border-slate-100 shadow-soft">
                <h3 className="text-sm font-bold text-navy mb-4">Confidence Check</h3>
                <p className="text-xs text-slate-light leading-relaxed mb-6">
                   Errors made with high confidence often signal a "hidden" misunderstanding.
                </p>
                <div className="space-y-4">
                   <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-slate-light uppercase">High Confidence Errors</span>
                      <span className="text-xs font-bold text-navy">{mistakes.filter(m => m.confidence === 'high').length}</span>
                   </div>
                   <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-slate-light uppercase">Low Confidence Errors</span>
                      <span className="text-xs font-bold text-navy">{mistakes.filter(m => m.confidence === 'low').length}</span>
                   </div>
                </div>
                <Link href="/confidence">
                   <Button variant="outline" className="w-full mt-6 rounded-xl border-slate-200 text-[10px] font-bold uppercase tracking-widest">
                      Calibrate Confidence
                   </Button>
                </Link>
             </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
