import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch, useLocation } from "wouter";
import { useEffect } from "react";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { AppProvider, useApp } from "./contexts/AppContext";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Onboarding from "./pages/Onboarding";
import Dashboard from "./pages/Dashboard";
import Today from "./pages/Today";
import Practice from "./pages/Practice";
import Curriculum from "./pages/Curriculum";
import Profile from "./pages/Profile";
import ComingSoon from "./pages/ComingSoon";
import Resources from "./pages/Resources";
import Session from "./pages/Session";
import Player from "./pages/Player";
import Library from "./pages/Library";
import Saved from "./pages/Saved";
import Continue from "./pages/Continue";
import TopicLearning from "./pages/TopicLearning";
import Adaptive from "./pages/Adaptive";
import Mistakes from "./pages/Mistakes";
import Confidence from "./pages/Confidence";
import Revision from "./pages/Revision";
import TimetablePage from "./pages/Timetable";
import GoalsPage from "./pages/Goals";
import Teach from "./pages/Teach";
import Community from "./pages/Community";
import SubjectPage from "./pages/SubjectPage";
import DemoEntry from "./pages/DemoEntry";

/**
 * Auth/onboarding guard as a real component — hooks are called unconditionally
 * at the top level, and redirects happen inside useEffect (never during render).
 */
function GuardedRoute({
  path,
  component: Component,
  requireAuth = true,
  requireOnboarding = true,
}: {
  path: string;
  component: React.ComponentType;
  requireAuth?: boolean;
  requireOnboarding?: boolean;
}) {
  return (
    <Route path={path}>
      <GuardInner requireAuth={requireAuth} requireOnboarding={requireOnboarding}>
        <Component />
      </GuardInner>
    </Route>
  );
}

function GuardInner({
  requireAuth,
  requireOnboarding,
  children,
}: {
  requireAuth: boolean;
  requireOnboarding: boolean;
  children: React.ReactNode;
}) {
  const { auth } = useApp();
  const [, navigate] = useLocation();

  useEffect(() => {
    if (requireAuth && auth.kind === "logged-out") {
      // Day 10: the product stays explorable — unauthenticated visitors
      // are sent to the public landing page, not a login wall.
      navigate("/");
      return;
    }
    if (
      requireAuth &&
      requireOnboarding &&
      auth.kind === "logged-in" &&
      !(auth as { onboarded: boolean }).onboarded
    ) {
      navigate("/onboarding");
      return;
    }
  }, [requireAuth, requireOnboarding, auth, navigate]);

  return <>{children}</>;
}

function Router() {
  return (
    <Switch>
      <Route path={"/"} component={Home} />
      <GuardedRoute path={"/demo"} component={DemoEntry} requireOnboarding={false} />
      <Route path={"/login"} component={Login} />
      <Route path={"/signup"} component={Signup} />
      <GuardedRoute path={"/onboarding"} component={Onboarding} requireOnboarding={false} />
      <GuardedRoute path={"/today"} component={Today} />
      <GuardedRoute path={"/practice"} component={Practice} />
      <GuardedRoute path={"/curriculum"} component={Curriculum} />
      <GuardedRoute path={"/dashboard"} component={Dashboard} />
      <GuardedRoute path={"/subject/:subjectId"} component={SubjectPage} />
      <GuardedRoute path={"/profile"} component={Profile} />
      <GuardedRoute path={"/adaptive"} component={Adaptive} />
      <GuardedRoute path={"/mistakes"} component={Mistakes} />
      <GuardedRoute path={"/confidence"} component={Confidence} />
      <GuardedRoute path={"/revision"} component={Revision} />
      <GuardedRoute path={"/teach"} component={Teach} />
      <GuardedRoute path={"/resources/:topicId"} component={Resources} />
      <GuardedRoute path={"/library"} component={Library} />
      <GuardedRoute path={"/saved"} component={Saved} />
      <GuardedRoute path={"/continue"} component={Continue} />
      <GuardedRoute path={"/topic/:topicId"} component={TopicLearning} />
      <GuardedRoute path={"/session/:resourceId"} component={Session} />
      <GuardedRoute path={"/player/:resourceId"} component={Player} />
      <GuardedRoute path={"/timetable"} component={TimetablePage} />
      <GuardedRoute path={"/goals"} component={GoalsPage} />
      <GuardedRoute path={"/community"} component={Community} />
      <Route path={"/credits"}>
        {() => (
          <ComingSoon
            overline="Credits"
            title="Credits ledger"
            blurb="Earned for practice, revision and teaching — spent on stretch resources and group sessions."
            capabilities={[
              "Credits balance & transaction history",
              "Earning rules for practice, revision & teach-back",
              "Spending on premium resources",
              "Weekly earning reports",
            ]}
          />
        )}
      </Route>
      <Route path={"/404"} component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <Toaster position="bottom-right" />
          <AppProvider>
            <Router />
          </AppProvider>
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
