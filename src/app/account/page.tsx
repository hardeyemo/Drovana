import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, MapPin, Package } from "lucide-react";
import { requireRole } from "@/lib/auth/server";
import { SignOutButton } from "@/components/auth/sign-out-button";
import { SavedAddresses } from "@/components/account/saved-addresses";

export const metadata: Metadata = { title: "Your account" };

export default async function AccountPage() {
  const { profile, supabase } = await requireRole("customer");
  const [{ data: deliveries }, { data: addresses }] = await Promise.all([
    supabase.from("deliveries").select("id,tracking_code,category,pickup_address,dropoff_address,estimated_fee_kobo,status,requested_at").order("requested_at", { ascending: false }).limit(20),
    supabase.from("saved_addresses").select("id,label,address,area").order("created_at", { ascending: false }).limit(20),
  ]);
  return <main className="mx-auto max-w-6xl px-5 py-10 sm:px-8 lg:px-12"><div className="flex flex-wrap items-center justify-between gap-4"><div><p className="text-xs font-bold uppercase tracking-[.15em] text-[#de7844]">Customer account</p><h1 className="mt-1 font-display text-3xl font-semibold text-[#263d32]">Hi, {profile.full_name || "there"}.</h1><p className="mt-1 text-sm text-[#718077]">Manage your deliveries and saved addresses.</p></div><SignOutButton/></div><div className="mt-8 grid gap-4 sm:grid-cols-2"><Link href="/deliveries/new" className="flex items-center justify-between rounded-2xl bg-[#de7844] p-5 font-semibold text-white"><span className="flex items-center gap-3"><Package/> Book a delivery</span><ArrowRight className="size-4"/></Link><Link href="/applications/rider" className="flex items-center justify-between rounded-2xl border border-[#e5e6df] bg-white p-5 font-semibold text-[#33483a]"><span className="flex items-center gap-3"><MapPin/> Apply to ride</span><ArrowRight className="size-4"/></Link></div><section className="mt-10"><h2 className="font-display text-2xl font-semibold text-[#263d32]">Your recent deliveries</h2><div className="mt-4 space-y-3">{deliveries?.length?deliveries.map((delivery)=><article key={delivery.id} className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-[#e5e6df] bg-white p-5"><div><span className="text-xs font-bold uppercase tracking-wider text-[#de7844]">{delivery.tracking_code} · {delivery.category}</span><p className="mt-1 font-semibold text-[#33483a]">{delivery.pickup_address} → {delivery.dropoff_address}</p><p className="mt-1 text-xs capitalize text-[#7b887e]">{delivery.status.replaceAll("_"," ")} · Estimate ₦{(delivery.estimated_fee_kobo/100).toLocaleString()}</p></div><Link className="text-sm font-bold text-[#3d6048]" href={`/deliveries/track?ref=${delivery.tracking_code}`}>Track <ArrowRight className="ml-1 inline size-4"/></Link></article>):<p className="rounded-2xl border border-dashed border-[#d6ded4] bg-white p-7 text-sm text-[#7c8780]">Your delivery history will appear here.</p>}</div></section><SavedAddresses initialAddresses={addresses??[]}/></main>;
}
