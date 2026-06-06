import { roles } from '../data/experience.js'
import { Reveal, RevealLine } from './Reveal.jsx'

export default function Experience() {
  return (
    <section className="section" id="experience">
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

        <div className="timeline">
          {roles.map((r, i) => (
            <Reveal as="article" className="xp" key={r.company} dir={i % 2 ? 'right' : 'left'}>
              <div className="xp-line" aria-hidden="true" />
              <div className="xp-head">
                <h3>
                  {r.role} <span className="xp-company">· {r.company}</span>
                </h3>
                <span className="xp-date">
                  {r.date} · {r.place}
                </span>
              </div>
              <p className="xp-summary">{r.summary}</p>
              <ul>
                {r.points.map((p, j) => (
                  <li key={j} dangerouslySetInnerHTML={{ __html: p }} />
                ))}
              </ul>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
