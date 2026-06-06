import { createContext, useContext, useEffect, useRef, useState } from 'react'

/**
 * Section state shared with the content inside:
 *  - 'below'  : not yet reached (waiting off-frame)
 *  - 'active' : centered in the viewport (the current "state")
 *  - 'above'  : scrolled past (lifted away)
 * Reveal/RevealLine read this so a whole section animates in/out together.
 */
const SectionStateContext = createContext('active')
export const useSectionState = () => useContext(SectionStateContext)

export default function Section({ id, className = 'section', children, ...rest }) {
  const ref = useRef(null)
  const [state, setState] = useState('below')

  useEffect(() => {
    const el = ref.current
    if (!el) return
    // active once the section overlaps the central band of the viewport
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

  return (
    <section ref={ref} id={id} className={className} data-section {...rest}>
      <SectionStateContext.Provider value={state}>{children}</SectionStateContext.Provider>
    </section>
  )
}
