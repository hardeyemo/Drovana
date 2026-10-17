import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { supabaseApiUnavailable } from "@/lib/supabase/api";

const schema = z.object({ user_id: z.string().uuid(), kind: z.enum(["rider", "business"]), decision: z.enum(["approved", "rejected", "suspended"]) });

export async function POST(request: Request) {
  const unavailable = supabaseApiUnavailable();
  if (unavailable) return unavailable;
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid review decision." }, { status: 400 });
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  if (!user.email_confirmed_at) return NextResponse.json({ error: "Confirm your email before continuing." }, { status: 403 });
  const { data: isAdmin, error: authorizationError } = await supabase.rpc("is_admin");
  if (authorizationError) {
    console.error("Admin application authorization unavailable", { code: authorizationError.code });
    return NextResponse.json({ error: "Administrator access could not be verified. Please try again later." }, { status: 503 });
  }
  if (!isAdmin) return NextResponse.json({ error: "Administrator access required." }, { status: 403 });
  const { error } = await supabase.rpc("admin_review_application", { p_user_id: parsed.data.user_id, p_kind: parsed.data.kind, p_decision: parsed.data.decision });
  if (error) return NextResponse.json({ error: "Administrator access required or application not found." }, { status: 403 });
  return NextResponse.json({ updated: true });
}
