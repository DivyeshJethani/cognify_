/**
 * COGNIFY — Teach Cognify (Day 12 Redesign)
 * High-fidelity redesign with rounded cards and modern typography.
 */
import AppShell, { PageHeader } from "@/components/cognify/AppShell";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { analyseTeachBack, teachBackPrompts } from "@/lib/teachBack";
import { INVENTORY_EXPORT, classifyType } from "@/lib/resourceDiscovery";
import { topicAlias } from "@/lib/curriculum";
import { cn } from "@/lib/utils";
import { 
  ArrowRight, 
  BookOpen, 
  Check, 
  AlertCircle,
  Lightbulb, 
  Mic, 
  Play, 
  RotateCcw, 
  Users, 
  Video,
  ChevronRight,
  Info
} from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link, useSearch } from "wouter";
import { toast } from "sonner";

const slugOf = (id: string) => topicAlias(id) ?? id;

const SUBJECT_NAMES: Record<string, string> = {
  MATH: "Mathematics",
  SCI: "Science",
  SST: "Social Science",
  ENG: "English",
  HIN: "Hindi",
  SKT: "Sanskrit",
};

type MediaKind = "video" | "audio";
interface Teaching {
  kind: "text" | "media";
  text?: string;
  mediaKind?: MediaKind;
  blobUrl?: string;
  durationSec?: number;
}

const STEPS = [
  { n: 1, label: "Choose" },
  { n: 2, label: "Learn" },
  { n: 3, label: "Teach" },
  { n: 4, label: "Analysis" },
];

function recommendNextStep(analysis: { coverage: number; outcome: "correct" | "partial" | "incorrect" | "irrelevant" | "too-short" }): { label: string; note: string; peer: boolean } {
  if (analysis.outcome === "correct" && analysis.coverage >= 80)
    return {
      label: "Teach a classmate",
      note: "Your explanation is excellent! You're ready to help others in your study group.",
      peer: true,
    };
  if (analysis.outcome === "partial")
    return {
      label: "Refine one concept",
      note: "Almost there — revisit the specific point flagged by Cognify, then try again.",
      peer: false,
    };
  if (analysis.outcome === "too-short")
    return {
      label: "Add more detail",
      note: "Write two or three connected sentences, then submit the explanation again.",
      peer: false,
    };
  if (analysis.outcome === "irrelevant")
    return {
      label: "Return to the prompt",
      note: "Start with the concept named in the prompt, then connect it to one key idea.",
      peer: false,
    };
  if (analysis.outcome === "incorrect")
    return {
      label: "Correct the misconception",
      note: "Review the correct concept below, then try the explanation again in your own words.",
      peer: false,
    };
  return {
    label: "Quick Review",
    note: "Some core ideas were missed. A brief review of the topic will help you explain it better.",
    peer: false,
  };
}

export default function Teach() {
  const prompts = teachBackPrompts();
  const search = useSearch();
  const [selectedId, setSelectedId] = useState<string>(() => {
    const q = new URLSearchParams(search).get("topic");
    return q && prompts.some((p) => p.topicId === q) ? q : prompts[0]?.topicId ?? "";
  });
  const [stage, setStage] = useState<1 | 2 | 3 | 4>(1);
  const [teaching, setTeaching] = useState<Teaching>({ kind: "text", text: "" });
  const [submitted, setSubmitted] = useState(false);

  const prompt = useMemo(() => prompts.find((p) => p.topicId === selectedId), [selectedId, prompts]);
  const analysis = useMemo(
    () =>
      submitted && prompt
        ? analyseTeachBack(prompt.topicId, teaching.kind === "text" ? teaching.text ?? "" : "")
        : null,
    [submitted, prompt, teaching]
  );
  const nextStep = analysis ? recommendNextStep(analysis) : null;

  const resources = useMemo(() => {
    if (!prompt) return [];
    const alias = topicAlias(prompt.topicId) ?? prompt.topicId;
    const raw = INVENTORY_EXPORT[alias] ?? [];
    return raw
      .filter((r) => {
        const t = classifyType(r);
        return t === "video-lecture" || t === "concept-explanation";
      })
      .slice(0, 3)
      .map((r) => ({
        id: r.id,
        title: r.title,
        format: r.format,
        source: r.sourceLabel,
        duration: r.durationMinutes ? `${Math.round(r.durationMinutes)} min` : "",
      }));
  }, [prompt]);

  const mediaRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const startedAt = useRef(0);

  const stopStream = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    if (mediaRef.current) mediaRef.current.srcObject = null;
  }, []);

  useEffect(() => () => stopStream(), [stopStream]);

  async function startRecording(kind: MediaKind) {
    try {
      const stream = await navigator.mediaDevices.getUserMedia(
        kind === "video" ? { video: true, audio: true } : { audio: true }
      );
      streamRef.current = stream;
      if (mediaRef.current) {
        mediaRef.current.srcObject = stream;
        mediaRef.current.play().catch(() => {});
      }
      startedAt.current = Date.now();
      const rec = new MediaRecorder(stream);
      chunksRef.current = [];
      rec.ondataavailable = (e) => e.data.size > 0 && chunksRef.current.push(e.data);
      rec.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: kind === "video" ? "video/webm" : "audio/webm" });
        setTeaching({ 
          kind: "media", 
          mediaKind: kind, 
          blobUrl: URL.createObjectURL(blob), 
          durationSec: Math.round((Date.now() - startedAt.current) / 1000) 
        });
      };
      recorderRef.current = rec;
      rec.start();
    } catch {
      toast.error("Couldn't access your microphone or camera — try writing instead.");
    }
  }

  function stopRecording() {
    recorderRef.current?.stop();
    stopStream();
    recorderRef.current = null;
  }

  function submitTeaching() {
    setSubmitted(true);
    setStage(4);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function resetFlow() {
    stopStream();
    setTeaching({ kind: "text", text: "" });
    setSubmitted(false);
    setStage(1);
  }

  return (
    <AppShell>
      <div className="py-6 animate-fade-in">
        <PageHeader
          title="Teach Cognify"
          subtitle="The ultimate test of mastery. Explain it to us, and we'll tell you if you truly know it."
        />

        <div className="mx-auto max-w-4xl">
          {/* Progress Steps */}
          <div className="flex items-center justify-between mb-10 px-4">
             {STEPS.map((s, i) => (
               <div key={s.n} className="flex items-center group">
                  <div className="flex flex-col items-center gap-2">
                     <div className={cn(
                       "h-10 w-10 rounded-2xl flex items-center justify-center font-bold transition-all duration-300 shadow-sm",
                       stage === s.n ? "bg-teal text-white shadow-teal/20 scale-110" : 
                       stage > s.n ? "bg-green-500 text-white shadow-green-500/20" : 
                       "bg-white border border-slate-200 text-slate-400"
                     )}>
                        {stage > s.n ? <Check className="h-5 w-5" /> : s.n}
                     </div>
                     <span className={cn(
                       "text-[10px] font-bold uppercase tracking-widest transition-colors",
                       stage >= s.n ? "text-navy" : "text-slate-light"
                     )}>
                        {s.label}
                     </span>
                  </div>
                  {i < STEPS.length - 1 && (
                    <div className={cn(
                      "h-[2px] w-12 sm:w-20 mx-2 mb-6 rounded-full transition-colors",
                      stage > s.n ? "bg-green-500" : "bg-slate-200"
                    )} />
                  )}
               </div>
             ))}
          </div>

          {/* Step Content */}
          <div className="min-h-[400px]">
            {stage === 1 && (
              <div className="space-y-6 animate-slide-up">
                 <div className="flex items-center justify-between">
                    <h2 className="text-xl font-bold text-navy">Which topic will you teach?</h2>
                    <span className="text-xs font-bold text-slate-light uppercase tracking-widest">Select a challenge</span>
                 </div>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {prompts.map((p) => {
                      const active = p.topicId === selectedId;
                      return (
                        <button
                          key={p.topicId}
                          onClick={() => setSelectedId(p.topicId)}
                          className={cn(
                            "text-left p-6 card-rounded transition-all duration-300 border-2",
                            active 
                              ? "bg-white border-teal shadow-lg ring-4 ring-teal/5" 
                              : "bg-white border-slate-100 hover:border-slate-200 shadow-soft"
                          )}
                        >
                          <div className="flex items-center justify-between mb-3">
                             <span className="text-[10px] font-bold text-slate-light uppercase tracking-widest">
                                {SUBJECT_NAMES[p.subjectCode] || p.subjectCode}
                             </span>
                             {active && <Check className="h-4 w-4 text-teal" />}
                          </div>
                          <h3 className="text-lg font-bold text-navy mb-2 leading-tight">{p.topicTitle}</h3>
                          <p className="text-xs text-slate-light italic leading-relaxed">
                             "{p.chapterTitle}"
                          </p>
                        </button>
                      );
                    })}
                 </div>
                 <div className="flex justify-end pt-4">
                    <Button 
                      onClick={() => setStage(2)} 
                      className="h-12 px-8 rounded-2xl bg-teal text-white shadow-lg shadow-teal/20 hover:bg-teal/90"
                    >
                       Continue to Learn <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                 </div>
              </div>
            )}

            {stage === 2 && prompt && (
              <div className="space-y-6 animate-slide-up">
                 <div className="flex items-center justify-between">
                    <h2 className="text-xl font-bold text-navy">Learn it once more</h2>
                    <span className="text-xs font-bold text-slate-light uppercase tracking-widest">Preparation</span>
                 </div>
                 
                 <div className="card-rounded p-6 bg-teal/5 border border-teal/10 flex items-start gap-4">
                    <div className="h-10 w-10 shrink-0 rounded-xl bg-teal/20 flex items-center justify-center text-teal">
                       <Info className="h-5 w-5" />
                    </div>
                    <div>
                       <h4 className="font-bold text-navy text-sm mb-1">Redefine your understanding</h4>
                       <p className="text-xs text-slate-600 leading-relaxed">
                          Review these resources to ensure you have a complete mental model. Explain it in your own words afterward.
                       </p>
                    </div>
                 </div>

                 <div className="space-y-3">
                    {resources.map((r) => (
                      <div key={r.id} className="flex items-center justify-between p-5 card-rounded bg-white border border-slate-100 shadow-soft">
                        <div className="flex items-center gap-4">
                           <div className="h-10 w-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400">
                              <Play className="h-4 w-4" />
                           </div>
                           <div>
                              <p className="font-bold text-navy leading-tight">{r.title}</p>
                              <p className="mt-1 text-[10px] font-bold text-slate-light uppercase tracking-widest">
                                 {r.format} · {r.duration} · {r.source}
                              </p>
                           </div>
                        </div>
                        <Link href={`/session/${slugOf(prompt.topicId)}`}>
                           <Button variant="outline" size="sm" className="rounded-xl border-slate-200 text-xs">
                              Review <ChevronRight className="ml-1 h-3 w-3" />
                           </Button>
                        </Link>
                      </div>
                    ))}
                 </div>

                 <div className="flex items-center justify-between pt-4">
                    <Button 
                      variant="ghost" 
                      onClick={() => setStage(1)}
                      className="text-slate-light hover:text-navy"
                    >
                       Back
                    </Button>
                    <Button 
                      onClick={() => setStage(3)} 
                      className="h-12 px-8 rounded-2xl bg-teal text-white shadow-lg shadow-teal/20 hover:bg-teal/90"
                    >
                       I'm Ready to Teach <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                 </div>
              </div>
            )}

            {stage === 3 && prompt && (
              <div className="space-y-6 animate-slide-up">
                 <div className="flex items-center justify-between">
                    <h2 className="text-xl font-bold text-navy">Your turn to explain</h2>
                    <span className="text-xs font-bold text-slate-light uppercase tracking-widest">Execution</span>
                 </div>

                 <div className="card-rounded p-8 bg-navy text-white shadow-xl shadow-navy/20 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-10">
                       <Lightbulb className="h-24 w-24" />
                    </div>
                    <div className="relative z-10">
                       <span className="text-[10px] font-bold text-teal uppercase tracking-[0.2em] mb-4 block">The Prompt</span>
                       <p className="text-2xl font-bold leading-tight italic">
                          "{prompt.prompt}"
                       </p>
                    </div>
                 </div>

                 {teaching.kind !== "text" && teaching.blobUrl ? (
                   <div className="card-rounded p-6 bg-white border border-slate-100 shadow-soft space-y-4">
                      <div className="flex items-center justify-between">
                         <h4 className="font-bold text-navy flex items-center gap-2">
                            {teaching.mediaKind === "video" ? <Video className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                            Your Recording
                         </h4>
                         <span className="text-[10px] font-bold text-slate-light uppercase">{teaching.durationSec}s</span>
                      </div>
                      {teaching.mediaKind === "video" ? (
                        <video src={teaching.blobUrl} controls className="w-full rounded-2xl bg-black aspect-video shadow-inner" />
                      ) : (
                        <audio src={teaching.blobUrl} controls className="w-full" />
                      )}
                      <div className="flex gap-3 pt-2">
                         <Button 
                           onClick={submitTeaching} 
                           className="flex-1 h-12 rounded-2xl bg-teal text-white shadow-lg shadow-teal/20 hover:bg-teal/90"
                         >
                            Submit Explanation
                         </Button>
                         <Button 
                           variant="outline" 
                           onClick={() => setTeaching({ kind: "text", text: "" })} 
                           className="h-12 px-6 rounded-2xl border-slate-200"
                         >
                            <RotateCcw className="h-4 w-4 mr-2" /> Redo
                         </Button>
                      </div>
                   </div>
                 ) : (
                   <div className="space-y-4">
                      <div className="relative">
                         <Textarea
                           value={teaching.text ?? ""}
                           onChange={(e) => setTeaching({ kind: "text", text: e.target.value })}
                           placeholder="Write your explanation as if you're teaching a friend..."
                           className="min-h-[240px] p-6 card-rounded border-slate-200 bg-white text-navy text-base leading-relaxed focus:ring-teal/20"
                         />
                         <div className="absolute bottom-4 right-4 text-[10px] font-bold text-slate-light uppercase">
                            {(teaching.text ?? "").trim().split(/\s+/).filter(Boolean).length} words
                         </div>
                      </div>
                      
                      <div className="flex flex-wrap items-center gap-3">
                         <Button 
                           variant="outline" 
                           onClick={() => startRecording("audio")}
                           className="h-11 px-5 rounded-xl border-slate-200 text-slate-600 hover:border-teal hover:text-teal"
                         >
                            <Mic className="h-4 w-4 mr-2" /> Record Audio
                         </Button>
                         <Button 
                           variant="outline" 
                           onClick={() => startRecording("video")}
                           className="h-11 px-5 rounded-xl border-slate-200 text-slate-600 hover:border-teal hover:text-teal"
                         >
                            <Video className="h-4 w-4 mr-2" /> Record Video
                         </Button>
                         
                         <div className="ml-auto">
                            <Button 
                              onClick={submitTeaching} 
                              className="h-12 px-8 rounded-2xl bg-teal text-white shadow-lg shadow-teal/20 hover:bg-teal/90"
                            >
                               Submit Explanation <ArrowRight className="ml-2 h-4 w-4" />
                            </Button>
                         </div>
                      </div>
                   </div>
                 )}
              </div>
            )}

            {stage === 4 && analysis && nextStep && (
              <div className="space-y-8 animate-slide-up">
                 <div className="text-center space-y-2">
                    <div className={cn(
                      "inline-flex h-16 w-16 items-center justify-center rounded-3xl mb-4",
                      analysis.outcome === "correct" ? "bg-teal/10 text-teal" :
                      analysis.outcome === "partial" ? "bg-orange/10 text-orange" :
                      "bg-red-50 text-red-600"
                    )}>
                       {analysis.outcome === "correct" ? <Check className="h-8 w-8" /> : <AlertCircle className="h-8 w-8" />}
                    </div>
                    <h2 className="text-2xl font-bold text-navy">
                      {analysis.outcome === "correct" ? "Understanding Check Complete" :
                       analysis.outcome === "partial" ? "Your explanation is partly correct" :
                       analysis.outcome === "too-short" ? "Add more detail to your explanation" :
                       analysis.outcome === "irrelevant" ? "This explanation needs to refocus" :
                       "Let's correct this explanation"}
                    </h2>
                    <p className="text-slate-light">Here's a quick summary of your explanation on "{prompt?.topicTitle}"</p>
                 </div>

                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="card-rounded p-8 bg-white border border-slate-100 shadow-soft">
                       <h4 className="text-[10px] font-bold text-slate-light uppercase tracking-widest mb-6">Your Explanation</h4>
                       <div className="space-y-6">
                          <div>
                             <div className="flex justify-between text-sm font-bold text-navy mb-2">
                                <span>Coverage</span>
                                <span>{analysis.coverage}%</span>
                             </div>
                             <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                                <div className={cn(
                                  "h-full transition-all duration-1000",
                                  analysis.outcome === "correct" ? "bg-teal" :
                                  analysis.outcome === "partial" ? "bg-orange" : "bg-red-500"
                                )} style={{ width: `${analysis.coverage}%` }} />
                             </div>
                          </div>
                          <div>
                             <div className="flex justify-between text-sm font-bold text-navy mb-2">
                                <span>Clarity</span>
                                <span>{analysis.clarity}%</span>
                             </div>
                             <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                                <div className="h-full bg-navy transition-all duration-1000" style={{ width: `${analysis.clarity}%` }} />
                             </div>
                          </div>
                       </div>
                    </div>

                    <div className="card-rounded p-8 bg-white border border-slate-100 shadow-soft">
                       <h4 className="text-[10px] font-bold text-slate-light uppercase tracking-widest mb-4">Our Feedback</h4>
                       <p className="text-navy font-bold leading-relaxed mb-4">
                          {analysis.verdict}
                       </p>
                       <div className={cn(
                         "p-4 rounded-xl border flex gap-3",
                         analysis.outcome === "correct" ? "bg-teal/5 border-teal/10" :
                         analysis.outcome === "partial" ? "bg-orange/5 border-orange/10" : "bg-red-50 border-red-100"
                       )}>
                          {analysis.outcome === "correct" ? <Check className="h-4 w-4 text-teal shrink-0 mt-0.5" /> : <AlertCircle className="h-4 w-4 text-red-600 shrink-0 mt-0.5" />}
                          <div>
                             <p className={cn(
                               "text-[10px] font-bold uppercase tracking-widest mb-1",
                               analysis.outcome === "correct" ? "text-teal" : analysis.outcome === "partial" ? "text-orange" : "text-red-600"
                             )}>
                               {analysis.outcome === "correct" ? "One more detail" : analysis.outcome === "partial" ? "What is missing" : "What was wrong"}
                             </p>
                             <p className="text-xs text-slate-700">{analysis.outcome === "correct" ? analysis.missingIdea : analysis.whatWasWrong}</p>
                          </div>
                       </div>
                       <div className="mt-3 p-4 rounded-xl bg-teal/5 border border-teal/10">
                          <p className="text-[10px] font-bold text-teal uppercase tracking-widest mb-1">Correct concept</p>
                          <p className="text-xs text-slate-700 leading-relaxed">{analysis.correctConcept}</p>
                       </div>
                    </div>
                 </div>

                 <div className="card-rounded p-8 bg-navy text-white shadow-xl shadow-navy/20 flex flex-col md:flex-row items-center gap-8">
                    <div className="flex-1 text-center md:text-left">
                       <span className="text-[10px] font-bold text-teal uppercase tracking-[0.2em] mb-2 block">Next Step</span>
                       <h3 className="text-2xl font-bold mb-2">{nextStep.label}</h3>
                       <p className="text-slate-300 text-sm leading-relaxed max-w-md">
                          {analysis.outcome === "correct" ? nextStep.note : analysis.tryAgain}
                       </p>
                    </div>
                    <div className="shrink-0 flex gap-3">
                       {nextStep.peer ? (
                         <Link href="/community">
                           <Button className="h-12 px-8 rounded-2xl bg-teal text-white shadow-lg shadow-teal/20 hover:bg-teal/90">
                              <Users className="mr-2 h-4 w-4" /> Go to Community
                           </Button>
                         </Link>
                       ) : (
                         <Button 
                           onClick={resetFlow} 
                           className="h-12 px-8 rounded-2xl bg-teal text-white shadow-lg shadow-teal/20 hover:bg-teal/90"
                         >
                            <RotateCcw className="mr-2 h-4 w-4" /> Try Again
                         </Button>
                       )}
                       <Link href="/today">
                         <Button variant="outline" className="h-12 px-8 rounded-2xl border-white/20 text-white hover:bg-white/10">
                            Done for Now
                         </Button>
                       </Link>
                    </div>
                 </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
