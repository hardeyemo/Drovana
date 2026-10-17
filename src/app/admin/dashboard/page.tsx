import type { Metadata } from "next";
import { Activity, PackageCheck, Users } from "lucide-react";
import { SignOutButton } from "@/components/auth/sign-out-button";
import { ApplicationReviewList } from "@/components/admin/application-review-list";
import { requireAdmin } from "@/lib/auth/server";

export const metadata: Metadata = { title: "Admin dashboard" };

const formatDate = (value: string) => new Intl.DateTimeFormat("en-NG", {
  dateStyle: "medium",
  timeStyle: "short",
}).format(new Date(value));

export default async function AdminDashboardPage() {
  const { supabase } = await requireAdmin();
  const [
    { data: overview },
    { data: riders },
    { data: businesses },
    { data: deliveries },
    { data: profiles },
    { data: events },
    { data: payments },
  ] = await Promise.all([
    supabase.rpc("admin_overview"),
    supabase.from("rider_profiles").select("user_id,vehicle_type,vehicle_registration,review_status,created_at").eq("review_status", "pending").order("created_at").limit(100),
    supabase.from("business_profiles").select("user_id,business_name,category,review_status,created_at").eq("review_status", "pending").order("created_at").limit(100),
    supabase.from("deliveries").select("id,tracking_code,category,customer_id,rider_id,pickup_address,dropoff_address,status,estimated_fee_kobo,requested_at").order("requested_at", { ascending: false }).limit(25),
    supabase.from("profiles").select("id,full_name,phone,role,created_at").order("created_at", { ascending: false }).limit(20),
    supabase.from("delivery_events").select("id,delivery_id,status,note,created_at").order("created_at", { ascending: false }).limit(12),
    supabase.from("payments").select("id,delivery_id,amount_kobo,status,created_at").order("created_at", { ascending: false }).limit(12),
  ]);

  const applicationIds = [...new Set([...(riders ?? []).map((row) => row.user_id), ...(businesses ?? []).map((row) => row.user_id)])];
  const { data: applicationProfiles } = applicationIds.length
    ? await supabase.from("profiles").select("id,full_name,phone").in("id", applicationIds)
    : { data: [] };
  const profileMap = new Map((applicationProfiles ?? []).map((row) => [row.id, row]));
  const riderItems = (riders ?? []).map((row) => ({ user_id: row.user_id, full_name: profileMap.get(row.user_id)?.full_name ?? "", phone: profileMap.get(row.user_id)?.phone ?? null, review_status: row.review_status, detail: `${row.vehicle_type ?? "Vehicle not listed"} · ${row.vehicle_registration ?? "Registration not listed"}` }));
  const businessItems = (businesses ?? []).map((row) => ({ user_id: row.user_id, full_name: profileMap.get(row.user_id)?.full_name ?? "", phone: profileMap.get(row.user_id)?.phone ?? null, review_status: row.review_status, detail: `${row.business_name} · ${row.category}` }));
  const stats = overview as { deliveries_today: number; open_deliveries: number; rider_applications: number; business_applications: number; paid_kobo_today: number } | null;
  const metrics: [string, number | string][] = [
    ["Deliveries today", stats?.deliveries_today ?? 0],
    ["Open deliveries", stats?.open_deliveries ?? 0],
    ["Rider applications", stats?.rider_applications ?? 0],
    ["Business applications", stats?.business_applications ?? 0],
    ["Payments today", `₦${((stats?.paid_kobo_today ?? 0) / 100).toLocaleString("en-NG")}`],
  ];
  const deliveryRefs = new Map((deliveries ?? []).map((delivery) => [delivery.id, delivery.tracking_code]));
  const activity = [
    ...(events ?? []).map((event) => ({ id: `event-${event.id}`, label: `Delivery ${event.status.replaceAll("_", " ")}`, detail: `${deliveryRefs.get(event.delivery_id) ?? event.delivery_id.slice(0, 8)}${event.note ? ` · ${event.note}` : ""}`, at: event.created_at })),
    ...(payments ?? []).map((payment) => ({ id: `payment-${payment.id}`, label: `Payment ${payment.status}`, detail: `${deliveryRefs.get(payment.delivery_id) ?? payment.delivery_id.slice(0, 8)} · ₦${(payment.amount_kobo / 100).toLocaleString("en-NG")}`, at: payment.created_at })),
  ].sort((a, b) => Date.parse(b.at) - Date.parse(a.at)).slice(0, 12);

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-8 sm:py-10 lg:px-12">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[.15em] text-[#de7844]">Operations · Ilorin</p>
          <h1 className="mt-1 font-display text-3xl font-semibold text-[#263d32] sm:text-4xl">Admin dashboard</h1>
          <p className="mt-2 text-sm text-[#718077]">Review applications and keep an eye on deliveries, customers, and payments.</p>
        </div>
        <SignOutButton />
      </header>

      <section aria-label="Platform overview" className="mt-7 grid gap-3 min-[420px]:grid-cols-2 lg:grid-cols-5">
        {metrics.map(([label, value]) => <article key={label} className="rounded-2xl border border-[#e5e6df] bg-white p-4"><div className="text-xs text-[#78847b]">{label}</div><div className="mt-2 font-display text-2xl font-bold text-[#263d32]">{value}</div></article>)}
      </section>

      <section aria-label="Application reviews" className="mt-9 grid gap-7 lg:grid-cols-2">
        <ApplicationReviewList kind="rider" items={riderItems} />
        <ApplicationReviewList kind="business" items={businessItems} />
      </section>

      <section className="mt-10" aria-labelledby="deliveries-heading">
        <div className="flex items-center gap-2"><PackageCheck className="size-5 text-[#de7844]"/><h2 id="deliveries-heading" className="font-display text-2xl font-semibold text-[#263d32]">Recent delivery orders</h2></div>
        <div className="mt-3 overflow-x-auto rounded-2xl border border-[#e5e6df] bg-white">
          <table className="w-full min-w-[820px] text-left text-sm">
            <thead className="border-b border-[#edf0e9] text-xs uppercase tracking-wider text-[#829087]"><tr><th className="p-4">Reference</th><th className="p-4">Route</th><th className="p-4">Type</th><th className="p-4">Status</th><th className="p-4">Estimate</th></tr></thead>
            <tbody>{(deliveries ?? []).map((delivery) => <tr key={delivery.id} className="border-b border-[#f0f1ed] last:border-0"><td className="p-4 font-semibold">{delivery.tracking_code}</td><td className="max-w-xs p-4"><span className="block break-words">{delivery.pickup_address} → {delivery.dropoff_address}</span></td><td className="p-4 capitalize">{delivery.category}</td><td className="p-4 capitalize">{delivery.status.replaceAll("_", " ")}</td><td className="p-4">₦{(delivery.estimated_fee_kobo / 100).toLocaleString("en-NG")}</td></tr>)}</tbody>
          </table>
          {(!deliveries || deliveries.length === 0) && <p className="p-5 text-sm text-[#78847b]">No delivery orders yet.</p>}
        </div>
      </section>

      <section className="mt-10 grid gap-8 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,.8fr)]">
        <div>
          <div className="flex items-center gap-2"><Activity className="size-5 text-[#de7844]"/><h2 className="font-display text-2xl font-semibold text-[#263d32]">Platform activity</h2></div>
          <div className="mt-3 divide-y divide-[#eff0eb] rounded-2xl border border-[#e5e6df] bg-white px-4">
            {activity.length ? activity.map((item) => <article key={item.id} className="flex flex-wrap items-start justify-between gap-2 py-4"><div><p className="text-sm font-semibold capitalize text-[#34483a]">{item.label}</p><p className="mt-1 max-w-xl break-words text-xs text-[#78847b]">{item.detail}</p></div><time className="shrink-0 text-xs text-[#8a958c]">{formatDate(item.at)}</time></article>) : <p className="py-5 text-sm text-[#78847b]">Activity will appear as deliveries and payments progress.</p>}
          </div>
        </div>

        <div>
          <div className="flex items-center gap-2"><Users className="size-5 text-[#de7844]"/><h2 className="font-display text-2xl font-semibold text-[#263d32]">Recent users</h2></div>
          <div className="mt-3 divide-y divide-[#eff0eb] rounded-2xl border border-[#e5e6df] bg-white px-4">
            {profiles?.length ? profiles.map((profile) => <article key={profile.id} className="flex items-center justify-between gap-3 py-4"><div className="min-w-0"><p className="truncate text-sm font-semibold text-[#34483a]">{profile.full_name || "Drovna customer"}</p><p className="mt-1 truncate text-xs text-[#78847b]">{profile.phone || "No phone number"}</p></div><span className="shrink-0 rounded-full bg-[#f3f5ef] px-2.5 py-1 text-xs capitalize text-[#52644f]">{profile.role}</span></article>) : <p className="py-5 text-sm text-[#78847b]">No user profiles to show.</p>}
          </div>
        </div>
      </section>
    </main>
  );
}
