import BlackHole from './components/BlackHole.jsx'
import Nav from './components/Nav.jsx'
import Hero from './components/Hero.jsx'
import Work from './components/Work.jsx'
import Experience from './components/Experience.jsx'
import About from './components/About.jsx'
import Contact from './components/Contact.jsx'
import useReveal from './useReveal.js'

export default function App() {
  useReveal()
  return (
    <>
      <BlackHole />
      <Nav />
      <main className="content">
        <Hero />
        <Work />
        <Experience />
        <About />
        <Contact />
        <footer>
          © {new Date().getFullYear()} Aziz Shamuratov. Built with React, Three.js &amp; a little gravity.
        </footer>
      </main>
    </>
  )
}
