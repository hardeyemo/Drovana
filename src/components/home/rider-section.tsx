import Link from "next/link";
import { buttonStyles } from "@/components/ui/button";

const stages = [
  { title: "Apply", text: "Create an account and send your rider details for review." },
  { title: "Get reviewed", text: "Drovna checks each application before approving it." },
  { title: "Pick up jobs", text: "Once approved, browse open jobs and accept the ones you can do." },
];

export function RiderSection() {
  return (
    <section className="mx-auto grid max-w-6xl gap-10 px-5 py-16 md:grid-cols-2 md:items-center">
      <div>
        <h2 className="text-3xl font-semibold sm:text-4xl">
          Ride with Drovna on your own terms
        </h2>
        <p className="mt-4 max-w-md text-ink-muted">
          Independent riders choose which jobs to accept. Job volume and
          earnings depend on demand in your area, so we don&apos;t promise either.
        </p>
        <Link
          href="/become-a-rider"
          className={buttonStyles({ size: "lg", className: "mt-7" })}
        >
          Become a rider
        </Link>
      </div>
      <ul className="space-y-3">
        {stages.map((s) => (
          <li key={s.title} className="rounded-panel border border-line bg-white p-5">
            <h3 className="text-lg font-semibold">{s.title}</h3>
            <p className="mt-1 text-ink-muted">{s.text}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}
