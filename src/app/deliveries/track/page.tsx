import type { Metadata } from "next";
import { Suspense } from "react";
import { TrackingLookup } from "@/components/deliveries/tracking-lookup";
import { requireUser } from "@/lib/auth/server";

export const metadata: Metadata = { title: "Track a delivery" };

export default async function TrackPage() { await requireUser(); return <Suspense fallback={<main className="mx-auto max-w-3xl px-5 py-20 text-center text-[#718077]">Loading tracking…</main>}><TrackingLookup /></Suspense>; }
