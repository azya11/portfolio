import { motion } from 'framer-motion'
import { useMediaPrefs } from '../lib/useMediaPrefs.js'

const EASE = [0.16, 1, 0.3, 1]

/**
 * Scroll-in reveal. Fades + lifts its children once they enter the viewport.
 * Honors reduced-motion (renders immediately, no transform). Set `stagger` to
 * cascade direct children that carry the `data-rc` attribute.
 */
export function Reveal({
  as = 'div',
  children,
  delay = 0,
  y = 28,
  duration = 0.9,
  amount = 0.25,
  className,
  ...rest
}) {
  const { reducedMotion } = useMediaPrefs()
  const M = motion[as] || motion.div

  if (reducedMotion) {
    const Tag = as
    return (
      <Tag className={className} {...rest}>
        {children}
      </Tag>
    )
  }

  return (
    <M
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount }}
      transition={{ duration, ease: EASE, delay }}
      {...rest}
    >
      {children}
    </M>
  )
}

/**
 * Masked line reveal for headings: the text rises out of a clipped box.
 */
export function RevealLine({ children, delay = 0, className }) {
  const { reducedMotion } = useMediaPrefs()
  if (reducedMotion) return <span className={className}>{children}</span>
  return (
    <span style={{ display: 'block', overflow: 'hidden' }} className={className}>
      <motion.span
        style={{ display: 'block' }}
        initial={{ y: '110%' }}
        whileInView={{ y: '0%' }}
        viewport={{ once: true, amount: 0.6 }}
        transition={{ duration: 0.9, ease: EASE, delay }}
      >
        {children}
      </motion.span>
    </span>
  )
}
