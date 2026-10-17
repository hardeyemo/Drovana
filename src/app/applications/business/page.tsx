import type { Metadata } from "next";
import { requireRole } from "@/lib/auth/server";
import { businessApplicationAction } from "@/app/applications/actions";

export const metadata: Metadata = { title: "Business application" };

export default async function BusinessApplicationPage({ searchParams }: { searchParams: Promise<{ sent?: string; error?: string }> }) {
  const { profile, supabase } = await requireRole("customer");
  const params = await searchParams;
  const { data: application } = await supabase.from("business_profiles").select("review_status, business_name").eq("user_id", profile.id).maybeSingle();

  return (
    <main className="mx-auto max-w-2xl px-4 py-8 sm:px-8 sm:py-12">
      <section className="rounded-3xl border border-[#e5e6df] bg-white p-5 sm:p-8">
        <p className="text-xs font-bold uppercase tracking-[.15em] text-[#de7844]">Local businesses</p>
        <h1 className="mt-2 font-display text-3xl font-semibold text-[#263d32]">Bring your shop online.</h1>
        <p className="mt-2 text-sm leading-relaxed text-[#718077]">Submit your business for review. Approved businesses can manage customer deliveries through their dashboard.</p>
        {params.sent && <p role="status" className="mt-5 rounded-xl bg-[#edf6eb] p-3 text-sm text-[#426d48]">Business application submitted for review.</p>}
        {params.error && <p role="alert" className="mt-5 rounded-xl bg-[#fff0ed] p-3 text-sm text-[#a23e32]">{params.error === "exists" ? "You already have a business application." : "Check your details and try again."}</p>}
        {application ? (
          <div className="mt-6 rounded-xl bg-[#f4f5ef] p-4 text-sm text-[#53675a]">{application.business_name} · <strong className="capitalize">{application.review_status}</strong></div>
        ) : (
          <form action={businessApplicationAction} className="mt-6 space-y-4">
            <label className="block text-sm font-semibold text-[#34483a]">Business name<input name="business_name" required minLength={2} maxLength={120} className="mt-1.5 h-12 w-full rounded-xl border border-[#dfe3dc] px-4 font-normal" /></label>
            <label className="block text-sm font-semibold text-[#34483a]">Business category<input name="category" required minLength={2} maxLength={60} placeholder="Restaurant, grocery, pharmacy…" className="mt-1.5 h-12 w-full rounded-xl border border-[#dfe3dc] px-4 font-normal" /></label>
            <label className="block text-sm font-semibold text-[#34483a]">Business address<input name="address" required minLength={5} maxLength={300} className="mt-1.5 h-12 w-full rounded-xl border border-[#dfe3dc] px-4 font-normal" /></label>
            <label className="block text-sm font-semibold text-[#34483a]">Business phone<input name="phone" required type="tel" placeholder="080 1234 5678" className="mt-1.5 h-12 w-full rounded-xl border border-[#dfe3dc] px-4 font-normal" /></label>
            <button className="h-12 w-full rounded-full bg-[#de7844] px-6 font-semibold text-white sm:w-auto">Submit business</button>
          </form>
        )}
      </section>
    </main>
  );
}
