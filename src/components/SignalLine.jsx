import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { stages } from '../data/pipeline.js'

gsap.registerPlugin(ScrollTrigger)

/**
 * A vertical glowing line running the full document height, drawn
 * progressively as the page scrolls (scaleY 0..1, scrubbed to total scroll
 * progress), with a traveling "packet" dot and a node per pipeline stage
 * that highlights when that chapter becomes active. Purely decorative.
 */
export default function SignalLine() {
  const trackRef = useRef(null)
  const fillRef = useRef(null)
  const packetRef = useRef(null)
  const nodeRefs = useRef({})

  useEffect(() => {
    const track = trackRef.current
    const fill = fillRef.current
    const packet = packetRef.current
    if (!track || !fill || !packet) return

    const layout = () => {
      const height = document.documentElement.scrollHeight
      track.style.height = `${height}px`
      stages.forEach((s) => {
        const el = document.getElementById(s.id)
        const node = nodeRefs.current[s.id]
        if (el && node) {
          // Chapter sections are individually GSAP-pinned (each wrapped in its
          // own pin-spacer), so `el.offsetTop` is local to that spacer and
          // reads 0 for every section. Use the viewport-relative rect plus
          // scroll position instead to get each section's true document top.
          const top = el.getBoundingClientRect().top + window.scrollY
          node.style.top = `${top + el.offsetHeight / 2}px`
        }
      })
    }
    layout()
    const ro = new ResizeObserver(layout)
    ro.observe(document.body)
    if (document.fonts?.ready) document.fonts.ready.then(layout)

    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        start: 0,
        end: 'max',
        scrub: 0.3,
        onUpdate: (self) => {
          gsap.set(fill, { scaleY: self.progress })
          gsap.set(packet, { top: `${self.progress * track.offsetHeight}px` })
        },
      })
    })

    const onActive = (e) => {
      Object.entries(nodeRefs.current).forEach(([id, el]) => {
        el?.classList.toggle('is-active', id === e.detail)
      })
    }
    window.addEventListener('chapter:active', onActive)

    return () => {
      ctx.revert()
      ro.disconnect()
      window.removeEventListener('chapter:active', onActive)
    }
  }, [])

  return (
    <div className="signal-line" ref={trackRef} aria-hidden="true">
      <div className="signal-track" />
      <div className="signal-fill" ref={fillRef} />
      <div className="signal-packet" ref={packetRef} />
      {stages.map((s) => (
        <div key={s.id} className="signal-node" ref={(el) => (nodeRefs.current[s.id] = el)} data-stage={s.id} />
      ))}
    </div>
  )
}
