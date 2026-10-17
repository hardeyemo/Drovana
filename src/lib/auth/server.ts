import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { AppRole } from "@/lib/auth/roles";

function profileErrorReason(code?: string) {
  if (code === "42501") return "permissions";
  if (code === "42P01" || code === "PGRST202" || code === "PGRST205") return "schema";
  return "unavailable";
}

function profileErrorRedirect(reason: string): never {
  const allowedReason = ["permissions", "schema", "unavailable"].includes(reason) ? reason : "unavailable";
  redirect(`/login?error=profile&reason=${allowedReason}`);
}

export async function requireUser() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  if (!user.email_confirmed_at) redirect("/verify-email");
  let profile;
  try {
    const { data, error } = await supabase.from("profiles").select("id, full_name, phone, role").eq("id", user.id).maybeSingle();
    if (error) {
      // Log only the PostgreSQL/PostgREST code. Never log auth tokens or user data.
      console.error("Drovna profile lookup failed", { code: error.code });
      profileErrorRedirect(profileErrorReason(error.code));
    }
    profile = data;
  } catch (error) {
    if (error && typeof error === "object" && "digest" in error) throw error;
    console.error("Drovna profile lookup failed", { kind: "request" });
    profileErrorRedirect("unavailable");
  }

  if (!profile) {
    const metadata = user.user_metadata;
    const fullName = typeof metadata?.full_name === "string" ? metadata.full_name.slice(0, 80) : "";
    const phone = typeof metadata?.phone === "string" ? metadata.phone.slice(0, 24) : null;
    try {
      const { data, error } = await supabase.from("profiles").insert({ id: user.id, full_name: fullName, phone }).select("id, full_name, phone, role").maybeSingle();
      if (data) profile = data;
      else if (error?.code === "23505") {
        // A concurrent request may have created this profile after the first lookup.
        const retry = await supabase.from("profiles").select("id, full_name, phone, role").eq("id", user.id).maybeSingle();
        if (retry.error) profileErrorRedirect(profileErrorReason(retry.error.code));
        profile = retry.data;
      } else {
        console.error("Drovna profile recovery failed", { code: error?.code ?? "no_row" });
        profileErrorRedirect(profileErrorReason(error?.code));
      }
    } catch (error) {
      if (error && typeof error === "object" && "digest" in error) throw error;
      console.error("Drovna profile recovery failed", { kind: "request" });
      profileErrorRedirect("unavailable");
    }
  }
  if (!profile) profileErrorRedirect("unavailable");
  return { supabase, user, profile };
}

export async function requireRole(role: AppRole) {
  const result = await requireUser();
  if (result.profile.role !== role) redirect("/account");
  return result;
}

export async function requireAdmin() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  if (!user.email_confirmed_at) redirect("/verify-email");

  try {
    const { data: profile, error } = await supabase
      .from("profiles")
      .select("id,role")
      .eq("id", user.id)
      .maybeSingle();
    if (error) {
      console.error("Drovna admin authorization failed", { code: error.code });
      profileErrorRedirect(profileErrorReason(error.code));
    }
    if (!profile || profile.id !== user.id || profile.role !== "admin") redirect("/account");
  } catch (error) {
    if (error && typeof error === "object" && "digest" in error) throw error;
    console.error("Drovna admin authorization failed", { kind: "request" });
    profileErrorRedirect("unavailable");
  }

  return { supabase, user };
}
