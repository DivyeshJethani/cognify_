/**
 * COGNIFY — Application shell (Day 12 Refinement)
 * Navy sidebar + Warm ivory content.
 * Modern, rounded, playful yet premium dashboard UI.
 */
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useApp } from "@/contexts/AppContext";
import { LOGO_URL } from "@/components/cognify/Primitives";
import {
  Award,
  Bell,
  BookOpen,
  Bookmark,
  CalendarDays,
  LayoutDashboard,
  LogOut,
  Menu,
  PenLine,
  Search,
  Settings,
  Users,
  UserCircle,
  Lightbulb,
} from "lucide-react";
import {
  getStudyContext,
  onContextChange,
} from "@/lib/studyContext";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";
import { Link, useLocation } from "wouter";

// Primary journey
const navItems = [
  { href: "/today", label: "Today", icon: LayoutDashboard },
  { href: "/curriculum", label: "Curriculum", icon: BookOpen },
  { href: "/teach", label: "Teach Back", icon: Lightbulb },
  { href: "/community", label: "Study Groups", icon: Users },
  { href: "/timetable", label: "Study Planner", icon: CalendarDays },
  { href: "/goals", label: "Stretch Goals", icon: Award, comingSoon: true },
];

const bottomNavItems = [
  { href: "/profile", label: "Profile", icon: UserCircle },
  { href: "/settings", label: "Settings", icon: Settings },
];

function NavLinks({ onNavigate }: { onNavigate?: () => void }) {
  const [location] = useLocation();
  
  return (
    <nav className="flex flex-col gap-1 px-4 py-4">
      {navItems.map((item) => {
        const active = location === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={cn(
              "group flex items-center justify-between rounded-xl px-4 py-3 text-[15px] font-medium transition-all duration-200",
              active
                ? "bg-teal text-white shadow-lg shadow-teal/20"
                : "text-white/60 hover:bg-white/5 hover:text-white"
            )}
          >
            <div className="flex items-center gap-3">
              <item.icon className={cn("h-5 w-5 shrink-0", active ? "text-white" : "text-white/40 group-hover:text-white/70")} />
              <span>{item.label}</span>
            </div>
            {item.comingSoon && (
              <span className="text-[8px] font-bold uppercase tracking-widest bg-white/10 text-white/40 px-1.5 py-0.5 rounded-md group-hover:text-white/60">Soon</span>
            )}
          </Link>
        );
      })}
    </nav>
  );
}

function TopSearch() {
  return (
    <div className="relative flex-1 max-w-2xl">
      <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate- light" />
      <input
        type="text"
        placeholder="Search topics, chapters, questions..."
        className="w-full rounded-full border-none bg-white py-2.5 pl-11 pr-4 text-sm shadow-soft focus:ring-2 focus:ring-teal/20 outline-none"
      />
    </div>
  );
}

function ShellContent({ children }: { children: React.ReactNode }) {
  const { logout, profile } = useApp();
  const [, rerender] = useState(0);
  useEffect(() => onContextChange(() => rerender((n) => n + 1)), []);
  const { boardName, className } = getStudyContext();

  return (
    <div className="flex min-h-screen bg-ivory">
      {/* Sidebar — desktop */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 flex-col bg-navy lg:flex">
        <div className="flex items-center gap-3 px-6 py-8">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal">
            <img src={LOGO_URL} alt="COGNIFY" className="h-6 w-6 brightness-0 invert" />
          </div>
          <div>
            <div className="font-display text-xl font-bold tracking-tight text-white leading-none">Cognify</div>
            <div className="mt-1 text-[10px] font-semibold uppercase tracking-widest text-teal/80">Your Personal Tutor</div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          <NavLinks />
        </div>

        {/* Bottom sidebar */}
        <div className="mt-auto border-t border-white/5 px-4 py-6">
          <div className="flex flex-col gap-1 mb-6">
            {bottomNavItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-3 rounded-xl px-4 py-3 text-[15px] font-medium text-white/60 hover:bg-white/5 hover:text-white transition-all"
              >
                <item.icon className="h-5 w-5 text-white/40" />
                <span>{item.label}</span>
              </Link>
            ))}
          </div>

          <div className="relative overflow-hidden rounded-2xl bg-white/5 p-5">
            <div className="relative z-10">
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10">
                 <img src="/manus-storage/cognify-logo-mark_070389eb.png" alt="Bot" className="h-10 w-10" />
              </div>
	              <div className="text-[15px] font-bold text-white">Hi {profile.name.split(" ")[0]}! 👋</div>
	              <div className="mt-1 text-[12px] leading-relaxed text-white/50">Ready to start studying?</div>
            </div>
            {/* Background decorative elements */}
            <div className="absolute -bottom-6 -right-6 h-20 w-20 rounded-full bg-teal/10 blur-3xl" />
          </div>
          
          <button
            onClick={logout}
            className="mt-8 flex w-full items-center gap-3 px-4 py-2 rounded-xl text-[13px] font-bold uppercase tracking-widest text-white/40 hover:bg-white/5 hover:text-white transition-all"
          >
            <LogOut className="h-4 w-4" /> Sign out
          </button>
        </div>
      </aside>

      {/* Main Area */}
      <div className="flex flex-1 flex-col lg:pl-64">
        {/* Top Header */}
        <header className="sticky top-0 z-30 flex h-20 items-center justify-between bg-ivory/80 px-6 backdrop-blur-md lg:px-10">
          <div className="flex items-center gap-4 lg:hidden">
             <MobileMenu />
          </div>
          
          <div className="hidden lg:block">
            <Button variant="ghost" size="icon" className="rounded-xl bg-white shadow-soft text-slate-light">
              <Menu className="h-5 w-5" />
            </Button>
          </div>

          <TopSearch />

          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" className="relative rounded-full bg-white shadow-soft text-slate-light">
              <Bell className="h-5 w-5" />
              <span className="absolute right-2.5 top-2.5 h-2 w-2 rounded-full bg-orange border-2 border-white" />
            </Button>
            <Link href="/profile">
              <div className="h-10 w-10 overflow-hidden rounded-full border-2 border-white shadow-soft cursor-pointer">
                <img 
                  src="https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=100&h=100&fit=crop" 
                  alt="Avatar" 
                  className="h-full w-full object-cover"
                />
              </div>
            </Link>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 px-6 pb-10 lg:px-10">
          {children}
        </main>
      </div>
    </div>
  );
}

function MobileMenu() {
  const [open, setOpen] = useState(false);
  const { profile } = useApp();
  
  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="rounded-xl bg-white shadow-soft text-slate-light">
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-72 border-0 bg-navy p-0">
        <SheetTitle className="sr-only">Navigation</SheetTitle>
        <div className="flex items-center gap-3 px-6 py-8">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal">
            <img src={LOGO_URL} alt="COGNIFY" className="h-6 w-6 brightness-0 invert" />
          </div>
          <div className="font-display text-xl font-bold tracking-tight text-white">Cognify</div>
        </div>
        <NavLinks onNavigate={() => setOpen(false)} />
      </SheetContent>
    </Sheet>
  );
}

export default function AppShell({ children }: { children: React.ReactNode }) {
  return <ShellContent>{children}</ShellContent>;
}

export function PageHeader({
  title,
  subtitle,
  actions,
}: {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
}) {
  return (
	    <div className="mb-8 flex flex-wrap items-end justify-between gap-4 pt-4">
	      <div className="min-w-0">
	        <h1 className="font-display text-3xl font-bold text-navy sm:text-4xl">{title}</h1>
	        {subtitle && (
	          <p className="mt-2 text-slate-light italic">{subtitle}</p>
	        )}
	      </div>
	      {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
	    </div>
  );
}
