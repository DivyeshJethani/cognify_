# COGNIFY — Design Brainstorm

## Three Stylistic Approaches

### 1. The Scholar's Atelier (Editorial Academic)
A warm, ivory-paper editorial aesthetic: serif display headlines, hairline rules, footnotes, numbered indexes — like a beautifully typeset academic journal meets a modern research laboratory. Emotional intent: trust, rigor, quiet intelligence.
**Probability: 0.06**

### 2. The Observatory (Dark Instrument Panel)
Deep-ink night-mode dashboards inspired by astronomical observatories and precision instruments: fine tick marks, glowing data points, constellation-like node graphs. Emotional intent: wonder, precision, focus.
**Probability: 0.03**

### 3. Field Notes Modernism (Swiss Lab Modernism)
Crisp grid-adjacent Swiss typography with oversized numerals, hard edges, flat color blocking in teal/amber on warm ivory — a learning laboratory's whiteboard: systematic, bright, disciplined. Emotional intent: clarity, momentum, optimism.
**Probability: 0.05**

---

## CHOSEN: The Scholar's Atelier (Editorial Academic)

The user's brief mandates the palette (Deep Ink, Cognify Teal, Learning Amber, Warm Ivory, Soft Green, Dark Text) and bans neon/glassmorphism/excessive rounded cards. "The Scholar's Atelier" fuses this palette with a sophisticated-learning-laboratory + academic environment feel: an editorial, typographically-driven system with hairline rules, small caps labels, and meaningful data visualizations.

### Design Movement
Editorial Academic / New Academic — a fusion of classical book typography (think academic journals, university prospectuses) with modern data-viz clarity (The Pudding, Stripe Atlas reports). Warm paper backgrounds, ink-toned text, restrained teal accents.

### Core Principles
1. **Typography is the interface.** Serif display for voice, humanist sans for data and UI chrome. Hierarchies carry structure, not card shadows.
2. **Hairline rules over card borders.** Content is organized with 1px ink rules and generous whitespace, like a well-set page. Radii stay minimal (0–6px).
3. **Data with provenance.** Every number has a label, a date, or a "why". Explanations sit close to metrics, like footnotes.
4. **Warm ivory everywhere.** Warm Ivory #F7F5EF is the default canvas; Deep Ink surfaces for the app shell and dashboard accents only where contrast demands.

### Color Philosophy
- **Warm Ivory #F7F5EF** — the paper; public pages and content areas.
- **Deep Ink #102A43** — the ink; shell, headings, dashboard sidebar, footer. Conveys scholarly authority.
- **Cognify Teal #1F9D8B** — the instrument; primary actions, mastery signals, active states.
- **Learning Amber #E9A23B** — the highlighter; weak topics, "needs revision", stretch moments, the streak flame.
- **Soft Green #E9F0EC** — the margin note; proficiency, calm backgrounds for data chips.
- **Dark Text #17212B** — body reading color.
Intent: calm intellect. Teal = progress, Amber = attention needed, Green = confidence, Ink = structure.

### Layout Paradigm
- **Public pages**: asymmetric editorial layout — oversized serif headline on the left, annotated data/illustration column on the right; full-width ink rule sections; no centered hero-stack.
- **App shell**: permanent left sidebar in Deep Ink (laboratory instrument), content on warm ivory; dashboard uses a two-column ledger layout (main column ~2/3, rail ~1/3) with hairline separators, NOT a bento grid.
- **Curriculum explorer**: nested outline/table-of-contents navigation (numbered, indented, with rules) — a real book index, not a card cascade.

### Signature Elements
1. **The DNA helix-stripe**: a subtle double-helix / interleaved line motif used as section dividers and in the logo mark.
2. **Marginalia labels**: small-caps, letterspaced, amber or teal overlines above every section ("SECTION 01 — LEARNING PATH").
3. **Footnote-style explanations**: "Why Cognify recommended this" appears as a small-caps "WHY" label + italic footnote line under recommendations.

### Interaction Philosophy
Interactions feel like turning pages of a precise instrument: instant, quiet, exact. Hovers shift underline weight and tint ink; no bouncing cards. Active items get a left teal tick-bar. Data reveals on hover with understated tooltips.

### Animation
- Entrances: 200–260ms ease-out fade + 8px rise, staggered 40–60ms.
- Rules: 1px hairlines "draw" in with scaleX on section entrance.
- Buttons: scale(0.97) active, 140ms; underline-slide on links.
- Dashboard tiles: none per-tile; only header stats count-up once on mount (~600ms).
- Respect prefers-reduced-motion.

### Typography System
- **Display/Headlines**: "Libre Caslon Text" (serif, scholarly, distinctive) — h1/h2, pull-quotes, DNA profile values.
- **UI/Body**: "Inter Tight" — wait, brief bans generic Inter-family feel; use **"Spline Sans"**? — choose **"Public Sans"** (US Gov serif-adjacent humanist sans) for UI text, labels, data.
- **Data/monospace**: "IBM Plex Mono" for numbers, IDs, dates, streaks.
- Hierarchy: overline (Public Sans 11px/700 small-caps tracked) → headline (Libre Caslon 36–56px) → body (Public Sans 15–16px) → data (Plex Mono 13–14px).

### Brand Essence
COGNIFY — a learning laboratory that decodes your Learning DNA and personalizes every study session; for school students and parents who want study to be a science, not a grind. Personality: scholarly, precise, warm.

### Brand Voice
Measured, academic-but-encouraging; never hypey. CTAs are verbs of inquiry and mastery.
- Example headline: "Your mind has a pattern. We found it."
- Example CTA: "Begin your diagnostic" / "Map your curriculum"

### Wordmark & Logo
- Wordmark: "COGNIFY" set in Libre Caslon Text small-caps-ish with generous tracking; the "O" replaced/accented by the helix mark.
- Logo mark: a bold abstract double-helix / intertwined strokes forming a "C", teal on ink (or ink on ivory), no text, transparent background.

### Signature Brand Color
**Cognify Teal #1F9D8B** — the ownable instrument color, used for the mark, primary CTAs, and progress.
