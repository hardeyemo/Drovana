import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { supabaseApiUnavailable } from "@/lib/supabase/api";

const referenceSchema = z.string().trim().min(8).max(24).regex(/^SD-[A-F0-9]+$/i);

export async function GET(request: Request) {
  const unavailable = supabaseApiUnavailable();
  if (unavailable) return unavailable;
  const reference = referenceSchema.safeParse(new URL(request.url).searchParams.get("ref"));
  if (!reference.success) return NextResponse.json({ error: "Enter a valid tracking reference." }, { status: 400 });
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Sign in required." }, { status: 401 });
    const { data: delivery, error } = await supabase.from("deliveries").select("id, tracking_code, category, pickup_address, dropoff_address, estimated_fee_kobo, final_fee_kobo, status, requested_at, accepted_at, picked_up_at, delivered_at").eq("tracking_code", reference.data.toUpperCase()).maybeSingle();
    if (error || !delivery) return NextResponse.json({ error: "We couldn’t find a delivery with that reference." }, { status: 404 });
    const { data: events } = await supabase.from("delivery_events").select("status, note, created_at").eq("delivery_id", delivery.id).order("created_at", { ascending: true });
    return NextResponse.json({ delivery, events: events ?? [] });
  } catch {
    return NextResponse.json({ error: "Tracking is temporarily unavailable." }, { status: 503 });
  }
}
