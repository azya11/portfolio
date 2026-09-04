# Portfolio Redesign — Signal: A Systems-Pipeline Scrollytelling Story

**Date:** 2026-07-18
**Owner:** Aziz Shamuratov

## Goal

Full ground-up rebuild of the portfolio (redesign #3, after the 3D black-hole
version and the clean-minimal version) into a "scrollytelling" experience: the
scroll itself acts out a request tracing through a system, using GSAP
ScrollTrigger pin/scrub animations, a continuous Lenis-driven scroll, and one
signature WebGL centerpiece. Existing content (identity, projects, experience,
skills, principles) is preserved as-is — only presentation, structure, and
copy framing change. Skin/visual language does not reference the current
clean-minimal design; only the underlying content does.

## Decisions (locked)

- **Narrative concept:** Systems pipeline. The scroll is a request/signal
  moving through a system: connect → middleware → compute → response → core →
  response returned. Not a generic metaphor — tied directly to the owner's
  backend/systems engineering identity.
- **Visual direction:** "Signal" (high-end agency). Deep near-black canvas, a
  glowing violet→pink gradient signal line as the throughline, confident
  editorial type, cinematic spacing. Rejected: Terminal Blueprint (too niche)
  and Minimal Schematic (too close to the current site, insufficient "wow").
- **Technical approach:** Hybrid (Approach C of 3 evaluated). DOM/SVG +
  GSAP ScrollTrigger drives the entire page reliably; WebGL is spent only on
  the Hero centerpiece (evolved from the existing `GridField` cube grid).
  Rejected: full-WebGL (too much performance/build risk for a solo-built
  portfolio) and pure-DOM (retires working Three.js investment for no reason).
- **Color mode:** Dark-only. The light/dark toggle from the previous redesign
  is removed. A glow-driven signal identity does not translate to a light
  canvas without a genuinely separate design; dark-only cuts that scope and
  commits fully to the concept.
- **Chapter navigation:** Persistent chapter rail, always visible and
  clickable, labeled with the six pipeline stage codes. Solves the
  scannability problem created by reordering Work behind three other chapters
  — a time-pressed recruiter can jump straight to it.

## Chapters (narrative + information architecture)

Six chapters, one per existing content section — reordered, relabeled, no new
content:

| # | Component (file, unchanged) | Stage code | Pipeline framing | Content (unchanged) |
|---|---|---|---|---|
| 01 | `Hero.jsx` | `CONNECT` | A client opens a connection | Identity, rotating role line, stat counters, CTAs |
| 02 | `Approach.jsx` | `MIDDLEWARE` | The rules every request passes through first | 4 principles, reframed as validation/rules |
| 03 | `Experience.jsx` | `COMPUTE` | The processing log | MyMainAI + Itransition timeline |
| 04 | `Work.jsx` | `RESPONSE` | The payload coming back | Boxcores, Mapgen, WatchDNA |
| 05 | `About.jsx` | `CORE` | The persistent store underneath it all | Bio, photo, skills |
| 06 | `Contact.jsx` | `200` | Connection returned successfully | Same contact content, "200 OK" as kicker/punchline |

`Footer.jsx` stays last, unchanged in position.

Component files keep their current names (`Approach.jsx`, `Work.jsx`, etc.) —
only `id`, kicker copy, and position within `App.jsx` change. A new
`src/data/pipeline.js` holds the six `{ id, code, label }` stage entries as
the single source of truth; both `ChapterRail` and each section's kicker read
from it.

## Visual system

- **Palette:** near-black canvas (refine from current `#0a0b0d`), off-white
  primary text, muted gray secondary text. Signal accent is a two-stop
  gradient (violet → pink) replacing the current flat electric blue —
  used consistently for the signal line stroke, active chapter-rail state,
  hover glows, and stat-counter numbers, so it reads as one identity running
  through the page.
- **Typography:** keep Geist (headings/body) and JetBrains Mono (stage
  labels, kickers, small status-style annotations like `STATUS: 200`, used
  sparingly as accent). Drop Instrument Serif — linked in `index.html` but
  unused since the last redesign; remove the font link too.
- **Signal line:** one continuous SVG path down the page spine, gradient
  stroke, revealed via `stroke-dashoffset` scrubbed against total scroll
  progress (one page-level `ScrollTrigger`, independent of per-chapter pin
  timelines). A small glowing "packet" dot travels along the path as the user
  scrolls. Each chapter has a node on the line that pulses active, driven by
  the same state that drives the chapter rail's active indicator.
- **Motion language:** chapter headlines reuse the existing masked-line
  reveal (`RevealLine`), retimed to read progress from each chapter's
  ScrollTrigger timeline instead of the current IntersectionObserver-driven
  spring. Parallax reuses the existing `useParallax` GSAP hook as-is. Card/
  content reveals use GSAP `fromTo` with the existing cubic-bezier ease
  family already defined in the codebase.

## Technical architecture

- **Scroll engine:** `Pager.jsx` is removed entirely — its wheel-snap,
  one-section-per-gesture model cannot drive scrubbed pin animations.
  `SmoothScroll` (Lenis + GSAP ticker, already implemented) becomes the only
  scroll engine, used unconditionally rather than only as the touch/
  reduced-motion fallback.
- **New components:**
  - `SignalLine.jsx` — the SVG path, traveling packet dot, node markers, and
    the page-level scroll-progress `ScrollTrigger`.
  - `ChapterRail.jsx` — fixed jump-nav showing the six stage codes; reuses
    the existing `app:navigate` `CustomEvent` pattern already dispatched by
    `Nav.jsx` and consumed by `SmoothScroll`.
- **Section-state model:** `Section.jsx`'s current IntersectionObserver
  tri-state (`below/active/above`) is replaced by a real per-chapter
  `ScrollTrigger` timeline (`pin: true, scrub: true` on desktop). `Reveal`
  and `RevealLine` adapt to read progress from that timeline instead of
  animating on a spring triggered by a tri-state flip. This is the largest
  refactor in the codebase; most other changes are additive.
- **`GridField.jsx` → Hero-only centerpiece:** evolves from the current
  cursor-reactive cube grid into a signal/handshake-themed WebGL visual,
  keeping the same cursor-reactive interaction pattern and lazy-loading, now
  scoped to the Hero chapter only rather than a persistent full-page
  background.
- **Content data:** `content.js`, `projects.js`, `experience.js`, `skills.js`
  keep their current shapes — no restructuring, only copy edits for the new
  kicker/stage framing. New `pipeline.js` holds the stage list (see Chapters
  table above). While touching content, also fix `index.html`'s meta/OG
  description, which still reads "70k+ users" — stale copy left over from
  the TAS Group removal in an earlier session.

## Mobile, reduced motion, and accessibility

- **Mobile:** continuous Lenis scroll (lighter config) stays; pinned scrub
  timelines are replaced per-chapter with simpler reveal-on-enter animations,
  since pin/scrub is the technique most prone to jank on phones. The signal
  line still renders (cheap, it's an SVG path), but packet/node sync uses
  scroll-linked opacity rather than true scrub-pin. The chapter rail
  collapses to a slim top progress bar with a tap-to-open chapter list.
- **Reduced motion:** governed by the existing `useMediaPrefs().reducedMotion`
  flag. Signal line renders fully drawn and static; chapters render content
  directly with simple opacity fades only, no pin/scrub. The WebGL Hero
  centerpiece swaps to a static poster frame.
- **Accessibility:** DOM order matches the new visual chapter order (no
  mismatch between scroll order and screen-reader order). `ChapterRail` is a
  real `<nav>` landmark with `aria-current` on the active stage. The
  signal-line SVG is `aria-hidden`. A skip-to-content link is added (not
  present in the current markup).

## Performance, testing, and verification

- No test suite exists in this repo (or its sibling project) and none is
  being introduced now — out of scope, would be scope creep for a portfolio
  rebuild.
- Verification is a manual dev-server walkthrough: full desktop scroll
  through all six chapters, a throttled/mobile-viewport pass, reduced-motion
  emulation, and `npm run build` to catch bundler/runtime errors before
  calling any phase done.

## Out of scope

- Audio/sound design.
- A CMS or backend for content; all content stays in static data files.
- Any new projects or written content beyond what already exists on the
  site today.
- Light mode (explicitly decided against above).
- Any changes to the Vercel deploy pipeline/configuration itself.

## Success criteria

- `npm run build` succeeds with no console errors.
- All six chapters present, in the new pipeline order, with all existing
  content intact (no lost projects, roles, principles, or contact info).
- Chapter rail is visible and functional on desktop; clicking any stage
  jumps to that chapter. On mobile (< 768px) it collapses to a top progress
  bar with a tap-to-open chapter list that offers the same six jump targets.
- Signal line renders and scrubs correctly across the full page on desktop.
- Hero WebGL centerpiece loads lazily and does not block first paint.
- Mobile viewport (< 768px) shows simplified reveal animations, not pinned
  scrub, and remains smoothly scrollable.
- `prefers-reduced-motion: reduce` fully disables scrub/pin/parallax and
  presents static, readable content with only opacity fades.
- No light-mode code paths remain (or are cleanly removed, not half-present).
- `index.html` meta/OG description no longer references "70k+ users."
