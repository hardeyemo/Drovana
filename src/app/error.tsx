"use client";

export default function Error({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return <main role="alert" className="mx-auto max-w-xl px-5 py-16 text-center"><h1 className="font-display text-3xl font-semibold text-[#263d32]">We couldn’t load this page.</h1><p className="mt-2 text-sm text-[#718077]">Please try again. Your account and delivery details remain protected.</p><button onClick={reset} className="mt-5 h-11 rounded-full bg-[#de7844] px-5 font-semibold text-white">Try again</button></main>;
}
