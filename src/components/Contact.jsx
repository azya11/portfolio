import { identity } from '../data/content.js'
import { useMagnetic } from '../lib/hooks.js'
import { Reveal, RevealLine } from './Reveal.jsx'
import Section from './Section.jsx'

const socials = [
  { label: 'GitHub', href: identity.github },
  { label: 'LinkedIn', href: identity.linkedin },
  { label: 'Email', href: `mailto:${identity.email}` },
  { label: 'Phone', href: `tel:${identity.phone}` },
]

export default function Contact() {
  const email = useMagnetic(0.2)
  return (
    <Section className="section contact" id="contact">
      <div className="container">
        <div className="kicker kicker-center">
          <span className="kicker-idx">06</span>
          <span>200</span>
        </div>

        <h2 className="contact-title">
          <RevealLine>Let’s build something</RevealLine>
          <RevealLine delay={0.08}>
            <em>worth shipping.</em>
          </RevealLine>
        </h2>

        <Reveal as="p" className="section-intro contact-intro" dir="left">
          <span className="hl">
            I’m open to software engineering roles and collaborations starting summer
            2026. If you’re working on something hard, I’d love to hear about it.
          </span>
        </Reveal>

        <Reveal dir="right">
          <a className="email-link" href={`mailto:${identity.email}`} ref={email}>
            <span className="hl">{identity.email}</span>
          </a>
        </Reveal>

        <Reveal as="p" className="availability" dir="left">
          Usually replies within a day · {identity.location} (MST)
        </Reveal>

        <Reveal className="socials" dir="right">
          {socials.map((s) => (
            <a key={s.label} href={s.href} target="_blank" rel="noreferrer">
              {s.label}
            </a>
          ))}
        </Reveal>
      </div>
    </Section>
  )
}
