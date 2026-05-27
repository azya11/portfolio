# Creative Portfolio

A dark, modern portfolio site built with **Vite + React + Three.js**, featuring an
interactive **3D black hole** (gravitational-lensing raymarch shader) as the hero
background, plus Work / About / Contact sections.

## Develop

```bash
npm install
npm run dev      # http://localhost:5173
```

## Build

```bash
npm run build    # outputs to /dist
npm run preview  # preview the production build
```

## Where to put your content (search for `PLACEHOLDER`)

| What | File |
|------|------|
| Name / logo, page title | `index.html`, `src/components/Nav.jsx` |
| Headline + intro | `src/components/Hero.jsx` |
| Projects (text, tags, images) | `src/components/Work.jsx` |
| Bio + skills + photo | `src/components/About.jsx` |
| Email + social links | `src/components/Contact.jsx` |
| Colors / theme | `src/index.css` (`:root` variables) |

**Images:** put files in `public/` (e.g. `public/projects/foo.jpg`) and reference
them as `/projects/foo.jpg`.

## Tuning the black hole

In `src/components/BlackHole.jsx`:
- `HORIZON`, `R_IN`, `R_OUT` — event horizon & accretion-disk radii.
- `uQuality` (raymarch steps) and `dpr` — raise for fidelity, lower for performance.
- `diskTemp()` — the disk color gradient.
