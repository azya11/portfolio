// Central identity + copy. Edit here; components read from this.

export const identity = {
  firstName: 'Aziz',
  lastName: 'Shamuratov',
  fullName: 'Aziz Shamuratov',
  title: 'Software Developer',
  location: 'Tempe, Arizona',
  coords: '33.4255° N, 111.9400° W',
  availability: 'Available · May 2026 grad',
  email: 'azizshamuratovv@gmail.com',
  phone: '+16022141634',
  phoneDisplay: '+1 602 214 1634',
  github: 'https://github.com/azya11',
  linkedin: 'https://www.linkedin.com/in/azizshamuratovv/',
  year: 2026,
}

// Rotating roles shown in the hero line ("I build ___").
export const rotatingRoles = [
  'backend systems',
  'RESTful APIs',
  'CI/CD pipelines',
  'event-driven services',
  'full-stack products',
]

// Hero stat counters.
export const stats = [
  { value: 70, suffix: 'k+', label: 'Users served' },
  { value: 3, suffix: 'yrs', label: 'Experience' },
  { value: 10, suffix: '+', label: 'Microservices' },
  { value: 85, suffix: '%', label: 'Test coverage' },
]

export const lead =
  'Software developer with 3 years shipping production backends and full-stack ' +
  'features across React, Node.js, and .NET. I like the invisible work — clean APIs, ' +
  'real test coverage, and pipelines that let a team move fast without breaking things.'

// Preloader: a greeting cycled through languages (skiper8-style).
export const greetings = [
  'Hello',
  'Hola',
  'Bonjour',
  'こんにちは',
  'Привет',
]

// Approach / philosophy.
export const principles = [
  {
    title: 'Boring is a feature',
    body:
      'Predictable beats clever. I optimize for the API that never surprises you, the ' +
      'deploy that’s a non-event, and code the next engineer can read without scheduling a meeting.',
  },
  {
    title: 'Tests earn their keep',
    body:
      'I write fast, honest tests that catch real regressions before users do — wired into ' +
      'CI so the team never has to think about them. Coverage is a means, not the goal.',
  },
  {
    title: 'Design the seams',
    body:
      'The interesting failures happen at boundaries. I spend my care on contracts and edges: ' +
      'clear inputs, predictable errors, and nothing that surprises the caller a year later.',
  },
  {
    title: 'Ship small, measure real',
    body:
      'I’d rather ship a small thing that delivers value than a big thing that might. Automate ' +
      'the boring parts, measure what actually matters, and iterate in the open.',
  },
]

export const aboutParagraphs = [
  'Hi, I’m Aziz. I’m a software developer in Tempe, Arizona, finishing my B.S. in Computer ' +
    'Science at Arizona State University this May.',
  'I’m drawn to the work no one sees but everyone feels — the API that never surprises you, ' +
    'the test that catches the bug before it ships.',
  'Over the last three years I’ve shipped production backends and full-stack features — from ' +
    'QR payment microservices serving 70k+ users to AI/AR capstone work as a team lead. I care ' +
    'about clean contracts, honest test coverage, and automating the boring parts so a team can ' +
    'focus on the hard ones.',
  'Outside of code I co-founded the Central Asian Student Association at ASU, placed as a 2× ' +
    'Amazon Hackathon finalist, and won a Claude Hackathon.',
]

export const aboutBadge = 'B.S. CS · ASU ’26'
