import { roles } from '../data/experience.js'
import { Reveal, RevealLine } from './Reveal.jsx'
import Section from './Section.jsx'

export default function Experience() {
  return (
    <Section id="compute">
      <div className="container">
        <div className="section-head">
          <div className="kicker">
            <span className="kicker-idx">03</span>
            <span>Compute</span>
            <span className="kicker-rule" />
          </div>
          <h2 className="section-title">
            <RevealLine>Where I’ve</RevealLine>{' '}
            <RevealLine delay={0.08}>
              <em>worked</em>
            </RevealLine>
          </h2>
          <Reveal as="p" className="section-intro" dir="left">
            The processing log — where the work actually happened.
          </Reveal>
        </div>

        <div className="timeline">
          {roles.map((r, i) => (
            <Reveal as="article" className="xp" key={r.company} dir={i % 2 ? 'right' : 'left'} order={i}>
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
    </Section>
  )
}
