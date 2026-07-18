import { lazy, Suspense, useRef } from 'react'
import { motion } from 'framer-motion'
import { identity, rotatingRoles, stats, lead } from '../data/content.js'
import { useRotatingText, useCountUp, useMagnetic } from '../lib/hooks.js'
import { useMediaPrefs } from '../lib/useMediaPrefs.js'
import Section from './Section.jsx'

const GridField = lazy(() => import('./GridField.jsx'))

const EASE = [0.16, 1, 0.3, 1]
const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.09, delayChildren: 0.05 } },
}
const item = {
  hidden: { opacity: 0, y: 26 },
  show: { opacity: 1, y: 0, transition: { duration: 0.9, ease: EASE } },
}

function Stat({ value, suffix, label, start }) {
  const [ref, display] = useCountUp(value, { start })
  return (
    <div className="stat">
      <div className="stat-num" ref={ref}>
        {display}
        {suffix && <span className="stat-suffix">{suffix}</span>}
      </div>
      <div className="stat-label">{label}</div>
    </div>
  )
}

export default function Hero({ ready }) {
  const { reducedMotion, isTouch } = useMediaPrefs()
  const interactive = !reducedMotion && !isTouch
  const roleRef = useRotatingText(rotatingRoles)
  const primary = useMagnetic(0.25)
  const ghost = useMagnetic(0.25)
  const state = reducedMotion || ready ? 'show' : 'hidden'

  return (
    <Section className="hero" id="top" pin={false}>
      <div className="hero-glow" aria-hidden="true" />
      {interactive ? (
        <Suspense fallback={<div className="hero-grid-fallback" aria-hidden="true" />}>
          <GridField />
        </Suspense>
      ) : (
        <div className="hero-grid-fallback" aria-hidden="true" />
      )}
      <span className="hero-rail" aria-hidden="true">
        {identity.title} · {identity.year}
      </span>

      <motion.div
        className="container hero-inner"
        variants={container}
        initial={reducedMotion ? 'show' : 'hidden'}
        animate={state}
      >
        <motion.div className="hero-top" variants={item}>
          <span className="status">
            <span className="live" />
            {identity.availability}
          </span>
          <span className="coords">
            {identity.coords} — {identity.location}
          </span>
        </motion.div>

        <h1 className="hero-title">
          <motion.span className="line" variants={item}>
            Aziz
          </motion.span>
          <motion.span className="line" variants={item}>
            <em>Shamuratov</em>
          </motion.span>
        </h1>

        <motion.div className="role-line" variants={item}>
          <span className="arrow">{'>'}</span>
          <span>I build</span>
          <span className="rot" ref={roleRef} />
          <span className="caret" />
        </motion.div>

        <motion.p className="hero-lead" variants={item}>
          <span className="hl">{lead}</span>
        </motion.p>

        <motion.div className="cta-row" variants={item}>
          <a className="btn btn-primary" href="#work" ref={primary}>
            View work <span className="btn-ic">↗</span>
          </a>
          <a className="btn btn-ghost" href="#contact" ref={ghost}>
            Get in touch
          </a>
          <div className="hero-quicklinks">
            <a href={identity.github} target="_blank" rel="noreferrer">
              GitHub
            </a>
            <a href={identity.linkedin} target="_blank" rel="noreferrer">
              LinkedIn
            </a>
          </div>
        </motion.div>

        <motion.div className="hero-stats" variants={item}>
          {stats.map((s) => (
            <Stat key={s.label} {...s} start={reducedMotion || ready} />
          ))}
        </motion.div>
      </motion.div>
    </Section>
  )
}
