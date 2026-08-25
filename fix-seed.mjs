// One-off helper: write a complete demo state into localStorage-compatible JSON.
// Run via: node -e ... — but localStorage is browser-only; this script prints the JSON.
const state = {
  auth: { kind: "logged-in", email: "aarav.demo@cognify.app", name: "Aarav Mehta", onboarded: true },
  onboarding: {
    boardId: "cbse",
    classId: "cbse-class-10",
    subjectIds: ["MATH", "SCI", "SST", "ENG"],
    learningGoal: "mastery",
  },
  profile: {
    id: "s-001",
    name: "Aarav Mehta",
    board: "CBSE",
    className: "Class 10",
    subjectIds: ["MATH", "SCI", "SST", "ENG"],
    learningGoal: "Master the Class 10 syllabus with depth — build genuine understanding, not exam-night recall.",
    weeklyTargetMinutes: 420,
    streakDays: 9,
    createdAt: "2026-07-14",
  },
  goalsList: [],
};
console.log(JSON.stringify(state));
