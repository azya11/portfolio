import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { useMediaPrefs } from '../lib/useMediaPrefs.js'
import { useSectionState } from './Section.jsx'

const EASE = [0.16, 1, 0.3, 1]

/**
 * Driven by the parent Section's state. While 'below' the block waits a full
 * viewport-width off its side; when the section becomes 'active' it slides in
 * and settles centered; when 'above' it lifts up and fades out. `order` adds a
 * small stagger so items in a section cascade. Honors reduced-motion (static).
 */
export function Reveal({
  as = 'div',
  dir = 'left',
  order = 0,
  className,
  children,
  // accepted for call-site compatibility
  distance,
  delay,
  y: _y,
  duration,
  amount,
  ...rest
}) {
  const { reducedMotion } = useMediaPrefs()
  const state = useSectionState()
  const [vw, setVw] = useState(() => (typeof window !== 'undefined' ? window.innerWidth : 1280))
  useEffect(() => {
    const onResize = () => setVw(window.innerWidth)
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  if (reducedMotion) {
    const Tag = as
    return (
      <Tag className={className} {...rest}>
        {children}
      </Tag>
    )
  }

  const fromX = dir === 'right' ? vw : -vw
  const variants = {
    below: { x: fromX, y: 0, opacity: 1 },
    active: { x: 0, y: 0, opacity: 1 },
    above: { x: 0, y: -130, opacity: 0 },
  }
  const M = motion[as] || motion.div
  return (
    <M
      className={className}
      variants={variants}
      initial="below"
      animate={state}
      transition={{
        type: 'spring',
        stiffness: 72,
        damping: 18,
        mass: 0.9,
        delay: state === 'active' ? order * 0.08 : 0,
      }}
      {...rest}
    >
      {children}
    </M>
  )
}

/** Masked line reveal for headings, also driven by section state. */
export function RevealLine({ children, delay = 0, className }) {
  const { reducedMotion } = useMediaPrefs()
  const state = useSectionState()
  if (reducedMotion) return <span className={className}>{children}</span>
  return (
    <span style={{ display: 'block', overflow: 'hidden' }} className={className}>
      <motion.span
        style={{ display: 'block' }}
        variants={{ below: { y: '110%' }, active: { y: '0%' }, above: { y: '-110%' } }}
        initial="below"
        animate={state}
        transition={{ duration: 0.8, ease: EASE, delay: state === 'active' ? delay : 0 }}
      >
        {children}
      </motion.span>
    </span>
  )
}
