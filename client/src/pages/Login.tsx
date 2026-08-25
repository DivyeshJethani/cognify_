/**
 * COGNIFY — Login
 * Editorial two-column: left ivory form column, right ink "field notes" column.
 */
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PublicLayout } from "@/components/cognify/PublicLayout";
import { useApp } from "@/contexts/AppContext";
import { ArrowRight, Mail } from "lucide-react";
import { useState } from "react";
import { Link } from "wouter";
import { toast } from "sonner";

export default function Login() {
  const { login } = useApp();
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !email.includes("@")) {
      toast.error("Enter a valid email address");
      return;
    }
    setLoading(true);
    setTimeout(() => {
      login(name.trim() || email.split("@")[0], email.trim());
      setLoading(false);
    }, 400);
  };

  return (
    <PublicLayout>
      <div className="grid min-h-[calc(100vh-4rem)] lg:grid-cols-[1fr_1.1fr]">
        {/* Form */}
        <div className="flex items-center px-6 py-12 sm:px-12 lg:px-20">
          <div className="w-full max-w-sm">
            <div className="marginalia">Entry — sign in</div>
            <h1 className="mt-4 font-display text-3xl font-bold text-ink">Welcome back.</h1>
            <p className="mt-3 text-[14px] leading-relaxed text-dark-text/75">
              Pick up exactly where you left off.
            </p>
            <form onSubmit={onSubmit} className="mt-8 space-y-5">
              <div className="space-y-2">
                <Label htmlFor="name" className="font-display text-xs uppercase tracking-[0.08em] text-muted-foreground">
                  Your name <span className="text-ink/30">(optional)</span>
                </Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Aarav Mehta"
                  className="h-11 border-ink/20 bg-card text-[14px]"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email" className="font-display text-xs uppercase tracking-[0.08em] text-muted-foreground">
                  Email address
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="h-11 border-ink/20 bg-card text-[14px]"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" className="font-display text-xs uppercase tracking-[0.08em] text-muted-foreground">
                  Password
                </Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  className="h-11 border-ink/20 bg-card text-[14px]"
                />
              </div>
              <Button type="submit" size="lg" disabled={loading} className="h-12 w-full bg-teal text-[15px] text-white hover:bg-teal-dark">
                {loading ? "Opening your file…" : (
                  <>Sign in <ArrowRight className="ml-1.5 h-4 w-4" /></>
                )}
              </Button>
            </form>
            <p className="mt-6 text-[14px] text-dark-text/60">
              New to COGNIFY?{" "}
              <Link href="/signup" className="border-b border-teal/60 pb-0.5 font-medium text-teal hover:border-teal">
                Begin your diagnostic
              </Link>
            </p>
          </div>
        </div>

        {/* Ink field-notes panel */}
        <div className="relative hidden bg-ink text-white lg:block">
          <div className="absolute inset-0 opacity-[0.35]" style={{
            backgroundImage: "radial-gradient(rgba(255,255,255,0.05) 1px, transparent 1px)",
            backgroundSize: "20px 20px",
          }} />
          <div className="relative flex h-full flex-col justify-between p-12">
            <div>
              <h2 className="font-serif text-2xl font-bold leading-snug">
                Field notes, entry 001
              </h2>
              <p className="mt-3 max-w-sm text-[14px] leading-relaxed text-white/60">
                We'll sync your progress and update your study plan the moment you sign in.
              </p>
            </div>
            <div className="space-y-4">
              {[
	                ["Peak focus", "Evening sessions"],
	                ["Learning style", "Visual & practical"],
	                ["Today's goal", "4 topics to refresh"],
              ].map(([k, v]) => (
                <div key={k} className="flex items-baseline justify-between border-b border-white/10 pb-3">
                  <span className="font-display text-xs uppercase tracking-[0.08em] text-white/40">{k}</span>
                  <span className="font-mono text-[12px] text-teal">{v}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </PublicLayout>
  );
}
