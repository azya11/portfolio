import { useEffect, useRef } from 'react'

/*
  Non-interactive overlays that sit above the black hole but below content:
   - film grain + vignette to seat the HDR render in the void
   - a soft lens-flare glow that eases toward the pointer
   - a hairline scroll-progress bar driven by scroll position
  All pointer/scroll work is done imperatively (refs + rAF) so React never
  re-renders on move — keeps the shader framerate clean.
*/
export default function Atmosphere() {
  const glowRef = useRef(null)
  const barRef = useRef(null)

  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const coarse = window.matchMedia('(pointer: coarse)').matches
    const glow = glowRef.current
    const bar = barRef.current

    // eased pointer glow
    let tx = window.innerWidth / 2
    let ty = window.innerHeight / 2
    let x = tx
    let y = ty
    let raf = 0

    const onMove = (e) => {
      tx = e.clientX
      ty = e.clientY
      if (glow && !glow.classList.contains('on')) glow.classList.add('on')
    }

    const loop = () => {
      x += (tx - x) * 0.12
      y += (ty - y) * 0.12
      if (glow) glow.style.transform = `translate(${x}px, ${y}px)`
      raf = requestAnimationFrame(loop)
    }

    if (!reduce && !coarse) {
      window.addEventListener('pointermove', onMove, { passive: true })
      raf = requestAnimationFrame(loop)
    }

    // scroll progress
    const onScroll = () => {
      const h = document.documentElement
      const max = h.scrollHeight - h.clientHeight
      const p = max > 0 ? h.scrollTop / max : 0
      if (bar) bar.style.transform = `scaleX(${p})`
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })

    return () => {
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('scroll', onScroll)
      cancelAnimationFrame(raf)
    }
  }, [])

  return (
    <>
      <div className="cursor-glow" ref={glowRef} />
      <div className="vignette" />
      <div className="grain" />
      <div className="scroll-progress" ref={barRef} style={{ transform: 'scaleX(0)' }} />
    </>
  )
}
