/**
 * COGNIFY — Study Groups (Day 12 Redesign)
 * High-fidelity chat + peer-learning.
 */
import AppShell, { PageHeader } from "@/components/cognify/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { findPeer, myGroup } from "@/lib/studyGroups";
import { getStudyContext, onContextChange } from "@/lib/studyContext";
import { cn } from "@/lib/utils";
import { 
  HelpCircle, 
  Send, 
  Users, 
  MessageCircle, 
  Search, 
  MoreVertical,
  ThumbsUp,
  Award
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

const CHAT_KEY = "cognify.community.v1";

interface ChatMessage {
  id: string;
  author: string;
  initials: string;
  message: string;
  when: string;
  topicTitle?: string;
  mine?: boolean;
}

const SUBJECT_NAMES: Record<string, string> = {
  MATH: "Mathematics",
  SCI: "Science",
  SST: "Social Science",
  ENG: "English",
  HIN: "Hindi",
  SKT: "Sanskrit",
};

function loadChat(): ChatMessage[] {
  try {
    const raw = JSON.parse(localStorage.getItem(CHAT_KEY) ?? "null");
    return Array.isArray(raw) ? (raw as ChatMessage[]) : [];
  } catch {
    return [];
  }
}

export default function Community() {
  const group = myGroup();
  const [, rerender] = useState(0);
  useEffect(() => onContextChange(() => rerender((n) => n + 1)), []);
  const ctx = getStudyContext();

  const requests = group.needHelp;
  const teachOffers = group.canTeach.filter((r) => r.kind === "can-teach");
  const [matched, setMatched] = useState<Record<string, boolean>>({});

  const [chat, setChat] = useState<ChatMessage[]>(
    () => loadChat().length > 0 ? loadChat() : group.discussions.map((d) => ({ ...d, mine: false }))
  );
  useEffect(() => {
    localStorage.setItem(CHAT_KEY, JSON.stringify(chat));
  }, [chat]);

  const [draft, setDraft] = useState("");
  const [doubtOpen, setDoubtOpen] = useState<Record<string, boolean>>({});

  const members = useMemo(
    () => [
      { name: "You", initials: "YO", tag: "This is you", img: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=100&h=100&fit=crop" },
      { name: "Ishita R.", initials: "IR", tag: "Science", img: "https://i.pravatar.cc/100?img=11" },
      { name: "Arjun V.", initials: "AV", tag: "Mathematics", img: "https://i.pravatar.cc/100?img=12" },
      { name: "Meera S.", initials: "MS", tag: "Social Science", img: "https://i.pravatar.cc/100?img=13" },
      { name: "Rohan K.", initials: "RK", tag: "Mathematics", img: "https://i.pravatar.cc/100?img=14" },
    ],
    []
  );

  function sendChat() {
    const msg = draft.trim();
    if (!msg) return;
    setChat((c) => [
      ...c,
      { id: `m-${Date.now().toString(36)}`, author: "You", initials: "YO", message: msg, when: "now", topicTitle: undefined, mine: true },
    ]);
    setDraft("");
  }

  function handleFindPeer(request: { id: string; topicTitle: string }) {
    const peers = findPeer(request.topicTitle);
    const found = peers.length > 0;
    setMatched((m) => ({ ...m, [request.id]: found }));
    toast.success(found ? "A classmate can help" : "Keep working on it", {
      description: found
        ? `${peers[0].name} has mastered this topic — they might be able to help you out.`
        : "No one has cleared this topic yet. You could be the first to master it!",
    });
  }

  return (
    <AppShell>
      <div className="py-6 animate-fade-in">
        <PageHeader
          title="Math Warriors"
          subtitle={`${ctx.boardName} · Class ${ctx.className}`}
          actions={
            <div className="flex items-center gap-2">
               <div className="flex -space-x-2 mr-2">
                  {members.map(m => (
                    <div key={m.name} className="h-8 w-8 rounded-full border-2 border-white overflow-hidden shadow-sm">
                       <img src={m.img} alt={m.name} className="h-full w-full object-cover" />
                    </div>
                  ))}
               </div>
               <Button variant="outline" size="sm" className="rounded-xl border-slate-200 bg-white text-xs h-9">
                  <Users className="mr-2 h-4 w-4" /> {group.memberCount} Members
               </Button>
            </div>
          }
        />

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_320px]">
          {/* Main Chat & Doubts Area */}
          <div className="space-y-8">
            {/* Chat Container */}
            <div className="card-rounded flex flex-col h-[600px] overflow-hidden bg-white shadow-soft border border-slate-100">
               {/* Chat Header */}
               <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4 bg-slate-50/50">
                  <div className="flex items-center gap-3">
                     <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple/10 text-purple">
                        <MessageCircle className="h-5 w-5" />
                     </div>
                     <div>
                        <h3 className="text-sm font-bold text-navy">Group Discussion</h3>
                        <p className="text-[10px] text-slate-light">Active now · 3 new messages</p>
                     </div>
                  </div>
                  <div className="flex items-center gap-2">
                     <button className="h-8 w-8 rounded-lg flex items-center justify-center text-slate-light hover:bg-slate-100 transition-colors">
                        <Search className="h-4 w-4" />
                     </button>
                     <button className="h-8 w-8 rounded-lg flex items-center justify-center text-slate-light hover:bg-slate-100 transition-colors">
                        <MoreVertical className="h-4 w-4" />
                     </button>
                  </div>
               </div>

               {/* Messages Area */}
               <div className="flex-1 overflow-y-auto p-6 space-y-6">
                  {chat.map((m) => {
                    const member = members.find(mem => mem.name === m.author) || members[0];
                    return (
                      <div key={m.id} className={cn("flex gap-4 max-w-[85%]", m.mine && "ml-auto flex-row-reverse")}>
                        <div className="h-8 w-8 shrink-0 rounded-full overflow-hidden shadow-sm mt-1">
                           <img src={member.img} alt={m.author} className="h-full w-full object-cover" />
                        </div>
                        <div className={cn("flex flex-col", m.mine && "items-end")}>
                           <div className="flex items-baseline gap-2 mb-1">
                              <span className="text-xs font-bold text-navy">{m.author}</span>
                              <span className="text-[9px] font-bold text-slate-light uppercase">{m.when}</span>
                           </div>
                           <div className={cn(
                             "rounded-2xl px-4 py-3 text-[14px] leading-relaxed shadow-sm",
                             m.mine 
                               ? "bg-teal text-white rounded-tr-none" 
                               : "bg-slate-50 text-navy border border-slate-100 rounded-tl-none"
                           )}>
                              {m.message}
                           </div>
                        </div>
                      </div>
                    );
                  })}
               </div>

               {/* Chat Input */}
               <div className="p-4 border-t border-slate-100 bg-white">
                  <div className="flex items-center gap-2">
                     <Input
                       value={draft}
                       onChange={(e) => setDraft(e.target.value)}
                       onKeyDown={(e) => e.key === "Enter" && sendChat()}
                       placeholder="Type your message..."
                       className="flex-1 rounded-xl border-slate-200 bg-slate-50 focus:bg-white text-sm h-11"
                     />
                     <Button 
                       onClick={sendChat} 
                       className="h-11 w-11 rounded-xl bg-teal text-white shadow-lg shadow-teal/20 hover:bg-teal/90 shrink-0"
                     >
                        <Send className="h-4 w-4" />
                     </Button>
                  </div>
               </div>
            </div>

            {/* Doubts Section */}
            <section>
               <div className="mb-6 flex items-center justify-between">
                  <h2 className="text-lg font-bold text-navy">Class Doubts</h2>
                  <div className="flex items-center gap-2">
                     <span className="text-xs text-slate-light">Ask one, answer one</span>
                     <Button variant="outline" size="sm" className="h-8 rounded-lg border-slate-200 text-[10px] font-bold uppercase tracking-wider">
                        Ask Doubt
                     </Button>
                  </div>
               </div>

               <div className="space-y-4">
                  {requests.map((r) => (
                    <div key={r.id} className="card-rounded p-5 card-hover group bg-white border border-slate-100 shadow-soft">
                       <div className="flex items-start gap-4">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-orange/10 text-orange">
                             <HelpCircle className="h-5 w-5" />
                          </div>
                          <div className="flex-1 min-w-0">
                             <div className="flex items-center gap-2 mb-1">
                                <span className="text-[10px] font-bold text-orange uppercase tracking-wider">
                                   {SUBJECT_NAMES[r.subjectCode] || r.subjectCode}
                                </span>
                                <span className="text-[10px] text-slate-light">• {r.author} • {r.when}</span>
                             </div>
                             <h3 className="text-base font-bold text-navy leading-tight">{r.topicTitle}</h3>
                             <p className="mt-2 text-sm text-slate-light leading-relaxed">{r.detail}</p>
                             
                             <div className="mt-4 flex items-center gap-3">
                                {doubtOpen[r.id] ? (
                                  <div className="flex items-center gap-2 text-xs font-bold text-teal">
                                     <ThumbsUp className="h-3.5 w-3.5" /> Answered in chat
                                  </div>
                                ) : (
                                  <>
                                    <Button 
                                      variant="outline" 
                                      size="sm" 
                                      className="h-8 rounded-lg border-slate-200 text-[10px] font-bold uppercase tracking-wider hover:bg-teal hover:text-white hover:border-teal"
                                      onClick={() => {
                                        setDoubtOpen(prev => ({ ...prev, [r.id]: true }));
                                        toast.success("Answer sent!");
                                      }}
                                    >
                                       Answer it
                                    </Button>
                                    <button 
                                      onClick={() => handleFindPeer(r)}
                                      className="text-[10px] font-bold text-teal hover:underline"
                                    >
                                       Find who knows this
                                    </button>
                                  </>
                                )}
                             </div>
                          </div>
                       </div>
                    </div>
                  ))}
               </div>
            </section>
          </div>

          {/* Right Sidebar */}
          <div className="space-y-8">
             {/* Peer Teaching Card */}
             <div className="card-rounded p-6 bg-purple/5 border border-purple/10">
                <div className="mb-4 flex items-center gap-3">
                   <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple text-white shadow-lg shadow-purple/20">
                      <Award className="h-5 w-5" />
                   </div>
                   <h2 className="text-base font-bold text-navy">Peer Teaching</h2>
                </div>
                <p className="text-xs text-slate-light leading-relaxed mb-6">
                   Help a classmate with a topic you know well. It's a great way to reinforce your own understanding.
                </p>
                
                <div className="space-y-4">
                   {teachOffers.map((c) => (
                     <div key={c.id} className="rounded-2xl bg-white p-4 shadow-sm border border-purple/5">
                        <div className="text-[9px] font-bold text-purple uppercase tracking-wider mb-1">
                           {SUBJECT_NAMES[c.subjectCode] || c.subjectCode}
                        </div>
                        <h3 className="text-[13px] font-bold text-navy leading-tight mb-3">{c.topicTitle}</h3>
                        <Button 
                          className="w-full h-8 rounded-lg bg-purple text-white text-[10px] font-bold uppercase tracking-wider hover:bg-purple/90"
                          onClick={() => toast.success("Offer sent!")}
                        >
                           Offer to teach
                        </Button>
                     </div>
                   ))}
                </div>
             </div>

             {/* Activity Sidebar */}
             <div className="card-rounded p-6 bg-white border border-slate-100 shadow-soft">
                <h2 className="text-base font-bold text-navy mb-4">Recent Activity</h2>
                <div className="space-y-6">
                   {[
                     { user: "Ishita R.", action: "answered a doubt in", topic: "Cell Structure", time: "10m ago" },
                     { user: "Arjun V.", action: "cleared a new topic:", topic: "Probability", time: "25m ago" },
                     { user: "Meera S.", action: "started a teach session", topic: "World War I", time: "1h ago" },
                   ].map((act, i) => (
                     <div key={i} className="flex gap-3">
                        <div className="h-8 w-8 shrink-0 rounded-full bg-slate-100 overflow-hidden">
                           <img src={`https://i.pravatar.cc/100?img=${i+20}`} alt={act.user} className="h-full w-full object-cover" />
                        </div>
                        <div className="min-w-0">
                           <p className="text-xs text-navy leading-tight">
                              <span className="font-bold">{act.user}</span> {act.action} <span className="font-bold">{act.topic}</span>
                           </p>
                           <p className="text-[10px] text-slate-light mt-1">{act.time}</p>
                        </div>
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
