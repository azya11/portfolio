import { lazy, Suspense, useState } from 'react'
import { AnimatePresence } from 'framer-motion'
import { SmoothScroll } from './lib/SmoothScroll.jsx'
import { useMediaPrefs } from './lib/useMediaPrefs.js'
import Preloader from './components/Preloader.jsx'

// Three.js is heavy + non-critical (background only) — load it in its own chunk.
const GridField = lazy(() => import('./components/GridField.jsx'))
import Nav from './components/Nav.jsx'
import Hero from './components/Hero.jsx'
import Work from './components/Work.jsx'
import Experience from './components/Experience.jsx'
import About from './components/About.jsx'
import Approach from './components/Approach.jsx'
import Contact from './components/Contact.jsx'
import Footer from './components/Footer.jsx'

export default function App() {
  const [loading, setLoading] = useState(true)
  const { reducedMotion, isTouch } = useMediaPrefs()
  const interactive = !reducedMotion && !isTouch

  return (
    <>
      <AnimatePresence>
        {loading && <Preloader key="preloader" onDone={() => setLoading(false)} />}
      </AnimatePresence>

      <SmoothScroll paused={loading}>
        {interactive ? (
          <Suspense fallback={<div className="bg-grid" aria-hidden="true" />}>
            <GridField />
          </Suspense>
        ) : (
          <div className="bg-grid" aria-hidden="true" />
        )}
        <div className="bg-grain" aria-hidden="true" />
        <Nav ready={!loading} />
        <main>
          <Hero ready={!loading} />
          <Work />
          <Experience />
          <About />
          <Approach />
          <Contact />
        </main>
        <Footer />
      </SmoothScroll>
    </>
  )
}
