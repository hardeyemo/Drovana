"use client";

import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { ArrowLeft, Check, Clock3, MapPin, Search } from "lucide-react";
import Link from "next/link";

type TrackingData = {
  delivery: { id: string; tracking_code: string; category: string; pickup_address: string; dropoff_address: string; estimated_fee_kobo: number; final_fee_kobo: number | null; status: string; requested_at: string };
  events: Array<{ status: string; note: string | null; created_at: string }>;
};

const steps = [
  { id: "requested", label: "Request placed" },
  { id: "accepted", label: "Rider assigned" },
  { id: "picked_up", label: "Picked up" },
  { id: "in_transit", label: "On the way" },
  { id: "delivered", label: "Delivered" },
];

export function TrackingLookup() {
  const searchParams = useSearchParams();
  const [reference, setReference] = useState(searchParams.get("ref") ?? "");
  const [data, setData] = useState<TrackingData | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const lookup = useCallback(async (value: string, quiet = false) => {
    const clean = value.trim().toUpperCase();
    if (!clean) return;
    if (!quiet) setLoading(true);
    setError("");
    try {
      const response = await fetch(`/api/deliveries/track?ref=${encodeURIComponent(clean)}`, { cache: "no-store" });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error ?? "Tracking request failed.");
      setData(result as TrackingData);
    } catch (reason) {
      if (!quiet) { setData(null); setError(reason instanceof Error ? reason.message : "Tracking is unavailable."); }
    } finally { if (!quiet) setLoading(false); }
  }, []);

  useEffect(() => {
    const ref = searchParams.get("ref");
    if (ref) { setReference(ref); void lookup(ref); }
  }, [lookup, searchParams]);

  useEffect(() => {
    if (!data || ["delivered", "cancelled"].includes(data.delivery.status)) return;
    const timer = window.setInterval(() => void lookup(data.delivery.tracking_code, true), 15000);
    return () => window.clearInterval(timer);
  }, [data, lookup]);

  const currentIndex = data ? steps.findIndex((step) => step.id === data.delivery.status) : -1;
  const eventTimes = new Map((data?.events ?? []).map((event) => [event.status, event.created_at]));
  return <main className="mx-auto max-w-3xl px-5 py-10 sm:px-8"><Link href="/" className="inline-flex items-center gap-2 text-sm font-semibold text-[#66746b]"><ArrowLeft className="size-4"/> Back home</Link><div className="mx-auto mt-10 max-w-xl"><p className="text-sm font-bold uppercase tracking-[.14em] text-[#de7844]">Drovna tracking</p><h1 className="mt-2 font-display text-4xl font-semibold tracking-tight text-[#263d32]">Your delivery, in view.</h1><p className="mt-2 text-[#718077]">Enter the tracking reference from your order confirmation.</p><form className="mt-6 flex flex-col gap-2 min-[420px]:flex-row" onSubmit={(event)=>{event.preventDefault();void lookup(reference);}}><label className="sr-only" htmlFor="tracking-ref">Tracking reference</label><div className="relative min-w-0 flex-1"><Search className="absolute left-4 top-1/2 size-4 -translate-y-1/2 text-[#89958b]"/><input id="tracking-ref" value={reference} onChange={(event)=>setReference(event.target.value)} placeholder="e.g. SD-A4C88F12" className="h-13 w-full rounded-full border border-[#dfe3dc] bg-white pl-11 pr-4 outline-none focus:border-[#de7844]"/></div><button disabled={loading} className="h-12 shrink-0 rounded-full bg-[#de7844] px-5 font-semibold text-white disabled:opacity-60 min-[420px]:h-13">{loading?"Loadingâ€¦":"Track"}</button></form>
      {error&&<div role="alert" className="mt-5 rounded-2xl border border-[#f0d1cb] bg-[#fff4f1] p-4 text-sm text-[#9a4034]">{error}</div>}
      {data&&<section className="mt-7 rounded-[1.5rem] border border-[#e4e6df] bg-white p-5 shadow-sm sm:p-7"><div className="flex flex-wrap items-start justify-between gap-3"><div><div className="text-xs font-semibold uppercase tracking-wider text-[#89938b]">Tracking reference</div><h2 className="mt-1 font-display text-2xl font-bold text-[#263d32]">{data.delivery.tracking_code}</h2></div><span className="rounded-full bg-[#fff0e6] px-3 py-1.5 text-xs font-bold capitalize text-[#a95631]">{data.delivery.status.replaceAll("_"," ")}</span></div><div className="mt-6 grid gap-3 rounded-2xl bg-[#f7f7f2] p-4 sm:grid-cols-2"><div><div className="text-xs text-[#8a958c]">PICKUP</div><div className="mt-1 flex gap-2 font-semibold text-[#33483a]"><MapPin className="mt-0.5 size-4 shrink-0 text-[#de7844]"/>{data.delivery.pickup_address}</div></div><div><div className="text-xs text-[#8a958c]">DELIVER TO</div><div className="mt-1 flex gap-2 font-semibold text-[#33483a]"><MapPin className="mt-0.5 size-4 shrink-0 text-[#6c9a69]"/>{data.delivery.dropoff_address}</div></div></div><ol className="mt-7 space-y-5">{steps.map((step,index)=>{const complete=data.delivery.status==="cancelled"?eventTimes.has(step.id):index<=currentIndex;const eventAt=eventTimes.get(step.id)??(step.id==="requested"?data.delivery.requested_at:undefined);return <li key={step.id} className="flex gap-3"><span className={`grid size-8 shrink-0 place-items-center rounded-full ${complete?"bg-[#e8f4e6] text-[#4e8557]":"bg-[#f1f2ed] text-[#9ba49b]"}`}>{complete?<Check className="size-4"/>:<span className="size-2 rounded-full bg-current"/>}</span><div><div className={`font-semibold ${complete?"text-[#33483a]":"text-[#879188]"}`}>{step.label}</div>{complete&&eventAt&&<div className="mt-0.5 text-xs text-[#89938b]">{new Date(eventAt).toLocaleString()}</div>}</div>{index===currentIndex&&<Clock3 className="ml-auto size-4 text-[#9da69e]"/>}</li>})}</ol><div className="mt-6 border-t border-[#edf0e9] pt-4 text-sm text-[#6d796f]">Delivery fee: <strong className="text-[#263d32]">â‚¦{((data.delivery.final_fee_kobo??data.delivery.estimated_fee_kobo)/100).toLocaleString()}</strong>{data.delivery.final_fee_kobo===null&&<span className="ml-2 text-xs">estimate</span>}</div>{data.delivery.status==="cancelled"&&<div className="mt-4 rounded-xl bg-[#f5f4f0] p-3 text-sm text-[#788178]">This delivery was cancelled.</div>}</section>}
      </div></main>;
}
