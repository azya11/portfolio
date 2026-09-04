import { useEffect, useState } from 'react'
import { stages } from '../data/pipeline.js'

/**
 * Fixed jump-nav listing all six pipeline stages. Desktop: always-visible
 * vertical rail. Mobile: collapses to a small toggle showing the current
 * stage code; tapping it opens the full list. Dispatches the same
 * `app:navigate` event Nav already used, so SmoothScroll's existing
 * listener handles the actual scrolling.
 */
export default function ChapterRail() {
  const [active, setActive] = useState(stages[0].id)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const onActive = (e) => setActive(e.detail)
    window.addEventListener('chapter:active', onActive)
    return () => window.removeEventListener('chapter:active', onActive)
  }, [])

  const go = (id) => {
    setOpen(false)
    window.dispatchEvent(new CustomEvent('app:navigate', { detail: `#${id}` }))
  }

  const activeStage = stages.find((s) => s.id === active) ?? stages[0]

  return (
    <nav className={`chapter-rail${open ? ' is-open' : ''}`} aria-label="Chapters">
      <button
        type="button"
        className="chapter-rail-toggle"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
      >
        <span className="chapter-rail-code">{activeStage.code}</span>
      </button>
      <ul>
        {stages.map((s) => (
          <li key={s.id}>
            <button
              type="button"
              className={s.id === active ? 'is-active' : ''}
              aria-current={s.id === active ? 'true' : undefined}
              onClick={() => go(s.id)}
            >
              <span className="chapter-rail-code">{s.code}</span>
              <span className="chapter-rail-label">{s.label}</span>
            </button>
          </li>
        ))}
      </ul>
    </nav>
  )
}
