import { useTilt } from '../hooks.js'

// Featured projects. image: '/projects/foo.jpg' (drop the file in /public/projects).
const projects = [
  {
    title: 'Mapgen',
    meta: 'Personal Project · 2026',
    blurb:
      'An AI pipeline that turns a natural-language prompt into a renderable 3D map. Claude tool-use parses the description into a validated scene spec, then real places are geocoded and built from live OpenStreetMap footprints + elevation data into a 3D scene you can export as GLB, OBJ, or STL — served by a hardened FastAPI app with Argon2 auth and CSRF protection.',
    tags: ['Python', 'FastAPI', 'Claude API', 'Three.js', 'OpenStreetMap'],
    image: '/projects/mapgen.png',
    link: 'https://mapgen-zeta.vercel.app/',
  },
  {
    title: 'WatchDNA',
    meta: 'Team Lead · AI + AR Capstone · 2025–2026',
    blurb:
      'AI + AR capstone. Elected Team Lead — ran the Scrum process, owned the TypeScript backend and every user story, documented endpoints with Swagger, and containerized the whole stack with Docker + Kubernetes behind a CI/CD pipeline.',
    tags: ['Python', 'PyTorch', 'TypeScript', 'Docker', 'Kubernetes'],
    image: '/projects/watchdna.png',
    link: 'https://watchdna.com/',
  },
  {
    title: 'Frienvas',
    meta: 'Personal Project · 2025–2026',
    blurb:
      'A Chrome extension that lets students form friend groups and share Canvas LMS deadlines in real time. Privacy-first by design: credentials stay on-device while a Manifest V3 service worker syncs deadlines every 30 minutes.',
    tags: ['JavaScript', 'Firebase', 'Vite', 'Chrome Extensions'],
    image: '/projects/frienvas.png',
    fit: 'contain',
    link: null,
  },
  {
    title: 'QR Payment Platform',
    meta: 'TAS Group · Production · 2023–2025',
    blurb:
      'Production payment & B2B backend serving 70k+ active users. Built 6–10 microservices exposing REST/SOAP APIs at hundreds of requests per second, backed by Kafka, RabbitMQ, and tuned MS SQL / PostgreSQL.',
    tags: ['C#', '.NET', 'Kafka', 'RabbitMQ', 'MS SQL'],
    image: '/projects/qr-payments.jpg',
    link: null,
  },
]

function ProjectCard({ p, i }) {
  const tilt = useTilt(6)
  const Tag = p.link ? 'a' : 'article'
  const linkProps = p.link ? { href: p.link, target: '_blank', rel: 'noreferrer' } : {}
  const thumbStyle =
    p.image && p.fit === 'contain'
      ? { backgroundImage: `url(${p.image})`, backgroundSize: '58%', backgroundPosition: 'center', backgroundRepeat: 'no-repeat' }
      : p.image
        ? { background: `center/cover no-repeat url(${p.image})` }
        : undefined

  return (
    <Tag
      ref={tilt}
      className={`work-card reveal${p.link ? ' is-link' : ''}`}
      style={{ transitionDelay: `${i * 70}ms` }}
      {...linkProps}
    >
      <div className="work-thumb" style={thumbStyle}>
        <span className="work-num">{String(i + 1).padStart(2, '0')}</span>
      </div>
      <div className="work-body">
        <div className="work-meta">{p.meta}</div>
        <h3>
          {p.title}
          {p.link && <span className="ext">↗</span>}
        </h3>
        <p>{p.blurb}</p>
        <div className="tags">
          {p.tags.map((t) => (
            <span className="tag" key={t}>{t}</span>
          ))}
        </div>
      </div>
    </Tag>
  )
}

export default function Work() {
  return (
    <section className="section-pad solid-bg" id="work">
      <div className="container">
        <div className="section-head reveal">
          <div className="section-kicker">
            <span className="idx">01</span>
            <span>Selected Work</span>
            <span className="rule" />
          </div>
          <h2 className="section-title">
            Things I’ve <em>built</em>
          </h2>
          <p className="section-intro">
            From an AI/AR capstone to a production payment platform serving tens of
            thousands of people — a few systems I’ve shipped end to end.
          </p>
        </div>
        <div className="work-grid">
          {projects.map((p, i) => (
            <ProjectCard p={p} i={i} key={p.title} />
          ))}
        </div>
      </div>
    </section>
  )
}
