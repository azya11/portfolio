// Featured projects. To add a screenshot, set image: '/projects/foo.jpg'
// (drop the file in /public/projects) and optionally link/repo URLs.
const projects = [
  {
    title: 'WatchDNA',
    blurb:
      'AI + AR capstone project. Elected Team Lead — ran the Scrum process, owned the TypeScript backend and all user stories, exposed endpoints via Swagger, and containerized the stack with Docker + Kubernetes behind a CI/CD pipeline.',
    tags: ['Python', 'PyTorch', 'TypeScript', 'Docker', 'Kubernetes'],
    meta: 'Team Lead · 2025–2026',
    image: '/projects/watchdna.png',
    link: 'https://watchdna.com/',
  },
  {
    title: 'Frienvas',
    blurb:
      'A Chrome extension that lets students form friend groups and share Canvas LMS assignment deadlines in real time. Privacy-first design keeps credentials on-device; a Manifest V3 service worker syncs deadlines every 30 minutes.',
    tags: ['JavaScript', 'Firebase', 'Vite', 'Chrome Extensions API'],
    meta: 'Personal Project · 2025–2026',
    image: '/projects/frienvas.png',
    fit: 'contain',
    link: null,
  },
  {
    title: 'QR Payment Platform',
    blurb:
      'Production payment & B2B backend at TAS Group serving 70k+ active users. Built 6–10 microservices with REST/SOAP APIs handling hundreds of req/s, backed by Kafka, RabbitMQ, and tuned MS SQL / PostgreSQL.',
    tags: ['C#', '.NET', 'Kafka', 'RabbitMQ', 'MS SQL'],
    meta: 'TAS Group · 2023–2025',
    image: '/projects/qr-payments.jpg',
    link: null,
  },
]

export default function Work() {
  return (
    <section className="section-pad solid-bg" id="work">
      <div className="container">
        <div className="reveal">
          <div className="eyebrow">Selected Work</div>
          <h2 className="section-title">Projects</h2>
          <p className="section-intro">
            A few things I’ve built — from an AI/AR capstone to a production payment
            platform serving tens of thousands of users.
          </p>
        </div>
        <div className="work-grid">
          {projects.map((p, i) => {
            const Tag = p.link ? 'a' : 'article'
            const linkProps = p.link
              ? { href: p.link, target: '_blank', rel: 'noreferrer' }
              : {}
            return (
              <Tag
                className={`work-card reveal${p.link ? ' is-link' : ''}`}
                key={i}
                style={{ transitionDelay: `${i * 60}ms` }}
                {...linkProps}
              >
                <div
                  className="work-thumb"
                  style={
                    p.image && p.fit === 'contain'
                      ? { backgroundImage: `url(${p.image})`, backgroundSize: '62%', backgroundPosition: 'center', backgroundRepeat: 'no-repeat' }
                      : p.image
                        ? { background: `center/cover no-repeat url(${p.image})` }
                        : undefined
                  }
                >
                  {!p.image && p.meta}
                </div>
                <div className="work-body">
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
          })}
        </div>
      </div>
    </section>
  )
}
