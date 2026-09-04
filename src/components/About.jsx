import { aboutParagraphs, aboutBadge } from '../data/content.js'
import { skillGroups } from '../data/skills.js'
import { useParallax } from '../lib/hooks.js'
import { Reveal, RevealLine } from './Reveal.jsx'
import Section from './Section.jsx'

export default function About() {
  const photoInner = useParallax(0.08)

  return (
    <Section id="core">
      <div className="container">
        <div className="section-head">
          <div className="kicker">
            <span className="kicker-idx">05</span>
            <span>Core</span>
            <span className="kicker-rule" />
          </div>
          <h2 className="section-title">
            <RevealLine>A bit about</RevealLine>{' '}
            <RevealLine delay={0.08}>
              <em>me</em>
            </RevealLine>
          </h2>
        </div>

        <div className="about-grid">
          <Reveal className="about-photo-wrap" dir="left">
            <div className="about-photo">
              <div
                className="about-photo-img"
                ref={photoInner}
                style={{ backgroundImage: 'url(/me.jpg)' }}
                role="img"
                aria-label="Photo of Aziz Shamuratov"
              />
            </div>
            <div className="about-badge">{aboutBadge}</div>
          </Reveal>

          <Reveal className="about-text" dir="right">
            <p className="about-pull">
              <span className="hl">{aboutParagraphs[1]}</span>
            </p>
            {[aboutParagraphs[0], aboutParagraphs[2], aboutParagraphs[3]].map((p, i) => (
              <p key={i}>{p}</p>
            ))}

            <div className="skill-groups">
              {skillGroups.map((g) => (
                <div className="skill-group" key={g.label}>
                  <div className="skill-label">{g.label}</div>
                  <div className="skill-row">
                    {g.items.map((s) => (
                      <span className="tag" key={s}>
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </div>
    </Section>
  )
}
