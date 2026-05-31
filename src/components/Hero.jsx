import { useRotatingText, useCountUp, useMagnetic } from '../hooks.js'

function Stat({ value, suffix, label, decimals }) {
  const [ref, display] = useCountUp(value, { decimals })
  return (
    <div className="stat">
      <div className="num" ref={ref}>
        {display}
        {suffix && <span className="suffix">{suffix}</span>}
      </div>
      <div className="label">{label}</div>
    </div>
  )
}

export default function Hero() {
  const roleRef = useRotatingText([
    'backend systems',
    'RESTful APIs',
    'CI/CD pipelines',
    'event-driven services',
    'full-stack products',
  ])
  const primary = useMagnetic(0.3)
  const ghost = useMagnetic(0.3)

  return (
    <section className="hero" id="top">
      <div className="container">
        <div className="hero-card">
          <span className="status">
            <span className="live" />
            Available · May 2026 grad
          </span>
          <p className="coords">33.4255° N, 111.9400° W — Tempe, Arizona</p>
          <h1>
            Aziz <span className="grad">Shamuratov</span>
          </h1>
          <div className="role-line">
            <span className="arrow">{'>'}</span>
            <span>I build</span>
            <span className="rot" ref={roleRef} />
            <span className="caret" />
          </div>
          <p className="lead">
            Software developer with <strong>3 years</strong> shipping production
            backends and full-stack features across <strong>React</strong>,{' '}
            <strong>Node.js</strong>, and <strong>.NET</strong>. I like the
            invisible work — clean APIs, real test coverage, and pipelines that
            let a team move fast without breaking things.
          </p>
          <div className="cta-row">
            <a className="btn primary" href="#work" ref={primary}>
              View work <span className="ic">↗</span>
            </a>
            <a className="btn ghost" href="#contact" ref={ghost}>
              Get in touch
            </a>
            <div className="hero-quicklinks">
              <a href="https://github.com/azya11" target="_blank" rel="noreferrer">GitHub</a>
              <a href="https://linkedin.com/in/aziz-shamuratov-236575259" target="_blank" rel="noreferrer">LinkedIn</a>
            </div>
          </div>
          <div className="hero-stats">
            <Stat value={70} suffix="k+" label="Users served" />
            <Stat value={3} suffix="yrs" label="Experience" />
            <Stat value={10} suffix="+" label="Microservices" />
            <Stat value={85} suffix="%" label="Test coverage" />
          </div>
        </div>
      </div>
      <div className="scroll-hint">
        <span>scroll</span>
        <span className="track" />
      </div>
    </section>
  )
}
