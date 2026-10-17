export function hasSupabaseConfig() {
  const value = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!value || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) return false;
  try {
    const url = new URL(value);
    const localHttp = process.env.NODE_ENV !== "production" && url.protocol === "http:" && ["localhost", "127.0.0.1", "[::1]"].includes(url.hostname);
    return (url.protocol === "https:" || localHttp) && !url.username && !url.password;
  } catch {
    return false;
  }
}

/** Accept either a Supabase project URL or its REST endpoint URL. Auth needs the project root. */
export function normalizeSupabaseUrl(value: string) {
  const url = new URL(value);
  url.pathname = url.pathname.replace(/\/rest\/v1\/?$/i, "").replace(/\/+$/, "") || "/";
  url.search = "";
  url.hash = "";
  return url.toString().replace(/\/$/, "");
}

export function supabasePublicConfig() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key || !hasSupabaseConfig()) throw new Error("Supabase is not configured. Set a valid NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.");
  return { url: normalizeSupabaseUrl(url), key };
}
