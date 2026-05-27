const EMAIL = 'azizshamuratovv@gmail.com'
const socials = [
  { label: 'GitHub', href: 'https://github.com/azya11' },
  { label: 'LinkedIn', href: 'https://linkedin.com/in/aziz-shamuratov-236575259' },
  { label: 'Phone', href: 'tel:+16022141634' },
]

export default function Contact() {
  return (
    <section className="section-pad solid-bg contact" id="contact">
      <div className="container reveal">
        <div className="eyebrow" style={{ textAlign: 'center' }}>Contact</div>
        <h2 className="section-title">Let’s build something</h2>
        <p className="section-intro" style={{ margin: '0 auto' }}>
          Open to software engineering roles and collaborations. Drop me a line.
        </p>
        <a className="email-link" href={`mailto:${EMAIL}`}>{EMAIL}</a>
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
