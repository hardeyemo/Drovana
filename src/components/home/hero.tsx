import Link from "next/link";
import { buttonStyles } from "@/components/ui/button";
import { bookingHref } from "@/lib/config/site";

function RouteIllustration() {
  return (
    <svg
      viewBox="0 0 480 400"
      role="img"
      aria-label="Illustration of a delivery route between a pickup point and a drop-off point"
      className="h-auto w-full"
    >
      <rect width="480" height="400" rx="24" fill="#f1ece2" />
      {/* street grid */}
      <g stroke="#e3ded3" strokeWidth="14" strokeLinecap="round">
        <path d="M-10 90H490M-10 210H490M-10 330H490" />
        <path d="M90 -10V410M230 -10V410M370 -10V410" />
      </g>
      {/* blocks */}
      <g fill="#fff">
        <rect x="108" y="108" width="104" height="84" rx="10" />
        <rect x="248" y="228" width="104" height="84" rx="10" />
        <rect x="388" y="108" width="70" height="84" rx="10" />
        <rect x="22" y="228" width="50" height="84" rx="10" />
      </g>
      {/* route */}
      <path
        d="M90 330V210H230V90H370V210"
        fill="none"
        stroke="#14b37d"
        strokeWidth="7"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeDasharray="2 14"
      />
      {/* pickup */}
      <circle cx="90" cy="330" r="16" fill="#0b1f3a" />
      <circle cx="90" cy="330" r="6" fill="#fff" />
      {/* package in transit */}
      <g transform="translate(206 66)">
        <rect width="48" height="48" rx="10" fill="#e5a02d" />
        <path d="M0 18H48M24 0V18" stroke="#0b1f3a" strokeWidth="4" />
      </g>
      {/* drop-off */}
      <path
        d="M370 232c-16-22-26-33-26-46a26 26 0 0 1 52 0c0 13-10 24-26 46z"
        fill="#0a7d5a"
      />
      <circle cx="370" cy="186" r="9" fill="#fff" />
    </svg>
  );
}

export function Hero() {
  return (
    <section className="mx-auto grid max-w-6xl gap-10 px-5 pb-16 pt-10 md:grid-cols-[1.05fr_0.95fr] md:items-center md:pt-16 lg:gap-16">
      <div>
        <h1 className="text-[2.6rem] font-semibold sm:text-6xl">
          Your delivery. Moving forward.
        </h1>
        <p className="mt-5 max-w-lg text-lg text-ink-muted">
          From parcels and meals to everyday purchases, connect with
          independent riders to move what matters across Ilorin.
        </p>

        <form
          action={bookingHref}
          method="get"
          className="mt-8 rounded-panel border border-line bg-white p-4 shadow-soft sm:p-5"
        >
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label htmlFor="pickup" className="text-sm font-medium">
                Pickup location
              </label>
              <input
                id="pickup"
                name="pickup"
                type="text"
                autoComplete="off"
                placeholder="e.g. Unity Road, near Sabo Oke"
                className="mt-1.5 h-11 w-full rounded-control border border-navy-900/20 bg-paper px-3 text-[0.95rem] placeholder:text-ink-muted/70"
              />
            </div>
            <div>
              <label htmlFor="dropoff" className="text-sm font-medium">
                Destination
              </label>
              <input
                id="dropoff"
                name="dropoff"
                type="text"
                autoComplete="off"
                placeholder="e.g. Tanke, near the junction"
                className="mt-1.5 h-11 w-full rounded-control border border-navy-900/20 bg-paper px-3 text-[0.95rem] placeholder:text-ink-muted/70"
              />
            </div>
          </div>
          <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-end">
            <div className="sm:flex-1">
              <label htmlFor="category" className="text-sm font-medium">
                What are we delivering?
              </label>
              <select
                id="category"
                name="category"
                defaultValue="parcel"
                className="mt-1.5 h-11 w-full rounded-control border border-navy-900/20 bg-paper px-3 text-[0.95rem]"
              >
                <option value="parcel">Parcel or document</option>
                <option value="food">Food or groceries</option>
                <option value="product">Product from a shop</option>
              </select>
            </div>
            <button type="submit" className={buttonStyles({ size: "lg" })}>
              Get an estimate
            </button>
          </div>
          <p className="mt-3 text-sm text-ink-muted">
            You&apos;ll review the fee estimate before you confirm anything.
          </p>
        </form>

        <p className="mt-5 text-[0.95rem]">
          Delivering your own work?{" "}
          <Link
            href="/become-a-rider"
            className="font-semibold text-emerald-700 underline underline-offset-4"
          >
            Become a rider
          </Link>
        </p>
      </div>

      <div className="mx-auto w-full max-w-md md:max-w-none">
        <RouteIllustration />
      </div>
    </section>
  );
}
