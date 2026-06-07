import { useEffect, useRef } from 'react'

const THRESHOLD = 300 // accumulated wheel delta (~3 notches) needed to advance
const DURATION = 850 // ms per section transition
const IDLE_RESET = 220 // ms of no wheel input before the tick counter clears

/**
 * Section pager. Moves the page one section at a time: each section snaps to the
 * centre of the viewport (its "state"), and the user must scroll ~3 ticks to
 * advance to the next one (input is ignored while a transition is animating, so
 * every section dwells). Drives a CSS transform track (no native scrollbar to
 * bypass); section reveals react via IntersectionObserver. Desktop only — touch
 * / reduced-motion use normal smooth scroll instead.
 */
export default function Pager({ loading, children }) {
  const trackRef = useRef(null)
  const offset = useRef(0)
  const target = useRef(0)
  const index = useRef(0)
  const accum = useRef(0)
  const animating = useRef(false)
  const raf = useRef(0)
  const idle = useRef(0)

  useEffect(() => {
    const track = trackRef.current
    if (!track) return

    const sections = () => Array.from(track.querySelectorAll('[data-section]'))
    const maxOffset = () => Math.max(0, track.scrollHeight - window.innerHeight)
    // each section is a viewport-tall pane → align it to the top of the screen
    const topFor = (el) => Math.max(0, Math.min(el.offsetTop, maxOffset()))
    const apply = () => {
      track.style.transform = `translate3d(0, ${-offset.current}px, 0)`
    }

    const tween = () => {
      cancelAnimationFrame(raf.current)
      animating.current = true
      const start = offset.current
      const end = target.current
      const t0 = performance.now()
      const step = (now) => {
        const p = Math.min(1, (now - t0) / DURATION)
        const e = 1 - Math.pow(1 - p, 3)
        offset.current = start + (end - start) * e
        apply()
        if (p < 1) raf.current = requestAnimationFrame(step)
        else animating.current = false
      }
      raf.current = requestAnimationFrame(step)
    }

    const goTo = (i) => {
      const secs = sections()
      if (!secs.length) return
      index.current = Math.max(0, Math.min(i, secs.length - 1))
      // last section lands at the very bottom so the footer shows; the rest
      // align to the top of the viewport (each is a full-height pane).
      target.current =
        index.current === secs.length - 1 ? maxOffset() : topFor(secs[index.current])
      tween()
    }

    document.body.style.overflow = 'hidden'
    apply()

    const onWheel = (e) => {
      e.preventDefault()
      if (loading || animating.current) return
      let d = e.deltaY
      if (e.deltaMode === 1) d *= 16
      else if (e.deltaMode === 2) d *= window.innerHeight
      accum.current += d
      clearTimeout(idle.current)
      idle.current = setTimeout(() => (accum.current = 0), IDLE_RESET)
      if (accum.current >= THRESHOLD) {
        accum.current = 0
        goTo(index.current + 1)
      } else if (accum.current <= -THRESHOLD) {
        accum.current = 0
        goTo(index.current - 1)
      }
    }

    const onKey = (e) => {
      if (loading || animating.current) return
      if (['ArrowDown', 'PageDown', ' '].includes(e.key)) {
        e.preventDefault()
        goTo(index.current + 1)
      } else if (['ArrowUp', 'PageUp'].includes(e.key)) {
        e.preventDefault()
        goTo(index.current - 1)
      } else if (e.key === 'Home') {
        e.preventDefault()
        goTo(0)
      } else if (e.key === 'End') {
        e.preventDefault()
        goTo(sections().length - 1)
      }
    }

    const onNav = (e) => {
      const secs = sections()
      const i = secs.findIndex((s) => '#' + s.id === e.detail)
      if (i >= 0) goTo(i)
    }

    const onResize = () => {
      const secs = sections()
      if (!secs[index.current]) return
      target.current =
        index.current === secs.length - 1 ? maxOffset() : topFor(secs[index.current])
      offset.current = target.current
      apply()
    }

    window.addEventListener('wheel', onWheel, { passive: false })
    window.addEventListener('keydown', onKey)
    window.addEventListener('app:navigate', onNav)
    window.addEventListener('resize', onResize)
    return () => {
      document.body.style.overflow = ''
      cancelAnimationFrame(raf.current)
      clearTimeout(idle.current)
      window.removeEventListener('wheel', onWheel)
      window.removeEventListener('keydown', onKey)
      window.removeEventListener('app:navigate', onNav)
      window.removeEventListener('resize', onResize)
    }
  }, [loading])

  // Snap back to the hero once the preloader clears.
  useEffect(() => {
    if (loading) return
    offset.current = 0
    target.current = 0
    index.current = 0
    if (trackRef.current) trackRef.current.style.transform = 'translate3d(0,0,0)'
  }, [loading])

  return (
    <div className="pager-track" ref={trackRef}>
      {children}
    </div>
  )
}
