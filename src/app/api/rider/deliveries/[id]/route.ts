import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { supabaseApiUnavailable } from "@/lib/supabase/api";

const schema = z.object({ status: z.enum(["picked_up", "in_transit", "delivered"]) });
const idSchema = z.string().uuid();

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const unavailable = supabaseApiUnavailable();
  if (unavailable) return unavailable;
  const { id } = await params;
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!idSchema.safeParse(id).success || !parsed.success) return NextResponse.json({ error: "Invalid delivery update." }, { status: 400 });
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  const { error } = await supabase.rpc("rider_update_delivery", { p_delivery_id: id, p_status: parsed.data.status });
  if (error) return NextResponse.json({ error: "This delivery update is not allowed." }, { status: 409 });
  return NextResponse.json({ updated: true });
}
