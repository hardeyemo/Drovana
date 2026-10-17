"use client";

import { useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Check, Clock3, MapPin, Package, ShoppingBag, Soup } from "lucide-react";

const categories = [
  { id: "food", title: "Food", caption: "Restaurant pickup", icon: Soup, base: 700 },
  { id: "grocery", title: "Groceries", caption: "Market or store run", icon: ShoppingBag, base: 800 },
  { id: "parcel", title: "Parcel", caption: "Send something across town", icon: Package, base: 650 },
  { id: "product", title: "Shop pickup", caption: "A local store purchase", icon: ShoppingBag, base: 800 },
] as const;

type Delivery = { id: string; tracking_code: string; estimated_fee_kobo: number; status: string };
type SavedAddress = { id: string; label: string; address: string; area: string };

const serviceFeeNaira = 0;
const formatNaira = (amount: number) => `₦${amount.toLocaleString("en-NG")}`;

export function DeliveryRequestForm({ savedAddresses }: { savedAddresses: SavedAddress[] }) {
  const [category, setCategory] = useState<(typeof categories)[number]["id"]>("food");
  const [delivery, setDelivery] = useState<Delivery | null>(null);
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const [paying, setPaying] = useState(false);

  useEffect(() => {
    const requestedCategory = new URLSearchParams(window.location.search).get("category");
    if (categories.some((item) => item.id === requestedCategory)) setCategory(requestedCategory as (typeof categories)[number]["id"]);
  }, []);
  const feeNaira = useMemo(() => categories.find((item) => item.id === category)?.base ?? 700, [category]);
  const totalNaira = feeNaira + serviceFeeNaira;

  async function submitOrder(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setPending(true); setError("");
    const form = new FormData(event.currentTarget);
    try {
      const response = await fetch("/api/deliveries", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ category, pickup_address: form.get("pickup"), dropoff_address: form.get("dropoff"), customer_phone: form.get("phone"), item_notes: form.get("notes") }) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error ?? "Could not place the request.");
      setDelivery(result.delivery as Delivery);
    } catch (reason) { setError(reason instanceof Error ? reason.message : "Could not place the request."); }
    finally { setPending(false); }
  }

  async function beginPayment() {
    if (!delivery) return;
    setPaying(true); setError("");
    try {
      const response = await fetch("/api/payments/initialize", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ delivery_id: delivery.id }) });
      const result = await response.json();
      if (!response.ok || typeof result.authorization_url !== "string") throw new Error(result.error ?? "Could not start payment.");
      window.location.assign(result.authorization_url);
    } catch (reason) { setError(reason instanceof Error ? reason.message : "Could not start payment."); setPaying(false); }
  }

  if (delivery) {
    const deliveryFeeNaira = delivery.estimated_fee_kobo / 100;
    const dueNaira = deliveryFeeNaira + serviceFeeNaira;

    return <main className="mx-auto max-w-3xl px-5 py-10 sm:px-8 sm:py-14"><div className="rounded-[2rem] border border-[#e5e4dc] bg-white p-6 text-center shadow-sm sm:p-12"><span className="mx-auto grid size-16 place-items-center rounded-full bg-[#e8f4e6] text-[#4e8557]"><Check className="size-8"/></span><p className="mt-5 text-sm font-bold uppercase tracking-[.14em] text-[#de7844]">Request placed</p><h1 className="mt-2 font-display text-3xl font-semibold text-[#263d32]">Your request is in the queue.</h1><p className="mx-auto mt-3 max-w-md text-[#6e7a72]">Review your delivery price before paying. Your rider will be dispatched after payment.</p><div className="mx-auto mt-6 max-w-md rounded-2xl border border-[#e5e6df] bg-white p-5 text-left sm:p-6"><div className="space-y-3 text-sm"><div className="flex justify-between gap-4 text-[#6e7b72]"><span>Delivery fee</span><strong className="text-[#263d32]">{formatNaira(deliveryFeeNaira)}</strong></div><div className="flex justify-between gap-4 text-[#6e7b72]"><span>Service fee</span><strong className="text-[#263d32]">{formatNaira(serviceFeeNaira)}</strong></div><div className="flex justify-between gap-4 border-t border-dashed border-[#dfe3dc] pt-3 font-bold text-[#263d32]"><span>Total due before dispatch</span><span>{formatNaira(dueNaira)}</span></div></div><p className="mt-4 rounded-xl bg-[#f5f6f1] p-3 text-xs leading-relaxed text-[#6c7a70]">Flat launch rates by delivery type for Ilorin. Delivery timing depends on rider availability.</p></div><div className="mx-auto mt-5 max-w-md rounded-2xl bg-[#f6f6f1] p-4 text-left"><div className="text-xs font-semibold uppercase tracking-wider text-[#8a958c]">Tracking reference</div><div className="mt-1 font-display text-2xl font-bold tracking-wider text-[#263d32]">{delivery.tracking_code}</div></div>{error&&<p role="alert" className="mx-auto mt-4 max-w-sm rounded-xl bg-[#fff0ed] p-3 text-sm text-[#a23e32]">{error}</p>}<div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row"><button onClick={beginPayment} disabled={paying} className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-[#de7844] px-6 font-semibold text-white disabled:opacity-60">{paying?"Connecting to payment…":"Pay delivery fee"}<ArrowRight className="size-4"/></button><Link href={`/deliveries/track?ref=${delivery.tracking_code}`} className="inline-flex h-12 items-center justify-center rounded-full border border-[#dce1d9] px-6 font-semibold text-[#33483a]">Track request</Link></div></div></main>;
  }

  return <main className="mx-auto grid max-w-6xl gap-8 px-5 py-10 sm:px-8 lg:grid-cols-[minmax(0,1fr)_340px] lg:px-12"><div><Link href="/" className="inline-flex items-center gap-2 text-sm font-semibold text-[#66746b]"><ArrowLeft className="size-4"/> Back home</Link><p className="mt-7 text-sm font-bold uppercase tracking-[.14em] text-[#de7844]">Drovna · Ilorin</p><h1 className="mt-2 font-display text-4xl font-semibold tracking-tight text-[#263d32]">Where should we go?</h1><p className="mt-2 text-[#718077]">Choose a delivery type to see the flat Ilorin launch rate before confirming.</p><p className="mt-4 text-sm text-[#718077]">Please review the <Link href="/terms" className="font-semibold text-[#456349] underline underline-offset-2">Terms &amp; Conditions</Link> before placing your delivery request.</p><form onSubmit={submitOrder} className="mt-7 space-y-6"><fieldset><legend className="font-semibold text-[#293c31]">Choose a delivery</legend><div className="mt-3 grid gap-3 sm:grid-cols-2">{categories.map(({id,title,caption,icon:Icon})=><button key={id} type="button" aria-pressed={category===id} onClick={()=>setCategory(id)} className={`rounded-2xl border p-4 text-left transition ${category===id?"border-[#de7844] bg-[#fff7f1] ring-1 ring-[#de7844]":"border-[#e4e6df] bg-white hover:border-[#bbc8bb]"}`}><Icon className={`size-5 ${category===id?"text-[#de7844]":"text-[#68796d]"}`}/><span className="mt-3 block font-semibold text-[#263d32]">{title}</span><span className="mt-1 block text-xs leading-relaxed text-[#7c8780]">{caption}</span></button>)}</div></fieldset>{savedAddresses.length>0&&<datalist id="saved-address-options">{savedAddresses.map((address)=><option key={address.id} value={address.address}>{address.label} · {address.area}</option>)}</datalist>}<div className="grid gap-4 sm:grid-cols-2"><label className="text-sm font-semibold text-[#293c31]">Pickup address<input list={savedAddresses.length?"saved-address-options":undefined} name="pickup" required minLength={5} maxLength={300} placeholder="Street, area or landmark" className="mt-2 h-12 w-full rounded-xl border border-[#dfe3dc] bg-white px-4 font-normal outline-none focus:border-[#de7844]"/></label><label className="text-sm font-semibold text-[#293c31]">Drop-off address<input list={savedAddresses.length?"saved-address-options":undefined} name="dropoff" required minLength={5} maxLength={300} placeholder="Street, area or landmark" className="mt-2 h-12 w-full rounded-xl border border-[#dfe3dc] bg-white px-4 font-normal outline-none focus:border-[#de7844]"/></label></div><div className="grid gap-4 sm:grid-cols-2"><label className="text-sm font-semibold text-[#293c31]">Your phone number<input name="phone" required type="tel" pattern="(\+?234|0)[789][01][0-9][0-9 ()-]{7,13}" title="Enter a Nigerian mobile number, for example 080 1234 5678." maxLength={24} placeholder="080 1234 5678" className="mt-2 h-12 w-full rounded-xl border border-[#dfe3dc] bg-white px-4 font-normal outline-none focus:border-[#de7844]"/></label><label className="text-sm font-semibold text-[#293c31]">Order notes <span className="font-normal text-[#89938b]">(optional)</span><input name="notes" maxLength={500} placeholder="What should your rider know?" className="mt-2 h-12 w-full rounded-xl border border-[#dfe3dc] bg-white px-4 font-normal outline-none focus:border-[#de7844]"/></label></div>{error&&<p role="alert" className="rounded-xl bg-[#fff0ed] p-3 text-sm text-[#a23e32]">{error}</p>}<button type="submit" disabled={pending} className="inline-flex h-13 w-full items-center justify-center gap-2 rounded-full bg-[#de7844] px-6 font-semibold text-white hover:bg-[#c96232] disabled:cursor-wait disabled:opacity-60 sm:w-auto sm:min-w-56">{pending?"Placing request…":"Place delivery request"}{!pending&&<ArrowRight className="size-4"/>}</button></form></div><aside aria-label="Delivery price summary" className="h-fit rounded-[1.5rem] border border-[#e4e6df] bg-white p-5 sm:p-6 lg:mt-16"><p className="font-display text-xl font-semibold text-[#263d32]">Price summary</p><div className="mt-5 space-y-4 text-sm"><div className="flex items-center justify-between gap-4 text-[#6e7b72]"><span>Delivery fee</span><strong className="text-[#263d32]">{formatNaira(feeNaira)}</strong></div><div className="flex items-center justify-between gap-4 text-[#6e7b72]"><span>Service fee</span><strong className="text-[#263d32]">{formatNaira(serviceFeeNaira)}</strong></div><div className="border-t border-dashed border-[#dfe3dc] pt-4"><div className="flex items-center justify-between gap-4 font-bold text-[#263d32]"><span>Total due before dispatch</span><span>{formatNaira(totalNaira)}</span></div></div></div><p className="mt-5 rounded-xl bg-[#f5f6f1] p-3 text-xs leading-relaxed text-[#6c7a70]">Flat launch rates by delivery type for Ilorin. Your delivery fee and total are shown before you confirm and pay.</p><div className="mt-5 flex items-start gap-2 text-xs leading-relaxed text-[#718077]"><Clock3 className="mt-0.5 size-4 shrink-0 text-[#de7844]"/><span>Delivery timing depends on rider availability.</span></div><div className="mt-3 flex items-center gap-2 text-xs text-[#718077]"><MapPin className="size-4 shrink-0 text-[#de7844]"/><span>Ilorin, Kwara State</span></div></aside></main>;
}
