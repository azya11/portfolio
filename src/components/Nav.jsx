import { useEffect, useState } from 'react'
import { useActiveSection } from '../hooks.js'

const links = [
  { id: 'work', label: 'Work' },
  { id: 'experience', label: 'Experience' },
  { id: 'about', label: 'About' },
  { id: 'approach', label: 'Approach' },
  { id: 'contact', label: 'Contact' },
]

export default function Nav() {
  const active = useActiveSection(['top', ...links.map((l) => l.id)])
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <nav className={`topnav${scrolled ? ' scrolled' : ''}`}>
      <a className="logo" href="#top">
        <span className="dot" />
        AZIZ<span>.S</span>
      </a>
      <ul>
        {links.map((l) => (
          <li key={l.id}>
            <a href={`#${l.id}`} className={active === l.id ? 'active' : ''}>
              {l.label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  )
}
