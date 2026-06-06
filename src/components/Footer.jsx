import { identity } from '../data/content.js'

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container footer-inner">
        <span>
          © {new Date().getFullYear()} {identity.fullName}
        </span>
        <span className="footer-sep">/</span>
        <span>Built with React &amp; Framer Motion</span>
        <span className="footer-sep">/</span>
        <span>{identity.location}</span>
      </div>
    </footer>
  )
}
