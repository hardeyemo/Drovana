import { NextResponse } from "next/server";
import { hasSupabaseConfig } from "@/lib/supabase/config";

export function supabaseApiUnavailable() {
  return hasSupabaseConfig()
    ? null
    : NextResponse.json({ error: "Authentication service is not configured." }, { status: 503 });
}
