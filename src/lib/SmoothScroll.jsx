import { createContext, useContext, useEffect, useRef, useState } from 'react'
import Lenis from 'lenis'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useMediaPrefs } from './useMediaPrefs.js'

gsap.registerPlugin(ScrollTrigger)

const SmoothScrollContext = createContext(null)

/**
 * Wraps the app in a Lenis smooth-scroll instance and drives both Lenis and
 * GSAP ScrollTrigger off GSAP's single ticker. Exposes start/stop (used to
 * freeze scroll during the preloader) and scrollTo (used by nav links).
 *
 * When the user prefers reduced motion we skip Lenis entirely and fall back to
 * native scrolling — ScrollTrigger still works against the window.
 */
export function SmoothScroll({ children, paused = false }) {
  const { reducedMotion } = useMediaPrefs()
  const lenisRef = useRef(null)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    if (reducedMotion) {
      setReady(true)
      return
    }

    const lenis = new Lenis({
      duration: 1.1,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      touchMultiplier: 1.5,
    })
    lenisRef.current = lenis

    lenis.on('scroll', ScrollTrigger.update)

    const onTick = (time) => lenis.raf(time * 1000)
    gsap.ticker.add(onTick)
    gsap.ticker.lagSmoothing(0)

    setReady(true)

    return () => {
      gsap.ticker.remove(onTick)
      lenis.destroy()
      lenisRef.current = null
    }
  }, [reducedMotion])

  // Freeze scrolling while the preloader is up (and on the reduced-motion path
  // where there is no Lenis instance to stop).
  useEffect(() => {
    if (reducedMotion) {
      document.body.style.overflow = paused ? 'hidden' : ''
      return () => {
        document.body.style.overflow = ''
      }
    }
    const lenis = lenisRef.current
    if (!lenis) return
    if (paused) lenis.stop()
    else lenis.start()
  }, [paused, reducedMotion, ready])

  const api = {
    get lenis() {
      return lenisRef.current
    },
    start: () => lenisRef.current?.start(),
    stop: () => lenisRef.current?.stop(),
    scrollTo: (target, opts) => {
      if (lenisRef.current) lenisRef.current.scrollTo(target, opts)
      else if (typeof target === 'string') {
        document.querySelector(target)?.scrollIntoView({ behavior: 'smooth' })
      }
    },
  }

  // Nav links dispatch this; handle it on the fallback (Lenis / native) path.
  useEffect(() => {
    const onNav = (e) => api.scrollTo(e.detail, { offset: -10 })
    window.addEventListener('app:navigate', onNav)
    return () => window.removeEventListener('app:navigate', onNav)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <SmoothScrollContext.Provider value={api}>
      {ready ? children : null}
    </SmoothScrollContext.Provider>
  )
}

export function useSmoothScroll() {
  return useContext(SmoothScrollContext)
}
