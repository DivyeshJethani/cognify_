/**
 * COGNIFY — Student Profile (Day 12 Redesign)
 * High-fidelity student profile and learning insights.
 */
import AppShell, { PageHeader } from "@/components/cognify/AppShell";
import { MasteryBar } from "@/components/cognify/Primitives";
import { useApp } from "@/contexts/AppContext";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { 
  Activity, 
  Award, 
  Target, 
  Zap, 
  Clock, 
  Flame,
  Brain,
  ChevronRight,
  ShieldCheck
} from "lucide-react";
import { calibrationSummary, confidenceReadings } from "@/lib/confidence";
import { featuredIntervention, activeInterventions } from "@/lib/interventions";
import { cn } from "@/lib/utils";

const formatLabels: Record<string, string> = {
  "visual-diagram": "Visual diagrams",
  "worked-example": "Worked examples",
  analogy: "Analogy",
  "step-by-step": "Step-by-step",
  "verbal-explanation": "Verbal explanation",
};

export default function Profile() {
  const { profile, dna, credits } = useApp();

  return (
    <AppShell>
      <div className="py-6 animate-fade-in">
        <PageHeader
          title="Your Profile"
          subtitle="A summary of your learning journey and growth"
        />

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_320px]">
          {/* Main Content */}
          <div className="space-y-8">
            {/* Profile Hero Card */}
            <div className="card-rounded p-8 bg-navy text-white shadow-xl shadow-navy/20 relative overflow-hidden">
               {/* Background Decoration */}
               <div className="absolute top-0 right-0 -mt-20 -mr-20 h-64 w-64 rounded-full bg-teal/10 blur-3xl" />
               <div className="absolute bottom-0 left-0 -mb-20 -ml-20 h-64 w-64 rounded-full bg-purple/10 blur-3xl" />
               
               <div className="relative flex flex-col md:flex-row items-center gap-8">
                  <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-3xl bg-white/10 border border-white/20 text-3xl font-bold text-teal backdrop-blur-md">
                    {profile.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                  </div>
                  <div className="text-center md:text-left flex-1">
                    <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mb-2">
                       <h2 className="text-3xl font-bold">{profile.name}</h2>
                       <span className="rounded-full bg-teal/20 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-teal border border-teal/30">
                          Class {profile.className}
                       </span>
                    </div>
                    <p className="text-white/60 text-sm max-w-xl mb-6">
                       Goal: <span className="text-white italic">"{profile.learningGoal}"</span>
                    </p>
                    
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 pt-6 border-t border-white/10">
                       <div>
                          <div className="text-xl font-bold">{profile.streakDays}</div>
                          <div className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Day Streak</div>
                       </div>
                       <div>
                          <div className="text-xl font-bold">{credits.balance}</div>
                          <div className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Credits</div>
                       </div>
                       <div>
                          <div className="text-xl font-bold">{Math.round(profile.weeklyTargetMinutes / 60)}h</div>
                          <div className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Weekly Goal</div>
                       </div>
                       <div>
                          <div className="text-xl font-bold text-teal">{dna.profileStrength}%</div>
                          <div className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Complete</div>
                       </div>
                    </div>
                  </div>
               </div>
            </div>

            {/* Insights Section */}
            <section>
               <h2 className="text-lg font-bold text-navy mb-6 flex items-center gap-2">
                  <Brain className="h-5 w-5 text-teal" />
                  Learning Insights
               </h2>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {dna.insights.map((ins, i) => (
                    <div key={ins.id} className="card-rounded p-6 card-hover">
                       <div className="flex items-center gap-3 mb-4">
                          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal/10 text-teal">
                             {i === 0 ? <Zap className="h-5 w-5" /> : <Target className="h-5 w-5" />}
                          </div>
                          <div>
                             <h4 className="text-[10px] font-bold text-slate-light uppercase tracking-widest">{ins.dimension}</h4>
                             <div className="text-xs font-bold text-teal">Understanding: {ins.confidence}%</div>
                          </div>
                       </div>
                       <h3 className="text-base font-bold text-navy mb-2 leading-tight">{ins.finding}</h3>
                       <p className="text-xs text-slate-light leading-relaxed">{ins.implication}</p>
                    </div>
                  ))}
               </div>
            </section>

            {/* Formats Section */}
            <section className="card-rounded p-8 bg-white shadow-soft border border-slate-100">
               <div className="mb-8">
                  <h2 className="text-lg font-bold text-navy mb-2">How you learn best</h2>
                  <p className="text-sm text-slate-light">We track which ways of learning work best for you.</p>
               </div>
               
               <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={dna.formatExperimentResults.map((f) => ({
                        name: formatLabels[f.format] ?? f.format,
                        success: f.success,
                      }))}
                      layout="vertical"
                      margin={{ top: 0, right: 30, bottom: 0, left: 20 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                      <XAxis type="number" domain={[0, 100]} hide />
                      <YAxis 
                        type="category" 
                        dataKey="name" 
                        width={120} 
                        tick={{ fontSize: 10, fontWeight: 700, fill: "#64748b" }} 
                        axisLine={false} 
                        tickLine={false} 
                      />
                      <Tooltip
                        cursor={{ fill: "rgba(148, 163, 184, 0.1)" }}
                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                        formatter={(v) => [`${v}% success`, "Success Rate"]}
                      />
                      <Bar dataKey="success" fill="#2DD4BF" radius={[0, 8, 8, 0]} barSize={20} />
                    </BarChart>
                  </ResponsiveContainer>
               </div>
               
               <div className="mt-8 flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-100">
                  <div className="flex items-center gap-3">
                     <Award className="h-5 w-5 text-amber-500" />
                     <span className="text-sm font-bold text-navy">Top Performing Format:</span>
                     <span className="text-sm font-bold text-teal">{formatLabels[dna.topFormat]}</span>
                  </div>
                  <div className="text-sm font-bold text-navy">{dna.formatExperimentResults[0]?.success}% Success</div>
               </div>
            </section>

            {/* Gaps Section */}
            <section>
               <h2 className="text-lg font-bold text-navy mb-6">Your Progress Gaps</h2>
               <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                  {[
                    { label: "Conceptual", value: dna.mistakeProfile.conceptual, color: "bg-teal", icon: Brain },
                    { label: "Careless", value: dna.mistakeProfile.careless, color: "bg-orange", icon: Zap },
                    { label: "Procedural", value: dna.mistakeProfile.procedural, color: "bg-navy", icon: Clock },
                  ].map((gap) => (
                    <div key={gap.label} className="card-rounded p-6 card-hover">
                       <div className={cn("mb-4 flex h-10 w-10 items-center justify-center rounded-xl text-white shadow-lg", gap.color)}>
                          <gap.icon className="h-5 w-5" />
                       </div>
                       <div className="text-2xl font-bold text-navy mb-1">{gap.value}%</div>
                       <div className="text-[10px] font-bold text-slate-light uppercase tracking-widest">{gap.label}</div>
                       <div className="mt-4 h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                          <div className={cn("h-full rounded-full", gap.color)} style={{ width: `${gap.value}%` }} />
                       </div>
                    </div>
                  ))}
               </div>
            </section>
          </div>

          {/* Right Sidebar */}
          <div className="space-y-8">
             {/* Stats Card */}
             <div className="card-rounded p-6 bg-white shadow-soft border border-slate-100">
                <h3 className="text-sm font-bold text-navy mb-6">Study Habits</h3>
                <div className="space-y-6">
                   <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                         <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-teal/10 text-teal">
                            <Clock className="h-4 w-4" />
                         </div>
                         <span className="text-xs font-bold text-slate-light">Peak Focus</span>
                      </div>
                      <span className="text-xs font-bold text-navy">{dna.peakFocusHour}</span>
                   </div>
                   <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                         <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange/10 text-orange">
                            <Zap className="h-4 w-4" />
                         </div>
                         <span className="text-xs font-bold text-slate-light">Avg Session</span>
                      </div>
                      <span className="text-xs font-bold text-navy">{dna.avgSessionMinutes}m</span>
                   </div>
                   <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                         <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple/10 text-purple">
                            <Flame className="h-4 w-4" />
                         </div>
                         <span className="text-xs font-bold text-slate-light">Streak</span>
                      </div>
                      <span className="text-xs font-bold text-navy">{profile.streakDays} Days</span>
                   </div>
                </div>
                
                <div className="mt-8 pt-6 border-t border-slate-100">
                   <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-bold text-slate-light uppercase tracking-widest">Learning Profile Strength</span>
                      <span className="text-[10px] font-bold text-teal">{dna.profileStrength}%</span>
                   </div>
                   <MasteryBar value={dna.profileStrength} className="h-1.5" />
                   <p className="mt-4 text-[10px] text-slate-light leading-relaxed italic">
                      "Every session sharpens this picture. Keep learning to unlock deeper insights."
                   </p>
                </div>
             </div>

             {/* Recent Achievements */}
             <div className="card-rounded p-6">
                <h3 className="text-sm font-bold text-navy mb-6">Recent Achievements</h3>
                <div className="space-y-4">
                   {[
                     { title: "Quick Learner", desc: "Finished 3 topics in one day", icon: Zap, color: "text-orange" },
                     { title: "Deep Focus", desc: "Studied for over 2 hours", icon: Clock, color: "text-purple" },
                     { title: "Mastery", desc: "Reached 90% in Science", icon: Award, color: "text-teal" },
                   ].map((ach, i) => (
                     <div key={i} className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors cursor-default group">
                        <div className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 group-hover:bg-white group-hover:shadow-sm transition-all", ach.color)}>
                           <ach.icon className="h-5 w-5" />
                        </div>
                        <div className="min-w-0">
                           <div className="text-xs font-bold text-navy">{ach.title}</div>
                           <div className="text-[10px] text-slate-light">{ach.desc}</div>
                        </div>
                     </div>
                   ))}
                </div>
                <button className="mt-6 w-full text-[10px] font-bold text-teal uppercase tracking-widest hover:underline">
                   View All Badges
                </button>
             </div>
             
             {/* Security/Privacy Card */}
             <div className="card-rounded p-6 bg-slate-50 border border-slate-100">
                <div className="flex items-center gap-3 mb-3">
                   <ShieldCheck className="h-4 w-4 text-navy" />
                   <h3 className="text-xs font-bold text-navy">Data Privacy</h3>
                </div>
                <p className="text-[10px] text-slate-light leading-relaxed">
                   Your learning data is private to you. We use it only to personalize your experience.
                </p>
             </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}

function formatDate(dateStr: string) {
  try {
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(new Date(dateStr));
  } catch {
    return dateStr;
  }
}
