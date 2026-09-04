# Vanilla-JS Kinetic Scrollytelling Rebuild Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the current React + react-three-fiber "Signal" app with a vanilla ES6 + GSAP/ScrollTrigger + Lenis + Three.js single-page portfolio, built around the four-stage narrative (Monolith → Kinetic Distortion → Horizontal Carousel → Resolution) approved in the design spec.

**Architecture:** Vite stays as the dev server/bundler only (no React plugin). `src/main.js` is the sole entry point: it mounts four section modules into `#app`, starts the Lenis/GSAP scroll-sync pipeline, and wires resize/reduced-motion handling. Pure logic (velocity→skew/blur math, particle count scaling, carousel mode selection, data shape) lives in small testable modules under `src/utils/` and `src/data.js`; DOM/animation wiring lives in `src/sections/*.js` and is verified visually via Playwright rather than unit-tested, since GSAP/ScrollTrigger/Three.js behavior isn't meaningfully assertable in jsdom.

**Tech Stack:** Vite 5 (bundler), vanilla ES6, GSAP 3.12+ (`gsap`, `gsap/ScrollTrigger`), Lenis, Three.js (latest, ESM imports only), Vitest + jsdom (unit tests for pure logic only), Playwright MCP (visual/behavioral verification).

## Global Constraints

- No React, no UI framework — plain ES6 modules and DOM APIs only (spec: Stack).
- Three.js must use modern ESM imports from the current package version, not the legacy `examples/` folder or r128-era patterns (spec: Stack).
- Sync pipeline must bind `lenis.raf` to `gsap.ticker.add`, convert seconds→ms, and call `gsap.ticker.lagSmoothing(0)` (spec: Sync pipeline).
- All real content (identity, projects, experience, principles, skills, rotating roles) must be carried forward verbatim from `src/data/*.js` — no placeholder copy (spec: Content).
- Every animated effect (skew/blur, elastic/bounce entrances, horizontal pin) must have a `prefers-reduced-motion` fallback; horizontal carousel must stack vertically under 768px width or reduced motion (spec: Accessibility & fallbacks).
- WebGL init must be wrapped in try/catch with a static-gradient fallback on failure (spec: Accessibility & fallbacks).
- Dark, minimal palette — no neon/glow (spec: Sections, user decision).
- No installation of unverified tooling (Higgsfield MCP, ccteams, Buildomator) (spec: Out of scope).

---

## File Structure

```
index.html                     — rewritten: single #app mount, keeps head/meta/fonts/OG tags
vite.config.js                 — drop @vitejs/plugin-react
package.json                   — drop react/react-dom/@gsap/react/@react-three/fiber/framer-motion; add vitest/jsdom; add "test" script
vitest.config.js               — new: jsdom environment
src/main.js                    — new entry point (replaces main.jsx)
src/data.js                    — new: real content, ported from src/data/*.js
src/data.test.js               — new
src/utils/motion.js            — new: pure math/logic helpers
src/utils/motion.test.js       — new
src/scroll.js                  — new: Lenis+GSAP sync pipeline
src/scroll.test.js             — new
src/webgl/particleField.js     — new: Three.js particle field factory
src/webgl/particleField.test.js — new
src/sections/hero.js           — new: Monolith section
src/sections/kinetic.js        — new: Kinetic Distortion section
src/sections/carousel.js       — new: Horizontal Carousel section
src/sections/resolution.js     — new: Resolution/CTA section
src/styles/base.css            — new: reset, variables, typography
src/styles/layout.css          — new: section/grid layout, responsive rules
src/styles/motion.css          — new: reduced-motion overrides
# Removed (old React app):
src/App.jsx, src/components/*, src/lib/*, src/data/*.js (old), src/styles/index.css
```

**Interfaces between files:**
- `src/data.js` exports `identity`, `rotatingRoles`, `stats`, `lead`, `principles`, `aboutParagraphs`, `roles`, `projects`, `skillGroups` — consumed by every `src/sections/*.js`.
- `src/utils/motion.js` exports `clamp(min, max, value)`, `skewFromVelocity(velocity, maxSkew?)`, `blurFromVelocity(velocity, maxBlur?)`, `particleCountForWidth(width)`, `prefersReducedMotion()`, `chooseCarouselMode(width, reducedMotion)` — consumed by `scroll.js`, `webgl/particleField.js`, `sections/kinetic.js`, `sections/carousel.js`.
- `src/scroll.js` exports `initScroll()` returning `{ lenis, destroy() }` — consumed by `main.js`.
- `src/webgl/particleField.js` exports `createParticleField(canvas, { width, height })` returning `{ update(elapsed), setFormation(progress), resize(w, h), destroy(), count } | null` (null on WebGL failure) — consumed by `sections/hero.js` and `sections/resolution.js`.
- `src/sections/*.js` each export `mount(root)` returning `{ el, destroy() }` (`carousel.js` additionally exports `chooseCarouselMode` re-export is not needed — it imports directly from `utils/motion.js`) — consumed by `main.js`.

---

### Task 1: Strip the React app; vanilla scaffold + tooling

**Files:**
- Delete: `src/App.jsx`, `src/components/` (entire directory), `src/lib/` (entire directory), `src/data/` (entire directory — replaced by `src/data.js` in Task 3), `src/styles/index.css`, `src/main.jsx`
- Create: `src/main.js`, `src/styles/base.css`, `vitest.config.js`
- Modify: `index.html`, `vite.config.js`, `package.json`

**Interfaces:**
- Produces: `#app` div in `index.html` as the sole mount point; `src/main.js` as the entry script (currently empty except CSS import, filled in by later tasks).

- [ ] **Step 1: Remove the old React app**

```bash
git rm -r src/App.jsx src/components src/lib src/data src/styles/index.css src/main.jsx
```

- [ ] **Step 2: Rewrite `index.html` body to drop the React mount, keep head metadata**

Keep everything in `<head>` as-is (fonts, OG tags, favicon, title, description — these are real content, not code). Replace only the `<body>`:

```html
  <body>
    <div id="app"></div>
    <script type="module" src="/src/main.js"></script>
  </body>
</html>
```

- [ ] **Step 3: Simplify `vite.config.js` to drop the React plugin**

```js
import { defineConfig } from 'vite'

export default defineConfig({})
```

- [ ] **Step 4: Update `package.json` dependencies and scripts**

```json
{
  "name": "portfolio",
  "private": true,
  "version": "0.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "test": "vitest run"
  },
  "dependencies": {
    "gsap": "^3.12.5",
    "lenis": "^1.1.18",
    "three": "^0.169.0"
  },
  "devDependencies": {
    "vite": "^5.4.10",
    "vitest": "^2.1.4",
    "jsdom": "^25.0.1"
  }
}
```

- [ ] **Step 5: Install updated dependencies**

Run: `npm install`
Expected: lockfile updates, no errors; `react`, `react-dom`, `@gsap/react`, `@react-three/fiber`, `framer-motion` no longer present in `node_modules/.package-lock.json` top-level deps.

- [ ] **Step 6: Create `vitest.config.js`**

```js
import { defineConfig } from 'vite'

export default defineConfig({
  test: {
    environment: 'jsdom',
  },
})
```

- [ ] **Step 7: Create `src/styles/base.css` with the dark-minimal design tokens**

```css
:root {
  color-scheme: dark;
  --bg: #0a0a0b;
  --bg-raised: #131316;
  --fg: #ededf0;
  --fg-muted: #9a9aa2;
  --border: #232328;
  --accent: #d6d6de;
  --font-sans: 'Geist', system-ui, sans-serif;
  --font-serif: 'Instrument Serif', serif;
  --font-mono: 'JetBrains Mono', monospace;
  --space-1: 0.5rem;
  --space-2: 1rem;
  --space-3: 2rem;
  --space-4: 4rem;
  --space-5: 8rem;
}

* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

html,
body {
  background: var(--bg);
  color: var(--fg);
  font-family: var(--font-sans);
  min-height: 100svh;
}

#app {
  position: relative;
}

.section {
  position: relative;
  min-height: 100svh;
  padding: var(--space-4) var(--space-3);
}

a {
  color: inherit;
}

.skip-link {
  position: absolute;
  top: -100%;
  left: var(--space-2);
  background: var(--bg-raised);
  color: var(--fg);
  padding: var(--space-1) var(--space-2);
  border: 1px solid var(--border);
  z-index: 100;
  transition: top 0.2s ease;
}

.skip-link:focus {
  top: var(--space-2);
}
```

- [ ] **Step 8: Create a placeholder-free `src/main.js` that imports the base CSS and confirms the shell mounts**

```js
import './styles/base.css'

const app = document.getElementById('app')
app.innerHTML = '<p style="padding:2rem">Portfolio rebuild in progress.</p>'
```

- [ ] **Step 9: Verify the dev server serves the new shell with no console errors**

Run: `npm run dev`, then navigate via the Playwright MCP browser tool to `http://localhost:5173`, take a screenshot, and check console messages.
Expected: dark page renders the placeholder text; `browser_console_messages` (level: error) returns no entries.

- [ ] **Step 10: Commit**

```bash
git add -A
git commit -m "Strip React app; vanilla Vite scaffold with vitest tooling"
```

---

### Task 2: Motion utility functions

**Files:**
- Create: `src/utils/motion.js`, `src/utils/motion.test.js`

**Interfaces:**
- Produces: `clamp`, `skewFromVelocity`, `blurFromVelocity`, `particleCountForWidth`, `prefersReducedMotion`, `chooseCarouselMode` (signatures listed in File Structure above).

- [ ] **Step 1: Write the failing tests**

```js
// src/utils/motion.test.js
import { describe, it, expect, vi, afterEach } from 'vitest'
import {
  clamp,
  skewFromVelocity,
  blurFromVelocity,
  particleCountForWidth,
  prefersReducedMotion,
  chooseCarouselMode,
} from './motion.js'

describe('clamp', () => {
  it('bounds a value within [min, max]', () => {
    expect(clamp(-8, 8, 100)).toBe(8)
    expect(clamp(-8, 8, -100)).toBe(-8)
    expect(clamp(-8, 8, 3)).toBe(3)
  })
})

describe('skewFromVelocity', () => {
  it('clamps to +/- maxSkew for large velocities', () => {
    expect(skewFromVelocity(10000)).toBe(8)
    expect(skewFromVelocity(-10000)).toBe(-8)
  })

  it('scales linearly within range (velocity / 200)', () => {
    expect(skewFromVelocity(400)).toBe(2)
  })

  it('respects a custom maxSkew', () => {
    expect(skewFromVelocity(10000, 12)).toBe(12)
  })
})

describe('blurFromVelocity', () => {
  it('caps at maxBlur for large velocities', () => {
    expect(blurFromVelocity(3000)).toBe(6)
  })

  it('scales with magnitude (|velocity| / 300)', () => {
    expect(blurFromVelocity(300)).toBeCloseTo(1)
  })

  it('is never negative', () => {
    expect(blurFromVelocity(-300)).toBeCloseTo(1)
  })
})

describe('particleCountForWidth', () => {
  it('returns the low tier under 480px', () => {
    expect(particleCountForWidth(320)).toBe(400)
  })

  it('returns the mid tier under 900px', () => {
    expect(particleCountForWidth(700)).toBe(900)
  })

  it('returns the full tier at desktop widths', () => {
    expect(particleCountForWidth(1440)).toBe(1800)
  })
})

describe('chooseCarouselMode', () => {
  it('stacks under 768px regardless of motion preference', () => {
    expect(chooseCarouselMode(500, false)).toBe('stack')
  })

  it('pins at desktop width without reduced motion', () => {
    expect(chooseCarouselMode(1200, false)).toBe('pin')
  })

  it('always stacks when reduced motion is requested', () => {
    expect(chooseCarouselMode(1200, true)).toBe('stack')
  })
})

describe('prefersReducedMotion', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('reads window.matchMedia for the reduce query', () => {
    const matchMedia = vi.fn().mockReturnValue({ matches: true })
    vi.stubGlobal('matchMedia', matchMedia)
    expect(prefersReducedMotion()).toBe(true)
    expect(matchMedia).toHaveBeenCalledWith('(prefers-reduced-motion: reduce)')
  })
})
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `npx vitest run src/utils/motion.test.js`
Expected: FAIL — `Cannot find module './motion.js'` (or all tests failing on missing exports).

- [ ] **Step 3: Implement `src/utils/motion.js`**

```js
export function clamp(min, max, value) {
  return Math.min(max, Math.max(min, value))
}

export function skewFromVelocity(velocity, maxSkew = 8) {
  return clamp(-maxSkew, maxSkew, velocity / 200)
}

export function blurFromVelocity(velocity, maxBlur = 6) {
  return Math.min(Math.abs(velocity) / 300, maxBlur)
}

export function particleCountForWidth(width) {
  if (width < 480) return 400
  if (width < 900) return 900
  return 1800
}

export function prefersReducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

export function chooseCarouselMode(width, reducedMotion) {
  if (reducedMotion) return 'stack'
  return width < 768 ? 'stack' : 'pin'
}
```

- [ ] **Step 4: Run the tests to verify they pass**

Run: `npx vitest run src/utils/motion.test.js`
Expected: PASS — all 13 assertions green.

- [ ] **Step 5: Commit**

```bash
git add src/utils/motion.js src/utils/motion.test.js
git commit -m "Add motion utility functions with unit tests"
```

---

### Task 3: Content data module

**Files:**
- Create: `src/data.js`, `src/data.test.js`

**Interfaces:**
- Produces: `identity`, `rotatingRoles`, `stats`, `lead`, `principles`, `aboutParagraphs`, `roles`, `projects`, `skillGroups`.

- [ ] **Step 1: Write the failing tests**

```js
// src/data.test.js
import { describe, it, expect } from 'vitest'
import {
  identity,
  rotatingRoles,
  principles,
  aboutParagraphs,
  roles,
  projects,
  skillGroups,
} from './data.js'

describe('identity', () => {
  it('has the required contact fields', () => {
    expect(identity.fullName).toBe('Aziz Shamuratov')
    expect(identity.email).toBe('azizshamuratovv@gmail.com')
    expect(identity.github).toContain('github.com')
    expect(identity.linkedin).toContain('linkedin.com')
  })
})

describe('projects', () => {
  it('has exactly 3 projects, each with required fields', () => {
    expect(projects).toHaveLength(3)
    projects.forEach((p) => {
      expect(p.title).toBeTruthy()
      expect(p.blurb).toBeTruthy()
      expect(Array.isArray(p.tags)).toBe(true)
      expect(p.tags.length).toBeGreaterThan(0)
      expect(p.link).toMatch(/^https?:\/\//)
    })
  })

  it('includes Boxcores, Mapgen, and WatchDNA', () => {
    const titles = projects.map((p) => p.title)
    expect(titles).toEqual(['Boxcores', 'Mapgen', 'WatchDNA'])
  })
})

describe('roles', () => {
  it('has exactly 2 experience entries with points', () => {
    expect(roles).toHaveLength(2)
    roles.forEach((r) => {
      expect(r.role).toBeTruthy()
      expect(r.company).toBeTruthy()
      expect(Array.isArray(r.points)).toBe(true)
      expect(r.points.length).toBeGreaterThan(0)
    })
  })
})

describe('principles and rotatingRoles', () => {
  it('has exactly 4 approach principles', () => {
    expect(principles).toHaveLength(4)
    principles.forEach((p) => {
      expect(p.title).toBeTruthy()
      expect(p.body).toBeTruthy()
    })
  })

  it('has at least one about paragraph and one rotating role', () => {
    expect(aboutParagraphs.length).toBeGreaterThan(0)
    expect(rotatingRoles.length).toBeGreaterThan(0)
  })
})

describe('skillGroups', () => {
  it('has non-empty groups with items', () => {
    expect(skillGroups.length).toBeGreaterThan(0)
    skillGroups.forEach((g) => {
      expect(g.label).toBeTruthy()
      expect(g.items.length).toBeGreaterThan(0)
    })
  })
})
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `npx vitest run src/data.test.js`
Expected: FAIL — `Cannot find module './data.js'`.

- [ ] **Step 3: Implement `src/data.js`, carrying forward real content verbatim**

```js
export const identity = {
  firstName: 'Aziz',
  lastName: 'Shamuratov',
  fullName: 'Aziz Shamuratov',
  title: 'Software Developer',
  location: 'Tempe, Arizona',
  availability: 'Available · May 2026 grad',
  email: 'azizshamuratovv@gmail.com',
  phone: '+16022141634',
  phoneDisplay: '+1 602 214 1634',
  github: 'https://github.com/azya11',
  linkedin: 'https://www.linkedin.com/in/azizshamuratovv/',
  year: 2026,
}

export const rotatingRoles = [
  'backend systems',
  'RESTful APIs',
  'CI/CD pipelines',
  'event-driven services',
  'full-stack products',
]

export const stats = [
  { value: 8, suffix: 'mo', label: 'Experience' },
  { value: 12, suffix: '+', label: 'API endpoints' },
  { value: 2, suffix: '', label: 'Internships' },
  { value: 85, suffix: '%', label: 'Test coverage' },
]

export const lead =
  'Software developer with hands-on internship experience shipping production backends and ' +
  'full-stack features across React, Node.js, and .NET. I like the invisible work — clean APIs, ' +
  'real test coverage, and pipelines that let a team move fast without breaking things.'

export const principles = [
  {
    title: 'Boring is a feature',
    body:
      'Predictable beats clever. I optimize for the API that never surprises you, the ' +
      'deploy that’s a non-event, and code the next engineer can read without scheduling a meeting.',
  },
  {
    title: 'Tests earn their keep',
    body:
      'I write fast, honest tests that catch real regressions before users do — wired into ' +
      'CI so the team never has to think about them. Coverage is a means, not the goal.',
  },
  {
    title: 'Design the seams',
    body:
      'The interesting failures happen at boundaries. I spend my care on contracts and edges: ' +
      'clear inputs, predictable errors, and nothing that surprises the caller a year later.',
  },
  {
    title: 'Ship small, measure real',
    body:
      'I’d rather ship a small thing that delivers value than a big thing that might. Automate ' +
      'the boring parts, measure what actually matters, and iterate in the open.',
  },
]

export const aboutParagraphs = [
  'Hi, I’m Aziz. I’m a software developer in Tempe, Arizona, finishing my B.S. in Computer ' +
    'Science at Arizona State University this May.',
  'I’m drawn to the work no one sees but everyone feels — the API that never surprises you, ' +
    'the test that catches the bug before it ships.',
  'Across two internships and a run of personal projects I’ve shipped production backends and ' +
    'full-stack features — from ASP.NET Core microservices at Itransition to AI/AR capstone work ' +
    'as a team lead. I care about clean contracts, honest test coverage, and automating the ' +
    'boring parts so a team can focus on the hard ones.',
  'Outside of code I co-founded the Central Asian Student Association at ASU, placed as a 2× ' +
    'Amazon Hackathon finalist, and won a Claude Hackathon.',
]

export const roles = [
  {
    role: 'Data Scientist Intern',
    company: 'MyMainAI',
    date: 'Jan 2026 – May 2026',
    place: 'On-site',
    summary: 'Turning messy datasets into models that actually inform decisions.',
    points: [
      'Ran <strong>EDA</strong> on large datasets to surface trends and actionable insights.',
      'Built and evaluated regression, classification, and clustering models — <strong>Random Forest, XGBoost, K-Means</strong>.',
      'Tuned hyperparameters with cross-validation and fine-tuned deep learning models in <strong>PyTorch</strong>.',
    ],
  },
  {
    role: '.NET Developer Intern',
    company: 'Itransition Group',
    date: 'Jul 2025 – Sep 2025',
    place: 'Remote',
    summary: 'Shipping fast inside a small, disciplined Agile squad.',
    points: [
      'Built 2 <strong>ASP.NET Core</strong> microservices (12+ endpoints) at <strong>~2k req/min</strong>; cut latency 30% via query & cache tuning.',
      'Reached <strong>85% coverage</strong> with xUnit + Moq wired into GitHub Actions CI, cutting QA regressions 40%.',
      'Merged <strong>40+ PRs</strong> with zero critical defects in a 5-person Agile squad.',
    ],
  },
]

export const projects = [
  {
    title: 'Boxcores',
    meta: 'Personal Project · 2026',
    blurb:
      'A social diary for the soccer matches you watch. Browse real matches, log the ones you\'ve ' +
      'seen, rate them 0–5 in half-steps, tag and review them, then follow a privacy-aware friends ' +
      'feed. Next.js frontend backed by a Go serverless API on Netlify, with Supabase Postgres, ' +
      'Auth, Storage, and row-level security.',
    tags: ['Next.js', 'TypeScript', 'Go', 'Supabase', 'PostgreSQL', 'Netlify'],
    image: '/projects/boxcores.webp',
    link: 'https://boxcores.com',
  },
  {
    title: 'Mapgen',
    meta: 'Personal Project · 2026',
    blurb:
      'An AI pipeline that turns a natural-language prompt into a renderable 3D map. Claude ' +
      'tool-use parses the description into a validated scene spec, then real places are geocoded ' +
      'and built from live OpenStreetMap footprints + elevation data into a 3D scene you can ' +
      'export as GLB, OBJ, or STL — served by a hardened FastAPI app with Argon2 auth and CSRF protection.',
    tags: ['Python', 'FastAPI', 'Claude API', 'Three.js', 'OpenStreetMap'],
    image: '/projects/mapgen.png',
    link: 'https://mapgen-zeta.vercel.app/',
  },
  {
    title: 'WatchDNA',
    meta: 'Team Lead · AI + AR Capstone · 2025–2026',
    blurb:
      'AI + AR capstone. Elected Team Lead — ran the Scrum process, owned the TypeScript backend ' +
      'and every user story, documented endpoints with Swagger, and containerized the whole stack ' +
      'with Docker + Kubernetes behind a CI/CD pipeline.',
    tags: ['Python', 'PyTorch', 'TypeScript', 'Docker', 'Kubernetes'],
    image: '/projects/watchdna.png',
    link: 'https://watchdna.com/',
  },
]

export const skillGroups = [
  { label: 'Languages', items: ['C#', 'C++', 'TypeScript', 'JavaScript', 'Python', 'Java', 'OCaml'] },
  { label: 'Frameworks', items: ['.NET', 'ASP.NET Core', 'React', 'Node.js', 'PyTorch', 'RESTful APIs'] },
  { label: 'Data', items: ['MS SQL', 'PostgreSQL', 'Redis', 'Kafka', 'RabbitMQ'] },
  { label: 'Cloud & Ops', items: ['AWS', 'Azure', 'Docker', 'Kubernetes', 'CI/CD', 'GitHub Actions'] },
  { label: 'Testing', items: ['xUnit', 'Moq', 'Jest', 'JUnit'] },
]
```

- [ ] **Step 4: Run the tests to verify they pass**

Run: `npx vitest run src/data.test.js`
Expected: PASS — all assertions green.

- [ ] **Step 5: Commit**

```bash
git add src/data.js src/data.test.js
git commit -m "Add content data module with unit tests"
```

---

### Task 4: Lenis + GSAP scroll sync pipeline

**Files:**
- Create: `src/scroll.js`, `src/scroll.test.js`

**Interfaces:**
- Consumes: `gsap`, `gsap/ScrollTrigger`, `lenis` (npm packages).
- Produces: `initScroll()` returning `{ lenis, destroy() }`.

- [ ] **Step 1: Write the failing tests (mocking `gsap` and `lenis`)**

```js
// src/scroll.test.js
import { describe, it, expect, vi, beforeEach } from 'vitest'

const onMock = vi.fn()
const rafMock = vi.fn()
const destroyMock = vi.fn()
const lenisInstance = { on: onMock, raf: rafMock, destroy: destroyMock }
const LenisMock = vi.fn(() => lenisInstance)

vi.mock('lenis', () => ({ default: LenisMock }))

const tickerAdd = vi.fn()
const tickerRemove = vi.fn()
const lagSmoothing = vi.fn()
const registerPlugin = vi.fn()

vi.mock('gsap', () => ({
  default: {
    registerPlugin,
    ticker: { add: tickerAdd, remove: tickerRemove, lagSmoothing },
  },
}))

vi.mock('gsap/ScrollTrigger', () => ({ ScrollTrigger: { update: vi.fn() } }))

const { initScroll } = await import('./scroll.js')

describe('initScroll', () => {
  beforeEach(() => {
    onMock.mockClear()
    tickerAdd.mockClear()
    tickerRemove.mockClear()
    lagSmoothing.mockClear()
    rafMock.mockClear()
    destroyMock.mockClear()
  })

  it('wires lenis scroll events to ScrollTrigger.update', () => {
    initScroll()
    expect(onMock).toHaveBeenCalledWith('scroll', expect.any(Function))
  })

  it('adds exactly one ticker callback and disables lag smoothing', () => {
    initScroll()
    expect(tickerAdd).toHaveBeenCalledTimes(1)
    expect(lagSmoothing).toHaveBeenCalledWith(0)
  })

  it('converts the ticker time (seconds) to milliseconds for lenis.raf', () => {
    initScroll()
    const tickCallback = tickerAdd.mock.calls[0][0]
    tickCallback(2)
    expect(rafMock).toHaveBeenCalledWith(2000)
  })

  it('destroy() removes the ticker callback and destroys lenis', () => {
    const { destroy } = initScroll()
    const tickCallback = tickerAdd.mock.calls[0][0]
    destroy()
    expect(tickerRemove).toHaveBeenCalledWith(tickCallback)
    expect(destroyMock).toHaveBeenCalledTimes(1)
  })
})
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `npx vitest run src/scroll.test.js`
Expected: FAIL — `Cannot find module './scroll.js'`.

- [ ] **Step 3: Implement `src/scroll.js`**

```js
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Lenis from 'lenis'

gsap.registerPlugin(ScrollTrigger)

export function initScroll() {
  const lenis = new Lenis({
    duration: 1.2,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    orientation: 'vertical',
    gestureOrientation: 'vertical',
    smoothWheel: true,
    wheelMultiplier: 1.0,
    touchMultiplier: 1.5,
    infinite: false,
  })

  lenis.on('scroll', ScrollTrigger.update)

  const tick = (time) => lenis.raf(time * 1000)
  gsap.ticker.add(tick)
  gsap.ticker.lagSmoothing(0)

  function destroy() {
    gsap.ticker.remove(tick)
    lenis.destroy()
  }

  return { lenis, destroy }
}
```

- [ ] **Step 4: Run the tests to verify they pass**

Run: `npx vitest run src/scroll.test.js`
Expected: PASS — all 4 assertions green.

- [ ] **Step 5: Commit**

```bash
git add src/scroll.js src/scroll.test.js
git commit -m "Add Lenis/GSAP scroll sync pipeline with wiring tests"
```

---

### Task 5: Three.js particle field module

**Files:**
- Create: `src/webgl/particleField.js`, `src/webgl/particleField.test.js`

**Interfaces:**
- Consumes: `three` (npm package), `particleCountForWidth` from `src/utils/motion.js`.
- Produces: `createParticleField(canvas, { width, height })` → `{ update(elapsed), setFormation(progress), resize(w, h), destroy(), count } | null`.

- [ ] **Step 1: Write the failing test**

jsdom has no real WebGL context, so `canvas.getContext('webgl2'/'webgl')` returns `null` there — this is exactly the no-WebGL fallback path the spec requires, and it's the one thing we can assert without a real browser. Real rendering is verified visually in Task 6/9 via Playwright.

```js
// src/webgl/particleField.test.js
import { describe, it, expect } from 'vitest'
import { createParticleField } from './particleField.js'

describe('createParticleField', () => {
  it('returns null instead of throwing when WebGL is unavailable', () => {
    const canvas = document.createElement('canvas')
    const field = createParticleField(canvas, { width: 300, height: 300 })
    expect(field).toBeNull()
  })
})
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npx vitest run src/webgl/particleField.test.js`
Expected: FAIL — `Cannot find module './particleField.js'`.

- [ ] **Step 3: Implement `src/webgl/particleField.js`**

```js
import * as THREE from 'three'
import { particleCountForWidth } from '../utils/motion.js'

export function createParticleField(canvas, { width, height } = {}) {
  const w = width ?? canvas.clientWidth ?? 1
  const h = height ?? canvas.clientHeight ?? 1

  let renderer
  try {
    renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true })
  } catch {
    return null
  }
  if (!renderer.getContext()) {
    return null
  }

  renderer.setSize(w, h, false)
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2))

  const scene = new THREE.Scene()
  const camera = new THREE.PerspectiveCamera(60, w / h, 0.1, 100)
  camera.position.z = 6

  const count = particleCountForWidth(w)
  const origins = new Float32Array(count * 3)
  for (let i = 0; i < count * 3; i++) {
    origins[i] = (Math.random() - 0.5) * 12
  }

  const geometry = new THREE.BufferGeometry()
  geometry.setAttribute('position', new THREE.BufferAttribute(origins.slice(), 3))
  const material = new THREE.PointsMaterial({ size: 0.03, color: 0xd6d6de })
  const points = new THREE.Points(geometry, material)
  scene.add(points)

  function update(elapsed) {
    points.rotation.y = elapsed * 0.02
    points.rotation.x = elapsed * 0.008
    renderer.render(scene, camera)
  }

  function setFormation(progress) {
    const pos = geometry.attributes.position
    const gridSize = Math.ceil(Math.sqrt(count))
    const spacing = 6 / gridSize
    for (let i = 0; i < count; i++) {
      const ix = i * 3
      const gx = (i % gridSize) * spacing - 3
      const gy = Math.floor(i / gridSize) * spacing - 3
      pos.array[ix] = origins[ix] + (gx - origins[ix]) * progress
      pos.array[ix + 1] = origins[ix + 1] + (gy - origins[ix + 1]) * progress
      pos.array[ix + 2] = origins[ix + 2] * (1 - progress)
    }
    pos.needsUpdate = true
  }

  function resize(w2, h2) {
    camera.aspect = w2 / h2
    camera.updateProjectionMatrix()
    renderer.setSize(w2, h2, false)
  }

  function destroy() {
    geometry.dispose()
    material.dispose()
    renderer.dispose()
  }

  return { update, setFormation, resize, destroy, count }
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `npx vitest run src/webgl/particleField.test.js`
Expected: PASS — `createParticleField` returns `null` under jsdom.

- [ ] **Step 5: Commit**

```bash
git add src/webgl/particleField.js src/webgl/particleField.test.js
git commit -m "Add Three.js particle field module with WebGL-fallback test"
```

---

### Task 6: Monolith (Hero) section

**Files:**
- Create: `src/sections/hero.js`
- Modify: `src/styles/layout.css` (new file — hero-specific rules added here and extended by later tasks)

**Interfaces:**
- Consumes: `identity`, `rotatingRoles` from `src/data.js`; `createParticleField` from `src/webgl/particleField.js`; `prefersReducedMotion` from `src/utils/motion.js`; `gsap`.
- Produces: `mountHero(root)` → `{ el, destroy() }`.

- [ ] **Step 1: Implement `src/sections/hero.js`**

```js
import gsap from 'gsap'
import { identity, rotatingRoles } from '../data.js'
import { createParticleField } from '../webgl/particleField.js'
import { prefersReducedMotion } from '../utils/motion.js'

export function mountHero(root) {
  const section = document.createElement('section')
  section.id = 'hero'
  section.className = 'section section-hero'
  section.innerHTML = `
    <canvas class="hero-canvas" aria-hidden="true"></canvas>
    <div class="hero-copy">
      <p class="hero-eyebrow">${identity.title} · ${identity.location}</p>
      <h1 class="hero-name">${identity.fullName}</h1>
      <p class="hero-role">I build <span class="hero-role-text">${rotatingRoles[0]}</span></p>
      <p class="hero-cue" aria-hidden="true">Scroll</p>
    </div>
  `
  root.appendChild(section)

  const canvas = section.querySelector('.hero-canvas')
  const field = createParticleField(canvas, {
    width: window.innerWidth,
    height: window.innerHeight,
  })

  let rafId = null
  const clock = { start: performance.now() }
  if (field) {
    const loop = () => {
      field.update((performance.now() - clock.start) / 1000)
      rafId = requestAnimationFrame(loop)
    }
    loop()
  } else {
    canvas.style.display = 'none'
    section.classList.add('no-webgl')
  }

  const roleEl = section.querySelector('.hero-role-text')
  let roleIndex = 0
  let roleInterval = null
  if (!prefersReducedMotion()) {
    roleInterval = setInterval(() => {
      roleIndex = (roleIndex + 1) % rotatingRoles.length
      gsap.to(roleEl, {
        opacity: 0,
        duration: 0.3,
        onComplete: () => {
          roleEl.textContent = rotatingRoles[roleIndex]
          gsap.to(roleEl, { opacity: 1, duration: 0.3 })
        },
      })
    }, 2600)
  }

  function onResize() {
    if (field) field.resize(window.innerWidth, window.innerHeight)
  }
  window.addEventListener('resize', onResize)

  function destroy() {
    if (rafId) cancelAnimationFrame(rafId)
    if (roleInterval) clearInterval(roleInterval)
    window.removeEventListener('resize', onResize)
    if (field) field.destroy()
    section.remove()
  }

  return { el: section, destroy }
}
```

- [ ] **Step 2: Add hero styles to `src/styles/layout.css`**

```css
.section-hero {
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.hero-canvas {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
}

.hero-copy {
  position: relative;
  z-index: 1;
  text-align: center;
  max-width: 40rem;
}

.hero-eyebrow {
  font-family: var(--font-mono);
  color: var(--fg-muted);
  letter-spacing: 0.08em;
  text-transform: uppercase;
  font-size: 0.8rem;
  margin-bottom: var(--space-2);
}

.hero-name {
  font-family: var(--font-serif);
  font-size: clamp(2.5rem, 8vw, 5.5rem);
  line-height: 1.05;
}

.hero-role {
  margin-top: var(--space-2);
  color: var(--fg-muted);
  font-size: clamp(1rem, 2vw, 1.25rem);
}

.hero-role-text {
  color: var(--fg);
}

.hero-cue {
  position: absolute;
  bottom: calc(var(--space-4) * -1);
  left: 50%;
  transform: translateX(-50%);
  font-family: var(--font-mono);
  font-size: 0.75rem;
  color: var(--fg-muted);
}

.section-hero.no-webgl {
  background: radial-gradient(circle at 50% 30%, var(--bg-raised), var(--bg));
}
```

- [ ] **Step 3: Wire into `main.js` temporarily to verify visually**

```js
// src/main.js (temporary — full wiring happens in Task 10)
import './styles/base.css'
import './styles/layout.css'
import { mountHero } from './sections/hero.js'

mountHero(document.getElementById('app'))
```

- [ ] **Step 4: Verify visually with Playwright MCP**

Run: `npm run dev`, navigate to `http://localhost:5173` via the Playwright MCP browser tool.
Expected: full-viewport dark hero with a drifting particle field behind centered name/title/rotating-role text; `browser_console_messages` (level: error) returns no entries. Take a screenshot for the record.

- [ ] **Step 5: Commit**

```bash
git add src/sections/hero.js src/styles/layout.css src/main.js
git commit -m "Add Monolith hero section with particle field and rotating role"
```

---

### Task 7: Kinetic Distortion section

**Files:**
- Create: `src/sections/kinetic.js`
- Modify: `src/styles/layout.css`, `src/styles/motion.css` (new file)

**Interfaces:**
- Consumes: `aboutParagraphs`, `principles`, `roles`, `skillGroups` from `src/data.js`; `skewFromVelocity`, `blurFromVelocity`, `prefersReducedMotion` from `src/utils/motion.js`; `gsap`, `gsap/ScrollTrigger`.
- Produces: `mountKinetic(root)` → `{ el, destroy() }`.

- [ ] **Step 1: Implement `src/sections/kinetic.js`**

```js
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { aboutParagraphs, principles, roles, skillGroups } from '../data.js'
import { skewFromVelocity, blurFromVelocity, prefersReducedMotion } from '../utils/motion.js'

export function mountKinetic(root) {
  const section = document.createElement('section')
  section.id = 'kinetic'
  section.className = 'section section-kinetic'

  const aboutHtml = `
    <div class="card card-about" data-card="pop">
      ${aboutParagraphs.map((p) => `<p>${p}</p>`).join('')}
      <div class="skills-strip">
        ${skillGroups
          .map(
            (g) =>
              `<div class="skills-group"><span class="skills-label">${g.label}</span> ${g.items.join(' · ')}</div>`,
          )
          .join('')}
      </div>
    </div>
  `

  const principleHtml = principles
    .map(
      (p) => `
    <div class="card card-principle" data-card="pop">
      <h3>${p.title}</h3>
      <p>${p.body}</p>
    </div>`,
    )
    .join('')

  const roleHtml = roles
    .map(
      (r) => `
    <div class="card card-role" data-card="drop">
      <p class="role-meta">${r.role} · ${r.company} · ${r.date}</p>
      <p class="role-summary">${r.summary}</p>
      <ul>${r.points.map((pt) => `<li>${pt}</li>`).join('')}</ul>
    </div>`,
    )
    .join('')

  section.innerHTML = `
    <div class="kinetic-track">
      ${aboutHtml}
      ${principleHtml}
      ${roleHtml}
    </div>
  `
  root.appendChild(section)

  const reduced = prefersReducedMotion()
  const cards = Array.from(section.querySelectorAll('[data-card]'))
  const triggers = []

  cards.forEach((card) => {
    if (reduced) {
      gsap.set(card, { opacity: 1, y: 0, scale: 1 })
      const trigger = ScrollTrigger.create({
        trigger: card,
        start: 'top 90%',
        onEnter: () => gsap.to(card, { opacity: 1, duration: 0.4 }),
      })
      gsap.set(card, { opacity: 0 })
      triggers.push(trigger)
      return
    }

    const isPop = card.dataset.card === 'pop'
    const trigger = ScrollTrigger.create({
      trigger: card,
      start: 'top 85%',
      toggleActions: 'play none none reverse',
      onEnter: () => {
        if (isPop) {
          gsap.from(card, { scale: 0.2, opacity: 0, duration: 1.6, ease: 'elastic.out(1, 0.3)' })
        } else {
          gsap.from(card, { y: -400, opacity: 0, duration: 1.4, ease: 'bounce.out' })
        }
      },
    })
    triggers.push(trigger)
  })

  let velocityTrigger = null
  if (!reduced) {
    velocityTrigger = ScrollTrigger.create({
      onUpdate: (self) => {
        const velocity = self.getVelocity()
        gsap.to('.section-kinetic [data-card]', {
          skewY: skewFromVelocity(velocity),
          filter: `blur(${blurFromVelocity(velocity)}px)`,
          duration: 0.3,
          ease: 'power2.out',
          overwrite: 'auto',
        })
      },
    })
  }

  function destroy() {
    triggers.forEach((t) => t.kill())
    if (velocityTrigger) velocityTrigger.kill()
    section.remove()
  }

  return { el: section, destroy }
}
```

- [ ] **Step 2: Add kinetic styles**

Append to `src/styles/layout.css`:

```css
.section-kinetic {
  display: flex;
  align-items: center;
}

.kinetic-track {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
  width: 100%;
  max-width: 46rem;
  margin: 0 auto;
}

.card {
  background: var(--bg-raised);
  border: 1px solid var(--border);
  border-radius: 0.5rem;
  padding: var(--space-3);
}

.card-about p + p {
  margin-top: var(--space-2);
}

.skills-strip {
  margin-top: var(--space-3);
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
  font-family: var(--font-mono);
  font-size: 0.85rem;
  color: var(--fg-muted);
}

.skills-label {
  color: var(--fg);
  font-weight: 500;
}

.card-role ul {
  margin-top: var(--space-2);
  padding-left: 1.2rem;
}

.card-role li + li {
  margin-top: 0.4rem;
}

.role-meta {
  font-family: var(--font-mono);
  font-size: 0.8rem;
  color: var(--fg-muted);
}
```

Create `src/styles/motion.css`:

```css
@media (prefers-reduced-motion: reduce) {
  .section-kinetic [data-card] {
    filter: none !important;
    transform: none !important;
  }
}
```

- [ ] **Step 3: Wire into `main.js` temporarily and verify visually**

```js
// src/main.js (temporary — replaced fully in Task 10)
import './styles/base.css'
import './styles/layout.css'
import './styles/motion.css'
import { mountHero } from './sections/hero.js'
import { mountKinetic } from './sections/kinetic.js'

const app = document.getElementById('app')
mountHero(app)
mountKinetic(app)
```

- [ ] **Step 4: Verify visually with Playwright MCP**

Run: `npm run dev`, navigate via Playwright MCP, scroll to the Kinetic Distortion section, screenshot.
Expected: about/principles/experience cards enter with elastic-pop or bounce-drop motion as they cross the trigger threshold; fast scrolling visibly skews/blurs cards, resolving back to normal at rest; no console errors.
Then emulate `prefers-reduced-motion: reduce` (via Playwright's `browser_evaluate` setting `matchMedia`, or devtools emulation) and re-check: cards should fade in with no skew/blur/overshoot.

- [ ] **Step 5: Commit**

```bash
git add src/sections/kinetic.js src/styles/layout.css src/styles/motion.css src/main.js
git commit -m "Add Kinetic Distortion section with pop/drop cards and velocity skew/blur"
```

---

### Task 8: Horizontal Carousel section

**Files:**
- Create: `src/sections/carousel.js`
- Modify: `src/styles/layout.css`, `src/styles/motion.css`

**Interfaces:**
- Consumes: `projects` from `src/data.js`; `chooseCarouselMode`, `prefersReducedMotion` from `src/utils/motion.js`; `gsap`, `gsap/ScrollTrigger`.
- Produces: `mountCarousel(root)` → `{ el, destroy() }`.

- [ ] **Step 1: Implement `src/sections/carousel.js`**

```js
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { projects } from '../data.js'
import { chooseCarouselMode, prefersReducedMotion } from '../utils/motion.js'

function projectCardHtml(p) {
  return `
    <a class="project-card" href="${p.link}" target="_blank" rel="noopener noreferrer">
      <p class="project-meta">${p.meta}</p>
      <h3>${p.title}</h3>
      <p class="project-blurb">${p.blurb}</p>
      <ul class="project-tags">${p.tags.map((t) => `<li>${t}</li>`).join('')}</ul>
    </a>`
}

export function mountCarousel(root) {
  const section = document.createElement('section')
  section.id = 'work'
  section.className = 'section section-carousel'
  section.innerHTML = `
    <div class="horizontal-viewport-wrapper">
      <div class="horizontal-track">
        ${projects.map(projectCardHtml).join('')}
      </div>
    </div>
  `
  root.appendChild(section)

  const wrapper = section.querySelector('.horizontal-viewport-wrapper')
  const track = section.querySelector('.horizontal-track')
  let trigger = null

  function applyMode() {
    if (trigger) {
      trigger.kill()
      trigger = null
    }
    gsap.set(track, { x: 0 })

    const mode = chooseCarouselMode(window.innerWidth, prefersReducedMotion())
    if (mode === 'stack') {
      section.classList.add('stacked')
      wrapper.style.height = 'auto'
      return
    }

    section.classList.remove('stacked')
    wrapper.style.height = ''
    trigger = ScrollTrigger.create({
      trigger: wrapper,
      pin: true,
      scrub: 1,
      start: 'top top',
      end: () => `+=${track.scrollWidth}`,
      invalidateOnRefresh: true,
      animation: gsap.to(track, {
        x: () => -(track.scrollWidth - window.innerWidth),
        ease: 'none',
      }),
    })
  }

  applyMode()

  function onResize() {
    applyMode()
  }
  window.addEventListener('resize', onResize)

  function destroy() {
    if (trigger) trigger.kill()
    window.removeEventListener('resize', onResize)
    section.remove()
  }

  return { el: section, destroy }
}
```

- [ ] **Step 2: Add carousel styles**

Append to `src/styles/layout.css`:

```css
.section-carousel {
  padding: 0;
}

.horizontal-viewport-wrapper {
  height: 100svh;
  overflow: hidden;
}

.horizontal-track {
  height: 100%;
  display: flex;
  gap: var(--space-3);
  padding: var(--space-4) var(--space-3);
  width: max-content;
}

.project-card {
  display: block;
  width: min(80vw, 28rem);
  height: 100%;
  background: var(--bg-raised);
  border: 1px solid var(--border);
  border-radius: 0.5rem;
  padding: var(--space-3);
  text-decoration: none;
  color: inherit;
  flex-shrink: 0;
}

.project-meta {
  font-family: var(--font-mono);
  font-size: 0.8rem;
  color: var(--fg-muted);
}

.project-tags {
  margin-top: var(--space-2);
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
  list-style: none;
  font-family: var(--font-mono);
  font-size: 0.75rem;
  color: var(--fg-muted);
}

.project-tags li {
  border: 1px solid var(--border);
  border-radius: 999px;
  padding: 0.15rem 0.6rem;
}

.section-carousel.stacked .horizontal-viewport-wrapper {
  height: auto;
  overflow: visible;
}

.section-carousel.stacked .horizontal-track {
  flex-direction: column;
  width: 100%;
  height: auto;
}

.section-carousel.stacked .project-card {
  width: 100%;
  height: auto;
}
```

Append to `src/styles/motion.css`:

```css
@media (prefers-reduced-motion: reduce) {
  .section-carousel .horizontal-viewport-wrapper {
    height: auto !important;
    overflow: visible !important;
  }

  .section-carousel .horizontal-track {
    flex-direction: column !important;
    width: 100% !important;
    transform: none !important;
  }
}
```

- [ ] **Step 3: Wire into `main.js` temporarily and verify visually**

```js
// src/main.js (temporary — replaced fully in Task 10)
import './styles/base.css'
import './styles/layout.css'
import './styles/motion.css'
import { mountHero } from './sections/hero.js'
import { mountKinetic } from './sections/kinetic.js'
import { mountCarousel } from './sections/carousel.js'

const app = document.getElementById('app')
mountHero(app)
mountKinetic(app)
mountCarousel(app)
```

- [ ] **Step 4: Verify visually with Playwright MCP at desktop and mobile viewports**

Run: `npm run dev`, navigate via Playwright MCP.
- Desktop (`browser_resize` to 1440×900): scroll to the carousel section; confirm it pins and the three project cards translate horizontally as you scroll, ending back in normal flow after the last card.
- Mobile (`browser_resize` to 390×844): confirm the carousel renders as a normal vertical stack, no pin, all three cards readable.
- No console errors in either case.

- [ ] **Step 5: Commit**

```bash
git add src/sections/carousel.js src/styles/layout.css src/styles/motion.css src/main.js
git commit -m "Add Horizontal Carousel section with mobile/reduced-motion stack fallback"
```

---

### Task 9: Resolution section

**Files:**
- Create: `src/sections/resolution.js`
- Modify: `src/styles/layout.css`

**Interfaces:**
- Consumes: `identity` from `src/data.js`; `createParticleField` from `src/webgl/particleField.js`; `gsap`, `gsap/ScrollTrigger`.
- Produces: `mountResolution(root)` → `{ el, destroy() }`.

- [ ] **Step 1: Implement `src/sections/resolution.js`**

```js
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { identity } from '../data.js'
import { createParticleField } from '../webgl/particleField.js'

export function mountResolution(root) {
  const section = document.createElement('section')
  section.id = 'contact'
  section.className = 'section section-resolution'
  section.innerHTML = `
    <canvas class="resolution-canvas" aria-hidden="true"></canvas>
    <div class="resolution-copy">
      <p class="resolution-eyebrow">Let's talk</p>
      <h2>Reach out — <a href="mailto:${identity.email}">${identity.email}</a></h2>
      <div class="resolution-links">
        <a href="${identity.github}" target="_blank" rel="noopener noreferrer">GitHub</a>
        <a href="${identity.linkedin}" target="_blank" rel="noopener noreferrer">LinkedIn</a>
      </div>
    </div>
  `
  root.appendChild(section)

  const canvas = section.querySelector('.resolution-canvas')
  const field = createParticleField(canvas, {
    width: window.innerWidth,
    height: window.innerHeight,
  })

  let rafId = null
  let trigger = null
  const clock = { start: performance.now() }

  if (field) {
    const loop = () => {
      field.update((performance.now() - clock.start) / 1000)
      rafId = requestAnimationFrame(loop)
    }
    loop()

    const progress = { value: 0 }
    trigger = ScrollTrigger.create({
      trigger: section,
      start: 'top bottom',
      end: 'top center',
      scrub: true,
      onUpdate: (self) => {
        progress.value = self.progress
        field.setFormation(progress.value)
      },
    })
  } else {
    canvas.style.display = 'none'
    section.classList.add('no-webgl')
  }

  function onResize() {
    if (field) field.resize(window.innerWidth, window.innerHeight)
  }
  window.addEventListener('resize', onResize)

  function destroy() {
    if (rafId) cancelAnimationFrame(rafId)
    if (trigger) trigger.kill()
    window.removeEventListener('resize', onResize)
    window.removeEventListener('resize', onResize)
    if (field) field.destroy()
    section.remove()
  }

  return { el: section, destroy }
}
```

- [ ] **Step 2: Add resolution styles**

Append to `src/styles/layout.css`:

```css
.section-resolution {
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  overflow: hidden;
}

.resolution-canvas {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
}

.resolution-copy {
  position: relative;
  z-index: 1;
  max-width: 34rem;
}

.resolution-eyebrow {
  font-family: var(--font-mono);
  color: var(--fg-muted);
  text-transform: uppercase;
  letter-spacing: 0.08em;
  font-size: 0.8rem;
  margin-bottom: var(--space-2);
}

.resolution-copy h2 {
  font-family: var(--font-serif);
  font-size: clamp(1.75rem, 5vw, 3rem);
  line-height: 1.2;
}

.resolution-links {
  margin-top: var(--space-3);
  display: flex;
  gap: var(--space-3);
  justify-content: center;
  font-family: var(--font-mono);
}

.section-resolution.no-webgl {
  background: radial-gradient(circle at 50% 60%, var(--bg-raised), var(--bg));
}
```

- [ ] **Step 3: Wire into `main.js` temporarily and verify visually**

```js
// src/main.js (temporary — replaced fully in Task 10)
import './styles/base.css'
import './styles/layout.css'
import './styles/motion.css'
import { mountHero } from './sections/hero.js'
import { mountKinetic } from './sections/kinetic.js'
import { mountCarousel } from './sections/carousel.js'
import { mountResolution } from './sections/resolution.js'

const app = document.getElementById('app')
mountHero(app)
mountKinetic(app)
mountCarousel(app)
mountResolution(app)
```

- [ ] **Step 4: Verify visually with Playwright MCP**

Run: `npm run dev`, navigate via Playwright MCP, scroll to the bottom section.
Expected: particle field visibly converges from scattered to a loose grid as the section enters view; email/GitHub/LinkedIn links are present and point to the real values from `identity`; no console errors.

- [ ] **Step 5: Commit**

```bash
git add src/sections/resolution.js src/styles/layout.css src/main.js
git commit -m "Add Resolution section with particle convergence and contact CTA"
```

---

### Task 10: Final `main.js` wiring, skip link, and resize/reduced-motion integration

**Files:**
- Modify: `src/main.js`, `index.html`, `src/styles/base.css`

**Interfaces:**
- Consumes: `initScroll` from `src/scroll.js`; all four `mount*` functions from `src/sections/*.js`.
- Produces: the final application entry point — no further consumers within this codebase.

- [ ] **Step 1: Add the skip-to-content link to `index.html`**

```html
  <body>
    <a class="skip-link" href="#main-content">Skip to content</a>
    <div id="app"></div>
    <script type="module" src="/src/main.js"></script>
  </body>
</html>
```

- [ ] **Step 2: Write the final `src/main.js`**

```js
import './styles/base.css'
import './styles/layout.css'
import './styles/motion.css'
import { initScroll } from './scroll.js'
import { mountHero } from './sections/hero.js'
import { mountKinetic } from './sections/kinetic.js'
import { mountCarousel } from './sections/carousel.js'
import { mountResolution } from './sections/resolution.js'

const app = document.getElementById('app')
app.id = 'main-content'
app.tabIndex = -1

initScroll()

mountHero(app)
mountKinetic(app)
mountCarousel(app)
mountResolution(app)

window.addEventListener('load', () => {
  window.ScrollTrigger?.refresh?.()
})
```

- [ ] **Step 3: Confirm the skip link is keyboard-focusable and jumps to `#main-content`**

Run: `npm run dev`, navigate via Playwright MCP, press Tab once from page load (`browser_press_key` with `Tab`), take a screenshot.
Expected: the skip link becomes visible at the top-left on focus; activating it (Enter) moves focus to `#main-content`.

- [ ] **Step 4: Full-page smoke test**

Run the dev server, navigate via Playwright MCP to `http://localhost:5173`, scroll through the entire page (hero → kinetic → carousel → resolution), take a full-page screenshot.
Expected: all four sections render in order, scroll is smooth (Lenis active), no console errors at any point, `document.title` and meta description remain the real ones from `index.html`.

- [ ] **Step 5: Run the full unit test suite**

Run: `npm test`
Expected: all tests across `motion.test.js`, `data.test.js`, `scroll.test.js`, `particleField.test.js` pass.

- [ ] **Step 6: Commit**

```bash
git add src/main.js index.html src/styles/base.css
git commit -m "Wire full app entry point with skip link and resize/refresh handling"
```

---

### Task 11: Cross-device/reduced-motion verification pass and cleanup

**Files:**
- No new files. Verification-only task; fixes go into whichever file the issue lives in.

- [ ] **Step 1: Desktop full-page audit**

Via Playwright MCP: `browser_resize` to 1440×900, navigate to the site, scroll top to bottom, screenshot each section, check `browser_console_messages` (level: error) — expect none.

- [ ] **Step 2: Mobile full-page audit**

Via Playwright MCP: `browser_resize` to 390×844, repeat the same pass. Confirm the carousel is a vertical stack, hero/resolution particle counts are reduced (visually thinner field is acceptable — verify no layout overflow, no console errors).

- [ ] **Step 3: Reduced-motion audit**

Via Playwright MCP `browser_evaluate`, stub `window.matchMedia` for `(prefers-reduced-motion: reduce)` to return `matches: true` before navigation (or use the browser's built-in emulation if available), then reload and repeat the scroll pass. Confirm: no elastic/bounce overshoot on kinetic cards, no skew/blur during scroll, carousel is a vertical stack, resolution particle convergence is visually calmer (still acceptable since it's a scrub-tied transform, not a jarring entrance).

- [ ] **Step 4: Link verification**

Via Playwright MCP, confirm each rendered link's `href` matches the real data: `mailto:azizshamuratovv@gmail.com`, `https://github.com/azya11`, `https://www.linkedin.com/in/azizshamuratovv/`, and the three project links (`https://boxcores.com`, `https://mapgen-zeta.vercel.app/`, `https://watchdna.com/`).

- [ ] **Step 5: Remove stale docs references and confirm build**

Run: `npm run build`
Expected: production build succeeds with no errors; `dist/` contains the built assets.

Update `README.md` to describe the new stack (remove references to the old React/black-hole build):

```markdown
# Portfolio

A dark, minimal single-page portfolio built with **Vite + vanilla ES6**, using
**Lenis** (smooth scroll), **GSAP/ScrollTrigger** (motion + pinning), and
**Three.js** (WebGL particle field) across four sections: Hero, Kinetic
Distortion, Horizontal Carousel, and Resolution.

## Develop

\`\`\`bash
npm install
npm run dev      # http://localhost:5173
\`\`\`

## Test

\`\`\`bash
npm test
\`\`\`

## Build

\`\`\`bash
npm run build    # outputs to /dist
npm run preview  # preview the production build
\`\`\`

## Content

Edit `src/data.js` for identity, projects, experience, principles, and skills.
```

- [ ] **Step 6: Commit**

```bash
git add README.md
git commit -m "Update README for the vanilla-JS rebuild; final cross-device verification pass"
```

---

## Self-Review Notes

- **Spec coverage:** Sync pipeline (Task 4), Monolith/particle field (Tasks 5–6), Kinetic Distortion pop/drop + velocity skew/blur (Task 7), Horizontal Carousel pin/scrub + mobile stack (Task 8), Resolution convergence (Task 9), accessibility/reduced-motion/no-WebGL fallback (Tasks 5, 7, 8, 11), performance scaling (`particleCountForWidth`, Task 2/5), verification plan (Tasks 6, 7, 8, 9, 11), out-of-scope tooling explicitly not touched (no task installs Higgsfield/ccteams/Buildomator/Figma MCP). Content carried forward verbatim (Task 3). All spec sections are covered.
- **Placeholder scan:** no TBD/TODO markers; every step has runnable code or an exact command with expected output.
- **Type/interface consistency:** `mount*(root)` returns `{ el, destroy() }` consistently across `hero.js`, `kinetic.js`, `carousel.js`, `resolution.js`; `createParticleField` return shape (`update/setFormation/resize/destroy/count`) matches its two consumers (Tasks 6 and 9); `initScroll()` return shape (`{ lenis, destroy() }`) matches its one consumer (Task 10).
