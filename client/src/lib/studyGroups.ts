/**
 * COGNIFY — Study Groups & peer learning (Day 4)
 * Academic, curriculum-focused — not a social network.
 *
 * MOCK SERVICE. Future NestJS backend:
 *   GET  /groups/my            → StudyGroup
 *   POST /groups/requests      (need-help / can-teach)
 *   POST /groups/requests/:id/match
 */
import type {
  GroupDiscussion,
  PeerCandidate,
  PeerRequest,
  StudyGroup,
} from "./types";

const discussions: GroupDiscussion[] = [
  {
    id: "d-1",
    author: "Ishita R.",
    initials: "IR",
    message:
      "Stuck on balancing redox equations in acidic medium — is there a worked example that separates oxidation and reduction halves clearly?",
    when: "2h ago",
    topicTitle: "Oxidation, Reduction & Corrosion",
  },
  {
    id: "d-2",
    author: "Arjun V.",
    initials: "AV",
    message:
      "I made a comparison table for all four reaction types with one example each — it killed my classification errors. Happy to share.",
    when: "5h ago",
    topicTitle: "Types of Reactions",
  },
  {
    id: "d-3",
    author: "Meera S.",
    initials: "MS",
    message:
      "For Nationalism in India: reconstructing the 1919–1922 timeline from memory before reading the notes made the sequence stick.",
    when: "1d ago",
    topicTitle: "Nationalism in India",
  },
  {
    id: "d-4",
    author: "Rohan K.",
    initials: "RK",
    message:
      "Does anyone have a clean way to remember when the discriminant is zero vs positive on the graph?",
    when: "1d ago",
    topicTitle: "Nature of Roots & Discriminant",
  },
];

const needHelp: PeerRequest[] = [
  {
    id: "pr-1",
    kind: "need-help",
    author: "Ishita R.",
    initials: "IR",
    topicTitle: "Heron's Formula",
    subjectCode: "MATH",
    detail: "I need help understanding Heron's Formula — specifically when to use it over ½bh.",
    when: "3h ago",
    status: "open",
  },
  {
    id: "pr-2",
    kind: "need-help",
    author: "Ishita R.",
    initials: "IR",
    topicTitle: "Oxidation, Reduction & Corrosion",
    subjectCode: "SCI",
    detail: "Half-equation balancing in acidic medium keeps failing at the electron count.",
    when: "2h ago",
    status: "open",
  },
  {
    id: "pr-3",
    kind: "need-help",
    author: "Rohan K.",
    initials: "RK",
    topicTitle: "Nature of Roots & Discriminant",
    subjectCode: "MATH",
    detail: "Need a visual way to connect D to the parabola's intersection with the x-axis.",
    when: "1d ago",
    status: "open",
  },
];

const canTeach: PeerRequest[] = [
  {
    id: "pr-4",
    kind: "can-teach",
    author: "Arjun V.",
    initials: "AV",
    topicTitle: "Types of Reactions",
    subjectCode: "SCI",
    detail: "I can teach the classification of reaction types — I built a comparison table that fixed my own errors.",
    when: "5h ago",
    status: "open",
  },
  {
    id: "pr-5",
    kind: "can-teach",
    author: "Meera S.",
    initials: "MS",
    topicTitle: "The First World War & Non-Cooperation",
    subjectCode: "SST",
    detail: "I can teach the 1919–1922 timeline — memory-reconstruction method included.",
    when: "1d ago",
    status: "open",
  },
];

const peersForTopics: Record<string, PeerCandidate[]> = {
  "Heron's Formula": [
    { name: "Arjun V.", initials: "AV", strength: "Strong in Mathematics", mastery: 92 },
    { name: "Meera S.", initials: "MS", strength: "Strong in Mathematics", mastery: 84 },
  ],
  "Nature of Roots & Discriminant": [
    { name: "Arjun V.", initials: "AV", strength: "Strong in Mathematics", mastery: 88 },
    { name: "Ritika P.", initials: "RP", strength: "Strong in Mathematics", mastery: 81 },
  ],
  "Types of Reactions": [
    { name: "Arjun V.", initials: "AV", strength: "Strong in Science", mastery: 90 },
  ],
};

export function myGroup(): StudyGroup {
  return {
    board: "CBSE",
    className: "Class 10",
    focusSubject: "Science",
    memberCount: 12,
    topicsDiscussed: [
      "Types of Reactions",
      "Oxidation, Reduction & Corrosion",
      "Nature of Roots & Discriminant",
      "Nationalism in India",
    ],
    discussions,
    needHelp,
    canTeach,
  };
}

export function findPeer(topicTitle: string): PeerCandidate[] {
  return peersForTopics[topicTitle] ?? [
    { name: "Ritika P.", initials: "RP", strength: "Strong in Mathematics", mastery: 79 },
    { name: "Meera S.", initials: "MS", strength: "Strong in Science", mastery: 76 },
  ];
}

export function openTeachRequests(): PeerRequest[] {
  return myGroup().needHelp.filter((r) => r.status === "open");
}

export function groupActivityNote(): string {
  return "3 new teach requests this week — 1 matched through peer teaching.";
}
