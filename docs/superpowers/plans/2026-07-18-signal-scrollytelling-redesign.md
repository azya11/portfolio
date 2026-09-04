# Signal: Systems-Pipeline Scrollytelling Redesign — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild the portfolio's presentation layer into a scroll-driven narrative — a request tracing through a system (connect → middleware → compute → response → core → 200) — using GSAP ScrollTrigger pin/scrub, continuous Lenis scroll, a glowing "signal" throughline, and a Hero-scoped WebGL centerpiece. All existing content (identity, projects, experience, skills, principles) is preserved; only structure, framing copy, and visuals change.

**Architecture:** `Pager.jsx`'s wheel-snap scroll engine is removed entirely; `SmoothScroll` (Lenis + GSAP ticker, already implemented) becomes the sole scroll engine. `Section.jsx` moves from an IntersectionObserver three-state model to a per-chapter GSAP ScrollTrigger (`pin: true, scrub: true` on desktop, a simple timed reveal on mobile), broadcasting a `chapter:active` `CustomEvent` that `SignalLine` and `ChapterRail` both listen for. Chapter order and content stay in the same six component files, only reordered and relabeled.

**Tech Stack:** React 18, Vite, GSAP 3 + ScrollTrigger (`gsap`, already a dependency), Lenis (already a dependency), Three.js + `@react-three/fiber` (already a dependency, scoped down to Hero only), framer-motion (kept for non-scrub micro-interactions: Hero role-text, magnetic buttons, Preloader, Work's cursor-preview gallery, Nav's entrance — NOT for the new pin/scrub reveals).

## Global Constraints

- No test framework is being introduced (matches this repo's and its sibling project's existing convention — see spec's "Performance, testing, and verification" section). Every task's verification is: `npm run build` succeeds with no errors, then a manual dev-server walkthrough of the specific behavior described in that task.
- Dark-only. No `data-theme`/light-mode code is added anywhere (confirmed via grep that none currently exists — this is a non-issue, not a removal).
- Existing content data shapes (`content.js`, `projects.js`, `experience.js`, `skills.js`) are not restructured — only copy edits inside them where the spec calls for it.
- **Spec correction:** the design spec assumed Instrument Serif was unused leftover CSS. Reading the actual `src/styles/index.css` shows it is the primary display/heading typeface (`--font-display`), used in `hero-title`, `section-title`, `work-title`, `xp-head h3`, `about-pull`, `contact-title`, `principle h3`, `preloader-word`, `stat-num` — over a dozen call sites. This plan **keeps** Instrument Serif rather than removing it: dropping it would mean redesigning the typographic hierarchy for all six chapters, which was never brainstormed or approved. Only the `og:description` stale-copy fix from the spec is still needed (see Task 2).
- This is a large sequential refactor. Intermediate commits between tasks may look visually rough (e.g., a background layer temporarily missing its calming overlay, a new element briefly unstyled) as pieces land in order — each task's verification confirms **that task's own deliverable** works and nothing crashes/errors, not final visual polish. Final polish is confirmed end-to-end in Task 10.
- Chapter DOM ids are fixed and must be used exactly as follows (this matters: `document.getElementById`/`querySelector('#id')` is used for scroll targets, and a purely-numeric id like `"200"` breaks CSS-selector-based lookups even though HTML allows it):

  | Chapter | DOM `id` | Stage code (display only) |
  |---|---|---|
  | Hero | `top` | `CONNECT` |
  | Approach | `middleware` | `MIDDLEWARE` |
  | Experience | `compute` | `COMPUTE` |
  | Work | `response` | `RESPONSE` |
  | About | `core` | `CORE` |
  | Contact | `contact` | `200` |

---

### Task 1: Remove the wheel-snap pager, unify on continuous scroll

**Files:**
- Modify: `src/App.jsx`
- Delete: `src/components/Pager.jsx`

**Interfaces:**
- Consumes: `SmoothScroll` from `src/lib/SmoothScroll.jsx` (existing, unchanged — `paused` prop).
- Produces: nothing new. `App.jsx`'s section order and GridField/background wiring stay exactly as they are today — this task's only job is killing the wheel-snap engine. Reordering happens in Task 4; GridField relocation happens in Task 8.

- [ ] **Step 1: Rewrite `App.jsx` to drop `Pager`**

Replace the full contents of `src/App.jsx` with:

```jsx
import { lazy, Suspense, useState } from 'react'
import { AnimatePresence } from 'framer-motion'
import { SmoothScroll } from './lib/SmoothScroll.jsx'
import { useMediaPrefs } from './lib/useMediaPrefs.js'
import Preloader from './components/Preloader.jsx'
import Nav from './components/Nav.jsx'
import Hero from './components/Hero.jsx'
import Work from './components/Work.jsx'
import Experience from './components/Experience.jsx'
import About from './components/About.jsx'
import Approach from './components/Approach.jsx'
import Contact from './components/Contact.jsx'
import Footer from './components/Footer.jsx'

// Three.js is heavy + non-critical (background only) — load it in its own chunk.
const GridField = lazy(() => import('./components/GridField.jsx'))

export default function App() {
  const [loading, setLoading] = useState(true)
  const { reducedMotion, isTouch } = useMediaPrefs()
  const interactive = !reducedMotion && !isTouch

  return (
    <>
      <AnimatePresence>
        {loading && <Preloader key="preloader" onDone={() => setLoading(false)} />}
      </AnimatePresence>

      {/* fixed background layers — GridField moves into Hero in Task 8 */}
      {interactive ? (
        <Suspense fallback={<div className="bg-grid" aria-hidden="true" />}>
          <GridField />
        </Suspense>
      ) : (
        <div className="bg-grid" aria-hidden="true" />
      )}
      <div className="bg-scrim" aria-hidden="true" />
      <div className="bg-grain" aria-hidden="true" />

      <Nav ready={!loading} />

      <SmoothScroll paused={loading}>
        <main id="main">
          <Hero ready={!loading} />
          <Work />
          <Experience />
          <About />
          <Approach />
          <Contact />
        </main>
        <Footer />
      </SmoothScroll>
    </>
  )
}
```

(This adds `id="main"` to the `<main>` element now, ahead of the skip-link that lands in Task 9, so we don't have to touch this file again just for that.)

- [ ] **Step 2: Delete the pager**

Delete `src/components/Pager.jsx`.

- [ ] **Step 3: Verify**

Run: `npm run build`
Expected: builds with no errors.

Run: `npm run dev`, open the printed local URL in a browser.
Expected: the page scrolls smoothly and continuously (Lenis) on mouse wheel, trackpad, and keyboard (arrow keys / Page Down via native scroll) — no more one-section-per-gesture snapping. Clicking a nav link (`Work`, `Experience`, `About`, `Contact`) still smooth-scrolls to that section. No console errors.

Run: `grep -rn "Pager" src/` (or use your editor's search)
Expected: no matches.

- [ ] **Step 4: Commit**

```bash
git add src/App.jsx
git rm src/components/Pager.jsx
git commit -m "Remove wheel-snap pager; Lenis is the only scroll engine"
```

---

### Task 2: Pipeline stage data + stale-copy fix

**Files:**
- Create: `src/data/pipeline.js`
- Modify: `index.html`

**Interfaces:**
- Produces: `stages` — an array of `{ id: string, code: string, label: string }`, exported from `src/data/pipeline.js`. `id` matches the DOM id table in Global Constraints exactly. This is consumed by `ChapterRail` (Task 7) and `SignalLine` (Task 6).

- [ ] **Step 1: Create the pipeline stage data**

Create `src/data/pipeline.js`:

```js
// The six pipeline stages, in scroll order. `id` must match each chapter
// Section's `id` prop exactly — it's used both as the DOM anchor for
// scroll-to-jump and as the `chapter:active` CustomEvent detail value.
export const stages = [
  { id: 'top', code: 'CONNECT', label: 'Connection opens' },
  { id: 'middleware', code: 'MIDDLEWARE', label: 'Rules & validation' },
  { id: 'compute', code: 'COMPUTE', label: 'Processing log' },
  { id: 'response', code: 'RESPONSE', label: 'Payload returned' },
  { id: 'core', code: 'CORE', label: 'Persistent store' },
  { id: 'contact', code: '200', label: 'Connection closed' },
]
```

- [ ] **Step 2: Fix the stale "70k+ users" OG description**

In `index.html`, find:

```html
    <meta
      property="og:description"
      content="Software developer who bends complexity into clean, well-tested systems. Production microservices for 70k+ users, AI/AR capstone lead, full-stack across React, Node.js, and .NET."
    />
```

Replace with:

```html
    <meta
      property="og:description"
      content="Software developer who bends complexity into clean, well-tested systems. Production microservices, an AI/AR capstone as team lead, full-stack across React, Node.js, and .NET."
    />
```

- [ ] **Step 3: Verify**

Run: `npm run build`
Expected: builds with no errors (this task adds an unused-for-now data file and a text-only HTML edit, so nothing else should change behaviorally).

- [ ] **Step 4: Commit**

```bash
git add src/data/pipeline.js index.html
git commit -m "Add pipeline stage data; fix stale 70k-users OG copy"
```

---

### Task 3: Signal palette tokens + remove page-wide grid/scrim CSS

**Files:**
- Modify: `src/styles/index.css`

**Interfaces:**
- Produces: new CSS custom properties `--signal-1`, `--signal-2`, `--signal-gradient` on `:root`, and updated `--accent`/`--accent-2` values. Every later task that styles new components (`SignalLine`, `ChapterRail`) uses these tokens rather than inventing new colors.

- [ ] **Step 1: Update palette tokens**

In `src/styles/index.css`, find the `:root` block's color lines:

```css
  --accent: #c3b6f7; /* soft lavender */
  --accent-2: #f3b6c6; /* soft rose */
```

Replace with:

```css
  --accent: #8f7dff; /* signal violet (was soft lavender) */
  --accent-2: #ff8fd0; /* signal pink (was soft rose) */
  --signal-1: #7c6cff;
  --signal-2: #ff8fd0;
  --signal-gradient: linear-gradient(180deg, var(--signal-1), var(--signal-2));
```

This is a deliberately minimal-diff way to re-skin the whole page: `--accent`/`--accent-2` are already used in ~40 existing selectors (buttons, tags, kickers, the nav dot, the timeline dot, hover underlines, `::selection`, etc.) — changing these two values shifts all of them toward the Signal palette without touching each selector individually.

- [ ] **Step 2: Remove the page-wide grid/scrim rules**

Find:

```css
/* ---------------------------------------------------------------- backgrounds */
.bg-grid,
.bg-grain,
.bg-scrim,
.hero-glow {
  position: fixed;
  inset: 0;
  z-index: -1;
  pointer-events: none;
}
/* Calms the live 3D grid behind content: darker top/bottom (under nav + footer)
   and a soft vignette, while leaving the centre readable. Sits above the canvas,
   below all content. */
.bg-scrim {
  background:
    linear-gradient(
      to bottom,
      rgba(8, 7, 14, 0.7) 0%,
      rgba(8, 7, 14, 0.46) 22%,
      rgba(8, 7, 14, 0.46) 78%,
      rgba(8, 7, 14, 0.72) 100%
    ),
    radial-gradient(120% 95% at 50% 50%, rgba(8, 7, 14, 0.3) 0%, rgba(8, 7, 14, 0.52) 100%);
}
.bg-grid {
  background-image:
    linear-gradient(to right, var(--line) 1px, transparent 1px),
    linear-gradient(to bottom, var(--line) 1px, transparent 1px);
  background-size: var(--grid-cell) var(--grid-cell);
  opacity: 0.45;
  -webkit-mask-image: radial-gradient(150% 130% at 50% 40%, #000 60%, transparent 100%);
  mask-image: radial-gradient(150% 130% at 50% 40%, #000 60%, transparent 100%);
}
.bg-grain {
  opacity: 0.05;
  mix-blend-mode: overlay;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
}
```

Replace with (keeps only the page-wide grain texture and a generic `hero-glow` positioning rule; `.bg-grid`/`.bg-scrim` selectors are dropped — their JSX `<div>`s still render harmlessly as empty, unstyled elements until Task 8 removes them from `App.jsx`):

```css
/* ---------------------------------------------------------------- backgrounds */
.bg-grain,
.hero-glow {
  position: fixed;
  inset: 0;
  z-index: -1;
  pointer-events: none;
}
.bg-grain {
  opacity: 0.05;
  mix-blend-mode: overlay;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
}
```

Note `.hero-glow` is repositioned from `fixed` (page-wide) to what will become Hero-local in Task 8, where its actual `position` gets overridden to `absolute` by the more specific `.hero .hero-glow` rule added in that task. Leaving the general rule as `fixed` here is harmless in the interim (Hero is viewport-height, so a fixed full-viewport glow layered only while Hero is on-screen looks correct anyway) and avoids a second edit to this line later.

- [ ] **Step 3: Verify**

Run: `npm run build`
Expected: builds with no errors.

Run: `npm run dev`, open in browser.
Expected: buttons, tags, kickers, and hover-underlines now show the more saturated violet/pink accent instead of pastel lavender/rose. The static dot-grid background pattern and its vignette are gone (the WebGL cube grid from `GridField` still renders — that's expected, it's unrelated to these CSS rules and gets scoped down in Task 8). No console errors.

- [ ] **Step 4: Commit**

```bash
git add src/styles/index.css
git commit -m "Signal palette tokens; drop page-wide grid/scrim CSS"
```

---

### Task 4: Reorder chapters, update ids and kicker copy

**Files:**
- Modify: `src/App.jsx`
- Modify: `src/components/Approach.jsx`
- Modify: `src/components/Experience.jsx`
- Modify: `src/components/Work.jsx`
- Modify: `src/components/About.jsx`
- Modify: `src/components/Contact.jsx`

**Interfaces:**
- Consumes: `stages` from `src/data/pipeline.js` (Task 2) — used here only as the source of truth for what each chapter's `id`/kicker code should be (copy this by hand into each component's JSX; components don't need to import `pipeline.js` themselves, `ChapterRail`/`SignalLine` are the ones that read it programmatically in Tasks 6–7).
- Produces: chapter DOM ids and visual order now match the Global Constraints table. This is a hard prerequisite for Task 6 (`SignalLine` positions node markers via `document.getElementById`) and Task 7 (`ChapterRail` jump targets).

- [ ] **Step 1: Reorder sections in `App.jsx`**

In `src/App.jsx`, change the `<main>` block from:

```jsx
        <main id="main">
          <Hero ready={!loading} />
          <Work />
          <Experience />
          <About />
          <Approach />
          <Contact />
        </main>
```

to:

```jsx
        <main id="main">
          <Hero ready={!loading} />
          <Approach />
          <Experience />
          <Work />
          <About />
          <Contact />
        </main>
```

- [ ] **Step 2: Update `Approach.jsx` (→ Middleware, 02)**

In `src/components/Approach.jsx`, change:

```jsx
    <Section id="approach">
      <div className="container">
        <div className="section-head">
          <div className="kicker">
            <span className="kicker-idx">04</span>
            <span>Philosophy</span>
            <span className="kicker-rule" />
          </div>
          <h2 className="section-title">
            <RevealLine>How I</RevealLine>{' '}
            <RevealLine delay={0.06}>
              <em>think</em>
            </RevealLine>{' '}
            <RevealLine delay={0.12}>about building</RevealLine>
          </h2>
          <Reveal as="p" className="section-intro" dir="left">
            A few principles I keep coming back to — they shape how I write, test,
            and ship software.
          </Reveal>
        </div>
```

to:

```jsx
    <Section id="middleware">
      <div className="container">
        <div className="section-head">
          <div className="kicker">
            <span className="kicker-idx">02</span>
            <span>Middleware</span>
            <span className="kicker-rule" />
          </div>
          <h2 className="section-title">
            <RevealLine>How I</RevealLine>{' '}
            <RevealLine delay={0.06}>
              <em>think</em>
            </RevealLine>{' '}
            <RevealLine delay={0.12}>about building</RevealLine>
          </h2>
          <Reveal as="p" className="section-intro" dir="left">
            The rules every request passes through before it's handled — a few
            principles I keep coming back to.
          </Reveal>
        </div>
```

- [ ] **Step 3: Update `Experience.jsx` (→ Compute, 03)**

In `src/components/Experience.jsx`, change:

```jsx
    <Section id="experience">
      <div className="container">
        <div className="section-head">
          <div className="kicker">
            <span className="kicker-idx">02</span>
            <span>Career</span>
            <span className="kicker-rule" />
          </div>
          <h2 className="section-title">
            <RevealLine>Where I’ve</RevealLine>{' '}
            <RevealLine delay={0.08}>
              <em>worked</em>
            </RevealLine>
          </h2>
        </div>
```

to:

```jsx
    <Section id="compute">
      <div className="container">
        <div className="section-head">
          <div className="kicker">
            <span className="kicker-idx">03</span>
            <span>Compute</span>
            <span className="kicker-rule" />
          </div>
          <h2 className="section-title">
            <RevealLine>Where I’ve</RevealLine>{' '}
            <RevealLine delay={0.08}>
              <em>worked</em>
            </RevealLine>
          </h2>
          <Reveal as="p" className="section-intro" dir="left">
            The processing log — where the work actually happened.
          </Reveal>
        </div>
```

(This adds a `section-intro` line that didn't exist before, for parity with the other chapters. `Reveal` is already imported in this file.)

- [ ] **Step 4: Update `Work.jsx` (→ Response, 04)**

In `src/components/Work.jsx`, change the `SectionHead` function's return value and the `<Section>` id. First, find:

```jsx
function SectionHead() {
  return (
    <div className="section-head">
      <div className="kicker">
        <span className="kicker-idx">01</span>
        <span>Selected Work</span>
        <span className="kicker-rule" />
      </div>
      <h2 className="section-title">
        <RevealLine>Things I’ve</RevealLine>{' '}
        <RevealLine delay={0.08}>
          <em>built</em>
        </RevealLine>
      </h2>
      <Reveal as="p" className="section-intro" dir="left">
        <span className="hl">
          From an AI/AR capstone to a production payment platform serving tens of
          thousands of people — a few systems I’ve shipped end to end.
        </span>
      </Reveal>
    </div>
  )
}
```

Replace with (also fixes stale copy — the old line described a "production payment platform serving tens of thousands of people," which was the TAS Group project removed from `projects.js` in a previous session; the current three projects are Boxcores, Mapgen, and WatchDNA):

```jsx
function SectionHead() {
  return (
    <div className="section-head">
      <div className="kicker">
        <span className="kicker-idx">04</span>
        <span>Response</span>
        <span className="kicker-rule" />
      </div>
      <h2 className="section-title">
        <RevealLine>Things I’ve</RevealLine>{' '}
        <RevealLine delay={0.08}>
          <em>built</em>
        </RevealLine>
      </h2>
      <Reveal as="p" className="section-intro" dir="left">
        <span className="hl">
          The payload coming back — a social diary app, an AI map generator, and
          an AI/AR capstone, each shipped end to end.
        </span>
      </Reveal>
    </div>
  )
}
```

Then find the closing `<Section id="work">` and change it to `<Section id="response">`:

```jsx
export default function Work() {
  const { isTouch } = useMediaPrefs()
  return (
    <Section id="work">
```

to:

```jsx
export default function Work() {
  const { isTouch } = useMediaPrefs()
  return (
    <Section id="response">
```

- [ ] **Step 5: Update `About.jsx` (→ Core, 05)**

In `src/components/About.jsx`, change:

```jsx
    <Section id="about">
      <div className="container">
        <div className="section-head">
          <div className="kicker">
            <span className="kicker-idx">03</span>
            <span>About</span>
            <span className="kicker-rule" />
          </div>
```

to:

```jsx
    <Section id="core">
      <div className="container">
        <div className="section-head">
          <div className="kicker">
            <span className="kicker-idx">05</span>
            <span>Core</span>
            <span className="kicker-rule" />
          </div>
```

- [ ] **Step 6: Update `Contact.jsx` (→ 200, 06)**

In `src/components/Contact.jsx`, change:

```jsx
        <div className="kicker kicker-center">
          <span className="kicker-idx">05</span>
          <span>Contact</span>
        </div>
```

to:

```jsx
        <div className="kicker kicker-center">
          <span className="kicker-idx">06</span>
          <span>200</span>
        </div>
```

(The `<Section id="contact">` line is unchanged — `contact` is already the correct final DOM id per Global Constraints.)

- [ ] **Step 7: Verify**

Run: `npm run build`
Expected: builds with no errors.

Run: `npm run dev`, open in browser, scroll through the full page.
Expected: chapters now appear in the order Hero → Approach ("02 Middleware") → Experience ("03 Compute") → Work ("04 Response") → About ("05 Core") → Contact ("06 200"). All existing content (principles, roles, projects, bio, skills, contact info) is still present and unchanged. Nav links for Work/Experience/About/Contact still jump to the right section (their `href`s didn't change, only the target sections' `id`s did — for `Work`, `Experience`, `About` this means the nav's hardcoded `href="#work"` etc. in `Nav.jsx` now point at ids that no longer exist; this is expected and gets fixed in Task 7 when `Nav.jsx`'s link list is replaced by `ChapterRail`. For now, confirm via `document.getElementById('middleware')` etc. in the browser console that the new ids resolve correctly on each section).

- [ ] **Step 8: Commit**

```bash
git add src/App.jsx src/components/Approach.jsx src/components/Experience.jsx src/components/Work.jsx src/components/About.jsx src/components/Contact.jsx
git commit -m "Reorder chapters into pipeline sequence; update ids and kicker copy"
```

---

### Task 5: Section + Reveal — GSAP ScrollTrigger pin/scrub rewrite

This is the largest refactor in the plan. `Section.jsx` (state producer) and `Reveal.jsx` (state consumer) change together in one task because splitting them would leave every section on a broken contract in between — the old IntersectionObserver tri-state (`'below'|'active'|'above'`) and the new GSAP progress object (`{progress, active}`) are incompatible shapes.

**Files:**
- Modify: `src/components/Section.jsx`
- Modify: `src/components/Reveal.jsx`

**Interfaces:**
- Consumes: `useMediaPrefs()` (existing, unchanged) for `reducedMotion`/`isTouch`.
- Produces:
  - `useSectionState()` now returns `{ progress: number, active: boolean }` instead of a string. `progress` is 0→1 (scrub position on desktop pin, or a short eased 0→1 sweep on mobile/non-pinned enter). `active` is `true` while the chapter is the current one.
  - A `window` `CustomEvent('chapter:active', { detail: id })` is dispatched exactly once per false→true transition of a chapter's `active` state. This is the mechanism `SignalLine` (Task 6) and `ChapterRail` (Task 7) use to know which chapter is current — it follows the same pattern this codebase already uses for `app:navigate`.
  - `Section` no longer accepts a `fit` prop (the old scale-to-fit-one-viewport behavior is removed — pinned chapters need real scroll distance to scrub through, which is the opposite of forcing content into exactly one viewport). It gains a `pin` prop, default `true`.

- [ ] **Step 1: Rewrite `Section.jsx`**

Replace the full contents of `src/components/Section.jsx` with:

```jsx
import { createContext, useContext, useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useMediaPrefs } from '../lib/useMediaPrefs.js'

gsap.registerPlugin(ScrollTrigger)

/**
 * Section state shared with the content inside:
 *  - progress: 0..1. On desktop (pinned + scrubbed) this tracks real scroll
 *    position through the pin. On mobile/non-pinned it sweeps 0..1 once, on
 *    a short eased tween, when the section enters the viewport.
 *  - active: true while this is the current chapter.
 */
const SectionStateContext = createContext({ progress: 1, active: true })
export const useSectionState = () => useContext(SectionStateContext)

export default function Section({ id, className = 'section', pin = true, children, ...rest }) {
  const ref = useRef(null)
  const wasActive = useRef(false)
  const [state, setState] = useState({ progress: 0, active: false })
  const { reducedMotion, isTouch } = useMediaPrefs()
  const scrub = pin && !isTouch

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const setActive = (active, progress) => {
      if (active && !wasActive.current) {
        window.dispatchEvent(new CustomEvent('chapter:active', { detail: id }))
      }
      wasActive.current = active
      setState({ progress, active })
    }

    if (reducedMotion) {
      setActive(true, 1)
      return
    }

    const ctx = gsap.context(() => {
      if (scrub) {
        ScrollTrigger.create({
          trigger: el,
          start: 'top top',
          end: '+=100%',
          pin: true,
          scrub: 0.4,
          onUpdate: (self) => setActive(true, self.progress),
          onLeave: () => setActive(false, 1),
          onEnterBack: () => setActive(true, 1),
          onLeaveBack: () => setActive(false, 0),
        })
      } else {
        const proxy = { p: 0 }
        let tween
        const enter = () => {
          tween?.kill()
          tween = gsap.to(proxy, {
            p: 1,
            duration: 0.9,
            ease: 'power3.out',
            onUpdate: () => setActive(true, proxy.p),
          })
        }
        ScrollTrigger.create({
          trigger: el,
          start: 'top 75%',
          end: 'bottom 25%',
          onEnter: enter,
          onEnterBack: enter,
          onLeave: () => setActive(false, 1),
          onLeaveBack: () => setActive(false, 0),
        })
      }
    }, el)

    return () => ctx.revert()
  }, [reducedMotion, scrub, id])

  return (
    <section ref={ref} id={id} className={className} data-section {...rest}>
      <SectionStateContext.Provider value={state}>{children}</SectionStateContext.Provider>
    </section>
  )
}
```

- [ ] **Step 2: Rewrite `Reveal.jsx`**

Replace the full contents of `src/components/Reveal.jsx` with:

```jsx
import { useSectionState } from './Section.jsx'
import { useMediaPrefs } from '../lib/useMediaPrefs.js'

/**
 * Driven by the parent Section's { progress, active }. `order` staggers
 * multiple Reveals in the same section by giving each a later start point
 * inside the section's 0..1 progress window. Honors reduced-motion (static).
 */
export function Reveal({ as = 'div', dir = 'left', order = 0, className, children, ...rest }) {
  const { reducedMotion } = useMediaPrefs()
  const { progress, active } = useSectionState()
  const Tag = as

  if (reducedMotion) {
    return (
      <Tag className={className} {...rest}>
        {children}
      </Tag>
    )
  }

  const start = Math.min(0.6, order * 0.12)
  const local = Math.max(0, Math.min(1, (progress - start) / (1 - start)))
  const eased = 1 - Math.pow(1 - local, 3)
  const shiftPx = dir === 'right' ? 60 : -60

  const style = {
    opacity: active ? eased : 0,
    transform: `translateX(${active ? (1 - eased) * shiftPx : shiftPx}px)`,
  }

  return (
    <Tag className={className} style={style} {...rest}>
      {children}
    </Tag>
  )
}

/** Masked line reveal for headings, also driven by section progress. */
export function RevealLine({ children, delay = 0, className }) {
  const { reducedMotion } = useMediaPrefs()
  const { progress, active } = useSectionState()
  if (reducedMotion) return <span className={className}>{children}</span>

  const start = Math.min(0.5, delay)
  const local = Math.max(0, Math.min(1, (progress - start) / (1 - start)))
  const eased = 1 - Math.pow(1 - local, 3)
  const y = active ? (1 - eased) * 110 : 110

  return (
    <span style={{ display: 'block', overflow: 'hidden' }} className={className}>
      <span style={{ display: 'block', transform: `translateY(${y}%)` }}>{children}</span>
    </span>
  )
}
```

Note this drops framer-motion (`motion`) from `Reveal`/`RevealLine` entirely — scrub-linked animation wants a direct progress→style mapping, not spring physics reacting to a three-state flip. framer-motion stays in the dependency tree and stays used elsewhere (Hero's role text and magnetic buttons, Preloader, Work's cursor-preview gallery, Nav's entrance) — those aren't part of this pin/scrub system.

- [ ] **Step 3: Verify**

Run: `npm run build`
Expected: builds with no errors.

Run: `npm run dev`, open in browser at a desktop viewport width (e.g. 1440px).
Expected: scrolling now visibly **pins** each chapter (Approach, Experience, Work, About, Contact — Hero still passes the now-removed `fit={false}` prop until Task 8 rewrites it to `pin={false}`, so for now Hero also pins and may log a harmless React "unknown DOM attribute" console warning for `fit`; both go away once Task 8 lands) for roughly one extra viewport-height of scroll while its heading and content reveal progressively, then releases and scrolls on to the next chapter. No layout jump, no GSAP warnings about missing plugin registration.

Resize the browser to a narrow width (< 480px) or use DevTools device emulation.
Expected: chapters no longer pin; content reveals with a smooth ~0.9s fade/slide as each section enters the viewport during normal scroll.

Enable "Emulate CSS prefers-reduced-motion: reduce" in DevTools Rendering tab, reload.
Expected: all content is immediately visible, fully opaque, no animation, no pinning.

- [ ] **Step 4: Commit**

```bash
git add src/components/Section.jsx src/components/Reveal.jsx
git commit -m "Replace IntersectionObserver tri-state with GSAP ScrollTrigger pin/scrub"
```

---

### Task 6: SignalLine — the glowing scrub-driven throughline

**Files:**
- Create: `src/components/SignalLine.jsx`
- Modify: `src/styles/index.css`
- Modify: `src/App.jsx`

**Interfaces:**
- Consumes: `stages` from `src/data/pipeline.js` (Task 2); the `chapter:active` `CustomEvent` dispatched by `Section.jsx` (Task 5); the `--signal-1`/`--signal-2` tokens (Task 3).
- Produces: `<SignalLine />` — a default-exported component with no props, rendered once near the top of `App.jsx`.

Implementation note: the spec described this as "an SVG path... revealed via `stroke-dashoffset`." This plan implements the same visual result with plain positioned `<div>`s and a `scaleY` transform instead of an SVG path with `getPointAtLength` math. Both achieve an identical glowing, progressively-revealed vertical line with a traveling dot — the div version needs no path-length calculations for the traveling packet's position (`progress * trackHeight` is enough for a straight vertical line), which is less code and less error-prone than doing the same thing via `<path>` geometry for a line that never actually curves.

- [ ] **Step 1: Create `SignalLine.jsx`**

Create `src/components/SignalLine.jsx`:

```jsx
import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { stages } from '../data/pipeline.js'

gsap.registerPlugin(ScrollTrigger)

/**
 * A vertical glowing line running the full document height, drawn
 * progressively as the page scrolls (scaleY 0..1, scrubbed to total scroll
 * progress), with a traveling "packet" dot and a node per pipeline stage
 * that highlights when that chapter becomes active. Purely decorative.
 */
export default function SignalLine() {
  const trackRef = useRef(null)
  const fillRef = useRef(null)
  const packetRef = useRef(null)
  const nodeRefs = useRef({})

  useEffect(() => {
    const track = trackRef.current
    const fill = fillRef.current
    const packet = packetRef.current
    if (!track || !fill || !packet) return

    const layout = () => {
      const height = document.documentElement.scrollHeight
      track.style.height = `${height}px`
      stages.forEach((s) => {
        const el = document.getElementById(s.id)
        const node = nodeRefs.current[s.id]
        if (el && node) {
          node.style.top = `${el.offsetTop + el.offsetHeight / 2}px`
        }
      })
    }
    layout()
    const ro = new ResizeObserver(layout)
    ro.observe(document.body)
    if (document.fonts?.ready) document.fonts.ready.then(layout)

    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: document.body,
        start: 'top top',
        end: 'bottom bottom',
        scrub: 0.3,
        onUpdate: (self) => {
          gsap.set(fill, { scaleY: self.progress })
          gsap.set(packet, { top: `${self.progress * track.offsetHeight}px` })
        },
      })
    })

    const onActive = (e) => {
      Object.entries(nodeRefs.current).forEach(([id, el]) => {
        el?.classList.toggle('is-active', id === e.detail)
      })
    }
    window.addEventListener('chapter:active', onActive)

    return () => {
      ctx.revert()
      ro.disconnect()
      window.removeEventListener('chapter:active', onActive)
    }
  }, [])

  return (
    <div className="signal-line" ref={trackRef} aria-hidden="true">
      <div className="signal-track" />
      <div className="signal-fill" ref={fillRef} />
      <div className="signal-packet" ref={packetRef} />
      {stages.map((s) => (
        <div key={s.id} className="signal-node" ref={(el) => (nodeRefs.current[s.id] = el)} data-stage={s.id} />
      ))}
    </div>
  )
}
```

- [ ] **Step 2: Add CSS**

Append to `src/styles/index.css` (a new section, e.g. after the NAV block):

```css
/* ============================================================= SIGNAL LINE */
.signal-line {
  position: absolute;
  top: 0;
  left: 28px;
  width: 2px;
  z-index: 5;
  pointer-events: none;
}
.signal-track {
  position: absolute;
  inset: 0;
  background: var(--line);
}
.signal-fill {
  position: absolute;
  inset: 0;
  background: var(--signal-gradient);
  transform: scaleY(0);
  transform-origin: top;
  box-shadow: 0 0 12px 1px rgba(124, 108, 255, 0.5);
}
.signal-packet {
  position: absolute;
  left: 50%;
  width: 10px;
  height: 10px;
  margin-left: -4px;
  margin-top: -4px;
  border-radius: 50%;
  background: var(--signal-2);
  box-shadow: 0 0 14px 4px rgba(255, 143, 208, 0.7);
}
.signal-node {
  position: absolute;
  left: 50%;
  width: 8px;
  height: 8px;
  margin-left: -3px;
  margin-top: -3px;
  border-radius: 50%;
  border: 1px solid var(--line-2);
  background: var(--bg-2);
  transition: background 0.4s var(--ease), box-shadow 0.4s var(--ease), transform 0.4s var(--ease);
}
.signal-node.is-active {
  background: var(--signal-1);
  box-shadow: 0 0 16px 3px rgba(124, 108, 255, 0.7);
  transform: scale(1.6);
}
@media (max-width: 900px) {
  .signal-line {
    left: 12px;
  }
}
```

- [ ] **Step 3: Render it in `App.jsx`**

In `src/App.jsx`, add the import:

```jsx
import SignalLine from './components/SignalLine.jsx'
```

And render it right after the background layers, before `<Nav>`:

```jsx
      <div className="bg-grain" aria-hidden="true" />

      <SignalLine />

      <Nav ready={!loading} />
```

- [ ] **Step 4: Verify**

Run: `npm run build`
Expected: builds with no errors.

Run: `npm run dev`, open in browser, scroll from top to bottom.
Expected: a thin glowing violet-to-pink line runs down the left side of the page, filling in as you scroll (fully unfilled at the top, fully filled at the bottom). A small glowing dot ("packet") tracks the current scroll position along it. Six small node dots are visible at roughly the vertical position of each chapter; the node for the current chapter is visibly larger/brighter than the others as you scroll past it. No console errors, no layout shift.

- [ ] **Step 5: Commit**

```bash
git add src/components/SignalLine.jsx src/styles/index.css src/App.jsx
git commit -m "Add SignalLine: scrub-driven glowing throughline with chapter nodes"
```

---

### Task 7: ChapterRail + Nav trim

**Files:**
- Create: `src/components/ChapterRail.jsx`
- Modify: `src/components/Nav.jsx`
- Modify: `src/styles/index.css`
- Modify: `src/App.jsx`

**Interfaces:**
- Consumes: `stages` from `src/data/pipeline.js`; `chapter:active` event (Task 5); dispatches `app:navigate` `CustomEvent` (existing pattern, already consumed by `SmoothScroll`, unchanged).
- Produces: `<ChapterRail />` — default export, no props.

- [ ] **Step 1: Create `ChapterRail.jsx`**

Create `src/components/ChapterRail.jsx`:

```jsx
import { useEffect, useState } from 'react'
import { stages } from '../data/pipeline.js'

/**
 * Fixed jump-nav listing all six pipeline stages. Desktop: always-visible
 * vertical rail. Mobile: collapses to a small toggle showing the current
 * stage code; tapping it opens the full list. Dispatches the same
 * `app:navigate` event Nav already used, so SmoothScroll's existing
 * listener handles the actual scrolling.
 */
export default function ChapterRail() {
  const [active, setActive] = useState(stages[0].id)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const onActive = (e) => setActive(e.detail)
    window.addEventListener('chapter:active', onActive)
    return () => window.removeEventListener('chapter:active', onActive)
  }, [])

  const go = (id) => {
    setOpen(false)
    window.dispatchEvent(new CustomEvent('app:navigate', { detail: `#${id}` }))
  }

  const activeStage = stages.find((s) => s.id === active) ?? stages[0]

  return (
    <nav className={`chapter-rail${open ? ' is-open' : ''}`} aria-label="Chapters">
      <button
        type="button"
        className="chapter-rail-toggle"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
      >
        <span className="chapter-rail-code">{activeStage.code}</span>
      </button>
      <ul>
        {stages.map((s) => (
          <li key={s.id}>
            <button
              type="button"
              className={s.id === active ? 'is-active' : ''}
              aria-current={s.id === active ? 'true' : undefined}
              onClick={() => go(s.id)}
            >
              <span className="chapter-rail-code">{s.code}</span>
              <span className="chapter-rail-label">{s.label}</span>
            </button>
          </li>
        ))}
      </ul>
    </nav>
  )
}
```

- [ ] **Step 2: Trim `Nav.jsx`**

Replace the full contents of `src/components/Nav.jsx` with (drops the `links` array and the `nav-links` block — `ChapterRail` now owns chapter navigation; `Nav` keeps just the logo mark and the availability pill):

```jsx
import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { identity } from '../data/content.js'

export default function Nav({ ready }) {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const go = (e, href) => {
    e.preventDefault()
    window.dispatchEvent(new CustomEvent('app:navigate', { detail: href }))
  }

  return (
    <motion.header
      className={`nav${scrolled ? ' is-scrolled' : ''}`}
      initial={{ y: -80, opacity: 0 }}
      animate={ready ? { y: 0, opacity: 1 } : { y: -80, opacity: 0 }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
    >
      <div className="nav-inner container">
        <a className="nav-mark" href="#top" onClick={(e) => go(e, '#top')}>
          <span className="nav-mark-dot" />
          {identity.firstName} {identity.lastName[0]}.
        </a>
        <a className="nav-status" href="#contact" onClick={(e) => go(e, '#contact')}>
          <span className="live" />
          Available
        </a>
      </div>
    </motion.header>
  )
}
```

- [ ] **Step 3: Add CSS**

In `src/styles/index.css`, remove the now-dead `.nav-links` rules:

```css
.nav-links {
  display: flex;
  gap: clamp(18px, 3vw, 40px);
  font-family: var(--font-mono);
  font-size: 13px;
  letter-spacing: 0.03em;
}
.nav-links a {
  color: var(--muted);
  position: relative;
  transition: color 0.3s var(--ease);
}
.nav-links a::after {
  content: '';
  position: absolute;
  left: 0;
  bottom: -5px;
  width: 0;
  height: 1px;
  background: var(--accent);
  transition: width 0.3s var(--ease);
}
.nav-links a:hover {
  color: var(--text);
}
.nav-links a:hover::after {
  width: 100%;
}
```

Also remove the now-dead mobile override `.nav-links { display: none; }` inside the `@media (max-width: 900px)` block (leave the rest of that block, e.g. `.about-grid`/`.hero-stats` rules, untouched).

Then append a new block for the chapter rail:

```css
/* ========================================================= CHAPTER RAIL */
.chapter-rail-toggle {
  display: none;
}
.chapter-rail {
  position: fixed;
  right: clamp(16px, 2.5vw, 40px);
  top: 50%;
  transform: translateY(-50%);
  z-index: 90;
}
.chapter-rail ul {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 14px;
}
.chapter-rail button {
  display: flex;
  align-items: center;
  gap: 10px;
  background: none;
  border: none;
  padding: 4px 0;
  cursor: pointer;
  font-family: var(--font-mono);
  color: var(--faint);
  text-align: right;
}
.chapter-rail-code {
  font-size: 11px;
  letter-spacing: 0.06em;
  white-space: nowrap;
}
.chapter-rail-label {
  display: none;
}
.chapter-rail button.is-active .chapter-rail-code {
  color: var(--text);
}
.chapter-rail button.is-active::after {
  content: '';
  width: 16px;
  height: 1px;
  background: var(--signal-gradient);
}

@media (max-width: 900px) {
  .chapter-rail {
    right: auto;
    left: 0;
    top: 0;
    transform: none;
    width: 100%;
  }
  .chapter-rail-toggle {
    display: flex;
    width: 100%;
    justify-content: center;
    padding: 10px;
    background: rgba(8, 9, 12, 0.7);
    backdrop-filter: blur(10px);
    border: none;
    border-bottom: 1px solid var(--line);
    color: var(--text);
    font-family: var(--font-mono);
    font-size: 12px;
    letter-spacing: 0.08em;
  }
  .chapter-rail ul {
    display: none;
    flex-direction: column;
    gap: 0;
    background: rgba(8, 9, 12, 0.92);
    backdrop-filter: blur(10px);
    padding: 8px 0;
  }
  .chapter-rail.is-open ul {
    display: flex;
  }
  .chapter-rail button {
    justify-content: center;
    width: 100%;
    padding: 12px 16px;
    text-align: center;
  }
  .chapter-rail-label {
    display: inline;
    font-family: var(--font-sans);
    color: var(--muted);
    font-size: 12px;
  }
}
```

- [ ] **Step 4: Render it in `App.jsx`**

In `src/App.jsx`, add the import:

```jsx
import ChapterRail from './components/ChapterRail.jsx'
```

Render it after `<Nav>`:

```jsx
      <Nav ready={!loading} />
      <ChapterRail />
```

- [ ] **Step 5: Verify**

Run: `npm run build`
Expected: builds with no errors.

Run: `npm run dev`, open at a desktop width.
Expected: a small fixed rail on the right edge shows all six stage codes (`CONNECT`/`MIDDLEWARE`/`COMPUTE`/`RESPONSE`/`CORE`/`200`). The current one highlights as you scroll (in sync with `SignalLine`'s node highlighting from Task 6, since both listen for the same `chapter:active` event). Clicking any stage code jumps directly to that chapter.

Resize to a mobile width (< 900px).
Expected: the rail collapses to a small bar at the top showing only the current stage code; tapping it opens a full list with labels, and tapping any entry jumps to that chapter and closes the list.

- [ ] **Step 6: Commit**

```bash
git add src/components/ChapterRail.jsx src/components/Nav.jsx src/styles/index.css src/App.jsx
git commit -m "Add ChapterRail chapter navigation; trim Nav to logo + status"
```

---

### Task 8: GridField → Hero-only signal centerpiece; retire useFit

**Files:**
- Modify: `src/components/GridField.jsx`
- Modify: `src/components/Hero.jsx`
- Modify: `src/App.jsx`
- Modify: `src/styles/index.css`
- Delete: `src/lib/useFit.js`

**Interfaces:**
- Consumes: nothing new.
- Produces: `GridField` is no longer imported/rendered by `App.jsx` — it's imported and lazy-loaded by `Hero.jsx` directly instead, scoped to the Hero chapter only.

- [ ] **Step 1: Recolor `GridField.jsx` toward the signal palette**

In `src/components/GridField.jsx`, find:

```js
  const edgeIdle = useMemo(() => new THREE.Color('#c3b6f7').multiplyScalar(0.42), [])
  const edgeHot = useMemo(() => new THREE.Color('#ece4ff'), [])
```

Replace with:

```js
  const edgeIdle = useMemo(() => new THREE.Color('#7c6cff').multiplyScalar(0.42), [])
  const edgeHot = useMemo(() => new THREE.Color('#ffe0f5'), [])
```

Find the point-light colors:

```js
      <pointLight
        color="#b9a9f2"
        intensity={10}
        distance={24}
        decay={1.1}
        position={[VIS_W * 0.42, VIS_H * 0.12, 3.2]}
      />
      <pointLight
        color="#f0b3c6"
        intensity={6}
        distance={24}
        decay={1.2}
        position={[VIS_W * 0.5, -VIS_H * 0.4, 3]}
      />
```

Replace with:

```js
      <pointLight
        color="#8f7dff"
        intensity={10}
        distance={24}
        decay={1.1}
        position={[VIS_W * 0.42, VIS_H * 0.12, 3.2]}
      />
      <pointLight
        color="#ff8fd0"
        intensity={6}
        distance={24}
        decay={1.2}
        position={[VIS_W * 0.5, -VIS_H * 0.4, 3]}
      />
```

(Cube side/lid material colors, geometry, and the press-to-activate interaction stay unchanged — this is a recolor, not a geometry rework. Deeper shader/geometry redesign is a reasonable follow-up polish pass to iterate on live in-browser later; it's out of scope for a plannable, no-placeholder task here.)

- [ ] **Step 2: Move `GridField` into `Hero.jsx`**

Replace the full contents of `src/components/Hero.jsx` with:

```jsx
import { lazy, Suspense, useRef } from 'react'
import { motion } from 'framer-motion'
import { identity, rotatingRoles, stats, lead } from '../data/content.js'
import { useRotatingText, useCountUp, useMagnetic } from '../lib/hooks.js'
import { useMediaPrefs } from '../lib/useMediaPrefs.js'
import Section from './Section.jsx'

const GridField = lazy(() => import('./GridField.jsx'))

const EASE = [0.16, 1, 0.3, 1]
const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.09, delayChildren: 0.05 } },
}
const item = {
  hidden: { opacity: 0, y: 26 },
  show: { opacity: 1, y: 0, transition: { duration: 0.9, ease: EASE } },
}

function Stat({ value, suffix, label, start }) {
  const [ref, display] = useCountUp(value, { start })
  return (
    <div className="stat">
      <div className="stat-num" ref={ref}>
        {display}
        {suffix && <span className="stat-suffix">{suffix}</span>}
      </div>
      <div className="stat-label">{label}</div>
    </div>
  )
}

export default function Hero({ ready }) {
  const { reducedMotion, isTouch } = useMediaPrefs()
  const interactive = !reducedMotion && !isTouch
  const roleRef = useRotatingText(rotatingRoles)
  const primary = useMagnetic(0.25)
  const ghost = useMagnetic(0.25)
  const state = reducedMotion || ready ? 'show' : 'hidden'

  return (
    <Section className="hero" id="top" pin={false}>
      <div className="hero-glow" aria-hidden="true" />
      {interactive ? (
        <Suspense fallback={<div className="hero-grid-fallback" aria-hidden="true" />}>
          <GridField />
        </Suspense>
      ) : (
        <div className="hero-grid-fallback" aria-hidden="true" />
      )}
      <span className="hero-rail" aria-hidden="true">
        {identity.title} · {identity.year}
      </span>

      <motion.div
        className="container hero-inner"
        variants={container}
        initial={reducedMotion ? 'show' : 'hidden'}
        animate={state}
      >
        <motion.div className="hero-top" variants={item}>
          <span className="status">
            <span className="live" />
            {identity.availability}
          </span>
          <span className="coords">
            {identity.coords} — {identity.location}
          </span>
        </motion.div>

        <h1 className="hero-title">
          <motion.span className="line" variants={item}>
            Aziz
          </motion.span>
          <motion.span className="line" variants={item}>
            <em>Shamuratov</em>
          </motion.span>
        </h1>

        <motion.div className="role-line" variants={item}>
          <span className="arrow">{'>'}</span>
          <span>I build</span>
          <span className="rot" ref={roleRef} />
          <span className="caret" />
        </motion.div>

        <motion.p className="hero-lead" variants={item}>
          <span className="hl">{lead}</span>
        </motion.p>

        <motion.div className="cta-row" variants={item}>
          <a className="btn btn-primary" href="#work" ref={primary}>
            View work <span className="btn-ic">↗</span>
          </a>
          <a className="btn btn-ghost" href="#contact" ref={ghost}>
            Get in touch
          </a>
          <div className="hero-quicklinks">
            <a href={identity.github} target="_blank" rel="noreferrer">
              GitHub
            </a>
            <a href={identity.linkedin} target="_blank" rel="noreferrer">
              LinkedIn
            </a>
          </div>
        </motion.div>

        <motion.div className="hero-stats" variants={item}>
          {stats.map((s) => (
            <Stat key={s.label} {...s} start={reducedMotion || ready} />
          ))}
        </motion.div>
      </motion.div>
    </Section>
  )
}
```

Changes from the original: `useFit`/`heroFit`/`section-fit` wrapper removed (content now lays out normally rather than being scaled to force-fit one viewport); `GridField` is now imported and rendered here, gated by the same `interactive` check `App.jsx` used to do; `Section` is called with `pin={false}` since the Hero is a cold-open entrance (already has its own `ready`-gated framer-motion animation) rather than a scroll-scrubbed chapter. Per the spec's mobile/reduced-motion requirement ("WebGL Hero centerpiece swaps to a static poster frame"), the non-interactive path renders `.hero-grid-fallback` — a lightweight static CSS dot-grid (added in Step 4 below) — instead of nothing, matching in spirit the page-wide `.bg-grid` fallback `App.jsx` used before this task, just Hero-scoped.

- [ ] **Step 3: Remove `GridField`/background wiring from `App.jsx`**

In `src/App.jsx`, remove the `lazy`/`Suspense` import (no longer used here), the `GridField` lazy import, the `useMediaPrefs`/`interactive` logic, and the background `<div>`s that are no longer needed (`bg-grid` and `bg-scrim` — their CSS was already dropped in Task 3; `GridField` itself moved into `Hero`). The full file becomes:

```jsx
import { useState } from 'react'
import { AnimatePresence } from 'framer-motion'
import { SmoothScroll } from './lib/SmoothScroll.jsx'
import Preloader from './components/Preloader.jsx'
import Nav from './components/Nav.jsx'
import ChapterRail from './components/ChapterRail.jsx'
import SignalLine from './components/SignalLine.jsx'
import Hero from './components/Hero.jsx'
import Work from './components/Work.jsx'
import Experience from './components/Experience.jsx'
import About from './components/About.jsx'
import Approach from './components/Approach.jsx'
import Contact from './components/Contact.jsx'
import Footer from './components/Footer.jsx'

export default function App() {
  const [loading, setLoading] = useState(true)

  return (
    <>
      <AnimatePresence>
        {loading && <Preloader key="preloader" onDone={() => setLoading(false)} />}
      </AnimatePresence>

      <div className="bg-grain" aria-hidden="true" />

      <SignalLine />

      <Nav ready={!loading} />
      <ChapterRail />

      <SmoothScroll paused={loading}>
        <main id="main">
          <Hero ready={!loading} />
          <Approach />
          <Experience />
          <Work />
          <About />
          <Contact />
        </main>
        <Footer />
      </SmoothScroll>
    </>
  )
}
```

- [ ] **Step 4: Update `.grid-field` CSS to be Hero-local**

In `src/styles/index.css`, find:

```css
/* =============================================== GRID FIELD (WebGL) */
.grid-field {
  position: fixed;
  inset: 0;
  z-index: -1;
  pointer-events: none;
  -webkit-mask-image: radial-gradient(140% 130% at 50% 42%, #000 62%, transparent 100%);
  mask-image: radial-gradient(140% 130% at 50% 42%, #000 62%, transparent 100%);
}
.grid-field canvas {
  display: block;
}
```

Replace with (only `position` changes, `fixed` → `absolute`, so it's now scoped to `.hero`'s own box rather than the full viewport — `.hero` is `position: relative` and `height: 100svh`, so the visual result is unchanged, it just no longer bleeds past the Hero chapter):

```css
/* =============================================== GRID FIELD (WebGL) */
.grid-field {
  position: absolute;
  inset: 0;
  z-index: -1;
  pointer-events: none;
  -webkit-mask-image: radial-gradient(140% 130% at 50% 42%, #000 62%, transparent 100%);
  mask-image: radial-gradient(140% 130% at 50% 42%, #000 62%, transparent 100%);
}
.grid-field canvas {
  display: block;
}
.hero-grid-fallback {
  position: absolute;
  inset: 0;
  z-index: -1;
  pointer-events: none;
  background-image:
    linear-gradient(to right, var(--line) 1px, transparent 1px),
    linear-gradient(to bottom, var(--line) 1px, transparent 1px);
  background-size: var(--grid-cell) var(--grid-cell);
  opacity: 0.35;
  -webkit-mask-image: radial-gradient(140% 130% at 50% 42%, #000 62%, transparent 100%);
  mask-image: radial-gradient(140% 130% at 50% 42%, #000 62%, transparent 100%);
}
```

This reuses the exact dot-grid technique the old page-wide `.bg-grid` used (same gradient lines, same `--grid-cell` token, same radial mask), just repositioned `absolute` and scoped to `.hero` instead of `fixed` to the viewport — the static fallback for touch/reduced-motion visitors keeps the same visual language whether or not they get the WebGL version.

Also find `.hero-glow` and make it Hero-scoped and positioned (it currently inherits `position: fixed` from the shared rule in Task 3's edit):

```css
.hero-glow {
  position: absolute;
  z-index: 0;
  background:
    radial-gradient(42% 50% at 16% 24%, rgba(143, 125, 255, 0.14), transparent 70%),
    radial-gradient(45% 45% at 84% 28%, rgba(255, 143, 208, 0.12), transparent 70%);
}
```

(This replaces the old rule that only set `background:` — it now also sets `position: absolute; z-index: 0` directly, overriding the shared `position: fixed` from the Task 3 selector since this is a more specific single-class rule appearing later in the stylesheet. Slightly more saturated glow colors matching the new signal palette.)

- [ ] **Step 5: Delete `useFit.js`**

Confirm no remaining usage:

Run: `grep -rn "useFit" src/`
Expected: no matches (Section.jsx dropped it in Task 5, Hero.jsx dropped it in Step 2 above).

Delete `src/lib/useFit.js`.

Also remove the now-unused `.section-fit`/`.hero-fit` CSS rules from `src/styles/index.css`:

```css
.section-fit {
  width: 100%;
  transform-origin: center center;
}
```

(`.hero-fit` — the second class the old Hero.jsx put on its wrapper div alongside `section-fit` — was never given its own CSS rule in `index.css`, so there's nothing further to remove for it; Step 2 of this task already dropped both classNames from the JSX.)

And simplify `.section`'s base rule — find:

```css
.section {
  position: relative;
  height: 100svh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  justify-content: center;
  /* clear the fixed nav at the top; keep content vertically centred */
  padding-block: clamp(86px, 11vh, 120px) clamp(56px, 8vh, 96px);
}
```

Replace with:

```css
.section {
  position: relative;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  /* clear the fixed nav at the top; keep content vertically centred */
  padding-block: clamp(86px, 11vh, 120px) clamp(56px, 8vh, 96px);
}
```

(`height: 100svh; overflow: hidden` forced every section's content into exactly one viewport, which is what `useFit`'s scale-down existed to compensate for. `min-height: 100vh` with no `overflow: hidden` lets pinned chapters occupy the real scroll distance GSAP's `pin: true` needs.)

- [ ] **Step 6: Verify**

Run: `npm run build`
Expected: builds with no errors, and the build output shows `GridField` in its own lazy-loaded chunk (same as before — check the `vite build` output listing for a separate `GridField-*.js` chunk).

Run: `npm run dev`, open in browser.
Expected: the WebGL cube-grid visual now appears only within the Hero chapter (scrolling past Hero, it's gone — no full-page persistent background). Its edge/glow colors read violet-to-pink rather than lavender-to-white. Hero no longer pins on scroll (it's a normal entrance, not a scrubbed chapter). Approach/Experience/Work/About/Contact still pin and scrub as in Task 5. No console errors.

- [ ] **Step 7: Commit**

```bash
git add src/components/GridField.jsx src/components/Hero.jsx src/App.jsx src/styles/index.css
git rm src/lib/useFit.js
git commit -m "Scope GridField to Hero as the signal centerpiece; retire useFit"
```

---

### Task 9: Accessibility pass — skip link + cross-component mobile/reduced-motion verification

**Files:**
- Modify: `src/App.jsx`
- Modify: `src/styles/index.css`

**Interfaces:**
- Consumes: nothing new. This task adds one small piece of new markup and otherwise verifies behavior already built into Tasks 5–8.

- [ ] **Step 1: Add a skip-to-content link**

In `src/App.jsx`, add the skip link as the very first child inside the top-level fragment, before `<AnimatePresence>`:

```jsx
    <>
      <a className="skip-link" href="#main">
        Skip to content
      </a>

      <AnimatePresence>
```

(`<main id="main">` already exists from Task 1, Step 1 — this just needed the link pointing at it.)

- [ ] **Step 2: Add skip-link CSS**

Append to `src/styles/index.css`:

```css
/* ======================================================= ACCESSIBILITY */
.skip-link {
  position: fixed;
  top: -60px;
  left: 16px;
  z-index: 1000;
  background: var(--bg-elev);
  color: var(--text);
  padding: 12px 20px;
  border-radius: 8px;
  border: 1px solid var(--line-2);
  font-family: var(--font-mono);
  font-size: 13px;
  transition: top 0.25s var(--ease);
}
.skip-link:focus {
  top: 16px;
}
```

- [ ] **Step 3: Verify — keyboard/skip link**

Run: `npm run dev`, open in browser.
Press `Tab` once from the top of the page.
Expected: the "Skip to content" link becomes visible (slides in from the top) and is focused. Pressing `Enter` jumps focus/scroll to `<main>`.

- [ ] **Step 4: Verify — desktop full walkthrough**

With the browser at a desktop width (≥ 1280px) and DevTools closed:
Expected, scrolling top to bottom: Hero enters (no pin, framer-motion staggered entrance, WebGL grid visible only here) → Approach pins and its principles reveal in sequence while `SignalLine`'s "middleware" node lights up and `ChapterRail` highlights `MIDDLEWARE` → Experience pins similarly for `COMPUTE` → Work pins for `RESPONSE` (hover-preview gallery still works exactly as before, unaffected by this refactor) → About pins for `CORE`, and its photo still shows the subtle `useParallax`-driven drift as you scroll through the pin (this hook is untouched by this refactor and already worked under Lenis scroll, so it should need no fixing — just confirm it still looks right) → Contact pins for `200`. No section ever clips or cuts off content. No console errors or warnings at any point in the scroll.

- [ ] **Step 5: Verify — mobile emulation**

In Chrome DevTools, toggle device toolbar, select a ~390px-wide device profile, throttle CPU to 4x slowdown.
Expected: no pinning anywhere (all chapters use the simple timed-reveal path from Task 5). `ChapterRail` shows as a collapsed top bar; tapping it opens the full stage list and tapping an entry jumps correctly. `SignalLine` still renders and fills as you scroll (repositioned to `left: 12px` per the Task 6 media query). Scrolling feels smooth, not janky, even under CPU throttle.

- [ ] **Step 6: Verify — reduced motion**

In DevTools Rendering tab, enable "Emulate CSS media feature prefers-reduced-motion: reduce," reload at desktop width.
Expected: every chapter's content is immediately fully visible with no animation and no pinning. The WebGL Hero centerpiece does not load — Hero shows the static `.hero-grid-fallback` dot-grid instead (matching the existing `interactive` gate from Task 8), no canvas element in the DOM, no console error. `SignalLine` and `ChapterRail` still render and function (they aren't gated by `reducedMotion`, only `Section`'s pin/scrub and `Reveal`'s animation are).

- [ ] **Step 7: Commit**

```bash
git add src/App.jsx src/styles/index.css
git commit -m "Add skip-to-content link; verify mobile and reduced-motion paths"
```

---

### Task 10: Final cleanup and full verification against spec success criteria

**Files:**
- Modify: any file where the audit in Step 1 finds a leftover reference (expected to be none, given each prior task already grepped for its own leftovers — this task is the final cross-check across the whole diff).

**Interfaces:** none — this is a verification-only task.

- [ ] **Step 1: Grep audit for leftovers**

Run each of these and confirm no matches:

```bash
grep -rn "Pager" src/
grep -rn "useFit" src/
grep -rn "70k+" src/ index.html
grep -rn "data-theme\|localStorage.*theme" src/
grep -rn "kicker-idx\">0[1-5]<" src/components/Approach.jsx src/components/Experience.jsx src/components/Work.jsx src/components/About.jsx
```

(The last one guards against a leftover pre-Task-4 kicker index slipping through — all four files should show their *new* indices, `02`/`03`/`04`/`05`, not old ones.)

- [ ] **Step 2: Build check**

Run: `npm run build`
Expected: succeeds with no errors or warnings beyond the pre-existing chunk-size notice (unrelated to this work).

- [ ] **Step 3: Walk the spec's success criteria**

Run: `npm run dev`, and manually confirm each line from the spec (`docs/superpowers/specs/2026-07-18-signal-scrollytelling-redesign-design.md`, "Success criteria" section):

- [ ] `npm run build` succeeds with no console errors (checked in Step 2, plus open the built `dist/index.html` via `npm run preview` and confirm no runtime console errors either).
- [ ] All six chapters present, in pipeline order, all existing content intact — cross-check against `src/data/projects.js` (Boxcores, Mapgen, WatchDNA), `src/data/experience.js` (MyMainAI, Itransition), `src/data/content.js` (principles, bio, contact info) to confirm nothing was dropped.
- [ ] Chapter rail visible/functional on desktop; collapses to top bar with the same six jump targets on mobile.
- [ ] Signal line renders and scrubs correctly across the full page on desktop.
- [ ] Hero WebGL centerpiece loads lazily (confirm via Network tab: the `GridField` chunk loads as a separate request, not bundled into the main chunk) and doesn't block first paint (Hero's text content is visible immediately, before the WebGL canvas appears).
- [ ] Mobile viewport shows simplified reveal animations, not pinned scrub, and stays smoothly scrollable.
- [ ] `prefers-reduced-motion: reduce` fully disables scrub/pin/parallax, presents static readable content with only the skip-link's opacity/position transition exempted (that one's a11y affordance, not decorative motion).
- [ ] No light-mode code paths exist (confirmed clean in Step 1's grep).
- [ ] `index.html` OG description no longer mentions "70k+ users" (confirmed in Step 1's grep).

- [ ] **Step 4: Final commit**

If Step 1's audit or Step 3's walkthrough turned up anything to fix, fix it now and commit those fixes with a specific message describing what was found. If everything already passes clean, there's nothing to commit for this task — the plan is complete as of Task 9's commit.
