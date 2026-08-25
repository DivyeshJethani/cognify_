/**
 * COGNIFY — Demo entry (Day 10)
 *
 * One-click seeded demo: a judge or first-time visitor signs in as a
 * preconfigured CBSE Class 10 student with a single click and lands on
 * Today. No diagnostic, no onboarding, no password.
 */
import { Button } from "@/components/ui/button";
import { PublicLayout } from "@/components/cognify/PublicLayout";
import { useApp } from "@/contexts/AppContext";
import { ArrowRight, ArrowLeft } from "lucide-react";
import { useEffect } from "react";
import { useLocation } from "wouter";

export default function DemoEntry() {
  const { auth, enterDemo } = useApp();
  const [, navigate] = useLocation();

  useEffect(() => {
    if (auth.kind === "logged-in") navigate("/today");
  }, [auth, navigate]);

  useEffect(() => {
    const t = setTimeout(() => {
      if (auth.kind === "logged-in") navigate("/today");
    }, 600);
    return () => clearTimeout(t);
  }, [auth, navigate]);

  return (
    <PublicLayout>
      <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-xl flex-col items-center justify-center px-6 text-center">
        <div className="marginalia">One-click entry</div>
        <h1 className="mt-4 font-display text-3xl font-bold text-ink sm:text-4xl">
          Opening your demo classroom…
        </h1>
        <p className="mt-4 text-[15px] leading-relaxed text-dark-text/75">
          Signed in as <strong>Aarav Mehta</strong> — CBSE, Class 10. This is a
          seeded demo account so you can explore every feature without a
          diagnostic or a password.
        </p>
        <div className="mt-8 flex items-center gap-3">
          <Button
            size="lg"
            onClick={() => {
              enterDemo();
              navigate("/today");
            }}
            className="h-12 bg-teal px-7 text-[15px] text-white hover:bg-teal-dark"
          >
            Enter as Aarav <ArrowRight className="ml-1.5 h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="lg"
            onClick={() => navigate("/")}
            className="h-12 border-ink/25 bg-transparent px-6 text-[15px] text-ink hover:bg-ink/5"
          >
            <ArrowLeft className="mr-1.5 h-4 w-4" /> Back to landing
          </Button>
        </div>
      </div>
    </PublicLayout>
  );
}
