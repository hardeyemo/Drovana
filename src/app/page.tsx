import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  Bike,
  Clock3,
  Package,
  ShoppingBasket,
  Soup,
  Sparkles,
  Store,
} from "lucide-react";
import { buttonStyles } from "@/components/ui/button";
import { ScrollReveal, StaggerGrid } from "@/components/motion/scroll-effects";
import { bookingHref } from "@/lib/config/site";

const categories = [
  { label: "Restaurants", detail: "Local favourites", icon: Soup, tone: "bg-[#fff0de] text-[#a85622]", href: "/services?category=food" },
  { label: "Groceries", detail: "Fresh, everyday", icon: ShoppingBasket, tone: "bg-[#e8f4e6] text-[#417449]", href: "/services?category=grocery" },
  { label: "Send a parcel", detail: "Across Ilorin", icon: Package, tone: "bg-[#e9efff] text-[#405991]", href: "/deliveries/new?category=parcel" },
  { label: "Local shops", detail: "Find it nearby", icon: Store, tone: "bg-[#f8e9ef] text-[#a64c6c]", href: "/services?category=product" },
];

const picks = [
  { name: "Amala Skye", kind: "Nigerian · Amala & soups", rating: "4.8", time: "20–35 min", fee: "₦850 delivery", category: "food", photo: "photo-1546069901-ba9599a7e63c", alt: "Colourful fresh meal bowl topped with vegetables" },
  { name: "The Green Bowl", kind: "Fresh · Bowls & smoothies", rating: "4.7", time: "25–40 min", fee: "₦1,000 delivery", category: "food", photo: "photo-1512621776951-a57141f2eefd", alt: "Fresh green salad with seasonal ingredients" },
  { name: "Tanke Market", kind: "Groceries · Everyday essentials", rating: "4.9", time: "30–45 min", fee: "₦700 delivery", category: "grocery", photo: "photo-1542838132-92c53300491e", alt: "Fresh produce arranged at a local market" },
];

const imageUrl = (id: string, width: number) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${width}&q=80`;

export default function HomePage() {
  return (
    <main>
      <ScrollReveal>
        <section className="relative overflow-hidden bg-[#f8f7f3]">
          <div className="mx-auto w-full max-w-7xl px-4 py-7 sm:px-8 sm:py-10 md:py-14 lg:px-12">
            <div className="relative mx-auto aspect-[1.15/1] w-full max-w-[1100px] overflow-hidden bg-[#d9dfd2] shadow-[0_24px_70px_-30px_rgba(24,45,39,.35)] sm:aspect-[1.3/1] md:aspect-[1.4/1]" style={{ borderRadius: "1.5rem 45% 45% 1.5rem / 1.5rem 50% 50% 1.5rem" }}>
              <Image src="https://images.pexels.com/photos/7362951/pexels-photo-7362951.jpeg?auto=compress&cs=tinysrgb&w=1600" alt="Black delivery courier wearing a helmet, ready to ride through the city" fill priority sizes="(max-width: 640px) 100vw, (max-width: 1024px) 90vw, 1100px" className="object-cover object-[center_38%]" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#182d27]/75 via-[#182d27]/10 to-[#182d27]/15" aria-hidden="true" />
              <div className="absolute left-4 top-4 rounded-full border border-white/55 bg-[#f8f7f3]/95 px-3.5 py-2 text-[10px] font-bold uppercase tracking-[.14em] text-[#345542] shadow-md sm:left-7 sm:top-7 sm:px-4 sm:text-xs">
                Local delivery · Ilorin
              </div>
              <div className="absolute bottom-5 left-5 right-5 text-white sm:bottom-9 sm:left-9 sm:right-auto sm:max-w-lg">
                <p className="text-xs font-bold uppercase tracking-[.18em] text-[#f4c28d] sm:text-sm">From pickup to doorstep</p>
                <h1 className="mt-2 max-w-md font-display text-2xl font-semibold leading-tight text-white sm:text-4xl md:text-5xl">Your delivery, in good hands.</h1>
                <p className="mt-2 max-w-sm text-sm leading-relaxed text-white/90 sm:mt-3 sm:text-base">Trusted local riders moving food, parcels and everyday essentials across Ilorin.</p>
              </div>
            </div>
          </div>
        </section>
      </ScrollReveal>

      <ScrollReveal>
        <section className="mx-auto max-w-7xl px-5 py-14 sm:px-8 lg:px-12 lg:py-16">
          <div className="flex flex-wrap items-end justify-between gap-4"><div><p className="text-sm font-bold uppercase tracking-[.15em] text-[#de7844]">One app, many errands</p><h2 className="mt-2 font-display text-3xl font-semibold tracking-tight text-[#1d332a] sm:text-4xl">What can we bring you?</h2></div><Link href="/services" className="hidden items-center gap-2 pb-1 text-sm font-semibold text-[#3d6048] hover:text-[#de7844] sm:flex">Explore everything <ArrowRight className="size-4" /></Link></div>
          <StaggerGrid className="mt-7 grid grid-cols-1 gap-3 min-[420px]:grid-cols-2 sm:grid-cols-4 sm:gap-4">{categories.map(({ label, detail, icon: Icon, tone, href }) => <Link key={label} href={href} className="group flex min-h-24 items-center gap-3 rounded-2xl border border-[#e9e9e3] bg-white p-4 transition duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-[#25382f0d] sm:min-h-28 sm:gap-4 sm:p-5"><span className={`grid size-12 shrink-0 place-items-center rounded-2xl ${tone}`}><Icon className="size-5" /></span><span className="min-w-0"><span className="block font-display text-base font-semibold text-[#263b31] sm:text-lg">{label}</span><span className="mt-0.5 block text-xs text-[#7c8780] sm:text-sm">{detail}</span></span><ArrowRight className="ml-auto hidden size-4 text-[#a3aca4] transition group-hover:translate-x-1 group-hover:text-[#de7844] sm:block" /></Link>)}</StaggerGrid>
        </section>
      </ScrollReveal>

      <ScrollReveal>
        <section className="bg-[#f3f2ec] py-14 lg:py-16"><div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-12"><div className="flex flex-wrap items-end justify-between gap-4"><div><p className="text-sm font-bold uppercase tracking-[.15em] text-[#de7844]">A little closer to home</p><h2 className="mt-2 font-display text-3xl font-semibold tracking-tight text-[#1d332a] sm:text-4xl">Ilorin picks for you</h2><p className="mt-2 text-[#728078]">Good local spots. Straightforward delivery fees.</p></div><Link href="/services?category=food" className="inline-flex items-center gap-2 pb-1 text-sm font-semibold text-[#3d6048]">See all nearby <ArrowRight className="size-4" /></Link></div>
          <StaggerGrid className="mt-7 grid gap-4 md:grid-cols-3">{picks.map((pick) => <Link key={pick.name} href={`/deliveries/new?category=${pick.category}`} className="group overflow-hidden rounded-[1.4rem] border border-[#e5e4dc] bg-white transition duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-[#263b3112]"><div className="relative h-48 overflow-hidden bg-[#e7e9e0] sm:h-52"><Image src={imageUrl(pick.photo, 800)} alt={pick.alt} fill sizes="(max-width: 768px) 100vw, 33vw" className="object-cover transition-transform duration-500 group-hover:scale-105" /><div className="absolute inset-0 bg-gradient-to-t from-[#182d27]/35 to-transparent" /><span className="absolute left-4 top-4 rounded-full bg-white/95 px-3 py-1 text-[11px] font-bold text-[#415648]">{pick.name === "Tanke Market" ? "Market near you" : "Ilorin favourite"}</span><span className="absolute bottom-3 right-3 rounded-full bg-white px-2.5 py-1 text-xs font-bold text-[#24382e]">★ {pick.rating}</span></div><div className="p-4"><div className="flex items-start justify-between gap-2"><div className="min-w-0"><h3 className="font-display text-xl font-semibold text-[#24382e]">{pick.name}</h3><p className="mt-1 text-sm text-[#7c8780]">{pick.kind}</p></div><ArrowRight className="mt-1 size-4 shrink-0 text-[#9ba59c] transition group-hover:translate-x-1 group-hover:text-[#de7844]" /></div><div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-[#eff0eb] pt-3 text-xs font-medium text-[#627168]"><span className="inline-flex items-center gap-1"><Clock3 className="size-3.5" />{pick.time}</span><span className="rounded-full bg-[#f5f6f1] px-2.5 py-1 text-[#3d6048]">{pick.fee}</span></div></div></Link>)}</StaggerGrid><p className="mt-4 text-xs text-[#8a938c]">Illustrative local listings and delivery estimates. Final availability, item prices and fee shown before confirmation.</p>
        </div></section>
      </ScrollReveal>

      <ScrollReveal>
        <section className="mx-auto grid max-w-7xl gap-5 px-5 py-14 sm:px-8 md:grid-cols-2 lg:px-12 lg:py-16">
          <div className="relative isolate min-h-[340px] overflow-hidden rounded-[1.6rem] bg-[#263d32] p-6 text-white sm:p-9"><Image src={imageUrl("photo-1607082348824-0a96f2a4b9da", 1000)} alt="Carefully packed parcel ready for delivery" fill sizes="(max-width: 768px) 100vw, 50vw" className="-z-20 object-cover opacity-40" /><div className="absolute inset-0 -z-10 bg-gradient-to-br from-[#182d27]/95 via-[#263d32]/80 to-[#263d32]/45" /><Sparkles className="absolute right-7 top-7 size-6 text-[#f0b977]" /><p className="text-sm font-bold uppercase tracking-[.14em] text-[#c9d8c7]">Every step, in the know</p><h2 className="mt-3 max-w-sm font-display text-3xl font-semibold leading-tight sm:text-4xl">No wondering where your order is.</h2><p className="mt-3 max-w-sm text-sm leading-relaxed text-[#e1e9e1]">See when your rider accepts, picks up and arrives. Your delivery fee is clear before you place the order.</p><Link href="/deliveries/track" className="mt-6 inline-flex h-12 items-center gap-2 rounded-full bg-white px-5 text-sm font-bold text-[#263d32] transition hover:bg-[#f6efe6]">Track a delivery <ArrowRight className="size-4" /></Link></div>
          <div className="relative isolate flex min-h-[340px] flex-col justify-between overflow-hidden rounded-[1.6rem] bg-[#f6e9d7] p-6 sm:p-9"><Image src={imageUrl("photo-1632906410999-d0e7fd1a7b9d", 1000)} alt="Local courier riding to make a delivery" fill sizes="(max-width: 768px) 100vw, 50vw" className="-z-20 object-cover opacity-25" /><div className="absolute inset-0 -z-10 bg-gradient-to-br from-[#f6e9d7]/95 via-[#f6e9d7]/80 to-[#f6e9d7]/45" /><div><div className="flex items-center gap-2 text-sm font-bold uppercase tracking-[.14em] text-[#9b633a]"><Bike className="size-4" /> For Ilorin riders</div><h2 className="mt-3 max-w-sm font-display text-3xl font-semibold leading-tight text-[#302c25] sm:text-4xl">Make the road work for you.</h2><p className="mt-3 max-w-sm text-sm leading-relaxed text-[#75685a]">Choose the deliveries that fit your day. Manage jobs, pickup details and delivery status from your rider dashboard.</p><Link href="/applications/rider" className="mt-6 inline-flex h-12 items-center gap-2 rounded-full bg-[#de7844] px-5 text-sm font-bold text-white transition hover:bg-[#c96232]">Apply to ride <ArrowRight className="size-4" /></Link></div><div className="mt-7 flex items-center justify-between gap-3 rounded-2xl border border-[#ead9c5] bg-white/85 p-4 backdrop-blur-sm"><div><div className="text-xs font-semibold uppercase tracking-wider text-[#9b8a78]">Built for local riders</div><div className="mt-1 font-semibold text-[#342f27]">Flexible jobs around Ilorin</div></div><div className="grid size-11 shrink-0 place-items-center rounded-full bg-[#e8f0e3] text-[#456349]"><Bike className="size-5" /></div></div></div>
        </section>
      </ScrollReveal>

      <ScrollReveal>
        <section className="border-t border-[#e9e7df] bg-white"><div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-5 px-5 py-9 sm:flex-row sm:items-center sm:px-8 lg:px-12"><div><p className="font-display text-2xl font-semibold text-[#1d332a]">Ilorin, we’re on our way.</p><p className="mt-1 text-sm text-[#748078]">Food, errands and everyday essentials, all in one place.</p></div><Link href={bookingHref} className={buttonStyles({ size: "lg", className: "!w-full !rounded-full !bg-[#de7844] !text-white hover:!bg-[#c96232] sm:!w-auto" })}>Get started <ArrowRight className="size-4" /></Link></div></section>
      </ScrollReveal>
    </main>
  );
}
