import { useEffect, useRef, useState } from 'react'

const prefersReduced = () =>
  typeof window !== 'undefined' &&
  window.matchMedia &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches

/* Adds `.in` to any `.reveal` element once it scrolls into view.
   Uses IntersectionObserver as the primary path, with a scroll/resize
   fallback so reveals never get stuck hidden if the observer misses a
   frame (e.g. layout shifts while the WebGL canvas sizes itself). */
export function useReveal() {
  useEffect(() => {
    const els = Array.from(document.querySelectorAll('.reveal'))
    if (prefersReduced()) {
      els.forEach((el) => el.classList.add('in'))
      return
    }

    const reveal = (el) => el.classList.add('in')
    // Reveal anything whose top has crossed 92% of the viewport — this
    // includes elements scrolled past (top < 0), so a late sweep (e.g. if a
    // heavy frame starved the handler) still catches everything above.
    const inView = (el) => {
      const r = el.getBoundingClientRect()
      const h = window.innerHeight || document.documentElement.clientHeight
      return r.top < h * 0.92
    }
    const sweep = () => {
      for (const el of els) if (!el.classList.contains('in') && inView(el)) reveal(el)
    }

    let io = null
    if ('IntersectionObserver' in window) {
      io = new IntersectionObserver(
        (entries) => entries.forEach((e) => { if (e.isIntersecting) reveal(e.target) }),
        { threshold: 0.12, rootMargin: '0px 0px -8% 0px' }
      )
      els.forEach((el) => io.observe(el))
    }

    // initial pass + fallbacks
    sweep()
    window.addEventListener('scroll', sweep, { passive: true })
    window.addEventListener('resize', sweep, { passive: true })

    return () => {
      if (io) io.disconnect()
      window.removeEventListener('scroll', sweep)
      window.removeEventListener('resize', sweep)
    }
  }, [])
}

/* Counts a number up from 0 → target once the element is visible. */
export function useCountUp(target, { duration = 1400, decimals = 0 } = {}) {
  const ref = useRef(null)
  const [val, setVal] = useState(0)

  useEffect(() => {
    const node = ref.current
    if (!node) return
    if (prefersReduced()) { setVal(target); return }

    let raf = 0
    let started = false
    const run = () => {
      const t0 = performance.now()
      const tick = (now) => {
        const p = Math.min(1, (now - t0) / duration)
        const eased = 1 - Math.pow(1 - p, 3) // easeOutCubic
        setVal(target * eased)
        if (p < 1) raf = requestAnimationFrame(tick)
      }
      raf = requestAnimationFrame(tick)
    }
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting && !started) { started = true; run() }
      },
      { threshold: 0.5 }
    )
    io.observe(node)
    return () => { io.disconnect(); cancelAnimationFrame(raf) }
  }, [target, duration])

  const display =
    decimals > 0 ? val.toFixed(decimals) : Math.round(val).toLocaleString()
  return [ref, display]
}

/* Typewriter that cycles through a list of words. Writes straight to the
   element's textContent (via the returned ref) so it never triggers a React
   re-render — stays smooth even while the WebGL shader is busy. */
export function useRotatingText(words, { type = 70, pause = 1500, erase = 36 } = {}) {
  const ref = useRef(null)
  useEffect(() => {
    const node = ref.current
    if (!node) return
    if (prefersReduced()) { node.textContent = words[0]; return }

    let timeout
    let idx = 0
    const cycle = () => {
      const word = words[idx % words.length]
      let i = 0
      let phase = 'typing'
      const step = () => {
        if (phase === 'typing') {
          node.textContent = word.slice(0, ++i)
          timeout = setTimeout(step, i >= word.length ? ((phase = 'pausing'), pause) : type)
        } else if (phase === 'pausing') {
          phase = 'erasing'
          timeout = setTimeout(step, erase)
        } else {
          node.textContent = word.slice(0, --i)
          if (i <= 0) { idx++; timeout = setTimeout(cycle, 220) }
          else timeout = setTimeout(step, erase)
        }
      }
      step()
    }
    cycle()
    return () => clearTimeout(timeout)
  }, [words, type, pause, erase])

  return ref
}

/* Tracks which section id is currently in view → for nav highlighting. */
export function useActiveSection(ids) {
  const [active, setActive] = useState(ids[0])
  useEffect(() => {
    const sections = ids
      .map((id) => document.getElementById(id))
      .filter(Boolean)
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => { if (e.isIntersecting) setActive(e.target.id) })
      },
      { rootMargin: '-45% 0px -50% 0px', threshold: 0 }
    )
    sections.forEach((s) => io.observe(s))
    return () => io.disconnect()
  }, [ids])
  return active
}

/* Pulls an element toward the pointer (magnetic buttons). */
export function useMagnetic(strength = 0.35) {
  const ref = useRef(null)
  useEffect(() => {
    const el = ref.current
    if (!el || prefersReduced() || matchMedia('(pointer: coarse)').matches) return
    const onMove = (e) => {
      const r = el.getBoundingClientRect()
      const x = e.clientX - (r.left + r.width / 2)
      const y = e.clientY - (r.top + r.height / 2)
      el.style.transform = `translate(${x * strength}px, ${y * strength}px)`
    }
    const reset = () => { el.style.transform = '' }
    el.addEventListener('pointermove', onMove)
    el.addEventListener('pointerleave', reset)
    return () => {
      el.removeEventListener('pointermove', onMove)
      el.removeEventListener('pointerleave', reset)
    }
  }, [strength])
  return ref
}

/* 3D tilt that follows the pointer across a card. */
export function useTilt(max = 7) {
  const ref = useRef(null)
  useEffect(() => {
    const el = ref.current
    if (!el || prefersReduced() || matchMedia('(pointer: coarse)').matches) return
    const onMove = (e) => {
      const r = el.getBoundingClientRect()
      const px = (e.clientX - r.left) / r.width - 0.5
      const py = (e.clientY - r.top) / r.height - 0.5
      el.style.transform = `perspective(900px) rotateX(${-py * max}deg) rotateY(${px * max}deg) translateY(-6px)`
    }
    const reset = () => { el.style.transform = '' }
    el.addEventListener('pointermove', onMove)
    el.addEventListener('pointerleave', reset)
    return () => {
      el.removeEventListener('pointermove', onMove)
      el.removeEventListener('pointerleave', reset)
    }
  }, [max])
  return ref
}
