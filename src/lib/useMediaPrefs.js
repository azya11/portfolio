import { useEffect, useState } from 'react'

const mq = (q) =>
  typeof window !== 'undefined' && window.matchMedia ? window.matchMedia(q) : null

function read() {
  return {
    reducedMotion: !!mq('(prefers-reduced-motion: reduce)')?.matches,
    // Coarse / no-hover pointer → treat as touch (disable trail, magnetic, tilt).
    isTouch:
      !!mq('(pointer: coarse)')?.matches || !!mq('(hover: none)')?.matches,
  }
}

/**
 * Reactive accessibility/input preferences. Updates if the user changes their
 * OS reduced-motion setting or switches input modality mid-session.
 */
export function useMediaPrefs() {
  const [prefs, setPrefs] = useState(read)

  useEffect(() => {
    const queries = [
      mq('(prefers-reduced-motion: reduce)'),
      mq('(pointer: coarse)'),
      mq('(hover: none)'),
    ].filter(Boolean)

    const onChange = () => setPrefs(read())
    queries.forEach((q) => q.addEventListener('change', onChange))
    return () => queries.forEach((q) => q.removeEventListener('change', onChange))
  }, [])

  return prefs
}
