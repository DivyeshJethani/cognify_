/**
 * COGNIFY — Coming-soon placeholder pages
 * Timetable, Stretch Goals, Study Groups, Credits. These backend-powered
 * features are listed in the brief for later stages; this page keeps the
 * navigation honest without inventing functionality.
 */
import AppShell, { PageHeader } from "@/components/cognify/AppShell";
import { Marginalia } from "@/components/cognify/Primitives";
import { useApp } from "@/contexts/AppContext";
import { Link } from "wouter";

export default function ComingSoon({
  overline,
  title,
  blurb,
  capabilities,
}: {
  overline: string;
  title: string;
  blurb: string;
  capabilities: string[];
}) {
  const { auth } = useApp();
  return (
    <AppShell>
      <PageHeader title={title} subtitle={blurb} />
      <div className="px-5 py-10 sm:px-8 lg:px-10">
        <div className="mx-auto max-w-xl">
          <Marginalia amber>Stage note</Marginalia>
          <p className="mt-4 footnote">
            This feature is implemented on the NestJS backend and will be surfaced
            here when the API layer is connected. The current frontend stage covers
            the foundation, curriculum and dashboard experience.
          </p>
          <div className="mt-6 divide-y divide-ink/10 border-y border-ink/10">
            {capabilities.map((c) => (
              <div key={c} className="flex items-center gap-3 py-3">
                <span className="h-1.5 w-1.5 rounded-full bg-teal" />
                <span className="text-[13.5px] text-dark-text/80">{c}</span>
              </div>
            ))}
          </div>
          <Link
            href={auth.kind === "logged-in" ? "/dashboard" : "/"}
            className="mt-8 inline-block border-b border-teal/50 pb-0.5 font-mono text-[14px] uppercase tracking-[0.08em] text-teal"
          >
            ← Back to the command center
          </Link>
        </div>
      </div>
    </AppShell>
  );
}
