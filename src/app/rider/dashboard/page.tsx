import type { Metadata } from "next";
import { requireRole } from "@/lib/auth/server";
import { RiderDashboard } from "@/components/rider/rider-dashboard";

export const metadata: Metadata = { title: "Rider dashboard" };

export default async function RiderDashboardPage() {
  const { profile, supabase } = await requireRole("rider");
  const { data: rider } = await supabase.from("rider_profiles").select("review_status,is_available").eq("user_id", profile.id).single();
  if (rider?.review_status !== "approved") return <main className="mx-auto max-w-2xl px-5 py-16"><h1 className="font-display text-3xl font-semibold text-[#263d32]">Your rider account is under review.</h1><p className="mt-3 text-[#718077]">Job access will appear after an administrator approves your application.</p></main>;
  const { data: activeJobs } = await supabase.from("deliveries").select("id,tracking_code,pickup_address,dropoff_address,status,customer_phone").eq("rider_id", profile.id).in("status", ["accepted","picked_up","in_transit"]).order("accepted_at", { ascending: true });
  const { data: openJobs } = rider.is_available ? await supabase.rpc("rider_open_jobs") : { data: [] };
  return <RiderDashboard initialJobs={openJobs ?? []} activeJobs={activeJobs ?? []} isAvailable={rider.is_available}/>;
}
