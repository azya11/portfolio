const skills = [
  'C#', 'C++', 'JavaScript', 'TypeScript', 'Python', 'Java', 'OCaml',
  '.NET', 'React', 'Node.js', 'RESTful APIs',
  'AWS', 'Azure', 'Docker', 'Kubernetes', 'CI/CD', 'GitHub Actions',
  'MS SQL', 'PostgreSQL', 'Redis', 'Kafka', 'RabbitMQ', 'Jest', 'JUnit',
]

export default function About() {
  return (
    <section className="section-pad solid-bg" id="about">
      <div className="container">
        <div className="reveal">
          <div className="eyebrow">About</div>
          <h2 className="section-title">A bit about me</h2>
        </div>
        <div className="about-grid reveal">
          <div
            className="about-photo"
            style={{ background: 'center 42% / cover no-repeat url(/me.jpg)' }}
            role="img"
            aria-label="Photo of Aziz Shamuratov"
          />
          <div className="about-text">
            <p>
              <strong>Hi, I’m Aziz Shamuratov</strong> — a software developer based in
              Tempe, AZ, finishing my B.S. in Computer Science at Arizona State
              University (May 2026).
            </p>
            <p>
              Over the last 3 years I’ve shipped production backends and full-stack
              features — from QR payment microservices serving <strong>70k+ users</strong>{' '}
              to AI/AR capstone work as a team lead. I care about clean APIs, solid test
              coverage, and automating everything I can with CI/CD.
            </p>
            <p>
              Outside of code I co-founded the <strong>Central Asian Student Association</strong>{' '}
              at ASU, placed as a 2× Amazon Hackathon finalist, and won a Claude Hackathon.
            </p>
            <div className="skills">
              {skills.map((s) => (
                <span className="tag" key={s}>{s}</span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
