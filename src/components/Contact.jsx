const EMAIL = 'azizshamuratovv@gmail.com'
const socials = [
  { label: 'GitHub', href: 'https://github.com/azya11' },
  { label: 'LinkedIn', href: 'https://linkedin.com/in/aziz-shamuratov-236575259' },
  { label: 'Email', href: `mailto:${EMAIL}` },
  { label: 'Phone', href: 'tel:+16022141634' },
]

export default function Contact() {
  return (
    <section className="section-pad solid-bg contact" id="contact">
      <div className="container reveal">
        <div className="section-kicker" style={{ justifyContent: 'center' }}>
          <span className="idx">05</span>
          <span>Contact</span>
        </div>
        <h2>Let’s build something with gravity.</h2>
        <p className="section-intro" style={{ margin: '20px auto 0' }}>
          I’m open to software engineering roles and collaborations starting{' '}
          summer 2026. If you’re working on something hard, I’d love to hear about it.
        </p>
        <a className="email-link" href={`mailto:${EMAIL}`}>{EMAIL}</a>
        <p className="availability">Usually replies within a day · Tempe, AZ (MST)</p>
        <div className="socials">
          {socials.map((s) => (
            <a key={s.label} href={s.href} target="_blank" rel="noreferrer">
              {s.label}
            </a>
          ))}
        </div>
      </div>
    </section>
  )
}
