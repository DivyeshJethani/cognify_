# Day 10 — Major Product Simplification & UX Overhaul

## Phase 1 — Entry points & navigation target
- [ ] /today and /practice auth guard redirects to / (landing), not /login; landing stays public at root
- [ ] Seed demo account: /demo one-click sign-in (Aarav Mehta, CBSE Class 10) from landing page CTA
- [ ] Public nav: Explore Cognify (scroll), Try Demo, Sign In CTAs; remove Learning DNA nav anchor
- [ ] Sidebar: Today, Curriculum, Practice (new), Teach Cognify, Study Groups
- [ ] Onboarding final step → /today; "Open my Command Center" wording → /today
- [ ] Public footer/logged-in CTA → /today

## Phase 2 — Simple Today home screen
- [ ] Today page: Continue Learning card + 1–2 recommended actions + Teach opportunity + Study Group activity
- [ ] Remove weak/developing topics, DNA analysis, error %, calibration, activity history, streak, timetable, goals from Today
- [ ] Small progress indicators only; one simple graph at most

## Phase 3 — Practice core feature
- [ ] New /practice page: Quick 5-question quiz, topic practice, short test entry
- [ ] Simple quiz UI powered by existing topic question banks (curriculum/questionBank)
- [ ] Human-readable feedback: "Keep practising this concept" / "You're improving" / "Try a slightly harder question"
- [ ] Practice results update Learning DNA silently (dna service kept, not exposed)

## Phase 4 — Teach Cognify hero
- [ ] Step 1: choose topic (suggested ready-to-teach topics)
- [ ] Step 2: learn first — 2–3 curated resources
- [ ] Step 3: teach — written explanation + audio/video recording (MediaRecorder)
- [ ] Step 4: AI analysis — built-in LLM for verdict, or fall back to existing mock analyseTeachBack with human-readable feedback
- [ ] Step 5: peer teaching recommendation → "You are ready to teach this topic" + [Teach a classmate] → community
- [ ] No complicated analytics in feedback

## Phase 5 — Study Groups collaborative
- [ ] Community page: group members, group chat (messages with input), Ask a doubt / Answer a doubt
- [ ] Peer teaching requests: "Aarav needs help with X" + [Teach Aarav]
- [ ] Topics being discussed; scoped by board/class

## Phase 6 — Curriculum Explorer + topic flow
- [ ] Topic page: name + one-line description + action row (WATCH / READ / PRACTICE / QUICK TEST / TEACH COGNIFY)
- [ ] Curated resources (1–2 video, 1 reading, practice, quick test); "More resources" collapsed
- [ ] No long paragraphs; start learning in seconds
- [ ] Remove Resource Library from sidebar (library accessible via quiet footer link only); /library stays for advanced users

## Phase 7 — Intelligence behind the scenes & density removal
- [ ] DNA services kept; Profile page demoted to footer quiet link only, no DNA wall
- [ ] Remove Stretch Goals from main experience (footer Coming Soon)
- [ ] Demote Session/Adaptive/Mistakes/Confidence/Revision/Timetable/Goals/Continue/Library/Saved/Interventions from nav, keep code & direct links
- [ ] Remove remaining long mock paragraphs across pages
- [ ] Mobile header: remove DNA % display

## Phase 8 — Verify, checkpoint, deliver
- [ ] Verify: root = landing, demo flow, Today simple, Curriculum works, topic actions, Practice, Teach (text+record), Study Groups chat + peer teaching, DNA not prominent, library demoted, mock text reduced
- [ ] Checkpoint + deliver


# Urgent Demo Fixes — Teach Evaluation and Class 10 CBSE Curriculum

## Scope

- Work only on the existing Cognify frontend.
- Preserve existing UI, layout, styling, animations, typography, navigation, and content unless behavior/data must change for this brief.
- Do not touch backend, Docker, Prisma, PostgreSQL, authentication, deployment, or unrelated pages.
- Do not remove or break existing Teach Cognify topic IDs.

## Implementation Checklist

- [ ] Inspect the existing Teach Cognify / Teach Back evaluation flow and result model.
- [ ] Test current evaluation behavior for correct, wrong, partial, irrelevant, and empty explanations.
- [ ] Implement explicit evaluation outcomes and corrective feedback while preserving the current UI.
- [ ] Inspect the existing Class 10 CBSE curriculum data model, aliases, and chapter/topic routing.
- [ ] Populate Mathematics with the required Class 10 CBSE chapters and usable topics.
- [ ] Populate Science with Physics, Chemistry, and Biology sections and usable topics.
- [ ] Populate Social Science with History, Political Science/Civics, and Geography sections and usable topics.
- [ ] Verify representative chapter/topic navigation and refresh behavior without 404s.
- [ ] Run focused type/build checks and manual browser checks for both requested changes.
- [ ] Report only changed files, Teach Cognify completion, curriculum sections, checks performed, and remaining limitations.

## Status

- [ ] Inspect existing implementations
- [ ] Implement Teach Cognify evaluation
- [ ] Populate curriculum data
- [ ] Verify flows and regressions
- [ ] Final report

## Findings

_To be filled during implementation._

## Changed Files

_To be filled after implementation._

## Remaining Limitations

_To be filled after verification._

> Preserve the existing COGNIFY visual language and keep this work limited to the explicitly requested behavior and demo data changes.


## Urgent Fix Completion Record

The existing Teach Cognify flow now evaluates submitted explanations with explicit outcomes: correct, partial, incorrect, irrelevant, and too-short. The existing result screen now changes its status heading, progress accent, feedback label, correction text, correct concept, and next-step guidance according to the outcome. Empty submissions are allowed to reach the result state so the student receives a meaningful request for more detail instead of silent blocking.

The Class 10 CBSE demo data now includes 14 Mathematics chapters, 16 Science chapters organized under Chemistry, Biology, and Physics labels, and 17 Social Science chapters organized under History, Political Science, and Geography labels. Every added chapter contains usable topics, objectives, resources, and learning actions through the existing curriculum model.

Focused checks completed: Teach evaluation cases produced the expected five outcomes; CBSE Class 10 curriculum integrity found 50 chapters and 105 topics with no duplicate chapter or topic IDs; TypeScript compilation passed; production build passed; development server restarted with no TypeScript or LSP errors; and route screenshot checks completed for `/teach` and `/curriculum` while unauthenticated routes redirected to the existing public landing flow.

Changed implementation files: `client/src/lib/types.ts`, `client/src/lib/teachBack.ts`, `client/src/pages/Teach.tsx`, and `client/src/lib/mockData.ts`. The temporary focused test script under `scripts/test-teach-back.ts` may be removed before checkpointing if it is not intended as a permanent project test.


# Curriculum Explorer Visibility Fix

- [ ] Trace the exact Curriculum Explorer component, context, selector, and data source used at runtime.
- [ ] Confirm the active board/class context used by the rendered Curriculum Explorer.
- [ ] Determine why the previously added Science and Social Science chapters are not visible in the live UI.
- [ ] Modify only the actual frontend data source or existing categorization path used by Curriculum Explorer.
- [ ] Ensure CBSE Class 10 Science visibly exposes Physics, Chemistry, and Biology categories with chapters.
- [ ] Ensure CBSE Class 10 Social Science visibly exposes History, Civics/Political Science, and Geography categories with chapters.
- [ ] Preserve existing Mathematics chapters, topic IDs, Teach Cognify behavior, and the current UI.
- [ ] Verify representative category, chapter, topic, and refresh flows in the rendered application.
- [ ] Report the exact cause, exact files changed, checks performed, and any remaining limitation.
