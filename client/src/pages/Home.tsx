/**
 * COGNIFY — Landing page
 * Style: Scholar's Atelier — asymmetric editorial layout, serif display,
 * marginalia labels, hairline rules, ivory paper, ink typography.
 */
import { Button } from "@/components/ui/button";
import { PublicLayout } from "@/components/cognify/PublicLayout";
import { Hairline, Marginalia } from "@/components/cognify/Primitives";
import { LOGO_URL } from "@/components/cognify/Primitives";
import { useApp } from "@/contexts/AppContext";
import { ArrowRight, BookOpen, FlaskConical, Layers, Radar, RotateCcw, ScrollText } from "lucide-react";
import { Link } from "wouter";

const heroImg = "/manus-storage/cognify-hero-lab_cf2b19b7.png";
const dnaImg = "/manus-storage/cognify-dna-illustration_388571e2.png";
const textureImg = "/manus-storage/cognify-lab-texture_eea6ce6a.png";

function Hero() {
  const { auth } = useApp();
  const ctaHref = auth.kind === "logged-in" ? "/today" : "/demo";
  return (
    <section className="relative overflow-hidden paper-grain">
      <div className="container grid items-center gap-12 py-16 lg:grid-cols-[1.15fr_1fr] lg:py-24">
        <div className="rise-in">
          <Marginalia>Section 01 — The premise</Marginalia>
          <h1 className="mt-5 font-display text-4xl font-bold leading-[1.08] text-ink sm:text-5xl lg:text-[3.6rem]">
            Your mind has a pattern.
            <br />
            <span className="text-teal italic">We found it.</span>
          </h1>
          <p className="mt-6 max-w-lg text-[15px] leading-relaxed text-dark-text/80">
            Every student learns differently — and most platforms ignore it. COGNIFY
            is a learning laboratory that continuously studies how <em>you</em> learn:
            your mistakes, your focus, your confidence, the formats that stick. It
            writes that knowledge into your <strong>Learning DNA</strong>, then
            personalises every lesson, practice session and revision around it.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-4">
            <Button asChild size="lg" className="h-12 bg-teal px-7 text-[15px] font-semibold text-white hover:bg-teal-dark">
              <Link href={ctaHref}>
                {auth.kind === "logged-in" ? "Open Today" : "Try the demo"} <ArrowRight className="ml-1.5 h-4 w-4" />
              </Link>
            </Button>
            <a
              href="#how-it-works"
              className="group inline-flex items-center gap-2 border-b border-ink/60 pb-0.5 font-serif text-[15px] italic text-ink transition-colors hover:border-teal hover:text-teal"
            >
              Read the method
              <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
            </a>
          </div>
          <div className="mt-10 flex flex-wrap gap-x-10 gap-y-4 border-t border-ink/10 pt-6">
            {[
              ["Boards", "CBSE · ICSE · State"],
              ["Subjects", "All school subjects"],
              ["Personalisation", "Continuous, not one-time"],
            ].map(([k, v]) => (
              <div key={k}>
                <div className="font-display text-xs uppercase tracking-[0.08em] text-dark-text/60">{k}</div>
                <div className="mt-1 font-serif text-lg font-bold text-ink">{v}</div>
              </div>
            ))}
          </div>
        </div>
        <div className="relative rise-in" style={{ animationDelay: "120ms" }}>
          <div className="border border-ink/15 bg-card p-2 shadow-[6px_6px_0_0_rgba(16,42,67,0.06)]">
            <img
              src={heroImg}
              alt="A student at a desk with a constellation of knowledge nodes"
              className="w-full object-cover"
            />
          </div>
          <div className="mt-3 flex items-center justify-between px-1">
            <span className="font-display text-xs uppercase tracking-[0.08em] text-dark-text/60">
              Fig. 1 — The knowledge map, drawn per student
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}

function HowItWorks() {
  const steps = [
    {
      icon: ScrollText,
      num: "I",
      title: "It listens",
      body: "Every answer you give is observed: which topics you miss, where you hesitate, what you guess with false confidence. Nothing is wasted — mistakes are classified, not just scored.",
    },
    {
      icon: Radar,
      num: "II",
      title: "It models",
      body: "Observations are woven into your Learning DNA: your mistake profile, focus rhythm, confidence calibration and the teaching formats that actually make things stick for you.",
    },
    {
      icon: Layers,
      num: "III",
      title: "It plans",
      body: "Each day, COGNIFY builds a learning path — what to learn, what to practice, what to revise — with spaced retention deciding the exact moment each topic resurfaces.",
    },
    {
      icon: RotateCcw,
      num: "IV",
      title: "It adapts",
      body: "The model rewrites itself weekly. A plateau becomes a new experiment in teaching format; a weak topic becomes a stretch goal; your timetable reshapes around your real life.",
    },
  ];
  return (
    <section id="how-it-works" className="border-t border-ink/10 bg-ivory-deep/60 paper-grain">
      <div className="container py-16 lg:py-24">
        <div className="grid gap-10 lg:grid-cols-[1fr_1.5fr]">
          <div>
            <Marginalia>Section 02 — The method</Marginalia>
            <h2 className="mt-4 font-display text-3xl font-bold text-ink sm:text-4xl">
              Not a quiz bank.<br /><span className="italic">A laboratory.</span>
            </h2>
            <p className="mt-4 max-w-sm text-[14px] leading-relaxed text-dark-text/80">
              Generic platforms hand every student the same lessons. COGNIFY treats
              learning as an experiment that runs on one subject: you.
            </p>
          </div>
          <div className="divide-y divide-ink/20 border-y border-ink/20">
            {steps.map((s, i) => (
              <div key={s.num} className="grid grid-cols-[3.5rem_1fr] gap-5 py-7">
                <div className="flex flex-col items-start gap-2">
                  <span className="font-serif text-2xl italic text-teal">{s.num}</span>
                  <s.icon className="h-4 w-4 text-ink/60" />
                </div>
                <div>
                  <h3 className="font-display text-[20px] font-bold text-ink">{s.title}</h3>
                  <p className="mt-2 text-[13.5px] leading-relaxed text-dark-text/80">{s.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function DnaSection() {
  return (
    <section id="learning-dna" className="relative overflow-hidden bg-ink text-white">
      <img
        src={textureImg}
        alt=""
        aria-hidden
        className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-40"
      />
      <div className="container relative grid items-center gap-12 py-16 lg:grid-cols-[1fr_0.9fr] lg:py-24">
        <div className="order-2 lg:order-1">
          <div className="border border-white/15 bg-white/[0.04] p-2">
            <img src={dnaImg} alt="DNA helix transforming into a curriculum tree" className="w-full" />
          </div>
          <div className="mt-3 font-display text-xs uppercase tracking-[0.08em] text-white/70">
            Fig. 2 — Learning DNA → curriculum tree
          </div>
        </div>
        <div className="order-1 lg:order-2">
          <Marginalia className="[&::before]:bg-teal !text-white/80">Section 03 — Learning DNA</Marginalia>
          <h2 className="mt-4 font-display text-3xl font-bold text-white sm:text-4xl">
            A profile that reads like a case study, <span className="italic">not a scorecard.</span>
          </h2>
          <p className="mt-4 max-w-lg text-[14px] leading-relaxed text-white/90">
            Your Learning DNA records six dimensions of how you learn. Each comes
            with evidence strength and a concrete change it triggers in your plan.
          </p>
          <dl className="mt-8 space-y-0 divide-y divide-white/10 border-y border-white/10">
            {[
              ["Topic mastery", "Every topic tracked from new → mastered, with live state"],
              ["Mistake classification", "Conceptual, careless or procedural — each demands a different fix"],
              ["Confidence calibration", "Where you over- or under-estimate yourself, measured"],
              ["Attention analysis", "Your real focus window, so sessions fit your rhythm"],
              ["Resilience & struggle", "How you respond to difficulty — and how to pace it"],
              ["Teaching-format fit", "Diagrams? Worked examples? The format that wins for you"],
            ].map(([k, v]) => (
              <div key={k} className="grid grid-cols-[11rem_1fr] gap-4 py-4">
                <dt className="font-mono text-[14px] uppercase tracking-[0.12em] text-teal-light">{k}</dt>
                <dd className="text-[14px] leading-relaxed text-white/90">{v}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </section>
  );
}

function CurriculumSection() {
  const subjects = [
    { code: "MATH", name: "Mathematics", color: "border-teal text-teal" },
    { code: "SCI", name: "Science", color: "border-blue-soft text-blue-soft" },
    { code: "SST", name: "Social Science", color: "border-amber text-amber" },
    { code: "ENG", name: "English", color: "border-white/40 text-white" },
    { code: "HIN", name: "Hindi & second languages", color: "border-teal text-teal" },
    { code: "SKT", name: "Sanskrit & more", color: "border-blue-soft text-blue-soft" },
  ];
  return (
    <section id="curriculum" className="border-t border-ink/10 bg-ivory paper-grain">
      <div className="container py-16 lg:py-24">
        <div className="max-w-2xl">
          <Marginalia amber>Section 04 — The curriculum</Marginalia>
          <h2 className="mt-4 text-3xl font-bold text-ink sm:text-4xl">
            Your whole board. Every chapter. Every topic.
          </h2>
          <p className="mt-4 text-[14px] leading-relaxed text-dark-text/80">
            COGNIFY maps the complete school curriculum — Board → Class → Subject →
            Chapter → Topic → learning objectives. Every topic carries its own
            mastery state, revision schedule and recommended next action, so you
            always know exactly where you stand and what to do next.
          </p>
        </div>
        <div className="mt-10 overflow-x-auto border border-ink/10">
          <table className="w-full min-w-[560px] border-collapse bg-card text-left">
            <thead>
              <tr className="border-b border-ink/15 bg-ivory-deep">
                <th className="px-5 py-3 font-display text-xs uppercase tracking-[0.08em] text-dark-text/60">Code</th>
                <th className="px-5 py-3 font-display text-xs uppercase tracking-[0.08em] text-dark-text/60">Subject</th>
                <th className="px-5 py-3 font-display text-xs uppercase tracking-[0.08em] text-dark-text/60">Structure</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink/8">
              {subjects.map((s) => (
                <tr key={s.code} className="transition-colors hover:bg-ivory-deep/50">
                  <td className={`px-5 py-3.5 font-mono text-xs font-medium ${s.color}`}>{s.code}</td>
                  <td className="px-5 py-3.5 font-serif text-base font-bold text-ink">{s.name}</td>
                  <td className="px-5 py-3.5 text-[14px] text-dark-text/80">
                    Chapters → Topics → Learning objectives
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-10 flex flex-wrap items-center gap-4">
          <Button asChild size="lg" className="h-12 bg-ink px-7 text-[15px] text-ivory hover:bg-ink/90">
            <Link href="/signup">
              Explore the curriculum <ArrowRight className="ml-1.5 h-4 w-4" />
            </Link>
          </Button>
          <span className="font-mono text-[14px] uppercase tracking-[0.08em] text-dark-text/60">
            CBSE Class 10 shown in demo · more boards & classes mapped
          </span>
        </div>
      </div>
    </section>
  );
}

function Closing() {
  const { auth } = useApp();
  const href = auth.kind === "logged-in" ? "/today" : "/signup";
  return (
    <section className="border-t border-ink/10 bg-ivory-deep/60 paper-grain">
      <div className="container py-20 text-center lg:py-28">
        <img src={LOGO_URL} alt="COGNIFY" className="mx-auto h-14 w-14" />
        <h2 className="mx-auto mt-6 max-w-xl font-serif text-3xl font-bold leading-snug text-ink sm:text-4xl">
          Stop studying like everyone else.<br />
          <span className="italic text-teal">Study like yourself.</span>
        </h2>
        <p className="mx-auto mt-4 max-w-md text-[14px] leading-relaxed text-dark-text/80">
          Your diagnostic takes minutes. The pattern-finding never stops.
        </p>
        <Button asChild size="lg" className="mt-8 h-12 bg-teal px-8 text-[15px] font-semibold text-white hover:bg-teal-dark">
          <Link href={href}>
            Begin your diagnostic <ArrowRight className="ml-1.5 h-4 w-4" />
          </Link>
        </Button>
      </div>
    </section>
  );
}

export default function Home() {
  return (
    <PublicLayout>
      <Hero />
      <Hairline />
      <HowItWorks />
      <DnaSection />
      <CurriculumSection />
      <Closing />
    </PublicLayout>
  );
}
