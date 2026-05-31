const principles = [
  {
    title: 'Signal over noise',
    body:
      'A black hole bends everything toward one point. Good software does the same with complexity — pull it into one well-named place instead of scattering it everywhere. The best abstraction is the one you forget is there.',
  },
  {
    title: 'Tests are gravity',
    body:
      'Invisible, constant, holding everything in orbit. I write coverage that earns its keep — fast, honest tests that catch the regression before a user ever feels it, wired into CI so the team never has to think about it.',
  },
  {
    title: 'Design at the event horizon',
    body:
      'The boundary is where the interesting physics happens — and where APIs live or die. I spend my care on contracts and edges: clear inputs, predictable failure, nothing that surprises the caller a year from now.',
  },
  {
    title: 'Ship light, not heat',
    body:
      'An accretion disk glows because energy is doing real work. I’d rather ship a small thing that radiates value than a large thing that just burns. Automate the boring, measure the real, iterate in public.',
  },
]

export default function Approach() {
  return (
    <section className="section-pad solid-bg" id="approach">
      <div className="container">
        <div className="section-head reveal">
          <div className="section-kicker">
            <span className="idx">04</span>
            <span>Philosophy</span>
            <span className="rule" />
          </div>
          <h2 className="section-title">
            How I <em>think</em> about building
          </h2>
          <p className="section-intro">
            The background isn’t just decoration. The way light behaves near a
            black hole is a surprisingly good metaphor for how I try to write
            software.
          </p>
        </div>
        <div className="principles-grid">
          {principles.map((p, i) => (
            <article className="principle reveal" key={p.title} style={{ transitionDelay: `${i * 70}ms` }}>
              <span className="pnum">{String(i + 1).padStart(2, '0')}</span>
              <h3>{p.title}</h3>
              <p>{p.body}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
