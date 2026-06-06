# Portfolio Redesign — Clean Minimal, Dark-First

**Date:** 2026-06-04
**Owner:** Aziz Shamuratov

## Goal

Redesign the existing React + Three.js black-hole portfolio into a clean, minimal,
typographically-driven software-engineer portfolio. Remove the 3D theme entirely.
The restraint should read as senior and intentional. Content stays; the skin and a
few metaphor-heavy copy lines change.

## Decisions (locked)

- **Direction:** Clean & minimal. Drop the 3D black hole.
- **Theme:** Dark by default, with a working light-mode toggle (persisted).
- **Accent:** Cool electric blue (`~#5b9dff`), used sparingly.
- **Heading/body font:** Geist (refined grotesk). Keep **JetBrains Mono** for
  labels, section indices, dates, tags. Drop Cal Sans + Instrument Serif.
- **Approach section:** Keep it, but rewrite the 4 principles in plain engineering
  language — no space metaphors.

## Visual system

- **Color tokens** via CSS custom properties on `<html>`, flipped by `[data-theme]`.
  - Dark (default): canvas `#0a0b0d`, text off-white, muted gray secondary, accent blue.
  - Light: canvas `#fafafa`, near-black text, accent slightly darkened.
- **Layout:** consistent max-width container, generous whitespace, hairline `1px`
  dividers instead of heavy cards, numbered section kickers (`01 / Work`).
- **Motion:** subtle reveal-on-scroll (fade + small rise). Tilt/magnetic effects kept
  but dialed way down; disabled on mobile / reduced-motion.

## Structure (unchanged order, re-skinned)

`Nav (+ theme toggle)` → `Hero` → `Work` → `Experience` → `About` → `Approach` →
`Contact` → `Footer`

- **Hero:** keep rotating role text, animated stat counters, CTAs. Left-aligned
  statement layout; remove the glassy card.
- **Work:** 4 projects in a calm grid — thumb, title, blurb, mono tags. Subtle tilt.
- **Experience:** clean vertical timeline, hairline rule, mono dates.
- **About:** photo + bio + skill groups, simplified.
- **Approach:** 4 rewritten plain-English principles.
- **Contact:** same content, restyled.

## Technical changes

- Remove `BlackHole.jsx` and `Atmosphere.jsx`; stop importing them in `App.jsx`.
  `three` / `@react-three/*` / `postprocessing` become unused deps (left in
  `package.json` for now).
- Add theme system: `data-theme` on `<html>`, toggle button in `Nav`, persisted to
  `localStorage`, default dark, respects `prefers-color-scheme` only on first visit.
- Keep hooks: `useReveal`, `useCountUp`, `useMagnetic`, `useTilt`, `useRotatingText`,
  `useActiveSection` — used more restrainedly.
- Rewrite `index.css` around new tokens. Update font links in `index.html`.
- Rewrite metaphor copy: footer ("a little gravity"), Contact headline ("with
  gravity"), and any other black-hole references → clean professional copy.

## Out of scope

- New sections or new content/projects.
- Backend, forms, analytics.
- Pruning unused npm dependencies (optional follow-up).

## Success criteria

- No 3D / WebGL on the page; no console errors.
- Dark default; toggle switches to light and persists across reload.
- Readable, professional, responsive (mobile → desktop).
- All existing content present; no remaining space metaphors in copy.
- `npm run build` succeeds.
