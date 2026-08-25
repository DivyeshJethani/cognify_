/**
 * COGNIFY — "Ask Cognify" contextual interaction (mock)
 *
 * Rule-based contextual assistant for the lecture player. Answers are drawn
 * from the current resource's metadata (whyRecommended, dnaDimension, format,
 * topic state) and the student's Learning DNA profile, so every answer is
 * tied to the session — never generic filler.
 *
 * Future backend: this becomes a POST /api/ask with sessionId + resourceContext
 * and an LLM answer grounded in curriculum data.
 */
import { discoveryMeta } from "./resourceDiscovery";
import type { LearningResource } from "./types";

export type AskActionId =
  | "explain-current"
  | "simplify"
  | "elaborate"
  | "give-example"
  | "quiz-me"
  | "what-s-next"
  | "connect-dna"
  | "summarise";

export interface AskAction {
  id: AskActionId;
  label: string;
  sublabel: string;
  prompt: string;
}

/** Eight guided actions — the buttons a future LLM would ground on. */
export const ASK_ACTIONS: AskAction[] = [
  {
    id: "explain-current",
    label: "Explain this part",
    sublabel: "What is happening right now?",
    prompt: "Explain the segment I am at right now.",
  },
  {
    id: "simplify",
    label: "Simplify",
    sublabel: "Say it more plainly",
    prompt: "Explain this more simply, as if to a younger student.",
  },
  {
    id: "elaborate",
    label: "Go deeper",
    sublabel: "More detail, same idea",
    prompt: "Explain this part in more depth — I want the full picture.",
  },
  {
    id: "give-example",
    label: "Give an example",
    sublabel: "Anchor it concretely",
    prompt: "Give me a concrete worked example of this idea.",
  },
  {
    id: "quiz-me",
    label: "Quiz me",
    sublabel: "Check my grasp",
    prompt: "Ask me one question to test whether I understand this.",
  },
  {
    id: "what-s-next",
    label: "What's next",
    sublabel: "Next step after this",
    prompt: "What should I do immediately after this resource?",
  },
  {
    id: "connect-dna",
    label: "How I learn",
    sublabel: "Relate it to my profile",
    prompt: "How does this fit my learning style?",
  },
  {
    id: "summarise",
    label: "Summarise",
    sublabel: "The whole segment, briefly",
    prompt: "Summarise what I have covered so far.",
  },
];

export interface AskMessage {
  role: "user" | "cognify";
  text: string;
}

export interface AskContext {
  resource: LearningResource;
  elapsedSec: number;
  totalSec: number;
  speed: number;
  confusingCount: number;
  transcriptText: string;
  /** Confusing segments marked by the student — drives contextual questions */
  confusingMarks?: { sec: number; note: string }[];
}

/** Quick-pick questions shown above the input */
export function quickPicks(ctx: AskContext): string[] {
  return [
    `Why did you recommend this resource?`,
`How does this fit my learning style?`,
    `Am I spending the right amount of time on this?`,
    `What should I do after this video?`,
    ctx.confusingCount > 0
      ? `Summarise my confusing marks (${ctx.confusingCount})`
      : `What should I watch for in this video?`,
    ctx.confusingMarks && ctx.confusingMarks.length > 0
      ? `Which marked segment matters most?`
      : undefined,
  ].filter((q): q is string => !!q)
  .slice(0, 4);
}

/** Answer a student question contextually */
export function answer(ctx: AskContext, question: string): string {
  const q = question.trim().toLowerCase();
  const r = ctx.resource;
  const progress = ctx.totalSec > 0 ? Math.round((ctx.elapsedSec / ctx.totalSec) * 100) : 0;

  if (q.includes("why") && (q.includes("recommend") || q.includes("choose"))) {
    return `${r.whyRecommended} This resource was selected from trusted sources like NCERT and tailored specifically for your current learning path.`;
  }

  if (q.includes("dna") || q.includes("learning style") || q.includes("format")) {
    return `We've noticed you learn best with visual diagrams and worked examples. This resource uses a ${r.format} format because it matches your strongest learning style. As you interact with the video, we'll keep refining your personal learning path.`;
  }

  if (q.includes("time") || q.includes("long") || q.includes("how long")) {
    const budget = Math.round(ctx.totalSec / 60);
    return `This resource runs about ${budget} minutes at ${ctx.speed}x speed. Your session estimate was ${r.durationMinutes} minutes, and you are at ${progress}% — ${formatRemaining(ctx, budget)} remaining. If you hit your attention ceiling, pause and finish the rest in a second sitting; spaced retention prefers two focused passes over one exhausted one.`;
  }

  if (q.includes("after") || q.includes("next") || q.includes("then")) {
    return `After this session, your progress will be saved and we'll schedule a quick revision for later. You'll likely see a short practice set next to help lock in what you've learned.`;
  }

  if (q.includes("confus") || q.includes("mark") || q.includes("replay")) {
    if (ctx.confusingCount === 0)
      return `You have no confusing marks yet. While playing, press “Mark confusing” at any moment — the segment is added to your replay list and noted in your analytics file. I will summarise them at the end of the session.`;
    const marks = ctx.confusingMarks ?? [];
    if (marks.length > 0) {
      const worst = marks.reduce((a, b) => (b.sec > a.sec ? b : a));
      return `You have marked ${ctx.confusingCount} confusing segment${ctx.confusingCount > 1 ? "s" : ""}. The latest mark sits at ${formatTime(worst.sec)} — “${worst.note}”. Open the “Replay” tab to review them; revisiting these points is a great way to strengthen your understanding.`;
    }
    return `You have marked ${ctx.confusingCount} confusing segment${ctx.confusingCount > 1 ? "s" : ""}. Open the “Replay” tab to review them — revisiting your own confusion points is the highest-yield revision step Cognify schedules, and each mark feeds your mistake-profile analysis.`;
  }

  if (q.includes("watch") || q.includes("look for") || q.includes("focus") || q.includes("tip")) {
    return `Focus on the step-by-step process. If a part feels fast, try slowing it down to 0.75x and mark it so you can review it later. These marks will help us customize your next practice session.`;
  }

  if (q.includes("explain current") || q.includes("segment i am at") || q.includes("right now")) {
    const seg = nearestSegment(ctx);
    return seg
      ? `Right now: “${seg.text.slice(0, 200)}${seg.text.length > 200 ? "…" : ""}” This is a key step to include in your notes to help you remember it later.`
      : `You are at ${formatTime(ctx.elapsedSec)} of ${formatTime(ctx.totalSec)} (${progress}% through). The segment here is still indexing — ask me again in a moment, or tell me what felt unclear.`;
  }

  if (q.includes("more simple") || q.includes("plainly") || q.includes("younger") || q.includes("simplif")) {
    const seg = nearestSegment(ctx);
    return seg
      ? `Simply: ${stripJargon(seg.text.slice(0, 160))}${seg.text.length > 160 ? "…" : "."} The short version: one idea, one picture in your head. If the picture won't stick, mark this segment and I will flag it for a diagram-first re-attempt.`
      : `At your current position the idea is ${r.difficulty === "foundational" ? "already the gentlest pass available" : "the hardest pass available"} — simplifying works best on the concrete step you paused at. Tell me the sentence that lost you.`;
  }

  if (q.includes("deeper") || q.includes("depth") || q.includes("full picture")) {
    return `Going deeper means the next layer of the same idea. For this topic, that layer is: how this connects to the surrounding curriculum step and why CBSE marks the transition between them. Ask Cognify for the related NCERT treatment after this video — the “NCERT / textbook” entry in your related resources is the depth layer.`;
  }

  if (q.includes("example") || q.includes("worked") || q.includes("concrete")) {
    return `A worked example for this segment: ${exampleFor(ctx)}. Try writing this down once without looking to see if you've got the process down!`;
  }

  if (q.includes("quiz") || q.includes("question") && q.includes("test") || q.includes("check my grasp") || q.includes("test whether")) {
    return `Here is a quick check: “${quizFor(ctx)}” Try answering this, then check the transcript to see if you got it right.`;
  }

  if (q.includes("my dna") || q.includes("profile") || q.includes("connect")) {
    const seg = nearestSegment(ctx);
    const segSnippet = seg ? `\u201C${seg.text.slice(0, 110)}\u2026\u201D` : "\u2026\u201D (segment still indexing)";
    return `This segment (${segSnippet}) matches your visual learning style perfectly. Try to keep your focus on the diagrams, and write one quick summary sentence in your notes before moving to the next part.`;
  }

  if (q.includes("summarise") || q.includes("covered so far") || q.includes("summary")) {
    const covered = ctx.transcriptText.slice(0, 160);
    return covered
      ? `So far: ${covered}${ctx.transcriptText.length > 160 ? "…" : "."} One-sentence summary: ${oneSentence(ctx)}. If you can restate it without the text, this segment is banked.`
      : `No segment text is indexed yet at this position — hit play to advance the transcript, or jump to the next authored segment. Your summary note at the end of the resource will capture everything at once.`;
  }

  if (q.includes("speed") || q.includes("fast") || q.includes("slow")) {
    return `You are at ${ctx.speed}x. For new topics, 1x is usually best. If it feels familiar, 1.25x is a good way to stay focused without missing details.`;
  }

  if (q.includes("note") || q.includes("write")) {
    return `The Notes tab is on your right. Write in your own words — the act of re-phrasing is itself retrieval practice. Notes you take during confusing segments are automatically timestamped, so revision later starts exactly where understanding slipped.`;
  }

  if (q.includes("difficult") || q.includes("hard") || q.includes("stuck")) {
    return `${r.difficulty === "stretch" || r.difficulty === "advanced" ? "This is a challenging topic, so it's okay if it takes a bit more effort!" : "You've got this! If a part feels tricky, try slowing it down to 0.75x or marking it to review later."} We'll use your progress here to keep your learning path balanced.`;
  }

  if (q.includes("hello") || q.includes("hi") || q.includes("hey")) {
    return `Observing your session. You are ${progress}% through “${r.title}” on ${r.topicTitle}. Ask me about the recommendation, your DNA, timing, confusing marks or what to do next.`;
  }

  return `I'm here to help you with this session! Ask me why this was recommended, how it fits your learning style, or how to manage your time for the rest of the video.`;
}

function formatRemaining(ctx: AskContext, budgetMinutes: number): string {
  const remainingMin = Math.max(0, Math.round(budgetMinutes - ctx.elapsedSec / 60 / ctx.speed));
  return `${remainingMin} minute${remainingMin === 1 ? "" : "s"}`;
}

function formatTime(sec: number): string {
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

function nearestSegment(ctx: AskContext) {
  // Uses the full transcript passed in via context (built by the player)
  const segs = (ctx as AskContext & { transcript?: { startSec: number; endSec: number; text: string }[] }).transcript;
  if (!segs) return null;
  return segs.find((s) => ctx.elapsedSec >= s.startSec && ctx.elapsedSec < s.endSec) ?? null;
}

function stripJargon(t: string): string {
  return t.replace(/\b(procedural|calibration|discriminant|algorithm)\b/gi, (m) => `“${m.toLowerCase()}”`);
}

function exampleFor(ctx: AskContext): string {
  const seg = nearestSegment(ctx);
  if (!seg) return "the worked example at the current timestamp — see the transcript step sequence.";
  return `built from the current segment: “${seg.text.slice(0, 90)}…” — the example mirrors the same step order, with the verification identity carried through to the end.`;
}

function quizFor(ctx: AskContext): string {
  const seg = nearestSegment(ctx);
  if (!seg) return "restate the last formula or claim the narration made, in your own words.";
  return `in your own words: what did the narration just establish, and why does the step before it have to be true first?`;
}

function oneSentence(ctx: AskContext): string {
  const segs = (ctx as AskContext & { transcript?: { startSec: number; endSec: number; text: string }[] }).transcript;
  if (!segs) return "(segment text not yet indexed)";
  const covered = segs.filter((s) => s.endSec <= ctx.elapsedSec);
  if (covered.length === 0) return "the opening framing of this resource.";
  return covered[covered.length - 1].text.slice(0, 140);
}
