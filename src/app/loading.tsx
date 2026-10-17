export default function Loading() {
  return <main role="status" aria-live="polite" className="mx-auto max-w-5xl px-5 py-16"><div className="h-8 w-56 animate-pulse rounded-lg bg-[#e7e9e2]"/><div className="mt-6 h-40 animate-pulse rounded-3xl bg-[#f0f1ec]"/><span className="sr-only">Loading page…</span></main>;
}
