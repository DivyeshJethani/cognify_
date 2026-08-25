/**
 * COGNIFY — Stretch Goals (Day 12 Redesign)
 * Coming Soon placeholder in high-fidelity style.
 */
import AppShell, { PageHeader } from "@/components/cognify/AppShell";
import { Award, Target, TrendingUp, Flag, Sparkles } from "lucide-react";

export default function GoalsPage() {
  return (
    <AppShell>
      <div className="py-6 animate-fade-in">
        <PageHeader
          title="Stretch Goals"
          subtitle="Personal milestones that adapt to your learning pace."
        />

        <div className="mx-auto max-w-2xl mt-12">
           <div className="card-rounded p-12 bg-white shadow-soft border border-slate-100 text-center space-y-6">
              <div className="inline-flex h-20 w-20 items-center justify-center rounded-3xl bg-teal/10 text-teal mb-2">
                 <Award className="h-10 w-10" />
              </div>
              
              <div className="space-y-2">
                 <h2 className="text-2xl font-bold text-navy">Coming Soon to Cognify</h2>
                 <p className="text-slate-light leading-relaxed max-w-md mx-auto">
                    We're building a reward system that celebrates real growth, not just grades. Goals will be automatically generated based on your unique learning path.
                 </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-8 border-t border-slate-50">
                 <div className="space-y-2">
                    <div className="h-8 w-8 rounded-lg bg-purple/10 text-purple mx-auto flex items-center justify-center">
                       <Target className="h-4 w-4" />
                    </div>
                    <p className="text-[10px] font-bold text-navy uppercase tracking-widest">Adaptive</p>
                    <p className="text-[10px] text-slate-light italic">Goals that fit you</p>
                 </div>
                 <div className="space-y-2">
                    <div className="h-8 w-8 rounded-lg bg-teal/10 text-teal mx-auto flex items-center justify-center">
                       <TrendingUp className="h-4 w-4" />
                    </div>
                    <p className="text-[10px] font-bold text-navy uppercase tracking-widest">Verified</p>
                    <p className="text-[10px] text-slate-light italic">Real mastery logs</p>
                 </div>
                 <div className="space-y-2">
                    <div className="h-8 w-8 rounded-lg bg-orange/10 text-orange mx-auto flex items-center justify-center">
                       <Flag className="h-4 w-4" />
                    </div>
                    <p className="text-[10px] font-bold text-navy uppercase tracking-widest">Rewarding</p>
                    <p className="text-[10px] text-slate-light italic">Earn recognition</p>
                 </div>
              </div>

              <div className="pt-6">
                 <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-50 text-[10px] font-bold text-slate-light uppercase tracking-[0.2em]">
                    <Sparkles className="h-3 w-3" /> Under Development
                 </div>
              </div>
           </div>
        </div>
      </div>
    </AppShell>
  );
}
