/**
 * COGNIFY — App State Context
 * Holds authentication (demo), onboarding selections, and student profile.
 * Persists to localStorage so refresh keeps the logged-in state.
 * When the NestJS API is connected, this becomes the API client layer.
 */
import { createContext, useCallback, useContext, useEffect, useState } from "react";
import {
  boards,
  creditsBalance,
  goals,
  learningDNA,
  recentActivity,
  revisionDue,
  studentProfile as defaultProfile,
  todaysPath,
  weakTopics,
} from "@/lib/mockData";
import { classSubjects } from "@/lib/studyContext";
import type { CreditsBalance, Goal, LearningDNA, StudentProfile, TodayPathItem } from "@/lib/types";

const STORAGE_KEY = "cognify.state.v1";

/** Seeded demo account — a judge/exploiter enters the product with one click,
 *  preconfigured as a CBSE Class 10 student with all subjects selected. */
export const DEMO_ACCOUNT = {
  name: "Aarav Mehta",
  email: "demo@demo.cognify.app",
  boardId: "cbse",
  classId: "cbse-10",
  subjectIds: [] as string[], // filled lazily from classSubjects
};

interface OnboardingSelection {
  boardId: string | null;
  classId: string | null;
  subjectIds: string[];
  learningGoal: string;
}

export type AuthState =
  | { kind: "logged-out" }
  | { kind: "logged-in"; email: string; name: string; onboarded: boolean };

interface AppState {
  auth: AuthState;
  onboarding: OnboardingSelection;
  profile: StudentProfile;
  credits: CreditsBalance;
  dna: LearningDNA;
  goalsList: Goal[];
  todayPath: TodayPathItem[];
  weakTopicsList: ReturnType<typeof weakTopics>;
  revisionDueList: ReturnType<typeof revisionDue>;
  activity: typeof recentActivity;
  login: (name: string, email: string) => void;
  logout: () => void;
  setOnboarding: (next: Partial<OnboardingSelection>) => void;
  completeOnboarding: () => void;
  setGoal: (id: string, progress: number) => void;
  clearAll: () => void;
  enterDemo: () => void;
}

const defaultOnboarding: OnboardingSelection = {
  boardId: null,
  classId: null,
  subjectIds: [],
  learningGoal: "",
};

const emptyState: AppState = {
  auth: { kind: "logged-out" },
  onboarding: defaultOnboarding,
  profile: defaultProfile,
  credits: creditsBalance,
  dna: learningDNA,
  goalsList: goals,
  todayPath: todaysPath,
  weakTopicsList: weakTopics(),
  revisionDueList: revisionDue(),
  activity: recentActivity,
  login: () => {},
  logout: () => {},
  setOnboarding: () => {},
  completeOnboarding: () => {},
  setGoal: () => {},
  clearAll: () => {},
  enterDemo: () => {},
};

const AppContext = createContext<AppState>(emptyState);

export function useApp() {
  return useContext(AppContext);
}

function loadState(): AppState | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    // Re-attach derived data which isn't persisted
    return {
      ...emptyState,
      ...parsed,
      credits: creditsBalance,
      dna: learningDNA,
      todayPath: todaysPath,
      weakTopicsList: weakTopics(),
      revisionDueList: revisionDue(),
      activity: recentActivity,
    } as AppState;
  } catch {
    return null;
  }
}

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AppState>(() => loadState() ?? emptyState);

  useEffect(() => {
    const { auth, onboarding, profile, goalsList } = state;
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ auth, onboarding, profile, goalsList })
    );
  }, [state]);

  const login = useCallback((name: string, email: string) => {
    setState((s) => ({
      ...s,
      auth: { kind: "logged-in", email, name, onboarded: s.onboarding.boardId !== null },
    }));
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setState((s) => ({ ...s, auth: { kind: "logged-out" }, onboarding: defaultOnboarding }));
  }, []);

  const setOnboarding = useCallback((next: Partial<OnboardingSelection>) => {
    setState((s) => ({
      ...s,
      onboarding: { ...s.onboarding, ...next },
    }));
  }, []);

  const completeOnboarding = useCallback(() => {
    setState((s) => {
      const board = boards.find((b) => b.id === s.onboarding.boardId);
      const cls = board?.classes.find((c) => c.id === s.onboarding.classId);
      const profile: StudentProfile = {
        ...s.profile,
        name: s.auth.kind === "logged-in" ? s.auth.name : s.profile.name,
        board: board?.name ?? s.profile.board,
        className: cls?.name ?? s.profile.className,
        subjectIds: s.onboarding.subjectIds,
        learningGoal: s.onboarding.learningGoal || s.profile.learningGoal,
      };
      const currentEmail = s.auth.kind === "logged-in" ? s.auth.email : "";
      return {
        ...s,
        profile,
        auth: { kind: "logged-in", email: currentEmail, name: profile.name, onboarded: true },
        onboarding: { ...s.onboarding },
      };
    });
  }, []);

  const setGoal = useCallback((id: string, progress: number) => {
    setState((s) => ({
      ...s,
      goalsList: s.goalsList.map((g) => (g.id === id ? { ...g, progress } : g)),
    }));
  }, []);

  const clearAll = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setState(emptyState);
  }, []);

  const enterDemo = useCallback(() => {
    const subjectIds = classSubjects(DEMO_ACCOUNT.boardId, DEMO_ACCOUNT.classId).map((s) => s.id);
    const profile: StudentProfile = {
      ...defaultProfile,
      name: DEMO_ACCOUNT.name,
      board: "CBSE",
      className: "Class 10",
      subjectIds,
      learningGoal: "Board exam preparation",
    };
    setState((s) => ({
      ...s,
      profile,
      onboarding: {
        boardId: DEMO_ACCOUNT.boardId,
        classId: DEMO_ACCOUNT.classId,
        subjectIds,
        learningGoal: profile.learningGoal,
      },
      auth: {
        kind: "logged-in",
        email: DEMO_ACCOUNT.email,
        name: DEMO_ACCOUNT.name,
        onboarded: true,
      },
    }));
    localStorage.setItem("cognify.profile-context.v1", JSON.stringify({
      boardId: DEMO_ACCOUNT.boardId,
      classId: DEMO_ACCOUNT.classId,
      subjectFocus: null,
    }));
    window.dispatchEvent(new CustomEvent("cognify:context-change"));
  }, []);

  return (
    <AppContext.Provider
      value={{
        ...state,
        login,
        logout,
        setOnboarding,
        completeOnboarding,
        setGoal,
        clearAll,
        enterDemo,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}
