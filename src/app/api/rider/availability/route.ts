import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { supabaseApiUnavailable } from "@/lib/supabase/api";

const schema = z.object({ available: z.boolean() });

export async function PUT(request: Request) {
  const unavailable = supabaseApiUnavailable();
  if (unavailable) return unavailable;
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid availability value." }, { status: 400 });
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  const { data, error } = await supabase.from("rider_profiles").update({ is_available: parsed.data.available }).eq("user_id", user.id).eq("review_status", "approved").select("user_id").maybeSingle();
  if (error || !data) return NextResponse.json({ error: "Only approved riders can change availability." }, { status: 403 });
  return NextResponse.json({ available: parsed.data.available });
}
