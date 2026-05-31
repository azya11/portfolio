import BlackHole from './components/BlackHole.jsx'
import Atmosphere from './components/Atmosphere.jsx'
import Nav from './components/Nav.jsx'
import Hero from './components/Hero.jsx'
import Work from './components/Work.jsx'
import Experience from './components/Experience.jsx'
import About from './components/About.jsx'
import Approach from './components/Approach.jsx'
import Contact from './components/Contact.jsx'
import { useReveal } from './hooks.js'

export default function App() {
  useReveal()
  return (
    <>
      <BlackHole />
      <Atmosphere />
      <Nav />
      <main className="content">
        <Hero />
        <Work />
        <Experience />
        <About />
        <Approach />
        <Contact />
        <footer>
          © {new Date().getFullYear()} Aziz Shamuratov
          <span className="sep">/</span>
          Built with React, Three.js &amp; a little gravity
          <span className="sep">/</span>
          Tempe, AZ
        </footer>
      </main>
    </>
  )
}
