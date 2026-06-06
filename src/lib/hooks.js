import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

const prefersReduced = () =>
  typeof window !== 'undefined' &&
  window.matchMedia &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches

const isCoarse = () =>
  typeof window !== 'undefined' &&
  window.matchMedia &&
  window.matchMedia('(pointer: coarse)').matches

/* Typewriter cycling through words. Writes straight to textContent via a ref so
   it never triggers a React re-render. */
export function useRotatingText(words, { type = 70, pause = 1500, erase = 36 } = {}) {
  const ref = useRef(null)
  useEffect(() => {
    const node = ref.current
    if (!node) return
    if (prefersReduced()) {
      node.textContent = words[0]
      return
    }

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
          if (i <= 0) {
            idx++
            timeout = setTimeout(cycle, 220)
          } else timeout = setTimeout(step, erase)
        }
      }
      step()
    }
    cycle()
    return () => clearTimeout(timeout)
  }, [words, type, pause, erase])

  return ref
}

/* Counts 0 → target once visible. `start` gates it so hero stats can wait for
   the preloader to finish. */
export function useCountUp(target, { duration = 1500, decimals = 0, start = true } = {}) {
  const ref = useRef(null)
  const [val, setVal] = useState(0)

  useEffect(() => {
    const node = ref.current
    if (!node || !start) return
    if (prefersReduced()) {
      setVal(target)
      return
    }

    let raf = 0
    let began = false
    const run = () => {
      const t0 = performance.now()
      const tick = (now) => {
        const p = Math.min(1, (now - t0) / duration)
        const eased = 1 - Math.pow(1 - p, 3)
        setVal(target * eased)
        if (p < 1) raf = requestAnimationFrame(tick)
      }
      raf = requestAnimationFrame(tick)
    }
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting && !began) {
          began = true
          run()
        }
      },
      { threshold: 0.5 },
    )
    io.observe(node)
    return () => {
      io.disconnect()
      cancelAnimationFrame(raf)
    }
  }, [target, duration, start])

  const display = decimals > 0 ? val.toFixed(decimals) : Math.round(val).toLocaleString()
  return [ref, display]
}

/* Pulls an element toward the pointer (magnetic buttons / links). */
export function useMagnetic(strength = 0.3) {
  const ref = useRef(null)
  useEffect(() => {
    const el = ref.current
    if (!el || prefersReduced() || isCoarse()) return
    const onMove = (e) => {
      const r = el.getBoundingClientRect()
      const x = e.clientX - (r.left + r.width / 2)
      const y = e.clientY - (r.top + r.height / 2)
      el.style.transform = `translate(${x * strength}px, ${y * strength}px)`
    }
    const reset = () => {
      el.style.transform = ''
    }
    el.addEventListener('pointermove', onMove)
    el.addEventListener('pointerleave', reset)
    return () => {
      el.removeEventListener('pointermove', onMove)
      el.removeEventListener('pointerleave', reset)
    }
  }, [strength])
  return ref
}

/* GSAP parallax: translates the element vertically as it scrolls through the
   viewport. `speed` > 0 moves slower than scroll (drifts up). */
export function useParallax(speed = 0.15) {
  const ref = useRef(null)
  useEffect(() => {
    const el = ref.current
    if (!el || prefersReduced()) return
    const ctx = gsap.context(() => {
      gsap.fromTo(
        el,
        { yPercent: -speed * 100 },
        {
          yPercent: speed * 100,
          ease: 'none',
          scrollTrigger: {
            trigger: el,
            start: 'top bottom',
            end: 'bottom top',
            scrub: true,
          },
        },
      )
    }, el)
    return () => ctx.revert()
  }, [speed])
  return ref
}

export { prefersReduced, isCoarse, ScrollTrigger }
