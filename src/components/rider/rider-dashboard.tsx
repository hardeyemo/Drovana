"use client";

import { useState } from "react";
import { ArrowRight, Bike, Check, Clock3, MapPin, Navigation } from "lucide-react";

type Job = { id: string; tracking_code: string; category: string; pickup_address: string; dropoff_address: string; distance_meters: number | null; estimated_fee_kobo: number; requested_at: string };
type ActiveJob = { id: string; tracking_code: string; pickup_address: string; dropoff_address: string; status: string; customer_phone: string };

export function RiderDashboard({ initialJobs, activeJobs, isAvailable }: { initialJobs: Job[]; activeJobs: ActiveJob[]; isAvailable: boolean }) {
  const [online, setOnline] = useState(isAvailable);
  const [jobs, setJobs] = useState(initialJobs);
  const [active, setActive] = useState(activeJobs);
  const [busy, setBusy] = useState("");
  const [error, setError] = useState("");

  async function toggleAvailability() {
    setBusy("availability"); setError("");
    try {
      const response = await fetch("/api/rider/availability", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ available: !online }) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error);
      setOnline(result.available);
      if (!result.available) setJobs([]);
      else window.location.reload();
    } catch (reason) { setError(reason instanceof Error ? reason.message : "Availability update failed."); }
    finally { setBusy(""); }
  }

  async function accept(job: Job) {
    setBusy(job.id); setError("");
    try {
      const response = await fetch(`/api/rider/jobs/${job.id}`, { method: "POST" });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error);
      setJobs((current)=>current.filter((item)=>item.id!==job.id));
      setActive((current)=>[{ id:job.id, tracking_code:job.tracking_code, pickup_address:job.pickup_address, dropoff_address:job.dropoff_address, status:"accepted", customer_phone:result.customer_phone ?? "" }, ...current]);
    } catch (reason) { setError(reason instanceof Error ? reason.message : "Could not accept this job."); }
    finally { setBusy(""); }
  }

  async function advance(job: ActiveJob) {
    const next = job.status === "accepted" ? "picked_up" : job.status === "picked_up" ? "in_transit" : "delivered";
    setBusy(job.id); setError("");
    try {
      const response = await fetch(`/api/rider/deliveries/${job.id}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status: next }) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error);
      setActive((current)=>next === "delivered" ? current.filter((item)=>item.id!==job.id) : current.map((item)=>item.id===job.id?{...item,status:next}:item));
    } catch (reason) { setError(reason instanceof Error ? reason.message : "Could not update delivery."); }
    finally { setBusy(""); }
  }

  return <main className="min-h-[70vh] bg-[#f6f6f1]"><div className="mx-auto max-w-7xl px-5 py-8 sm:px-8 lg:px-12"><div className="flex flex-wrap items-center justify-between gap-4"><div><p className="text-sm font-bold uppercase tracking-[.14em] text-[#de7844]">Drovna rider</p><h1 className="mt-1 font-display text-3xl font-semibold text-[#263d32] sm:text-4xl">Your Ilorin dashboard</h1><p className="mt-1 text-[#77827a]">Manage your availability and assigned deliveries.</p></div><button onClick={toggleAvailability} disabled={busy==="availability"} aria-pressed={online} className={`inline-flex h-11 items-center gap-2 rounded-full px-4 text-sm font-bold disabled:opacity-60 ${online?"bg-[#e7f3e5] text-[#427749]":"bg-[#eceee9] text-[#68736a]"}`}><span className={`size-2 rounded-full ${online?"bg-[#57a262]":"bg-[#9ba49c]"}`}/>{busy==="availability"?"Updatingâ€¦":online?"Youâ€™re online":"Youâ€™re offline"}</button></div>
      {error&&<p role="alert" className="mt-5 rounded-xl bg-[#fff0ed] p-3 text-sm text-[#a23e32]">{error}</p>}
      <div className="mt-7 grid gap-4 sm:grid-cols-3"><div className="rounded-2xl border border-[#e5e6df] bg-white p-5"><div className="flex items-center justify-between text-sm text-[#78847b]"><span>Active jobs</span><Bike className="size-4 text-[#de7844]"/></div><div className="mt-3 font-display text-3xl font-bold text-[#263d32]">{active.length}</div></div><div className="rounded-2xl border border-[#e5e6df] bg-white p-5"><div className="flex items-center justify-between text-sm text-[#78847b]"><span>Nearby requests</span><Navigation className="size-4 text-[#de7844]"/></div><div className="mt-3 font-display text-3xl font-bold text-[#263d32]">{online?jobs.length:0}</div></div><div className="rounded-2xl border border-[#e5e6df] bg-white p-5"><div className="flex items-center justify-between text-sm text-[#78847b]"><span>Delivery status</span><Check className="size-4 text-[#6d9b69]"/></div><div className="mt-3 font-display text-xl font-bold capitalize text-[#263d32]">{online?"Available":"Offline"}</div></div></div>
      <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_360px]"><section><div className="flex items-end justify-between gap-3"><div><h2 className="font-display text-2xl font-semibold text-[#263d32]">Nearby delivery requests</h2><p className="mt-1 text-sm text-[#77827a]">The customerâ€™s phone number is shared after acceptance.</p></div><span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-[#718077]">{online?jobs.length:0} available</span></div><div className="mt-4 space-y-3">{!online&&<div className="rounded-2xl border border-[#e5e6df] bg-white p-5 text-sm text-[#768279]">Go online to see available jobs.</div>}{online&&jobs.map((job)=><article key={job.id} className="rounded-2xl border border-[#e5e6df] bg-white p-5"><div className="flex flex-wrap items-start justify-between gap-4"><div><span className="rounded-full bg-[#fff0e6] px-2.5 py-1 text-[11px] font-bold capitalize text-[#aa5a34]">{job.category}</span><div className="mt-4 grid gap-3 sm:grid-cols-[1fr_auto_1fr] sm:items-center"><div><div className="text-[10px] font-bold uppercase tracking-wider text-[#97a097]">PICK UP</div><div className="mt-1 flex items-center gap-1.5 font-semibold text-[#33483a]"><MapPin className="size-3.5 text-[#de7844]"/>{job.pickup_address}</div></div><ArrowRight className="hidden size-4 text-[#a3aca4] sm:block"/><div><div className="text-[10px] font-bold uppercase tracking-wider text-[#97a097]">DROP OFF</div><div className="mt-1 flex items-center gap-1.5 font-semibold text-[#33483a]"><MapPin className="size-3.5 text-[#6d9b69]"/>{job.dropoff_address}</div></div></div><div className="mt-3 flex items-center gap-1 text-xs text-[#829087]"><Clock3 className="size-3.5"/>{job.distance_meters?`${(job.distance_meters/1000).toFixed(1)} km`:"Distance pending"}</div></div><div className="flex items-center gap-3 sm:flex-col sm:items-end"><div className="font-display text-xl font-bold text-[#263d32]">â‚¦{(job.estimated_fee_kobo/100).toLocaleString()}</div><button disabled={busy===job.id} onClick={()=>void accept(job)} className="h-10 rounded-full bg-[#de7844] px-4 text-sm font-bold text-white disabled:opacity-60">{busy===job.id?"Acceptingâ€¦":"Accept job"}</button></div></div></article>)}{online&&jobs.length===0&&<div className="rounded-2xl border border-[#dce6d8] bg-[#f1f7ee] p-5 text-sm text-[#56735a]">No open requests right now. New deliveries will appear here.</div>}</div></section>
        <aside><h2 className="font-display text-2xl font-semibold text-[#263d32]">Your active jobs</h2><div className="mt-4 space-y-3">{active.length===0?<div className="rounded-2xl border border-[#e5e6df] bg-white p-5 text-sm text-[#7d8980]">Accepted deliveries and status actions will show here.</div>:active.map((job)=><article key={job.id} className="rounded-2xl border border-[#e5e6df] bg-white p-4"><div className="text-xs font-bold uppercase tracking-wider text-[#de7844]">{job.tracking_code}</div><div className="mt-2 text-sm font-semibold text-[#34483a]">{job.pickup_address} <span className="text-[#9ca69c]">â†’</span> {job.dropoff_address}</div><div className="mt-2 text-xs capitalize text-[#7b887e]">{job.status.replaceAll("_"," ")}</div>{job.customer_phone&&<a href={`tel:${job.customer_phone}`} className="mt-2 block text-sm font-semibold text-[#4c7352]">Call customer</a>}{job.status!=="delivered"&&<button disabled={busy===job.id} onClick={()=>void advance(job)} className="mt-4 h-10 w-full rounded-full border border-[#dce4d9] text-sm font-semibold text-[#456449] disabled:opacity-60">{busy===job.id?"Updatingâ€¦":job.status==="accepted"?"Confirm pickup":job.status==="picked_up"?"Mark in transit":"Confirm delivery"}</button>}</article>)}</div><p className="mt-4 text-xs leading-relaxed text-[#89938b]">Rider payouts and earnings reconciliation are not available in this release.</p></aside></div>
    </div></main>;
}
