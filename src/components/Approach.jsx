import { principles } from '../data/content.js'
import { Reveal, RevealLine } from './Reveal.jsx'
import Section from './Section.jsx'

export default function Approach() {
  return (
    <Section id="middleware">
      <div className="container">
        <div className="section-head">
          <div className="kicker">
            <span className="kicker-idx">02</span>
            <span>Middleware</span>
            <span className="kicker-rule" />
          </div>
          <h2 className="section-title">
            <RevealLine>How I</RevealLine>{' '}
            <RevealLine delay={0.06}>
              <em>think</em>
            </RevealLine>{' '}
            <RevealLine delay={0.12}>about building</RevealLine>
          </h2>
          <Reveal as="p" className="section-intro" dir="left">
            The rules every request passes through before it's handled — a few
            principles I keep coming back to.
          </Reveal>
        </div>

        <div className="principles-grid">
          {principles.map((p, i) => (
            <Reveal as="article" className="principle" key={p.title} dir={i % 2 ? 'right' : 'left'} order={i}>
              <span className="principle-num">{String(i + 1).padStart(2, '0')}</span>
              <h3>{p.title}</h3>
              <p>{p.body}</p>
            </Reveal>
          ))}
        </div>
      </div>
    </Section>
  )
}
