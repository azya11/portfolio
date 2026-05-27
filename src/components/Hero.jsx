export default function Hero() {
  return (
    <section className="hero" id="top">
      <div className="container">
        <div className="hero-card">
          <p className="eyebrow">Aziz Shamuratov · Tempe, AZ</p>
          <h1>
            Software
            <br />
            <span className="grad">Developer</span>
          </h1>
          <p className="lead">
            Full-stack developer with 3 years of experience building modern
            applications with <strong>React</strong>, <strong>Node.js</strong>, and{' '}
            <strong>.NET</strong> — designing RESTful APIs, scaling microservices,
            and shipping CI/CD pipelines.
          </p>
          <div className="cta-row">
            <a className="btn primary" href="#work">View projects</a>
            <a className="btn ghost" href="#contact">Get in touch</a>
          </div>
        </div>
      </div>
      <div className="scroll-hint">scroll ↓</div>
    </section>
  )
}
