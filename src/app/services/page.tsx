import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { ArrowRight, Bike, Package, ShoppingBasket, Soup, Store } from "lucide-react";
import { ScrollReveal, StaggerGrid } from "@/components/motion/scroll-effects";

export const metadata: Metadata = { title: "Explore local delivery" };
const options = [
  { title: "Restaurants", text: "Get local meals picked up and delivered to your door.", icon: Soup, href: "/deliveries/new?category=food", photo: "photo-1546069901-ba9599a7e63c", alt: "Fresh meal bowl with colourful vegetables", tint: "bg-[#fff0e6] text-[#a85622]" },
  { title: "Groceries", text: "Market runs and everyday essentials from nearby shops.", icon: ShoppingBasket, href: "/deliveries/new?category=grocery", photo: "photo-1542838132-92c53300491e", alt: "Fresh produce at a neighbourhood market", tint: "bg-[#e8f4e6] text-[#417449]" },
  { title: "Parcels", text: "Documents, gifts and packages across Ilorin.", icon: Package, href: "/deliveries/new?category=parcel", photo: "photo-1607082348824-0a96f2a4b9da", alt: "Parcel packed for a local delivery", tint: "bg-[#e9efff] text-[#405991]" },
  { title: "Local shops", text: "Buy from your favourite neighbourhood stores.", icon: Store, href: "/deliveries/new?category=product", photo: "photo-1472851294608-062f824d29cc", alt: "A welcoming local shopfront", tint: "bg-[#f8e9ef] text-[#a64c6c]" },
];
const imageUrl = (id: string) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=900&q=80`;

export default function ServicesPage() {
  return <ScrollReveal><main className="mx-auto max-w-7xl px-5 py-10 sm:px-8 sm:py-14 lg:px-12"><p className="text-sm font-bold uppercase tracking-[.14em] text-[#de7844]">Ilorin, Kwara State</p><h1 className="mt-2 font-display text-4xl font-semibold tracking-tight text-[#263d32] sm:text-5xl">Your neighbourhood, delivered.</h1><p className="mt-3 max-w-xl text-[#718077]">Tell us what you need moved. We’ll show an estimated delivery fee before you confirm.</p>
    <StaggerGrid className="mt-8 grid gap-5 sm:grid-cols-2">{options.map(({title,text,icon:Icon,href,tint,photo,alt})=><Link key={title} href={href} className="group overflow-hidden rounded-[1.5rem] border border-[#e5e6df] bg-white transition duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-[#263b3112]"><div className="relative h-52 overflow-hidden bg-[#e7e9e0] sm:h-60"><Image src={imageUrl(photo)} alt={alt} fill sizes="(max-width: 640px) 100vw, 50vw" className="object-cover transition-transform duration-500 group-hover:scale-105" /><div className="absolute inset-0 bg-gradient-to-t from-[#182d27]/35 to-transparent" /><span className={`absolute bottom-4 left-4 grid size-12 place-items-center rounded-2xl shadow-sm ${tint}`}><Icon className="size-5" aria-hidden="true" /></span></div><span className="flex items-center gap-4 p-5 sm:p-6"><span className="flex-1"><span className="block font-display text-xl font-semibold text-[#263d32]">{title}</span><span className="mt-1 block text-sm leading-relaxed text-[#758178]">{text}</span><span className="mt-4 inline-flex items-center gap-1 text-sm font-bold text-[#3d6048]">Start a request <ArrowRight className="size-4 transition group-hover:translate-x-1" /></span></span></span></Link>)}</StaggerGrid>
    <div className="mt-8 flex items-start gap-3 rounded-2xl bg-[#f4f5ef] p-5 text-sm text-[#6f7b72]"><Bike className="mt-0.5 size-5 shrink-0 text-[#de7844]"/><p>Delivery fees are estimates based on a short trip in Ilorin. Your final fee is shown for approval before a rider is assigned.</p></div></main></ScrollReveal>;
}
