"use client";

import { useState } from "react";

type Application = { user_id: string; full_name: string; phone: string | null; review_status: string; detail: string };

export function ApplicationReviewList({ kind, items }: { kind: "rider" | "business"; items: Application[] }) {
  const [rows, setRows] = useState(items);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState("");
  async function decide(row: Application, decision: "approved" | "rejected") {
    setBusy(row.user_id); setError("");
    try {
      const response = await fetch("/api/admin/applications", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ user_id: row.user_id, kind, decision }) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error ?? "Review failed.");
      setRows((current)=>current.filter((item)=>item.user_id!==row.user_id));
    } catch (reason) { setError(reason instanceof Error ? reason.message : "Review failed."); }
    finally { setBusy(""); }
  }
  return <section><h2 className="font-display text-xl font-semibold capitalize text-[#263d32]">Pending {kind} applications</h2>{error&&<p role="alert" className="mt-3 text-sm text-[#a23e32]">{error}</p>}<div className="mt-3 space-y-3">{rows.length?rows.map((row)=><article key={row.user_id} className="rounded-2xl border border-[#e5e6df] bg-white p-4"><div className="font-semibold text-[#34483a]">{row.detail}</div><div className="mt-1 text-sm text-[#738078]">{row.full_name} · {row.phone||"No phone"}</div><div className="mt-3 flex gap-2"><button disabled={busy===row.user_id} onClick={()=>void decide(row,"approved")} className="h-9 rounded-full bg-[#47734e] px-4 text-sm font-semibold text-white disabled:opacity-60">Approve</button><button disabled={busy===row.user_id} onClick={()=>void decide(row,"rejected")} className="h-9 rounded-full border border-[#e4c7c1] px-4 text-sm font-semibold text-[#984c41] disabled:opacity-60">Reject</button></div></article>):<div className="rounded-2xl border border-dashed border-[#d8dfd5] p-5 text-sm text-[#7e8980]">No pending applications.</div>}</div></section>;
}
