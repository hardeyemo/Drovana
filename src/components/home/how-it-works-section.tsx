const steps = [
  {
    title: "Enter the delivery details",
    text: "Add pickup and drop-off addresses, the item, and phone numbers for both ends. You see a fee estimate before you confirm.",
  },
  {
    title: "Connect with an approved rider",
    text: "Approved independent riders can accept your request. How quickly one accepts depends on how many riders are active at the time.",
  },
  {
    title: "Follow progress until it's done",
    text: "Your delivery moves through clear statuses: accepted, picked up, in transit and delivered.",
  },
];

export function HowItWorksSection() {
  return (
    <section className="bg-navy-900 text-white">
      <div className="mx-auto max-w-6xl px-5 py-16">
        <h2 className="max-w-xl text-3xl font-semibold sm:text-4xl">
          How a delivery works
        </h2>
        <ol className="mt-10 grid gap-8 md:grid-cols-3">
          {steps.map((s, i) => (
            <li key={s.title} className="flex gap-4 md:block">
              <span
                aria-hidden="true"
                className="flex size-10 shrink-0 items-center justify-center rounded-full bg-emerald-500 font-display text-lg font-semibold text-navy-950"
              >
                {i + 1}
              </span>
              <div className="md:mt-4">
                <h3 className="text-xl font-semibold">{s.title}</h3>
                <p className="mt-2 text-navy-200">{s.text}</p>
              </div>
            </li>
          ))}
        </ol>
        <p className="mt-10 max-w-2xl rounded-control border border-white/15 px-4 py-3 text-sm text-navy-200">
          We&apos;re launching in Ilorin and building our rider community. Fees are
          estimates, and delivery times aren&apos;t guaranteed.
        </p>
      </div>
    </section>
  );
}
