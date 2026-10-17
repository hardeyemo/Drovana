import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { supabaseApiUnavailable } from "@/lib/supabase/api";

const schema = z.object({ label: z.string().trim().min(1).max(60), address: z.string().trim().min(5).max(300), area: z.string().trim().min(2).max(80).default("Ilorin") });

export async function GET() {
  const unavailable = supabaseApiUnavailable();
  if (unavailable) return unavailable;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  const { data, error } = await supabase.from("saved_addresses").select("id,label,address,area,created_at").order("created_at", { ascending: false }).limit(20);
  if (error) return NextResponse.json({ error: "Could not load addresses." }, { status: 503 });
  return NextResponse.json({ addresses: data });
}

export async function POST(request: Request) {
  const unavailable = supabaseApiUnavailable();
  if (unavailable) return unavailable;
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Check the address details." }, { status: 400 });
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  const { data, error } = await supabase.from("saved_addresses").insert({ user_id: user.id, ...parsed.data }).select("id,label,address,area,created_at").single();
  if (error) return NextResponse.json({ error: "Could not save this address." }, { status: 400 });
  return NextResponse.json({ address: data }, { status: 201 });
}

export async function DELETE(request: Request) {
  const unavailable = supabaseApiUnavailable();
  if (unavailable) return unavailable;
  const id = z.string().uuid().safeParse(new URL(request.url).searchParams.get("id"));
  if (!id.success) return NextResponse.json({ error: "Invalid address." }, { status: 400 });
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  const { error } = await supabase.from("saved_addresses").delete().eq("id", id.data);
  if (error) return NextResponse.json({ error: "Could not remove this address." }, { status: 400 });
  return NextResponse.json({ deleted: true });
}
