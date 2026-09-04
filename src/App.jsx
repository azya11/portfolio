import { useState } from 'react'
import { AnimatePresence } from 'framer-motion'
import { SmoothScroll } from './lib/SmoothScroll.jsx'
import Preloader from './components/Preloader.jsx'
import Nav from './components/Nav.jsx'
import ChapterRail from './components/ChapterRail.jsx'
import SignalLine from './components/SignalLine.jsx'
import Hero from './components/Hero.jsx'
import Work from './components/Work.jsx'
import Experience from './components/Experience.jsx'
import About from './components/About.jsx'
import Approach from './components/Approach.jsx'
import Contact from './components/Contact.jsx'
import Footer from './components/Footer.jsx'

export default function App() {
  const [loading, setLoading] = useState(true)

  return (
    <>
      <a className="skip-link" href="#main">
        Skip to content
      </a>

      <AnimatePresence>
        {loading && <Preloader key="preloader" onDone={() => setLoading(false)} />}
      </AnimatePresence>

      <div className="bg-grain" aria-hidden="true" />

      <SignalLine />

      <Nav ready={!loading} />
      <ChapterRail />

      <SmoothScroll paused={loading}>
        <main id="main">
          <Hero ready={!loading} />
          <Approach />
          <Experience />
          <Work />
          <About />
          <Contact />
        </main>
        <Footer />
      </SmoothScroll>
    </>
  )
}
