import { useSectionState } from './Section.jsx'
import { useMediaPrefs } from '../lib/useMediaPrefs.js'

/**
 * Driven by the parent Section's { progress, active }. `order` staggers
 * multiple Reveals in the same section by giving each a later start point
 * inside the section's 0..1 progress window. Honors reduced-motion (static).
 */
export function Reveal({ as = 'div', dir = 'left', order = 0, className, children, ...rest }) {
  const { reducedMotion } = useMediaPrefs()
  const { progress, active } = useSectionState()
  const Tag = as

  if (reducedMotion) {
    return (
      <Tag className={className} {...rest}>
        {children}
      </Tag>
    )
  }

  const start = Math.min(0.6, order * 0.12)
  const local = Math.max(0, Math.min(1, (progress - start) / (1 - start)))
  const eased = 1 - Math.pow(1 - local, 3)
  const shiftPx = dir === 'right' ? 60 : -60

  const style = {
    opacity: active ? eased : 0,
    transform: `translateX(${active ? (1 - eased) * shiftPx : shiftPx}px)`,
  }

  return (
    <Tag className={className} style={style} {...rest}>
      {children}
    </Tag>
  )
}

/** Masked line reveal for headings, also driven by section progress. */
export function RevealLine({ children, delay = 0, className }) {
  const { reducedMotion } = useMediaPrefs()
  const { progress, active } = useSectionState()
  if (reducedMotion) return <span className={className}>{children}</span>

  const start = Math.min(0.5, delay)
  const local = Math.max(0, Math.min(1, (progress - start) / (1 - start)))
  const eased = 1 - Math.pow(1 - local, 3)
  const y = active ? (1 - eased) * 110 : 110

  return (
    <span style={{ display: 'block', overflow: 'hidden' }} className={className}>
      <span style={{ display: 'block', transform: `translateY(${y}%)` }}>{children}</span>
    </span>
  )
}
