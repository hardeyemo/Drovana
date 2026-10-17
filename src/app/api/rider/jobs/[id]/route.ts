import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { supabaseApiUnavailable } from "@/lib/supabase/api";

const idSchema = z.string().uuid();

export async function POST(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const unavailable = supabaseApiUnavailable();
  if (unavailable) return unavailable;
  const { id } = await params;
  if (!idSchema.safeParse(id).success) return NextResponse.json({ error: "Invalid delivery." }, { status: 400 });
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  const { error } = await supabase.rpc("rider_accept_delivery", { p_delivery_id: id });
  if (error) return NextResponse.json({ error: error.message.includes("no longer available") ? "This delivery has already been accepted." : "Unable to accept this delivery." }, { status: 409 });
  const { data: delivery } = await supabase.from("deliveries").select("customer_phone").eq("id", id).eq("rider_id", user.id).maybeSingle();
  return NextResponse.json({ accepted: true, customer_phone: delivery?.customer_phone ?? "" });
}
