/**
 * COGNIFY — Today (Day 12 Redesign)
 * High-fidelity student dashboard hub.
 */
import AppShell from "@/components/cognify/AppShell";
import { getStudyContext, onContextChange } from "@/lib/studyContext";
import { useApp } from "@/contexts/AppContext";
import { todaySequence } from "@/lib/journeyData";
import { topicAlias } from "@/lib/curriculum";
import { myGroup } from "@/lib/studyGroups";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";
import { Link } from "wouter";
import { 
  BookOpen, 
  ChevronRight, 
  Clock, 
  MessageCircle, 
  Play, 
  Trophy, 
  Video,
  ArrowRight,
  PenLine,
  Lightbulb,
  Users
} from "lucide-react";

const slugOf = (id: string) => topicAlias(id) ?? id;

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return "morning";
  if (h < 17) return "afternoon";
  return "evening";
}

export default function Today() {
  const { profile } = useApp();
  const [, rerender] = useState(0);
  useEffect(() => onContextChange(() => rerender((n) => n + 1)), []);
  const ctx = getStudyContext();
  const group = myGroup();

  const items = todaySequence().items.slice(0, 3);

  return (
    <AppShell>
      <div className="py-6 animate-fade-in">
        {/* Header greeting */}
        <div className="mb-8">
          <h1 className="font-display text-3xl font-bold text-navy sm:text-4xl flex items-center gap-2">
            Good {greeting()}, {profile.name.split(" ")[0]}! 👋
          </h1>
          <p className="mt-2 text-slate-light italic">Let's make today a productive learning day.</p>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Main Content Area */}
          <div className="lg:col-span-2 space-y-8">
            {/* Top Picks Section */}
            <section>
              <h2 className="mb-4 text-lg font-bold text-navy">Your top picks for today</h2>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                {/* Continue Learning Card */}
                <div className="card-rounded p-5 border-l-4 border-teal flex flex-col justify-between h-full">
                  <div>
                    <div className="text-[11px] font-bold uppercase tracking-wider text-teal">Continue Learning</div>
                    <h3 className="mt-2 text-base font-bold text-navy leading-tight">Quadratic Equations</h3>
                    <div className="mt-4 flex items-center gap-2">
                       <div className="h-1.5 flex-1 rounded-full bg-slate-100 overflow-hidden">
                          <div className="h-full w-[42%] bg-teal" />
                       </div>
                       <span className="text-[10px] font-bold text-teal">42% complete</span>
                    </div>
                  </div>
                  <div className="mt-6 flex items-center justify-between">
                    <Link href="/continue">
                      <button className="btn-rounded bg-teal text-white text-xs flex items-center gap-2 py-2">
                        Continue <Play className="h-3 w-3 fill-current" />
                      </button>
                    </Link>
                    <div className="relative h-16 w-16">
                       <div className="absolute inset-0 bg-teal/5 rounded-lg rotate-6" />
                       <div className="absolute inset-0 bg-white border border-teal/20 rounded-lg flex items-center justify-center">
                          <BookOpen className="h-8 w-8 text-teal/40" />
                       </div>
                    </div>
                  </div>
                </div>

                {/* Teach Cognify Card */}
                <div className="card-rounded p-5 border-l-4 border-purple flex flex-col justify-between h-full bg-purple/5">
                  <div>
                    <div className="text-[11px] font-bold uppercase tracking-wider text-purple">Teach Back</div>
                    <h3 className="mt-2 text-base font-bold text-navy leading-tight">Explain a concept in your own words</h3>
                    <p className="mt-1 text-[11px] text-slate-light">Reinforce your learning</p>
                  </div>
                  <div className="mt-6 flex items-center justify-between">
                    <Link href="/teach">
                      <button className="btn-rounded bg-purple text-white text-xs flex items-center gap-2 py-2">
                        Teach Now 🎙️
                      </button>
                    </Link>
                    <div className="h-16 w-16 flex items-center justify-center">
                       <img src="https://api.dicebear.com/7.x/bottts/svg?seed=Cognify&backgroundColor=b6e3f4" alt="Bot" className="h-12 w-12" />
                    </div>
                  </div>
                </div>

                {/* Quick Practice Card */}
                <div className="card-rounded p-5 border-l-4 border-orange flex flex-col justify-between h-full">
                  <div>
                    <div className="text-[11px] font-bold uppercase tracking-wider text-orange">Quick Practice</div>
                    <h3 className="mt-2 text-base font-bold text-navy leading-tight">Polynomials Quick Quiz</h3>
                    <p className="mt-1 text-[11px] text-slate-light">5 questions</p>
                  </div>
                  <div className="mt-6 flex items-center justify-between">
                    <Link href="/practice">
                      <button className="btn-rounded bg-orange text-white text-xs flex items-center gap-2 py-2">
                        Start Quiz <ArrowRight className="h-3 w-3" />
                      </button>
                    </Link>
                    <div className="h-16 w-16 flex items-center justify-center bg-orange/5 rounded-xl">
                       <PenLine className="h-8 w-8 text-orange/40" />
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Pick up where you left off */}
            <section>
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-bold text-navy">Pick up where you left off</h2>
                <Link href="/curriculum" className="text-xs font-bold text-teal flex items-center gap-1 hover:underline">
                  View all <ChevronRight className="h-3 w-3" />
                </Link>
              </div>
              <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                {[
                  { name: "Mathematics", chapters: 8, color: "bg-blue-500", icon: "📐" },
                  { name: "Physics", chapters: 7, color: "bg-green-500", icon: "⚛️" },
                  { name: "Chemistry", chapters: 6, color: "bg-amber-500", icon: "🧪" },
                  { name: "Biology", chapters: 6, color: "bg-rose-500", icon: "🔬" },
                ].map((subject) => (
                  <div key={subject.name} className="card-rounded p-4 card-hover group cursor-pointer">
                    <div className={cn("mb-3 flex h-10 w-10 items-center justify-center rounded-xl text-xl", subject.color + "/10")}>
                      {subject.icon}
                    </div>
                    <h3 className="text-sm font-bold text-navy">{subject.name}</h3>
                    <div className="mt-1 text-[10px] text-slate-light">{subject.chapters} Chapters</div>
                    <div className="mt-4 flex justify-end">
                       <div className="h-6 w-6 rounded-full bg-slate-50 flex items-center justify-center group-hover:bg-teal group-hover:text-white transition-colors">
                          <ChevronRight className="h-3 w-3" />
                       </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Cognify Recommends */}
            <section>
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-bold text-navy">Cognify Recommends</h2>
                <button className="text-xs font-medium text-slate-light flex items-center gap-1">
                  Why these? <span className="h-3.5 w-3.5 rounded-full border border-slate-300 flex items-center justify-center text-[8px]">i</span>
                </button>
              </div>
              <div className="space-y-3">
                <div className="card-rounded p-4 flex items-center gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-teal/10">
                    <Trophy className="h-6 w-6 text-teal" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-bold text-navy">Revise Discriminant Concept</h3>
                    <p className="text-xs text-slate-light truncate">You got this wrong in your last quiz. A quick revision will help.</p>
                  </div>
                  <button className="btn-rounded bg-teal/5 text-teal text-[10px] font-bold hover:bg-teal hover:text-white border border-teal/10">
                    Review Now
                  </button>
                </div>
	                <div className="card-rounded p-4 flex items-center gap-4">
	                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-orange/10">
	                    <Lightbulb className="h-6 w-6 text-orange" />
	                  </div>
	                  <div className="flex-1 min-w-0">
	                    <h3 className="text-sm font-bold text-navy">Try Teaching Back</h3>
	                    <p className="text-xs text-slate-light truncate">Explain this topic to a friend or yourself to master it.</p>
	                  </div>
	                  <button className="btn-rounded bg-orange/5 text-orange text-[10px] font-bold hover:bg-orange hover:text-white border border-orange/10">
	                    Try Now
	                  </button>
	                </div>
              </div>
            </section>
            
            {/* Banner */}
            <div className="relative overflow-hidden rounded-2xl bg-navy p-8 text-white">
              <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
                 <div className="max-w-md text-center md:text-left">
                    <p className="text-lg font-medium italic opacity-90">"Learning is not about being perfect, it's about being better than yesterday." 🚀</p>
                 </div>
                 <div className="flex items-center gap-4">
                    <div className="h-16 w-16 animate-bounce">
                       <img src="https://api.dicebear.com/7.x/bottts/svg?seed=Cognify&backgroundColor=b6e3f4" alt="Bot" className="h-full w-full" />
                    </div>
                    <div className="h-12 w-12 rounded-full bg-purple/30 blur-xl" />
                 </div>
              </div>
              {/* Stars decoration */}
              <div className="absolute inset-0 opacity-20 pointer-events-none">
                 {[...Array(20)].map((_, i) => (
                    <div 
                      key={i}
                      className="absolute h-1 w-1 bg-white rounded-full"
                      style={{ 
                        top: `${Math.random() * 100}%`, 
                        left: `${Math.random() * 100}%`,
                        opacity: Math.random()
                      }}
                    />
                 ))}
              </div>
            </div>
          </div>

          {/* Right Sidebar Area */}
          <div className="space-y-8">
            {/* Progress Overview Card */}
            <div className="card-rounded p-6">
              <div className="mb-6 flex items-center justify-between">
                <h2 className="text-base font-bold text-navy">Your Progress</h2>
                <button className="text-[10px] font-bold text-slate-light flex items-center gap-1">
                  This Week <ChevronRight className="h-2 w-2" />
                </button>
              </div>
              
              <div className="relative mx-auto mb-8 flex h-40 w-40 items-center justify-center">
                <svg className="h-full w-full -rotate-90 transform">
                  <circle
                    cx="80"
                    cy="80"
                    r="70"
                    stroke="currentColor"
                    strokeWidth="12"
                    fill="transparent"
                    className="text-slate-100"
                  />
                  <circle
                    cx="80"
                    cy="80"
                    r="70"
                    stroke="currentColor"
                    strokeWidth="12"
                    fill="transparent"
                    strokeDasharray={440}
                    strokeDashoffset={440 - (440 * 78) / 100}
                    strokeLinecap="round"
                    className="text-teal transition-all duration-1000"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <div className="text-3xl font-bold text-navy">78%</div>
                  <div className="text-[10px] font-bold text-slate-light uppercase tracking-wider">Overall</div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-xl bg-slate-50 p-3">
                  <div className="text-lg font-bold text-navy">12</div>
                  <div className="text-[9px] font-bold text-slate-light uppercase">Topics Studied</div>
                </div>
                <div className="rounded-xl bg-slate-50 p-3">
                  <div className="text-lg font-bold text-navy">8</div>
                  <div className="text-[9px] font-bold text-slate-light uppercase">Quizzes Attempted</div>
                </div>
                <div className="col-span-2 rounded-xl bg-slate-50 p-3 flex items-center justify-between">
                  <div>
                    <div className="text-lg font-bold text-navy">3.6 hrs</div>
                    <div className="text-[9px] font-bold text-slate-light uppercase">Time Spent</div>
                  </div>
                  <Clock className="h-5 w-5 text-teal/40" />
                </div>
              </div>
              
              <div className="mt-6 text-center">
                <p className="text-[11px] font-medium text-teal">Keep it up! You're doing great! 🌟</p>
              </div>
            </div>

            {/* Study Group Card */}
            <div className="card-rounded p-6">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-base font-bold text-navy">Your Study Group</h2>
                <Link href="/community" className="text-[10px] font-bold text-teal hover:underline">View all</Link>
              </div>
              
              <div className="rounded-2xl bg-slate-50 p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple text-white">
                    <Users className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-navy">Math Warriors</h3>
                    <div className="text-[10px] text-slate-light">5 members</div>
                  </div>
                  <button className="ml-auto rounded-full bg-white p-2 shadow-soft text-teal">
                    <MessageCircle className="h-4 w-4" />
                  </button>
                </div>
                
                <div className="mt-4 flex items-center justify-between">
                  <div className="flex -space-x-2">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className="h-7 w-7 rounded-full border-2 border-white bg-slate-200 overflow-hidden">
                        <img src={`https://i.pravatar.cc/100?img=${i+10}`} alt="User" />
                      </div>
                    ))}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-purple" />
                    <span className="text-[10px] font-bold text-purple">3 new messages</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Up Next Card */}
            <div className="card-rounded p-6">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-base font-bold text-navy">Up Next</h2>
                <Link href="/timetable" className="text-[10px] font-bold text-teal hover:underline">View all</Link>
              </div>
              
              <div className="space-y-4">
                {[
                  { time: "11:00 AM", title: "Quadratic Equations", sub: "Live Doubt Solving", type: "video", color: "text-purple", bg: "bg-purple/10" },
                  { time: "4:00 PM", title: "Physics", sub: "Practice Problems", type: "doc", color: "text-teal", bg: "bg-teal/10" },
                  { time: "6:00 PM", title: "Study Group", sub: "Discussion", type: "users", color: "text-purple", bg: "bg-purple/10" },
                ].map((event, idx) => (
                  <div key={idx} className="flex items-center gap-3">
                    <div className={cn("flex h-9 w-9 shrink-0 items-center justify-center rounded-lg", event.bg, event.color)}>
                      {event.type === "video" && <Video className="h-4 w-4" />}
                      {event.type === "doc" && <BookOpen className="h-4 w-4" />}
                      {event.type === "users" && <Users className="h-4 w-4" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-[9px] font-bold text-slate-light uppercase tracking-wider">{event.time}</span>
                      </div>
                      <h4 className="text-[13px] font-bold text-navy truncate leading-tight">{event.title}</h4>
                      <p className="text-[10px] text-slate-light truncate">{event.sub}</p>
                    </div>
                    <button className={cn("btn-rounded text-[10px] font-bold py-1.5 px-3", idx === 1 ? "bg-teal text-white" : "bg-white border border-slate-200 text-navy shadow-soft")}>
                      {idx === 1 ? "Start" : "Join"}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
