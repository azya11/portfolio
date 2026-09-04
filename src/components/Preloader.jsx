import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { greetings } from '../data/content.js'
import { useMediaPrefs } from '../lib/useMediaPrefs.js'

const EASE = [0.76, 0, 0.24, 1]
const STEP = 340 // ms per greeting

const wordVariants = {
  initial: { y: '120%', rotate: 8, opacity: 0 },
  enter: { y: '0%', rotate: 0, opacity: 1 },
  exit: { y: '-120%', rotate: -8, opacity: 0 },
}

/**
 * skiper8-style typographic preloader: a greeting word cycles through several
 * languages along a curved path, a counter ticks 0→100, then the whole panel
 * wipes upward to reveal the page. Calls `onDone` once the sequence finishes;
 * the parent's <AnimatePresence> animates the exit.
 */
export default function Preloader({ onDone }) {
  const { reducedMotion } = useMediaPrefs()
  const [index, setIndex] = useState(0)

  useEffect(() => {
    if (reducedMotion) {
      const t = setTimeout(onDone, 600)
      return () => clearTimeout(t)
    }
    let i = 0
    const id = setInterval(() => {
      i += 1
      if (i >= greetings.length) {
        clearInterval(id)
        setTimeout(onDone, STEP + 120)
      } else {
        setIndex(i)
      }
    }, STEP)
    return () => clearInterval(id)
  }, [onDone, reducedMotion])

  const total = reducedMotion ? 600 : greetings.length * STEP

  return (
    <motion.div
      className="preloader"
      initial={{ y: 0 }}
      exit={{
        y: '-100%',
        transition: { duration: 0.9, ease: EASE },
      }}
    >
      <div className="preloader-inner">
        <span className="preloader-dot" aria-hidden="true" />
        <div className="preloader-word" aria-live="polite">
          {reducedMotion ? (
            <span className="preloader-word-line">{greetings[greetings.length - 1]}</span>
          ) : (
            <AnimatePresence>
              <motion.span
                className="preloader-word-line"
                key={index}
                variants={wordVariants}
                initial="initial"
                animate="enter"
                exit="exit"
                transition={{ duration: 0.46, ease: EASE }}
              >
                {greetings[index]}
              </motion.span>
            </AnimatePresence>
          )}
        </div>
      </div>

      <div className="preloader-bar" aria-hidden="true">
        <motion.span
          className="preloader-fill"
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: total / 1000, ease: 'linear' }}
        />
      </div>

      <Counter total={total} />
    </motion.div>
  )
}

function Counter({ total }) {
  const [n, setN] = useState(0)
  useEffect(() => {
    const t0 = performance.now()
    let raf = 0
    const tick = (now) => {
      const p = Math.min(1, (now - t0) / total)
      setN(Math.round(p * 100))
      if (p < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [total])
  return <span className="preloader-count">{String(n).padStart(3, '0')}</span>
}
