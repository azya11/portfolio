import { createContext, useContext, useEffect, useRef, useState } from 'react'
import { useFit } from '../lib/useFit.js'

/**
 * Section state shared with the content inside:
 *  - 'below'  : not yet reached (waiting off-frame)
 *  - 'active' : centered in the viewport (the current "state")
 *  - 'above'  : scrolled past (lifted away)
 */
const SectionStateContext = createContext('active')
export const useSectionState = () => useContext(SectionStateContext)

export default function Section({ id, className = 'section', fit = true, children, ...rest }) {
  const ref = useRef(null)
  const fitRef = useRef(null)
  const [state, setState] = useState('below')

  // Broadcast active/above/below based on viewport center.
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) setState('active')
        else setState(e.boundingClientRect.top < 0 ? 'above' : 'below')
      },
      { rootMargin: '-45% 0px -45% 0px', threshold: 0 },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [])

  // Scale content down if it would overflow the pane, so a section's full data
  // always fits the frame (never clipped).
  useFit(fitRef, fit)

  const inner = fit ? (
    <div className="section-fit" ref={fitRef}>
      {children}
    </div>
  ) : (
    children
  )

  return (
    <section ref={ref} id={id} className={className} data-section {...rest}>
      <SectionStateContext.Provider value={state}>{inner}</SectionStateContext.Provider>
    </section>
  )
}
