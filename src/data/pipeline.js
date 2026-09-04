// The six pipeline stages, in scroll order. `id` must match each chapter
// Section's `id` prop exactly — it's used both as the DOM anchor for
// scroll-to-jump and as the `chapter:active` CustomEvent detail value.
export const stages = [
  { id: 'top', code: 'CONNECT', label: 'Connection opens' },
  { id: 'middleware', code: 'MIDDLEWARE', label: 'Rules & validation' },
  { id: 'compute', code: 'COMPUTE', label: 'Processing log' },
  { id: 'response', code: 'RESPONSE', label: 'Payload returned' },
  { id: 'core', code: 'CORE', label: 'Persistent store' },
  { id: 'contact', code: '200', label: 'Connection closed' },
]
