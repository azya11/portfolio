# Vanilla-JS Kinetic Scrollytelling Rebuild

Status: Approved
Date: 2026-07-18

## Context

The current site (`src/`) is a React + Vite app ("Signal") with GSAP/ScrollTrigger,
Lenis, and react-three-fiber, built through two prior design cycles (portfolio-redesign,
signal-scrollytelling-redesign). The owner requested a full ground-up rebuild,
explicitly not carrying forward any existing code or visual design, using a
vanilla-JS kinetic-scroll storytelling architecture (Lenis + GSAP/ScrollTrigger +
Three.js) instead of React.

Real portfolio content (identity, projects, experience, skills, principles) is
carried forward as factual data — only the code and visual design are being
discarded.

## Goals

- Replace the React app with a vanilla ES6 + Vite (bundler only) site.
- Single-page, four-stage scroll narrative: Monolith (hero) → Kinetic Distortion
  (bio/principles/experience cards) → Horizontal Carousel (projects) → Resolution
  (contact CTA).
- Dark, minimal aesthetic — no neon/glow. One restrained accent color.
- Physics-based motion: spring/elastic entrances, bounce drops, scroll-velocity-driven
  skew/blur, pinned horizontal scroll.
- Full support for `prefers-reduced-motion` and no-WebGL fallback.
- No dependency on unverified/fictional tooling (Higgsfield MCP, ccteams, Buildomator).

## Non-goals

- Keeping any existing component code, CSS, or visual design from the current build.
- Video-based background assets (no real generation tool available for this repo).
- Multi-page routing — this stays a single scrolling page.

## Stack

- **Bundler/dev server:** Vite (kept — it's a build tool, not a UI framework).
- **Animation:** GSAP 3.12+ with ScrollTrigger.
- **Smooth scroll:** Lenis, driven by `gsap.ticker` (not its own rAF loop).
- **3D/WebGL:** Three.js, latest stable (not r128 — modern ESM imports only,
  no legacy `examples/` folder imports).
- Library APIs are looked up via Context7 MCP at implementation time rather than
  relied on from memory, particularly for ScrollTrigger pin/scrub options and
  current Three.js `BufferGeometry`/`Points` usage.

## Sync pipeline

```js
gsap.registerPlugin(ScrollTrigger);
const lenis = new Lenis({ duration: 1.2, smoothWheel: true, ... });
lenis.on('scroll', ScrollTrigger.update);
gsap.ticker.add((time) => lenis.raf(time * 1000));
gsap.ticker.lagSmoothing(0);
```

## Content (carried forward as data, not code)

- **Identity:** Aziz Shamuratov, Software Developer, Tempe AZ, ASU CS grad May 2026.
  Contact: email, phone, GitHub, LinkedIn (from `src/data/content.js`).
- **Experience:** Data Scientist Intern @ MyMainAI (Jan–May 2026), .NET Developer
  Intern @ Itransition Group (Jul–Sep 2025).
- **Approach/principles:** 4 principles ("Boring is a feature", "Tests earn their
  keep", "Design the seams", "Ship small, measure real").
- **Projects (3):** Boxcores, Mapgen, WatchDNA — title/blurb/tags/link each.
- **Skills:** grouped by Languages/Frameworks/Data/Cloud & Ops/Testing.

## Section design

**Polish reference:** cantor8.io (an enterprise product site, not a scrollytelling
site) was raised as inspiration — not for its light theme or corporate structure,
but for its level of restraint: tight grid rhythm, confident type scale, subtle
rather than showy motion. Treat that as the bar for craft/polish, not as a
structural or palette reference.

### 1. Monolith (Hero)
Full-viewport canvas, `THREE.Points` particle field (~1500–2000 points on desktop,
reduced on mobile/low-end), slow ambient rotation/drift, no scroll-scrub yet (idle
motion only). Centered minimal type: name, title, a rotating-role line cycling through
`rotatingRoles` data, and a scroll-down cue. Dark background (`#0a0a0a`-ish), single
accent color for the cue/rotating text.

### 2. Kinetic Distortion
Sequential cards for About paragraphs, the 4 Approach principles, and the 2 Experience
roles. Cards enter via `elastic.out(1, 0.3)` (principles — "pop") or `bounce.out`
(experience — "drop"), triggered by individual `ScrollTrigger`s
(`start: "top 85%"`, `toggleActions: "play none none reverse"`). A single
`ScrollTrigger.create({ onUpdate })` computes `getVelocity()` and maps it to
`skewY`/`blur()` on the section's card containers, clamped and resolving to 0 via
`overwrite: "auto"`. Skills render as a static tag strip beneath the About card (no
separate entrance choreography).

### 3. Horizontal Carousel
Desktop/tablet: `ScrollTrigger` pin on a `.horizontal-viewport-wrapper`, scrubbed
`x` translate on a `.horizontal-track` sized to `scrollWidth - innerWidth`,
`invalidateOnRefresh: true` for resize correctness. Three project cards
(Boxcores, Mapgen, WatchDNA) with blurb/tags/external link.
Mobile (`<768px`) and `prefers-reduced-motion`: no pin, cards render as a normal
vertical stack — same content, standard fade-in.

### 4. Resolution
Particle field reused/reinitialized, animated (via scrub) from scattered to a
loose grid arrangement behind a contact CTA block: email, GitHub, LinkedIn.

## Accessibility & fallbacks

- `prefers-reduced-motion: reduce` — disable skew/blur velocity effects and
  elastic/bounce overshoot (replace with plain opacity fades); disable horizontal
  pin (falls back to the mobile vertical-stack layout for the carousel).
- WebGL init wrapped in try/catch; on failure, hero/resolution canvases are
  replaced with a static CSS gradient background — the rest of the page functions
  identically.
- Skip-to-content link retained (was added in the prior build; the accessibility
  requirement carries forward even though the implementation doesn't).

## Performance

- Particle count and renderer `pixelRatio` capped lower on mobile/narrow viewports.
- All `ScrollTrigger` instances created with cleanup/`invalidateOnRefresh` on
  resize; no duplicate triggers on re-layout.
- No React runtime, no component re-render overhead — DOM updates are direct and
  GSAP-driven.

## Verification plan

- Run `npm run dev`, drive the page via the Playwright MCP browser tool:
  screenshot desktop and mobile viewports for each section, confirm no console
  errors, confirm horizontal carousel pins/scrubs correctly.
- Manually toggle `prefers-reduced-motion` (OS or devtools emulation) and verify
  the fallback path — no skew/blur/pin, cards still readable and functional.
- Confirm all real links (GitHub, LinkedIn, project links, mailto) resolve.

## Explicitly out of scope from the original brief

The originating brief referenced several tools that either don't exist or aren't
available in this environment: "Claude Fable 5" (no such model), Higgsfield MCP
(video generation), ccteams, Buildomator/GSD-plugin, and a Figma MCP server. None
of these are installed or will be installed as part of this work — implementation
is done directly, with Context7 MCP (already available) used for real library
documentation lookups.
