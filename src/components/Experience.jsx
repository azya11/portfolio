const roles = [
  {
    role: 'Data Scientist Intern',
    company: 'MyMainAI',
    date: 'Jan 2026 – May 2026',
    place: 'On-site',
    summary: 'Turning messy datasets into models that actually inform decisions.',
    points: [
      'Ran <strong>EDA</strong> on large datasets to surface trends and actionable insights.',
      'Built and evaluated regression, classification, and clustering models — <strong>Random Forest, XGBoost, K-Means</strong>.',
      'Tuned hyperparameters with cross-validation and fine-tuned deep learning models in <strong>PyTorch</strong>.',
    ],
  },
  {
    role: '.NET Developer Intern',
    company: 'Itransition Group',
    date: 'Jul 2025 – Sep 2025',
    place: 'Remote',
    summary: 'Shipping fast inside a small, disciplined Agile squad.',
    points: [
      'Built 2 <strong>ASP.NET Core</strong> microservices (12+ endpoints) at <strong>~2k req/min</strong>; cut latency 30% via query & cache tuning.',
      'Reached <strong>85% coverage</strong> with xUnit + Moq wired into GitHub Actions CI, cutting QA regressions 40%.',
      'Merged <strong>40+ PRs</strong> with zero critical defects in a 5-person Agile squad.',
    ],
  },
  {
    role: 'C# / .NET Software Developer',
    company: 'TAS Group',
    date: 'Jul 2023 – Jul 2025',
    place: 'On-site / Remote',
    summary: 'Two years owning payment infrastructure real people depend on.',
    points: [
      'Developed <strong>6–10 microservices</strong> for QR payments & B2B backends used by <strong>70k+ active users</strong>.',
      'Built REST/SOAP APIs handling hundreds of req/s; cut query time 10–20% across owned services.',
      'Processed tens of thousands of daily events with <strong>Kafka & RabbitMQ</strong>; raised test coverage 40% → 65%.',
    ],
  },
]

export default function Experience() {
  return (
    <section className="section-pad solid-bg" id="experience">
      <div className="container">
        <div className="section-head reveal">
          <div className="section-kicker">
            <span className="idx">02</span>
            <span>Career</span>
            <span className="rule" />
          </div>
          <h2 className="section-title">
            Where I’ve <em>worked</em>
          </h2>
        </div>
        <div className="timeline">
          {roles.map((r, i) => (
            <article className="xp reveal" key={r.company} style={{ transitionDelay: `${i * 70}ms` }}>
              <div className="xp-head">
                <h3>
                  {r.role} <span className="xp-company">· {r.company}</span>
                </h3>
                <span className="xp-date">{r.date} · {r.place}</span>
              </div>
              <p className="xp-summary">{r.summary}</p>
              <ul>
                {r.points.map((p, j) => (
                  <li key={j} dangerouslySetInnerHTML={{ __html: p }} />
                ))}
              </ul>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
