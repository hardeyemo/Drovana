import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { supabaseApiUnavailable } from "@/lib/supabase/api";

const requestSchema = z.object({
  category: z.enum(["food", "grocery", "parcel", "product"]),
  pickup_address: z.string().trim().min(5).max(300),
  dropoff_address: z.string().trim().min(5).max(300),
  customer_phone: z.string().trim().regex(/^(\+?234|0)[789][01]\d{8}$/),
  item_notes: z.string().trim().max(500).optional().default(""),
});

const minimumFeeKobo = { food: 70000, grocery: 80000, parcel: 65000, product: 80000 } as const;

export async function POST(request: Request) {
  const unavailable = supabaseApiUnavailable();
  if (unavailable) return unavailable;
  let body: unknown;
  try { body = await request.json(); } catch { return NextResponse.json({ error: "Invalid request body." }, { status: 400 }); }
  const parsed = requestSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Check the delivery details and phone number, then try again." }, { status: 400 });

  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user?.email_confirmed_at) return NextResponse.json({ error: "Verify your email before placing a delivery request." }, { status: 401 });
    const input = parsed.data;
    const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
    let businessId: string | null = null;
    if (profile?.role === "business") {
      const { data: business } = await supabase.from("business_profiles").select("user_id, address, review_status").eq("user_id", user.id).maybeSingle();
      if (!business || business.review_status !== "approved") return NextResponse.json({ error: "Your business account is not approved for delivery bookings." }, { status: 403 });
      businessId = business.user_id;
    }
    const { data, error } = await supabase.from("deliveries").insert({
      customer_id: user.id,
      category: input.category,
      pickup_address: input.pickup_address,
      dropoff_address: input.dropoff_address,
      customer_phone: input.customer_phone,
      business_id: businessId,
      item_notes: input.item_notes || null,
      estimated_fee_kobo: minimumFeeKobo[input.category],
      status: "requested",
    }).select("id, tracking_code, estimated_fee_kobo, status").single();
    if (error) {
      console.error("delivery_create_failed", error.code);
      return NextResponse.json({ error: "We couldn’t place that request. Please try again." }, { status: 400 });
    }
    return NextResponse.json({ delivery: data }, { status: 201 });
  } catch (error) {
    console.error("delivery_create_unavailable", error instanceof Error ? error.message : "unknown");
    return NextResponse.json({ error: "Delivery service is temporarily unavailable." }, { status: 503 });
  }
}
