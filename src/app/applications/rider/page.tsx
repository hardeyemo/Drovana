import type { Metadata } from "next";
import { requireRole } from "@/lib/auth/server";
import { riderApplicationAction } from "@/app/applications/actions";

export const metadata: Metadata = { title: "Rider application" };

export default async function RiderApplicationPage({ searchParams }: { searchParams: Promise<{ sent?: string; error?: string }> }) {
  const { profile, supabase } = await requireRole("customer");
  const params = await searchParams;
  const { data: application } = await supabase.from("rider_profiles").select("review_status, vehicle_type").eq("user_id", profile.id).maybeSingle();

  return (
    <main className="mx-auto max-w-2xl px-4 py-8 sm:px-8 sm:py-12">
      <section className="rounded-3xl border border-[#e5e6df] bg-white p-5 sm:p-8">
        <p className="text-xs font-bold uppercase tracking-[.15em] text-[#de7844]">Ride with Drovna</p>
        <h1 className="mt-2 font-display text-3xl font-semibold text-[#263d32]">Rider application</h1>
        <p className="mt-2 text-sm leading-relaxed text-[#718077]">Rider access is reviewed before jobs are available. We’ll notify you when your application is approved.</p>
        {params.sent && <p role="status" className="mt-5 rounded-xl bg-[#edf6eb] p-3 text-sm text-[#426d48]">Application submitted for review.</p>}
        {params.error && <p role="alert" className="mt-5 rounded-xl bg-[#fff0ed] p-3 text-sm text-[#a23e32]">{params.error === "exists" ? "You already have a rider application." : "Check your details and try again."}</p>}
        {application ? (
          <div className="mt-6 rounded-xl bg-[#f4f5ef] p-4 text-sm text-[#53675a]">Application status: <strong className="capitalize">{application.review_status}</strong></div>
        ) : (
          <form action={riderApplicationAction} className="mt-6 space-y-4">
            <label className="block text-sm font-semibold text-[#34483a]">Vehicle type<input name="vehicle_type" required minLength={3} maxLength={40} placeholder="Motorcycle, bicycle, car" className="mt-1.5 h-12 w-full rounded-xl border border-[#dfe3dc] px-4 font-normal" /></label>
            <label className="block text-sm font-semibold text-[#34483a]">Vehicle registration<input name="vehicle_registration" required minLength={4} maxLength={30} className="mt-1.5 h-12 w-full rounded-xl border border-[#dfe3dc] px-4 font-normal" /></label>
            <button className="h-12 w-full rounded-full bg-[#de7844] px-6 font-semibold text-white sm:w-auto">Submit application</button>
          </form>
        )}
      </section>
    </main>
  );
}
