# COGNIFY — Task Notes (working state)

## Style review feedback (to apply, one pass, then deliver)
1. Logged-in app routes (/dashboard, /curriculum, /profile) screenshot as logged-out redirect → screenshots show login page. Need to verify app routes via browser with localStorage seeded OR check guards. Auth guard redirects logged-out users to /login — screenshot tool is logged out, so app routes legitimately redirect. FIX: pre-seed localStorage for logged-in state in a demo helper? Better: take screenshots via browser after logging in, OR add a `?demo=1` seed. Simplest: browser-based login via UI, then screenshot.
2. Make app surfaces visibly distinct from marketing (dashboard = field notebook ledger, curriculum = book index, profile = case dossier) — largely done but unverified due to redirect.
3. Every metric/recommendation carries provenance (WHY footnote, confidence) — mostly done.
4. DNA helix-stripe motif on every major page (divider, index marker, sidebar accent).
5. Brief amendments (accepted, appended to ideas.md):
   - Product routes never reuse public auth split identity.
   - DNA helix-stripe appears at least once on every major page.
   - Every product metric/recommendation carries provenance language.

## Asset URLs (use exactly)
- Logo: /manus-storage/cognify-logo-mark_070389eb.png
- Hero lab: /manus-storage/cognify-hero-lab_cf2b19b7.png
- DNA illustration: /manus-storage/cognify-dna-illustration_388571e2.png
- Texture: /manus-storage/cognify-lab-texture_eea6ce6a.png

## Architecture
- Static React 19 + Tailwind 4 + wouter. AppContext (contexts/AppContext.tsx) holds auth/onboarding/profile + localStorage cognify.state.v1.
- Pages: Home, Login, Signup, Onboarding, Dashboard, Curriculum, Profile, ComingSoon (/timetable /goals /community /credits).
- Data: lib/mockData.ts (CBSE/ICSE/UP Board, Class 8–10, 6 subjects, chapters/topics w/ mastery/state/revision), lib/types.ts.
- App shell: ink sidebar AppShell.tsx; PublicLayout.tsx = landing header/footer + useRequireAuth/useRequireOnboarding guards.
- TypeScript passes. Landing page verified good. Auth pages verified good.
- TODO: verify logged-in app routes via browser (sign in via UI), fix onboarding guard redirect issue for logged-in but not-onboarded (works). Apply style review, checkpoint, deliver.

## Checklist from brief (coverage)
- [x] Landing, login/signup, onboarding (Board→Class→Subjects→Goals), shell/nav, dashboard command center (today's path w/ WHY, weak topics, revision due, activity timeline, DNA preview, goals, streak), curriculum explorer (tree + 3 view modes + topic drawer w/ mastery/state/last-studied/revision/next-action/resources), profile/DNA preview, responsive, mock data only, reusable components, design tokens in index.css.

## Dashboard findings (after seeding logged-in + onboarded state)
- Dashboard renders the app shell correctly: ink sidebar, header "Learning Command Center", greeting, today's path with WHY marginalia, weak topics, due-for-revision, activity timeline, DNA preview, streak/goals. Design system works.
- BUG 1: "Streak — undefinedd" → streak value renders `undefined` (streak calculation returns undefined). Find streak logic in Dashboard.tsx.
- BUG 2: "Weekly target — 3h 22m of NaNh 00m target" → weekly minutes target NaN. Fix weekly-target math.
- BUG 3: Current streak card shows "d" (missing number, same streak bug).
- BUG 4: Signup form: name/email not bound? Earlier "Tell us your name first" even though input showed Aarav Mehta — actually the state persisted from previous partial run; the toast appeared because name state was empty. Fine, not a bug (state was seeded earlier but empty before typing). NOTE: signup page had values prefilled by browser autocomplete. No fix needed; but signup showed stale name from earlier session — acceptable.
- Also "DNA profile 72%" badge fine. Mistake profile chart renders (recharts).
- DNA preview cards good. Fix streak/target, then verify curriculum + profile pages, then style review apply + checkpoint.

## Post-fix verification (all good)
Dashboard metrics correct (streak 9d, weekly target 7h 00m). Curriculum explorer renders book-index layout + chapter topic rows + topic dossier drawer with mastery, objectives, WHY recommendation, resources, last-studied/next-revision. Profile/dossier page renders case-file sections I–IV with evidence badges, bar charts, rhythm stats. All three app routes verified in browser with seeded state. Next: mobile check of dashboard + final pre-delivery screenshot pass, checkpoint, deliver.

# PHASE 2: Learning Experience build (current scope)
User request: build resource discovery, topic resource page, lecture player, learning session, notes, transcript, related resources, Ask Cognify. Keep existing design system untouched. Realistic mock resources tied to curriculum (not generic). Responsive. Checkpoint + deliver after.

## Done so far (phase 7)
- types.ts extended: LearningResource (source ResourceSource: youtube/ncert/cbse/edu-website/cognify-original; format ResourceFormat: lecture/revision/explanation/example/practice/diagram; Difficulty; relevance 0-100; whyRecommended; dnaDimension), ResourceDiscoveryResult, TranscriptSegment {startSec,endSec,text,confusing?}, ConfusingMark, PlayerEvent {type PLAY/PAUSE/REWIND/FAST_FORWARD/SKIP/SPEED_CHANGE/COMPLETE/DROP_OFF, atSec, sessionId, resourceId, payload?}, LearningSession {id, resourceId, topicId, objective, estimatedMinutes, nextActivity, startedAt}.
- client/src/lib/curriculum.ts created: findSubject(boardId,classId,subjectId), findTopic(topicId), findChapter(chapterId), subjectName(code). Imports boards+types from mockData.
- client/src/lib/resourceDiscovery.ts created: INVENTORY keyed by topic id (matches mockData topic ids e.g. "t-0-euclid-s-division-lemma-hcf" [subject-chapter index-prefix "t-N-title"], covering MATH ch1-4 (Euclid/HCF, Irrational proofs, FTA, Zeros, Zeros&Coefs, Division algo, Graphical, Substitution&Elimination, Cross-multiplication, Factorisation, Completing Square, Discriminant), SCI (Balancing, Types of Reactions, Redox, Acids/Bases, pH, Nutrition plants, Nutrition humans, Transportation), SST (French Rev, Italy&Germany, Balkans, WWI&Non-Coop, Salt March), ENG (Letter to God, Mandela, Flying), HINDI (माँ की चिट्ठी, ल्हासा की ओर), SKT. ~4-5 resources each w/ curriculum-realistic whyRecommended tied to DNA (visual-diagram top format, careless sign errors, attention 22min ceiling, confidence overestimate).
- TRANSCRIPTS in resourceDiscovery.ts: r-rev-proof (irrational proof rebuild, marks breaking step), r-rev-zc (zeros-coefficients), r-learn-da (division algorithm), r-rev-digest (nutrition humans enzyme map).
- discoverResources(topicId, {formats?, difficulty?}) returns ResourceDiscoveryResult sorted by relevance; getTranscript(resourceId); discoveryMeta.
- NOTE: INVENTORY keys must match findTopic ids: mockData ids are `t-${index}-${slug}` where topic index is per-chapter 0-based ("t-0-...", "t-1-...") — I used "t-0-" style; VERIFY mapping: e.g. Real Numbers topics ids t-0-euclid, t-1-irrational, t-2-fta; Polynomials: t-3-zeros, t-4-relationship, t-5-division; PLE: t-6-graphical, t-7-substitution, t-8-cross; Quadratic: t-9-factorisation, t-10-completing, t-11-discriminant. Science: t-0-balancing, t-1-types, t-2-oxidation, t-3-acids, t-4-ph, t-5-plants, t-6-humans, t-7-transport. Social ch1: t-0-french, t-1-italy-germany, t-2-balkans; ch2: t-3-wwi-noncoop, t-4-civil-disobedience. English ch1 (First Flight): t-0-letter-to-god, t-1-nelson-mandela, t-2-flying. Hindi क्षितिज ch1: t-0-maa-ki-chitthi, t-1-lhasa-ki-or. Sanskrit: t-0-achha-vakt.
- topicMeta() in resourceDiscovery.ts uses buggy subjectId split — NOT used currently; safe to remove.

## Remaining plan
Phase 8: TopicResources page (/resources/:topicId) + LearningSession page (/session) + wire "Open resources" button in Curriculum.tsx topic drawer to /resources. Add route to App.tsx.
Phase 9: LecturePlayer page (/player/:resourceId) with video area (mock controls emit player events via lib/playerEvents.ts store → localStorage + in-memory queue), transcript panel, notes panel (localStorage persisted), related resources (discoverResources siblings + cross-format), Ask Cognify (rule-based contextual answers from whyRecommended/DNA meta), replay section (confusing marks list), playback speed (0.75-2x), mark-confusing button that writes into transcript segment + ConfusingMark list. Sidebar session card: learning obj, progress, est time, next activity.
Phase 10: browser verify all flows (seeded demo state exists in browser localStorage from earlier), responsive check, screenshot, checkpoint.
Phase 11: deliver.

## App state/seed info
LocalStorage key: cognify.state.v1. Seeded demo user: Aarav Mehta, CBSE Class 10, subjects MATH/SCI/SST/ENG, streak 9d, weeklyTarget 420min. Dev preview: https://3000-...manus.computer (auto-publish enabled; checkpoints publish immediately). Checkpoint c2eb2f1f delivered previously. Style: "Scholar's Atelier" — index.css tokens: bg ivory, ink, teal, amber; font-serif Libre Caslon, font-mono IBM Plex, sans Public Sans. Primitives in components/cognify/Primitives.tsx (Logo, Marginalia, MasteryBar, StateBadge). AppShell in AppShell.tsx (sidebar, public header).

## Build state update (phase 8 done, phase 9 in progress)
Created so far for learning experience:
- client/src/lib/curriculum.ts: findSubject/findTopic/findChapter/subjectName (exports boards from mockData).
- client/src/lib/playerEvents.ts: startSession(resourceId)→sessionId, logEvent({type,atSec,sessionId,resourceId,payload?}) — types PLAY/PAUSE/REWIND/FAST_FORWARD/SKIP/SPEED_CHANGE/COMPLETE/DROP_OFF; localStorage key cognify.player-events.v1, eventsForSession/eventsForResource, eventLabel().
- client/src/lib/askCognify.ts: quickPicks(ctx), answer(ctx, question) contextual rule-based; ctx={resource,elapsedSec,totalSec,speed,confusingCount,transcriptText}; asks: recommend/dna/time/after/confus/watch/speed/note/difficult/hello; fallback points to session grounding. discoveryMeta imported from resourceDiscovery.
- client/src/pages/Resources.tsx: DONE. Route /resources/:topicId. Filter strip: formats (All/Lecture/Revision/Explanation/Example/Practice/Diagram-visual) + difficulty (All/Foundational/Core/Advanced/Stretch). Rows: source glyph badge, sourceLabel, ActionChip (actionForFormat: lecture→learn, revision→revise, practice→practice, else→learn), difficulty chip colored (foundational green-mid, core teal, advanced ink, stretch amber-dark), clock, serif title, relevance bar 0-100 + value, DNA chip (amber) when dnaDimension, "Why Cognify recommends —" footnote-style line. Right col: "Begin session" dark ink button → navigate(`/session/${r.id}?topic=${topicId}`). Margin panel: topic summary card + format legend. Provenance footnote. Ranking note from discovery.
- client/src/pages/Session.tsx: DONE. /session/:resourceId?topic=X. Briefing: current objective card, 4-stat grid (mastery+bar, est time, format+difficulty, session id live analytics ON), transcript preview first segment blockquote, "After this session" dashed box, dark ink sidebar card with Begin session → navigate(`/player/${resourceId}?sessionId=${sessionId}&topic=${topicId}`). Uses getTranscript for minutes (ceil(last.endSec/60)).
- Curriculum.tsx drawer now has "Open resource explorer" button → /resources/:topicId.
- App.tsx routes added: /resources/:topicId, /session/:resourceId, /player/:resourceId (Resources/Session done; Player.tsx still MISSING → TS error only for Player).

## Next: create client/src/pages/Player.tsx
Route params: /player/:resourceId. Query: sessionId, topic. Must include:
- Video area: mock video stage (dark ink box with title/topic/progress bar; controls: play/pause, prev10s(REWIND), next10s(FAST_FORWARD), skip intro (SKIP), speed selector 0.75/1/1.25/1.5/2x (SPEED_CHANGE), mark confusing button, complete button (COMPLETE), simulated 1s tick updating elapsedSec; DROP_OFF if user clicks "End session early" or close while <90%).
- Log events via logEvent; keep sessionId from query or startSession.
- Left column: transcript with timestamps + active segment highlight; confusing marks toggle segment style; click segment seeks.
- Notes tab: localStorage cognify.notes.v1 per resourceId, add note, timestamped.
- Replay tab: list of confusing marks with notes, seek-to.
- Ask Cognify tab: messages + quickPicks + input; answer() from askCognify.
- Related resources: discoverResources(topic) excluding current resource → cards linking /session/:id.
- Session sidebar: objective, progress %, est time, next activity (practice set after completion), event ledger (eventsForSession showing last events with eventLabel) — "observing" feel.
- Mobile: stacked.
After Player: verify flows in browser (seeded user), screenshot, checkpoint, deliver.
CSS classes available: marginalia, marginalia-amber, hairline, footnote, index-num, paper-grain, rise-in, btn usage = h-9 border border-ink bg-ink text-ivory font-mono uppercase; primary teal = bg-teal text-white hover:bg-teal-dark. Colors: --teal #1f9d8b, --teal-dark #17776a, --amber #e9a23b, --amber-dark #c9862a, --ivory-deep #f1eee6, --green-mid #7fa894, --dark-text #17212b, ink #102a43.

## PHASE 10 verification — critical finding
The Resources page rendered "Topic not found" for t-4-relationship-between-zeros-coefficients because the actual topic ids in mockData are TRUNCATED (slice(0,28)) and per-chapter indexed (each chapter's topics start at index 0):
- MATH ch1: t-0-euclid-s-division-lemma-hcf, t-1-irrational-numbers-proofs, t-2-fundamental-theorem-of-arith
- MATH ch2: t-0-zeros-of-a-polynomial, t-1-relationship-between-zeros-c, t-2-division-algorithm-for-polyn
- MATH ch3: t-0-graphical-method, t-1-substitution-elimination-met, t-2-cross-multiplication-word-pr
- MATH ch4: t-0-standard-form-factorisation, t-1-completing-the-square, t-2-nature-of-roots-discriminant
- SCI ch1: t-0-writing-balancing-equations, t-1-types-of-reactions, t-2-oxidation-reduction-corrosio
- SCI ch2: t-0-properties-of-acids-bases, t-1-ph-scale-strength
- SCI ch3: t-0-nutrition-in-plants, t-1-nutrition-in-humans, t-2-transportation-excretion
- SST ch1: t-0-the-french-revolution-the-id, t-1-making-of-nationalism-in-ita, t-2-nationalism-imperialism
- SST ch2: t-0-the-first-world-war-non-coop, t-1-civil-disobedience-sense-of-
- ENG: t-0-a-letter-to-god, t-1-nelson-mandela-long-walk-to-, t-2-two-stories-about-flying
- HIN: t-0--, t-1-- (Hindi titles are Devanagari → empty id; HIN/SKT resources in inventory use those broken ids too)

FIX PLAN: change resourceDiscovery INVENTORY keys to canonical ids used in a new stable mapping — simplest: change mkTopic in mockData to NOT truncate/slice AND use subject prefix? Too invasive. Better: introduce a CANONICAL_TOPIC_IDS map in curriculum.ts mapping inventory keys to real ids, and change findTopic to also resolve by "canonical alias". Alternatively re-key inventory to real ids. Decision: change resourceDiscovery INVENTORY keys to match actual ids AND add topicTitle/subjectCode/chapterId to resolved resources via a lookup. Simplest robust: create mapping `CANONICAL_TO_TOPIC: {canonicalKey → realTopicId}` in resourceDiscovery (or better, keep inventory keyed by canonical and resolve through a mapping constant), and in discoverResources use that mapping. Also add transcript inventories keyed the same canonical way.
Actually cleanest: in resourceDiscovery, add TOPIC_ALIASES Record<canonicalKey, realTopicId> and resolve. Keep current canonical keys unchanged (they match titles). 
Then TopicDetail drawer's resource list labels → resources page already works.
Test URLs after fix:
- /resources/t-1-relationship-between-zeros-c (math ch2 topic 1, inventory key t-4-relationship-between-zeros-coefficients)
- /resources/t-0-euclid-s-division-lemma-hcf (math ch1 topic 0, inventory key t-0-euclid-s-division-lemma-hcf — SAME, this one should already work!)

## PHASE 10 debugging state (continued)
- Circular import fixed: resourceDiscovery no longer imports from curriculum (removed unused topicMeta + imports). curriculum.ts imports TOPIC_ALIASES from resourceDiscovery (one-way now). tsc passes.
- Resources page topic now resolves (title/mastery panel correct), BUT discoverResources(topicId=alias) returns 0 resources.
- Suspect: resolveAlias in resourceDiscovery. Check its code: it does `if (slug in TOPIC_ALIASES) return TOPIC_ALIASES[slug]` — should work. Possibly INVENTORY access uses resolvedId but INVENTORY key is alias; resolvedId = runtime id (t-1-relationship-between-zeros-c) which is NOT an INVENTORY key! BUG: INVENTORY is keyed by ALIAS slugs (e.g. "t-4-relationship-between-zeros-coefficients"), resolveAlias returns runtime id → INVENTORY[runtimeId] undefined → null.
- FIX: keep mapping ALIAS→runtime but store INVENTORY keyed by ALIAS (already is). So discoverResources should pass the ALIAS key: resolveAlias should return the alias itself when slug is an alias, and only fall back to runtime id when slug is runtime. Simplest: change resolveAlias: if slug in TOPIC_ALIASES → return slug (alias key), else if slug in Object.values(TOPIC_ALIASES) → find the alias key for that runtime id and return it.
- Also Player/Sessions pass runtime id via ?topic=; both directions must work.
- Browser cache note: page markdown may be cached; after fix hard-reload via browser_navigate with cache-bust not possible — full page reload needed (browser_navigate refetches).
- Dev URL: https://3000-i8xkmuro48iuj1y2dmkc0-323c3b4d.us3.manus.computer
- Test: /resources/t-4-relationship-between-zeros-coefficients (alias), then open session /session/r-rev-zc?topic=t-4-..., then player /player/r-rev-zc?sessionId=sess-1&topic=t-4-...

## PHASE 10 status (post debugging)
All flows now WORKING in browser: Resources page resolves aliases and shows 5 ranked resources with why-recommendations, format legend, session panel; Session briefing page renders objective/mastery/time/next-activity and creates a session id; Player renders with controls, speed, mark-confusing, tabs (transcript/notes/replay/related/ask), observation log, DNA watch panel. Transcript shows "will be provided with resource file" for r-ncert-zc (no transcript authored for it) — acceptable degradation, transcript exists for r-rev-zc etc.
Remaining polish items before checkpoint:
1. Add transcripts for the other zeros/coefficients resources used in demo flow? Optional — player works.
2. Verify Ask Cognify tab, Notes tab, Related tab render in player.
3. Verify Related resources show (should come from discovery).
4. Mobile responsive check for /resources, /session, /player.
5. Checkpoint + deliver.
Dev URL: https://3000-i8xkmuro48iuj1y2dmkc0-323c3b4d.us3.manus.computer
Test URL pattern: /resources/t-4-relationship-between-zeros-coefficients

## VERIFIED in browser (all OK)
- Resources page (/resources/t-4-...) shows 5 ranked resources w/ relevance, why-recommendation, format/difficulty filters, session panel.
- Session briefing (/session/r-ncert-zc?topic=...) renders objective, mastery, time, next activity, creates session id.
- Player (/player/r-rev-zc?sessionId=...&topic=...) renders all 5 tabs: TRANSCRIPT (full authored segments w/ timestamps), NOTES (draft+save), REPLAY (confusing marks list), RELATED (4 sibling resources w/ links back to session), ASK COGNIFY (quick picks + typed question, contextual answers incl. DNA-aware).
- Playback simulation works: PLAY logs event, elapsed ticks, progress bar moves, observation log updates, DNA watch panel shows completion %.
- Speed 0.75–2x buttons present, mark-confusing + end-session-early buttons present.
- Analytics event count displayed in header ("Analytics ON · 1 events").
- Notes persisted via localStorage module (save/restore notes per resource).

## REMAINING before checkpoint
1. Mobile screenshot check for /resources and /player (375px).
2. TS check passes (0 errors).
3. webdev_save_checkpoint (single checkpoint at end) then deliver.
Dev URL: https://3000-i8xkmuro48iuj1y2dmkc0-323c3b4d.us3.manus.computer

## FINAL VERIFICATION COMPLETE
Resources page verified desktop: 5 ranked resources with relevance scores, why-recommendations, DNA tags (Confidence calibration, Mastery gap, Teaching format), all 6 format filters + difficulty filters, format legend, session summary panel. Player verified: all tabs, transcript with timestamps, Ask Cognify contextual answers, related resources, observation log, DNA watch panel, analytics header counter. TS: 0 errors. The lingering Vite log line about "await" (curriculum.ts:33) is STALE from earlier pre-fix build; final `pnpm run check` reports 0 errors and pages render correctly, so it is not a live bug.
Mobile: AppShell hides sidebar with lg:hidden + mobile toggle exists (verified via JS); pages use the same responsive shell as previously verified pages.
Next: webdev_save_checkpoint then deliver (auto-publish enabled).

# DAY 2 REQUEST (new scope, from /home/ubuntu/upload/pasted_content_2.txt)
User wants the complete resource-discovery + learning experience as a natural extension. Preserve everything (nav, palette, type, command center, curriculum, DNA, onboarding). Do NOT connect backend/DB/external APIs. All mock data, clean frontend services. Design must feel academic/intelligent/calm/premium (Scholar's Atelier — already matches).

Key new requirements:
1. "Resource Library" = new MAJOR nav section in sidebar + hub page. Reachable from Command Center, Curriculum, topic pages, recommendations.
2. All 5 subjects supported (Math, Science, SST, English, Hindi/Skt) — already have mock data.
3. Resource types: VIDEO LECTURE, ARTICLE, NCERT/TEXTBOOK, DIAGRAM, ANIMATION/VISUAL, REVISION NOTES, SOLVED EXAMPLE, PRACTICE SET, QUICK REVISION, CONCEPT EXPLANATION — per-type layouts, not generic cards.
4. "Free resources from across the web" section (YouTube/NCERT/CBSE/edu/OER) — per resource: title, source, type, duration, topic, difficulty, relevance, description, why-recommend, save button, open/start button. Must NOT claim live internet search.
5. Intelligent recommendation rails with WHY: "Recommended for you", "Because you struggled with this topic", "Best for quick revision", "Best for conceptual understanding", "Continue learning", "Before your upcoming test", "Explore another explanation" — DNA-driven.
6. Topic Learning page (/topic/:id): overview, objectives, mastery, last studied, revision status, recommended format + why, recommended resources, practice, related topics, DNA insight.
7. Learning player extras: learning objective card, save resource, previous/next resource.
8. Session mode: today's learning objective + [Take Notes] [I am confused] [I understand] [Ask Cognify] — Cognify guiding feel.
9. Interaction tracking: play/pause/seek/rewind/speed/complete/confusing/ask/note/save/switch/retry — frontend services only.
10. Notes: timestamped, attach to timeline (02:14 "Remember..."), highlight, mark confusing.
11. Ask Cognify actions: Explain differently / Give example / Give hint / Test me / Show diagram / Why important / Another explanation / Make me teach back — mock responses.
12. Resource comparison/switching: "Didn't understand this explanation? Try: VIDEO → DIAGRAM → EXAMPLE → SIMPLE EXPLANATION → QUICK REVISION".
13. My Saved Resources (/saved) with subject/type/chapter/recent filters.
14. Continue Learning (/continue): partially watched, unfinished sessions/practice, saved, upcoming revision ("Continue: Light — Reflection 68% [Continue]").
15. Search: topics/resources/lectures/notes/practice — cmdk palette, Cognify-styled, global.
16. Responsive.

todo.md written with full checklist. Current checkpoint b119ae6e. Dev URL: https://3000-i8xkmuro48iuj1y2dmkc0-323c3b4d.us3.manus.computer

## File inventory (for Day 2 work)
- lib/types.ts (253L): LearningResource{source:youtube|ncert|cbse|edu-website|cognify-original, format:lecture|revision|explanation|example|practice|diagram, difficulty, relevance, whyRecommended, dnaDimension}, TranscriptSegment, PlayerEvent types PLAY/PAUSE/REWIND/FAST_FORWARD/SKIP/SPEED_CHANGE/COMPLETE/DROP_OFF.
- lib/resourceDiscovery.ts (1649L): TOPIC_ALIASES (canonical slug → runtime id), resolveAlias, ALIAS_IDS, INVENTORY keyed by ALIAS slugs, TRANSCRIPTS (4 keys), discoverResources, getTranscript, discoveryMeta.
- lib/mockData.ts (935L): boards[] CBSE/ICSE/UP, topics per chapter keyed t-{index0based}-{title-slug} (truncated), learningDNA, weakTopics(), revisionDue().
- lib/curriculum.ts: findSubject/findTopic/findChapter/subjectName/findTopicByIdOrAlias.
- lib/playerEvents.ts: startSession, logEvent, eventsForSession, eventsForResource, eventLabel.
- lib/askCognify.ts: quickPicks(ctx), answer(ctx, question) — rule-based.
- pages: Player.tsx (698L, tabs transcript/notes/replay/related/ask; player stage; observation log; DNA watch panel), Resources.tsx (330L, filters+why rows), Session.tsx (202L briefing), Curriculum.tsx drawer has "Open resource explorer", Dashboard.tsx command center, Profile.tsx.
- App.tsx routes: /dashboard /curriculum /profile /resources/:topicId /session/:resourceId /player/:resourceId /timetable /goals /community /credits /onboarding /login /signup + guards.
- Sidebar nav in AppShell.tsx — add "Resource Library" + maybe "My Library"/"Saved" entries there.
- Notes localStorage key cognify.notes.v1 (in Player.tsx); saved resources NEW key cognify.saved-resources.v1; continue progress NEW key cognify.progress.v1; search index from INVENTORY+topics.

## DAY 2 PHASE 12 — SERVICE LAYER PLAN (current working item)
types.ts ALREADY EXTENDED with: ResourceType (10 types), LearningResource fields (resourceType, description, rail?, isFreeWeb?), LearningInteractionType (12), SavedResource, ResourceProgress, SearchResult/ResultKind, TimelineNote, TopicLearningView, AskActionId/AskAction.
TS error now: resourceDiscovery.ts LearningResource mapper (line ~1611) missing resourceType/description — will add via mapper function + add rail description.

### Plan for resourceDiscovery.ts
1. Add `RESOURCE_TYPE_META` (per type: label, glyph char, duration presence).
2. Add `describeType(r)` function → resourceType/description derived from raw fields (title, format, sourceLabel) to avoid hand-editing 100+ entries. Add `isFreeWeb` (source ∈ youtube/ncert/cbse/edu-website).
3. Add `discoverAll()` → flat list of all resources (for library/search).
4. Add `searchResources(query)` over INVENTORY (title/topic).
5. Add recommendation rails module lib/recommendations.ts:
   RAILS: "Recommended for you", "Because you struggled with this topic", "Best for quick revision", "Best for conceptual understanding", "Continue learning", "Before your upcoming test", "Explore another explanation". Each rail: fn(topicId/context)→ LearningResource[] with per-resource rail-specific WHY (reuse whyRecommended, prepend rail voice).
6. New modules: lib/savedResources.ts (localStorage cognify.saved-resources.v1), lib/continueLearning.ts (cognify.progress.v1 + session store → merge with playerEvents for partial watch fraction; unfinished sessions from AppContext? keep simple: localStorage), lib/search.ts (index topics+resources+notes practice → SearchResult[]), lib/notes.ts (TimelineNote localStorage cognify.timeline-notes.v1), lib/askActions.ts (8 AskAction definitions + mock answer(ctx, action) returning text).
7. playerEvents.ts: add interaction events via new logInteraction() using LearningInteractionType.

### Resource type derivation (describeType)
- video-lecture: format=lecture, source=youtube → YouTube; ncert lecture → ncert-textbook? Keep: source=ncert AND format in [lecture,example] → ncert-textbook; diagram/animation → if title contains 'animat' or 'drag' → animation-visual else diagram; revision → quick-revision if title contains 'rapid' or duration<=15? Use: format=revision & ≤15min → quick-revision else revision-notes; example → solved-example; practice → practice-set; explanation → concept-explanation; article never generated yet (maybe add 2 mock article resources for free-web).

### Key facts
- INVENTORY keys = alias slugs; TOPIC_ALIASES maps alias→runtime id. discoverResources resolves via resolveAlias (alias stays alias key).
- Topics per alias key: ch1 math: t-0-euclid-s-division-lemma-hcf, t-1-irrational-numbers-proofs, t-2-fundamental-theorem-of-arithmetic; ch2: t-3-zeros-of-a-polynomial, t-4-relationship-between-zeros-coefficients, t-5-division-algorithm-for-polynomials; ch3: t-6-graphical-method, t-7-substitution-elimination-methods, t-8-cross-multiplication-word-problems; ch4: t-9-standard-form-factorisation, t-10-completing-the-square, t-11-nature-of-roots-discriminant; sci ch1: t-0-writing-balancing-equations, t-1-types-of-reactions, t-2-oxidation-reduction-corrosion; ch2: t-3-properties-of-acids-bases, t-4-ph-scale-strength; ch3: t-5-nutrition-in-plants, t-6-nutrition-in-humans, t-7-transportation-excretion; sst ch1: t-0-french-revolution-idea-of-nation, t-1-making-of-nationalism-italy-germany, t-2-nationalism-imperialism; ch2: t-3-first-world-war-non-cooperation, t-4-civil-disobedience-collective-belonging; eng: t-0-a-letter-to-god, t-1-nelson-mandela, t-2-two-stories-about-flying; hin: t-0-maa-ki-chitthi, t-1-lhasa-ki-or; skt: t-0-achha-vakt-mein-bhale-kaam.
- ~85 resources total in inventory now.
- Curriculum data needed for TopicLearningView: boards→class→subject→chapter→topic with mastery etc. (from mockData.findSubject/findTopic), findTopicByIdOrAlias in curriculum.ts.
- Subject codes: MATH/SCI/SST/ENG/HIN/SKT. Chapter titles: Real Numbers, Polynomials, PLE, Quadratic Equations / Chemical Reactions & Equations, Acids Bases & Salts, Life Processes / History: Nationalism in Europe, Nationalism in India / First Flight prose / कृतिका.
- Need per-topic canonical info for library (subject, chapter name). Add TOPIC_META derived from curriculum in curriculum.ts or a small static map. Better: curriculum.ts add `topicPath(alias)` → {board,class,subject,chapter,topic}.

### Pages to build (phase 13)
- /library → ResourceLibrary.tsx: hero "Resource Library — the open shelf", board/class/subject/chapter/topic selector (already scaffolded nav items), recommended rails, "Free resources from across the web" section, per-type layouts. Nav entry "Resource Library" in AppShell navItems (line 33-41) + mobile sheet.
- /saved → SavedResources.tsx: filters subject/type/chapter/recent; empty state.
- /continue → ContinueLearning.tsx (or merged into library section + separate route): partially watched, unfinished, saved, upcoming revision.
- /topic/:topicAlias → TopicLearning.tsx: overview, objectives, mastery, last studied, revision, recommended format+why, resources (discoverResources), practice entry, related topics, DNA insight.
- Search: cmdk CommandDialog global (⌘K / cmd palette button in AppShell header) → SearchResult kinds → links.

### Player.tsx enhancements (phase 14)
- Save resource button (top bar) → savedResources.add.
- Learning objective card (already objective strip — enrich "what you should understand by the end").
- Previous/next resource nav (same topic siblings).
- Timeline notes: notes already {sec,text}; upgrade to TimelineNote shape (importance highlight, confusing) + render markers on timeline (small amber marks above progress bar).
- Ask Cognify action chips (8 actions) alongside quickPicks → use askActions answer().
- "Didn't click? Try another format" strip → rails/explore-another-explanation (cross-format same topic).
- Session reflection: I am confused / I understand buttons in session bar; Ask Cognify already exists.
- Interaction tracking: logInteraction on note save, save resource, action ask, switch resource.

### Session.tsx enhancements
- Guided mode block: [Take Notes] [I am confused] [I understand] [Ask Cognify] — buttons; confused → mark topic confusion store + suggests alternative explanation rail.

### Wiring (phase 15)
- Dashboard: add "Continue learning" card + resource rails entry.
- Curriculum drawer: "Topic Learning Page" button → /topic/:alias.
- Resources page rows: add Save button, type glyph.
- Nav: Resource Library (real), Saved (real), Continue Learning (real) entries; timetable/goals/community/credits stay SOON.
- Verify flows, TS clean, screenshots, checkpoint.

## DAY 2 STATE (as of latest)
DONE so far in phase 12 (service layer):
- types.ts: extended with ResourceType (10), LearningInteractionType (13 incl MARK_CONFUSING/ASK_QUESTION/TAKE_NOTE/SAVE_RESOURCE/SWITCH_RESOURCE/RETRY_EXPLANATION), SavedResource {resourceId,savedAt,note?}, ResourceProgress {resourceId,fraction,lastAtSec?,updatedAt}, SearchResult {kind:topic|resource|lecture|note|practice,id,title,context,href,relevance}, TimelineNote {id,resourceId,atSec,text,importance,confusing?,createdAt}, TopicLearningView, AskActionId/AskAction (8 actions) in askCognify.ts.
- resourceDiscovery.ts: RESOURCE_TYPES + typeMeta + classifyType + describe (maps format/source/title → ResourceType), isFreeWeb flag, discoverAll(), searchResources(), topicIndexes() (needs mockData import of boards; topic.mastery is number 0-1), ALIAS_IDS kept in curriculum.ts.
- curriculum.ts: CANONICAL_TOPIC_SLUGS (local, avoids circular import), findTopicByIdOrAlias, ALIAS_IDS, topicAlias(), topicPath(), allTopics().
- savedResources.ts: listSaved/addSaved/removeSaved/isSaved, listProgress/updateProgress/continueLearning/progressFor/markCompleted (localStorage cognify.saved-resources.v1, cognify.progress.v1).
- search.ts: searchAll() over topics/resources/transcripts/notes (localStorage cognify.timeline-notes.v1), links /topic/:alias, /resources/:topic, /player/:id?topic=.
- askCognify.ts: ASK_ACTIONS (8) + new answer branches (explain-current, simplify, deeper, example, quiz, connect-dna, summarise) + helpers nearestSegment/stripJargon/exampleFor/quizFor/oneSentence/formatTime. NOTE: AskContext may need optional transcript field — currently the player builds context WITHOUT transcript field. Player must pass transcript: getTranscript(id).
- TS: reported 0 errors after check ran; later "164 errors at line 201" was likely a transient/stale report — line 201 template literal looks syntactically valid. RUN `pnpm run check` again to confirm before moving on.

REMAINING (phase 12 tail):
- Add `transcript` to AskContext usage in Player.tsx (pass segments array).
- recommendations.ts: rail definitions (Recommended for you / Struggled with this topic / Quick revision / Conceptual / Continue learning / Before upcoming test / Another explanation) with cross-format "Explore another explanation" fn same-topic different format.
- topicIndexes: add `topicIndexes()` callers need subject/chapter data — resourceDiscovery has mockData import.

PHASE 13 PAGES: /library ResourceLibrary, /saved SavedResources, /continue ContinueLearning, /topic/:alias TopicLearning. PHASE 14: Player.tsx (save button, prev/next resource, timeline notes TimelineNote shape, Ask action chips, another-format strip, logInteraction SAVE_RESOURCE/SWITCH_RESOURCE/RETRY_EXPLANATION), Session.tsx (reflection buttons). PHASE 15: nav (AppShell navItems lines 33-41, comingSoon line 43), dashboard card, curriculum drawer topic-link button, search cmdk palette in AppShell header, TS clean, screenshots, checkpoint.

## STATUS UPDATE — SERVICES COMPLETE (0 TS errors)
recommendations.ts DONE: buildRails() returns 6 rails (recommended/struggled/revision/conceptual/continue/before-test), anotherExplanation(topicId, currentResourceId) for the player strip, RAIL_DEFINITIONS exported. Types fixed with explicit annotations.
All Day-2 service modules now exist: types.ts (extended), resourceDiscovery.ts (types+indexes), curriculum.ts (aliases+helpers), savedResources.ts, search.ts, recommendations.ts, askCognify.ts (8 actions).
Remaining: Player.tsx updates (transcript prop to AskContext, save/unsave, logInteraction SAVE_RESOURCE/SWITCH_RESOURCE, prev/next resource via anotherExplanation + relatedResources) — check existing Player.tsx structure first; Session.tsx (reflection at end: "I understood" / "I need another explanation" / "Log it anyway" → log RETRY_EXPLANATION); then phase 13 pages /library, /saved, /continue, /topic/:alias + nav (AppShell navItems, ComingSoon removal), dashboard card, search cmdk in AppShell, screenshots, checkpoint.

## PHASE 13 PROGRESS
AppShell.tsx: nav now has /library "Resource Library" (Library icon), /saved "My Saved Resources" (Bookmark), /continue "Continue Learning" (PlayCircle) — 0 TS errors.
Library.tsx: DONE (0 TS errors). Resource Library hub with format+type+free-web filters, ledger rows w/ save buttons, subject index + type legend margin panels, provenance footnote.
REMAINING pages to write:
1. client/src/pages/Saved.tsx — My Saved Resources: listSaved()/removeSaved()/addSaved() from "@/lib/savedResources"; resource detail via discoverAll() find by id; empty state "Your shelf is empty — save resources while exploring"; Scholar's Atelier ledger.
2. client/src/pages/Continue.tsx — Continue Learning: continueLearning() returns {resourceId,fraction,lastAtSec?,updatedAt}; show progress bar per resource, resume CTA -> /session/${resourceId}, mark-done action; empty state.
3. client/src/pages/TopicLearning.tsx — route /topic/:topicId: uses findTopicByIdOrAlias; shows TopicLearningView meta (topic.description?, actionReason, estimatedMinutes, difficulty?, mastery % bar from resolved.topic.mastery), revisionStatus, recommendedFormat (topic.recommendedFormat?), rails: recommended resources for this topic (discoverResources(topicId)), "Another explanation" (anotherExplanation(topicId) from "@/lib/recommendations"), DNA note card; CTA "Begin learning session" links to first recommended resource session.
4. Routes in App.tsx: import Library "/library", Saved "/saved", Continue "/continue", TopicLearning "/topic/:topicId" (GuardedRoute).
5. Dashboard card linking to /saved or rails (optional) — Dashboard.tsx has "Continue where you left off" card already; add a "Resource Library" quick action tile if feasible.
6. Search palette (cmdk) in AppShell header: Dialog + Command from "@/components/ui/command" (exists?), searchAll() from "@/lib/search" — keyboard shortcut ⌘K; results link to hrefs. Add shortcut key in MobileHeader desktop header too.
7. Player.tsx phase 14: pass transcript segments to AskContext (AskContext interface in askCognify.ts currently has transcriptText only; extend with transcript?: {startSec,endSec,text}[] and use in answer()), logInteraction("SAVE_RESOURCE") on save, prev/next resource buttons using anotherExplanation, Session.tsx reflection buttons.
8. Verify in browser + screenshot + checkpoint + deliver.
Pattern to follow for new pages: reuse PageHeader, Marginalia, Hairline, ActionChip from Primitives; index-num class for numbers; font-serif headings, font-mono metadata; buttons .border.border-ink.bg-ink.text-ivory uppercase tracking tracking-[0.12em] text-[10.5px]; empty states with border-dashed border-ink/20 + SearchX icon.

## STATUS UPDATE — PHASE 13 NEARLY DONE (0 TS errors)
DONE: Library.tsx, Saved.tsx, Continue.tsx, TopicLearning.tsx created. Routes in App.tsx added (/library, /saved, /continue, /topic/:topicId) with guards. AppShell.tsx: nav expanded (Library/Saved/Continue items), SearchBox Dialog component w/ ⌘K shortcut via useEffect, quick-nav when query empty. MastaryBar uses value prop. Continue page uses logEvent+startSession correctly.
REMAINING phase 14 (Player.tsx + Session.tsx enhancements per brief):
- Player.tsx: needs (a) AskContext transcript segments (askCognify.ts AskContext currently {topicTitle,subjectName?,transcriptText?,dna?,questionContext?} — extend with transcript segments and pass in Player), (b) save/unsave button + logEvent("SKIP"-ish) for resource switching, (c) "Another explanation" prev/next buttons using anotherExplanation(topicId, resourceId), (d) transcript timestamps already exist; notes are timeline-attached already.
- Session.tsx: add end-of-session reflection actions: "I understood it" / "I need another explanation" (link to anotherExplanation -> /resources page) / log it. Use ASK_ACTIONS & quickPicks from askCognify.ts as reference.
- Dashboard.tsx: optionally add a "Resource Library" quick tile linking /library.
- Curriculum.tsx line ~276: navigate to /resources/:topicId already; add a "View dossier" link to /topic/:alias too.
- Verify in browser (library, saved, continue, topic pages; search palette; player another-explanation), mobile screenshot, checkpoint (auto-publish), deliver.
NOTE: Vite log has STALE error lines about askCognify.ts:175 — these are old (from before my fix at 07:39:26) and TS now shows 0 errors; server restart earlier may still have cached bad HMR. If 500s appear on pages, run webdev_restart_server.

## STATUS UPDATE — PHASE 14 NEARLY DONE (0 TS errors)
Player.tsx DONE: resume-from-progress (reads cognify.progress.v1), updateProgress effect, save/unsave bookmark toggle in header (forceRender refresh), "Another explanation available" banner linking /resources/:topicId (uses anotherExplanation(topicId, resourceId)), related-resource links emit SKIP event with switchedTo payload, quickPicks now pass confusingMarks array.
askCognify.ts DONE: AskContext has confusingMarks field; quickPicks shows "Which marked segment matters most?"; answer mentions latest mark time+note.
NEXT (phase 14 tail): Session.tsx reflection actions — read Session.tsx (ends session: "I understood it" / "I need another explanation" buttons); wire "another explanation" to /resources/:topicId; log events.
THEN (phase 15): dashboard quick tile → /library; Curriculum.tsx topic drawer: add "View dossier →" link to /topic/:alias; browser verify library, saved, continue, topic page, search palette (sidebar top), player enhancements; mobile screenshot; checkpoint (auto-publish on); deliver (phase 16).
Dev server healthy (stale log lines only). TypeScript: 0 errors.

## Day 2 — phase 15 status (pre-checkpoint)
- Topic dossier page (/topic/:id) VERIFIED working: dossier, mastery, 5 resources, DNA note, working sequence, "What a pass builds" all render.
- Fix applied: CANONICAL_TOPIC_SLUGS in curriculum.ts maps aliases → real truncated runtime ids. Verified 0 mismatches for all TOPIC_ALIASES entries via tsx script (31 runtime ids).
- Dashboard weak-topics + revision entries link to /topic/:alias (via topicAlias).
- Curriculum drawer now has "Open learning dossier →" link next to "Open resource explorer".
- Session.tsx enhanced: reflection actions (I understood / Another explanation / skip), save-to-library, topic switching.
- Player.tsx enhanced: save/unsave, another-explanation rail, progress persistence, richer Ask Cognify context with confusingMarks.
- TS clean (0 errors). Stale 07:39 askCognify transform errors in devserver log are historical.
- Remaining: quick verify /library /saved /continue + ⌘K palette, then checkpoint + deliver.

## Verification round 2
Library (104 resources, filters, type chips) VERIFIED. Continue Learning with seeded progress (fraction 0.4) VERIFIED — shows Resume / Mark done. Saved page crashed: my bad console seed wrote `{saved:[],notes:{}}` object shape but Saved.tsx expects the stored value to be an ARRAY (listSaved helper) — TypeError saved.map. FIX: either restore correct array shape in localStorage via console (fastest: set key cognify.saved-resources.v1 to array) OR harden listSaved to coerce. Do both: console reseed + robust coercion in savedResources.ts loadList.
Correct saved shape = [ { resourceId, topicId?, note, savedAt } ].
Saved key: cognify.saved-resources.v1; notes separate? check loadList.

## Verification round 3 — ALL GREEN
Topic dossier (/topic/:alias) VERIFIED end-to-end: dossier, mastery 27%, 5 resources with WHY, DNA note, working sequence, "what a pass builds" panel. Session briefing from topic page VERIFIED (objective, topic mastery, est time, transcript preview, next activity, session id). Player VERIFIED: save/unsave, speed buttons, mark confusing, observation log (PLAY event emitted), transcript with 6 segments, DNA watching panel, alternative-explanation rail. Command palette (⌘K) VERIFIED: opens with quick-nav entries + search topics/resources. LoadList hardened to coerce non-array localStorage values. All flows wired: dashboard weak topics → /topic, curriculum drawer → dossier link + explorer link. TS clean, 0 errors. Ready to checkpoint.
Day 2 delivered: Resource Library hub (/library, 104 resources, format+type filters, free-web-only toggle), My Saved Resources (/saved), Continue Learning (/continue), Topic Learning dossier (/topic/:id), session reflection (I understood / Another explanation), player save + alternative rail + progress persistence + rich Ask context.

# DAY 4 BUILD STATE (checkpoint 5be4151a live at cognifyapp-7pg7ycde.manus.space)

## Brief file: /home/ubuntu/upload/pasted_content_3.txt — 20 requirements
Adaptive Learning hub, learning path viz, mistake analysis + detail, confidence calibration, spaced revision + session, timetable, stretch goals, Teach Cognify (+ teach requests), study groups, contextual AI panel, intervention center, Learning DNA links, Command Center integration, complete journey, design rules (no bento/AI-clichés), responsive, reusable components (AdaptiveRecommendation, MistakeAnalysis, ConfidenceCheck, RevisionCard, LearningIntervention, TeachBack, StudyGroup, PeerRequest, AIContextPanel, LearningPath, GoalCard), mock services.

## Day 4 todo.md appended — phase 17 in progress.
Plan: types.ts DONE (MistakeCategory/Mistake/MistakeAnalysisSummary, ConfidenceReading, RevisionEntry/RevisionBucket, TeachBackPrompt/TeachBackAnalysis, Intervention, TimetableSession, StretchGoal, StudyGroup/PeerRequest/PeerCandidate/GroupDiscussion, AdaptiveRecommendation, LearningPathStage, AssistantContext/AssistantMessage).

## Service files to create (client/src/lib/):
adaptive.ts (today's adaptive path), mistakes.ts, confidence.ts, revision.ts, teachBack.ts, interventions.ts, timetable.ts, goals.ts, studyGroups.ts, assistant.ts

## Existing service knowledge (reuse):
- resourceDiscovery.ts: discoverResources(topicId), TOPIC_ALIASES, LearningResource shape. INVENTORY keyed by alias slug. Circular import: resourceDiscovery must NOT import curriculum.ts (curriculum.ts CAN import resourceDiscovery).
- curriculum.ts: findTopicByIdOrAlias(id), topicPath(topicId) → {subject, chapter, topic}, topicAlias(topic) → alias slug, boards.
- mockData.ts: boards exported; topic ids are t-{idx}-{slug28chars}.
- askCognify.ts has existing ask functions.
- savedResources.ts: listSaved/addSaved/removeSaved, progress, markCompleted.
- recommendations.ts: rails. playerEvents.ts: logEvent.
- Sidebar nav in AppShell.tsx (add Adaptive/adaptive, mistakes, confidence, revision, interventions; Timetable/goals/community/credits were SOON — build real now).
- App.tsx routes use PublicLayout + app guard component.

## Topic catalog (MATH Class 10 CBSE, anchor data):
Ch1 Real Numbers: t-0-euclid-s-division-lemma-hcf (84 proficient due6), t-1-irrational-numbers-proofs (38 weak due -2), t-2-fundamental-theorem-of-arith (61 developing due4)
Ch2 Polynomials: t-0-zeros-of-a-polynomial (92 mastered due12), t-1-relationship-between-zeros-c (27 weak due1), t-2-division-algorithm-for-polyn (0 new)
Ch3 Linear Equations: t-0-graphical-method (73 prof due8), t-1-substitution-elimination-met (55 dev due5), t-2-cross-multiplication-word-pr (0 new)
Ch4 Quadratics: t-0-standard-form-factorisation (66 dev due9), t-1-completing-the-square (19 weak due3), t-2-nature-of-roots-discriminant (0 new)
SCI: Ch1 t-1-types-of-reactions (41 weak due2); Ch2 t-1-ph-scale-strength (52 dev due4); t-1-nutrition-in-humans (33 weak due1)
SST: t-1-making-of-nationalism-in-ita (22 weak due-1); t-0-first-world-war-non-coop (58 dev due6)
ENG: t-1-nelson-mandela-long-walk-to (44 weak due2); HIN: t-1-lhasa-ki-or (30 weak due3)

## Design tokens reminder
btn-primary / btn-outline / btn-ghost / ctrl-btn CSS classes in index.css; Scholar's Atelier: ivory bg, deep ink text, teal primary, amber accents; Marginalia caps labels; MasteryBar value prop (0-100); StateBadge state; PageHeader in AppShell; DNA link indicators "Evidence: NN%".
