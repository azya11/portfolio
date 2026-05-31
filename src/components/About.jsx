const skillGroups = [
  { label: 'Languages', items: ['C#', 'C++', 'TypeScript', 'JavaScript', 'Python', 'Java', 'OCaml'] },
  { label: 'Frameworks', items: ['.NET', 'ASP.NET Core', 'React', 'Node.js', 'PyTorch', 'RESTful APIs'] },
  { label: 'Data', items: ['MS SQL', 'PostgreSQL', 'Redis', 'Kafka', 'RabbitMQ'] },
  { label: 'Cloud & Ops', items: ['AWS', 'Azure', 'Docker', 'Kubernetes', 'CI/CD', 'GitHub Actions'] },
  { label: 'Testing', items: ['xUnit', 'Moq', 'Jest', 'JUnit'] },
]

export default function About() {
  return (
    <section className="section-pad solid-bg" id="about">
      <div className="container">
        <div className="section-head reveal">
          <div className="section-kicker">
            <span className="idx">03</span>
            <span>About</span>
            <span className="rule" />
          </div>
          <h2 className="section-title">
            A bit about <em>me</em>
          </h2>
        </div>
        <div className="about-grid reveal">
          <div className="about-photo-wrap">
            <div
              className="about-photo"
              style={{ background: 'center 42% / cover no-repeat url(/me.jpg)' }}
              role="img"
              aria-label="Photo of Aziz Shamuratov"
            />
            <div className="about-badge">
              <b>B.S. CS</b> · ASU ’26
            </div>
          </div>
          <div className="about-text">
            <p>
              <strong>Hi, I’m Aziz.</strong> I’m a software developer in Tempe,
              Arizona, finishing my B.S. in Computer Science at Arizona State
              University this May.
            </p>
            <p className="about-pull">
              I’m drawn to the work no one sees but everyone feels — the API that
              never surprises you, the test that catches the bug before it ships.
            </p>
            <p>
              Over the last three years I’ve shipped production backends and
              full-stack features — from QR payment microservices serving{' '}
              <strong>70k+ users</strong> to AI/AR capstone work as a team lead. I
              care about clean contracts, honest test coverage, and automating the
              boring parts so a team can focus on the hard ones.
            </p>
            <p>
              Outside of code I co-founded the{' '}
              <strong>Central Asian Student Association</strong> at ASU, placed as a{' '}
              <strong>2× Amazon Hackathon</strong> finalist, and won a{' '}
              <strong>Claude Hackathon</strong>.
            </p>
            <div className="skill-groups">
              {skillGroups.map((g) => (
                <div className="skill-group" key={g.label}>
                  <div className="gl">{g.label}</div>
                  <div className="skill-row">
                    {g.items.map((s) => (
                      <span className="tag" key={s}>{s}</span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
