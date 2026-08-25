/**
 * COGNIFY — Signup
 * Mirror of Login: left form column, right ink panel with the "diagnostic" framing.
 */
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PublicLayout } from "@/components/cognify/PublicLayout";
import { useApp } from "@/contexts/AppContext";
import { ArrowRight } from "lucide-react";
import { useState } from "react";
import { Link } from "wouter";
import { toast } from "sonner";

export default function Signup() {
  const { login } = useApp();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Tell us your name first");
      return;
    }
    if (!email.trim() || !email.includes("@")) {
      toast.error("Enter a valid email address");
      return;
    }
    setLoading(true);
    setTimeout(() => {
      login(name.trim(), email.trim());
      setLoading(false);
    }, 400);
  };

  return (
    <PublicLayout>
      <div className="grid min-h-[calc(100vh-4rem)] lg:grid-cols-[1.1fr_1fr]">
        <div className="flex items-center px-6 py-12 sm:px-12 lg:px-20">
          <div className="w-full max-w-sm">
            <div className="marginalia">Enrolment — new student</div>
            <h1 className="mt-4 font-display text-3xl font-bold text-ink">
              Open your learning file.
            </h1>
            <p className="mt-3 text-[14px] leading-relaxed text-dark-text/75">
              Two minutes to set up. Then COGNIFY begins the quiet work of
              understanding how you learn.
            </p>
            <form onSubmit={onSubmit} className="mt-8 space-y-5">
              <div className="space-y-2">
                <Label htmlFor="s-name" className="font-display text-xs uppercase tracking-[0.08em] text-muted-foreground">
                  Full name
                </Label>
                <Input
                  id="s-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Aarav Mehta"
                  className="h-11 border-ink/20 bg-card text-[14px]"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="s-email" className="font-display text-xs uppercase tracking-[0.08em] text-muted-foreground">
                  Email address
                </Label>
                <Input
                  id="s-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="h-11 border-ink/20 bg-card text-[14px]"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="s-password" className="font-display text-xs uppercase tracking-[0.08em] text-muted-foreground">
                  Create a password
                </Label>
                <Input
                  id="s-password"
                  type="password"
                  placeholder="At least 8 characters"
                  className="h-11 border-ink/20 bg-card text-[14px]"
                />
              </div>
              <Button type="submit" size="lg" disabled={loading} className="h-12 w-full bg-teal text-[15px] text-white hover:bg-teal-dark">
                {loading ? "Creating your file…" : (
                  <>Continue to setup <ArrowRight className="ml-1.5 h-4 w-4" /></>
                )}
              </Button>
            </form>
            <p className="mt-6 text-[14px] text-dark-text/60">
              Already enrolled?{" "}
              <Link href="/login" className="border-b border-teal/60 pb-0.5 font-medium text-teal hover:border-teal">
                Sign in instead
              </Link>
            </p>
          </div>
        </div>

        <div className="relative hidden bg-ink text-white lg:block">
          <div className="absolute inset-0 opacity-[0.35]" style={{
            backgroundImage: "radial-gradient(rgba(255,255,255,0.05) 1px, transparent 1px)",
            backgroundSize: "20px 20px",
          }} />
          <div className="relative flex h-full flex-col justify-between p-12">
            <div>
              <h2 className="font-serif text-2xl font-bold leading-snug">
                What happens next
              </h2>
            </div>
            <ol className="space-y-5">
              {[
                ["Step I", "Choose your board, class and subjects — the complete school curriculum, not just maths and science."],
                ["Step II", "Set your learning goals — mastery, exams, or genuine understanding."],
                ["Step III", "COGNIFY maps your curriculum and opens the Command Center with your first learning path."],
              ].map(([k, v]) => (
                <li key={k} className="grid grid-cols-[3rem_1fr] gap-4 border-l border-white/10 pl-4">
                  <span className="font-mono text-[14px] uppercase tracking-widest text-teal">{k}</span>
                  <p className="text-[14px] leading-relaxed text-white/65">{v}</p>
                </li>
              ))}
            </ol>
            <div className="font-mono text-[12px] uppercase tracking-[0.08em] text-white/35">
              No payment · No ads · Your data stays yours
            </div>
          </div>
        </div>
      </div>
    </PublicLayout>
  );
}
