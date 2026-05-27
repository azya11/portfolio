const roles = [
  {
    role: 'Data Scientist Intern',
    company: 'MyMainAI',
    date: 'Jan 2026 – May 2026',
    place: 'On-site',
    points: [
      'Ran EDA on large datasets to surface trends and actionable insights.',
      'Built and evaluated regression, classification, and clustering models (Random Forest, XGBoost, K-Means).',
      'Tuned hyperparameters with cross-validation and fine-tuned deep learning models in PyTorch.',
    ],
  },
  {
    role: 'C#/.NET Software Developer',
    company: 'TAS Group',
    date: 'Jul 2023 – Jul 2025',
    place: 'On-site / Remote',
    points: [
      'Developed 6–10 microservices for QR payments & B2B backends used by 70k+ active users.',
      'Built REST/SOAP APIs handling hundreds of req/s; cut query time 10–20% across owned services.',
      'Processed tens of thousands of daily events with Kafka & RabbitMQ; raised module test coverage 40% → 65%.',
    ],
  },
  {
    role: '.NET Developer Intern',
    company: 'Itransition Group',
    date: 'Jul 2025 – Sep 2025',
    place: 'Remote',
    points: [
      'Built 2 ASP.NET Core microservices (12+ endpoints) at ~2k req/min; cut latency 30% via query & cache tuning.',
      'Reached 85% coverage with xUnit + Moq wired into GitHub Actions CI, cutting QA regressions 40%.',
      'Merged 40+ PRs with zero critical defects in a 5-person Agile squad.',
    ],
  },
]

export default function Experience() {
  return (
    <section className="section-pad solid-bg" id="experience">
      <div className="container">
        <div className="reveal">
          <div className="eyebrow">Career</div>
          <h2 className="section-title">Experience</h2>
        </div>
        <div className="timeline">
          {roles.map((r, i) => (
            <article className="xp reveal" key={i} style={{ transitionDelay: `${i * 60}ms` }}>
              <div className="xp-head">
                <h3>
                  {r.role} <span className="xp-company">· {r.company}</span>
                </h3>
                <span className="xp-date">{r.date} · {r.place}</span>
              </div>
              <ul>
                {r.points.map((p, j) => (
                  <li key={j}>{p}</li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
