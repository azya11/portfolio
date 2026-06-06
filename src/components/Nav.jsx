import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { identity } from '../data/content.js'
import { useSmoothScroll } from '../lib/SmoothScroll.jsx'

const links = [
  { label: 'Work', href: '#work' },
  { label: 'Experience', href: '#experience' },
  { label: 'About', href: '#about' },
  { label: 'Contact', href: '#contact' },
]

export default function Nav({ ready }) {
  const [scrolled, setScrolled] = useState(false)
  const smooth = useSmoothScroll()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const go = (e, href) => {
    e.preventDefault()
    smooth?.scrollTo(href, { offset: -10 })
  }

  return (
    <motion.header
      className={`nav${scrolled ? ' is-scrolled' : ''}`}
      initial={{ y: -80, opacity: 0 }}
      animate={ready ? { y: 0, opacity: 1 } : { y: -80, opacity: 0 }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
    >
      <div className="nav-inner container">
        <a className="nav-mark" href="#top" onClick={(e) => go(e, '#top')}>
          <span className="nav-mark-dot" />
          {identity.firstName} {identity.lastName[0]}.
        </a>
        <nav className="nav-links">
          {links.map((l) => (
            <a key={l.href} href={l.href} onClick={(e) => go(e, l.href)}>
              {l.label}
            </a>
          ))}
        </nav>
        <a className="nav-status" href="#contact" onClick={(e) => go(e, '#contact')}>
          <span className="live" />
          Available
        </a>
      </div>
    </motion.header>
  )
}
