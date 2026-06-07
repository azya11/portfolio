import { useEffect } from 'react'

/**
 * Scales the referenced element down (via transform) when its natural height
 * would overflow its parent pane, so a section's full content always fits the
 * frame. Measures against the parent's content box; re-checks on resize and
 * after fonts load. `enabled = false` is a no-op.
 */
export function useFit(contentRef, enabled = true) {
  useEffect(() => {
    if (!enabled) return
    const el = contentRef.current
    const pane = el?.parentElement
    if (!el || !pane) return

    const measure = () => {
      el.style.transform = 'none'
      const cs = getComputedStyle(pane)
      const avail = pane.clientHeight - parseFloat(cs.paddingTop) - parseFloat(cs.paddingBottom)
      const h = el.scrollHeight
      const s = h > avail && avail > 0 ? Math.max(0.5, avail / h) : 1
      el.style.transform = s < 1 ? `scale(${s})` : 'none'
    }

    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(el)
    window.addEventListener('resize', measure)
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(measure)
    const t = setTimeout(measure, 400)
    return () => {
      ro.disconnect()
      window.removeEventListener('resize', measure)
      clearTimeout(t)
    }
  }, [contentRef, enabled])
}
