// Featured projects. `image` points at /public/projects/* (kept from the old build);
// when null/missing, the gallery renders a gradient placeholder block.

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
  {
    title: 'Frienvas',
    meta: 'Personal Project · 2025–2026',
    blurb:
      'A Chrome extension that lets students form friend groups and share Canvas LMS deadlines in ' +
      'real time. Privacy-first by design: credentials stay on-device while a Manifest V3 service ' +
      'worker syncs deadlines every 30 minutes.',
    tags: ['JavaScript', 'Firebase', 'Vite', 'Chrome Extensions'],
    image: '/projects/frienvas.png',
    link: null,
  },
]
