"use client";

import { useState } from "react";
import { MapPin, Plus, Trash2 } from "lucide-react";

export type SavedAddress = { id: string; label: string; address: string; area: string };

export function SavedAddresses({ initialAddresses }: { initialAddresses: SavedAddress[] }) {
  const [addresses, setAddresses] = useState(initialAddresses);
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  async function add(formData: FormData) {
    setPending(true); setError("");
    try {
      const response = await fetch("/api/addresses", { method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify({label:formData.get("label"),address:formData.get("address"),area:formData.get("area")}) });
      const result=await response.json();
      if(!response.ok) throw new Error(result.error);
      setAddresses((current)=>[result.address,...current]);
    } catch(reason) { setError(reason instanceof Error?reason.message:"Could not save the address."); }
    finally { setPending(false); }
  }
  async function remove(id:string) {
    setError("");
    try { const response=await fetch(`/api/addresses?id=${encodeURIComponent(id)}`,{method:"DELETE"}); const result=await response.json(); if(!response.ok) throw new Error(result.error); setAddresses((current)=>current.filter((item)=>item.id!==id)); }
    catch(reason) { setError(reason instanceof Error?reason.message:"Could not remove the address."); }
  }
  return <section className="mt-10"><h2 className="font-display text-2xl font-semibold text-[#263d32]">Saved addresses</h2><div className="mt-4 grid gap-4 md:grid-cols-[1fr_1fr]"><form action={add} className="rounded-2xl border border-[#e5e6df] bg-white p-5"><p className="font-semibold text-[#34483a]">Add an address</p><label className="mt-3 block text-xs font-semibold text-[#718077]">Label<input name="label" required maxLength={60} placeholder="Home, work…" className="mt-1 h-10 w-full rounded-lg border border-[#dfe3dc] px-3 text-sm"/></label><label className="mt-3 block text-xs font-semibold text-[#718077]">Address<input name="address" required minLength={5} maxLength={300} placeholder="Street and landmark" className="mt-1 h-10 w-full rounded-lg border border-[#dfe3dc] px-3 text-sm"/></label><label className="mt-3 block text-xs font-semibold text-[#718077]">Area<input name="area" required maxLength={80} defaultValue="Ilorin" className="mt-1 h-10 w-full rounded-lg border border-[#dfe3dc] px-3 text-sm"/></label>{error&&<p role="alert" className="mt-3 text-xs text-[#a23e32]">{error}</p>}<button disabled={pending} className="mt-4 inline-flex h-10 items-center gap-2 rounded-full bg-[#de7844] px-4 text-sm font-semibold text-white disabled:opacity-60"><Plus className="size-4"/>{pending?"Saving…":"Save address"}</button></form><div className="space-y-3">{addresses.map((item)=><article key={item.id} className="flex items-start justify-between gap-3 rounded-2xl border border-[#e5e6df] bg-white p-4"><div className="flex gap-3"><MapPin className="mt-0.5 size-4 shrink-0 text-[#de7844]"/><div><div className="font-semibold text-[#34483a]">{item.label}</div><div className="mt-1 text-sm text-[#718077]">{item.address}</div><div className="mt-1 text-xs text-[#929b93]">{item.area}</div></div></div><button onClick={()=>void remove(item.id)} aria-label={`Remove ${item.label}`} className="rounded-lg p-2 text-[#909b91] hover:bg-[#fff0ed] hover:text-[#a23e32]"><Trash2 className="size-4"/></button></article>)}{addresses.length===0&&<p className="rounded-2xl border border-dashed border-[#d8dfd5] p-5 text-sm text-[#7c8780]">Saved pickup and drop-off addresses will appear here.</p>}</div></div></section>;
}
