import { createContext, useContext, useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useMediaPrefs } from '../lib/useMediaPrefs.js'

gsap.registerPlugin(ScrollTrigger)

/**
 * Section state shared with the content inside:
 *  - progress: 0..1. On desktop (pinned + scrubbed) this tracks real scroll
 *    position through the pin. On mobile/non-pinned it sweeps 0..1 once, on
 *    a short eased tween, when the section enters the viewport.
 *  - active: true while this is the current chapter.
 */
const SectionStateContext = createContext({ progress: 1, active: true })
export const useSectionState = () => useContext(SectionStateContext)

export default function Section({ id, className = 'section', pin = true, children, ...rest }) {
  const ref = useRef(null)
  const wasActive = useRef(false)
  const [state, setState] = useState({ progress: 0, active: false })
  const { reducedMotion, isTouch } = useMediaPrefs()
  const scrub = pin && !isTouch

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const setActive = (active, progress) => {
      if (active && !wasActive.current) {
        window.dispatchEvent(new CustomEvent('chapter:active', { detail: id }))
      }
      wasActive.current = active
      setState({ progress, active })
    }

    if (reducedMotion) {
      setActive(true, 1)
      return
    }

    const ctx = gsap.context(() => {
      if (scrub) {
        ScrollTrigger.create({
          trigger: el,
          start: 'top top',
          end: '+=100%',
          pin: true,
          scrub: 0.4,
          onUpdate: (self) => setActive(true, self.progress),
          onLeave: () => setActive(false, 1),
          onEnterBack: () => setActive(true, 1),
          onLeaveBack: () => setActive(false, 0),
        })
      } else {
        const proxy = { p: 0 }
        let tween
        const enter = () => {
          tween?.kill()
          tween = gsap.to(proxy, {
            p: 1,
            duration: 0.9,
            ease: 'power3.out',
            onUpdate: () => setActive(true, proxy.p),
          })
        }
        ScrollTrigger.create({
          trigger: el,
          start: 'top 75%',
          end: 'bottom 25%',
          onEnter: enter,
          onEnterBack: enter,
          onLeave: () => setActive(false, 1),
          onLeaveBack: () => setActive(false, 0),
        })
      }
    }, el)

    return () => ctx.revert()
  }, [reducedMotion, scrub, id])

  return (
    <section ref={ref} id={id} className={className} data-section {...rest}>
      <SectionStateContext.Provider value={state}>{children}</SectionStateContext.Provider>
    </section>
  )
}
