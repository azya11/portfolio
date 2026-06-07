import { useState } from 'react'
import { motion, AnimatePresence, useMotionValue, useSpring } from 'framer-motion'
import { projects } from '../data/projects.js'
import { useMediaPrefs } from '../lib/useMediaPrefs.js'
import { Reveal, RevealLine } from './Reveal.jsx'
import Section from './Section.jsx'

const EASE = [0.16, 1, 0.3, 1]

function SectionHead() {
  return (
    <div className="section-head">
      <div className="kicker">
        <span className="kicker-idx">01</span>
        <span>Selected Work</span>
        <span className="kicker-rule" />
      </div>
      <h2 className="section-title">
        <RevealLine>Things I’ve</RevealLine>{' '}
        <RevealLine delay={0.08}>
          <em>built</em>
        </RevealLine>
      </h2>
      <Reveal as="p" className="section-intro" dir="left">
        <span className="hl">
          From an AI/AR capstone to a production payment platform serving tens of
          thousands of people — a few systems I’ve shipped end to end.
        </span>
      </Reveal>
    </div>
  )
}

function Thumb({ p }) {
  if (p.image) {
    return <img src={p.image} alt={p.title} loading="lazy" />
  }
  return <div className="thumb-placeholder">{p.title}</div>
}

/* Desktop: hover-reveal list with a cursor-following image preview. */
function GalleryList() {
  const [active, setActive] = useState(null)
  const mx = useMotionValue(0)
  const my = useMotionValue(0)
  const x = useSpring(mx, { stiffness: 240, damping: 28, mass: 0.5 })
  const y = useSpring(my, { stiffness: 240, damping: 28, mass: 0.5 })

  const onMove = (e) => {
    mx.set(e.clientX)
    my.set(e.clientY)
  }

  return (
    <div className="work-gallery" onMouseMove={onMove} onMouseLeave={() => setActive(null)}>
      <ul className="work-list">
        {projects.map((p, i) => {
          const Tag = p.link ? 'a' : 'div'
          const linkProps = p.link
            ? { href: p.link, target: '_blank', rel: 'noreferrer' }
            : {}
          return (
            <li key={p.title}>
              <Reveal dir={i % 2 ? 'right' : 'left'} order={i}>
                <Tag
                  className={`work-row${active === i ? ' is-active' : ''}${p.link ? ' is-link' : ''}`}
                  onMouseEnter={() => setActive(i)}
                  {...linkProps}
                >
                  <span className="work-idx">{String(i + 1).padStart(2, '0')}</span>
                  <span className="work-title">
                    {p.title}
                    {p.link && <span className="work-ext">↗</span>}
                  </span>
                  <span className="work-meta">{p.meta}</span>
                  <span className="work-tags">
                    {p.tags.slice(0, 3).map((t) => (
                      <span className="tag" key={t}>
                        {t}
                      </span>
                    ))}
                  </span>
                </Tag>
              </Reveal>
            </li>
          )
        })}
      </ul>

      <motion.div className="work-preview" style={{ x, y }} aria-hidden="true">
        <div className="work-preview-offset">
          <AnimatePresence mode="popLayout">
            {active !== null && (
              <motion.div
                key={active}
                className="work-preview-card"
                initial={{ clipPath: 'inset(100% 0 0 0)', opacity: 0.4, scale: 1.06 }}
                animate={{ clipPath: 'inset(0% 0 0 0)', opacity: 1, scale: 1 }}
                exit={{ clipPath: 'inset(0 0 100% 0)', opacity: 0 }}
                transition={{ duration: 0.5, ease: EASE }}
              >
                <Thumb p={projects[active]} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  )
}

/* Touch / reduced-motion: simple card grid with visible images. */
function CardGrid() {
  return (
    <div className="work-cards">
      {projects.map((p, i) => {
        const Tag = p.link ? 'a' : 'article'
        const linkProps = p.link
          ? { href: p.link, target: '_blank', rel: 'noreferrer' }
          : {}
        return (
          <Reveal key={p.title} dir={i % 2 ? 'right' : 'left'} order={i}>
            <Tag className={`work-card${p.link ? ' is-link' : ''}`} {...linkProps}>
              <div className="work-card-thumb">
                <Thumb p={p} />
              </div>
              <div className="work-card-body">
                <span className="work-meta">{p.meta}</span>
                <h3>
                  {p.title}
                  {p.link && <span className="work-ext">↗</span>}
                </h3>
                <p>{p.blurb}</p>
                <div className="work-tags">
                  {p.tags.map((t) => (
                    <span className="tag" key={t}>
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            </Tag>
          </Reveal>
        )
      })}
    </div>
  )
}

export default function Work() {
  const { isTouch } = useMediaPrefs()
  return (
    <Section id="work">
      <div className="container">
        <SectionHead />
        {isTouch ? <CardGrid /> : <GalleryList />}
      </div>
    </Section>
  )
}
