import Link from "next/link";
import { FileText, ShoppingBag, UtensilsCrossed } from "lucide-react";
import type { LucideIcon } from "lucide-react";

const services: {
  icon: LucideIcon;
  title: string;
  text: string;
  category: string;
  cta: string;
}[] = [
  {
    icon: FileText,
    title: "Parcels and documents",
    text: "Send a package to a friend, or take paperwork to an office or school across town.",
    category: "parcel",
    cta: "Send a parcel",
  },
  {
    icon: UtensilsCrossed,
    title: "Food and groceries",
    text: "Have a meal or a grocery order collected from where you bought it and brought to you.",
    category: "food",
    cta: "Order a pickup",
  },
  {
    icon: ShoppingBag,
    title: "Shopping and products",
    text: "Buy from a local shop and have the item brought to your door, or sent to someone else.",
    category: "product",
    cta: "Deliver a purchase",
  },
];

export function ServicesSection() {
  return (
    <section className="mx-auto max-w-6xl px-5 py-16">
      <h2 className="max-w-xl text-3xl font-semibold sm:text-4xl">
        Three kinds of delivery, one request form
      </h2>
      <div className="mt-8 divide-y divide-line overflow-hidden rounded-panel border border-line bg-white md:grid md:grid-cols-3 md:divide-x md:divide-y-0">
        {services.map(({ icon: Icon, title, text, category, cta }) => (
          <div key={category} className="flex flex-col p-6">
            <span className="inline-flex size-11 items-center justify-center rounded-control bg-emerald-100 text-emerald-800">
              <Icon className="size-5" aria-hidden="true" />
            </span>
            <h3 className="mt-4 text-xl font-semibold">{title}</h3>
            <p className="mt-2 flex-1 text-ink-muted">{text}</p>
            <Link
              href={`/deliveries/new?category=${category}`}
              className="mt-5 font-semibold text-emerald-700 underline underline-offset-4"
            >
              {cta}
            </Link>
          </div>
        ))}
      </div>
    </section>
  );
}
