// Featured projects. `image` points at /public/projects/* (kept from the old build);
// when null/missing, the gallery renders a gradient placeholder block.

export const projects = [
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
  {
    title: 'QR Payment Platform',
    meta: 'TAS Group · Production · 2023–2025',
    blurb:
      'Production payment & B2B backend serving 70k+ active users. Built 6–10 microservices ' +
      'exposing REST/SOAP APIs at hundreds of requests per second, backed by Kafka, RabbitMQ, ' +
      'and tuned MS SQL / PostgreSQL.',
    tags: ['C#', '.NET', 'Kafka', 'RabbitMQ', 'MS SQL'],
    image: '/projects/qr-payments.jpg',
    link: null,
  },
]
