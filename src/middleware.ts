import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { hasSupabaseConfig, normalizeSupabaseUrl } from "@/lib/supabase/config";
import { roleHome, type AppRole } from "@/lib/auth/roles";

const roleRoutes: Array<{ prefix: string; role: AppRole }> = [
  { prefix: "/admin", role: "admin" },
  { prefix: "/rider", role: "rider" },
  { prefix: "/business", role: "business" },
];

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request });
  const { pathname, search } = request.nextUrl;
  const isProtected = pathname === "/account" || pathname.startsWith("/account/") || pathname === "/deliveries/new" || pathname === "/deliveries/track" || pathname.startsWith("/applications/") || roleRoutes.some(({ prefix }) => pathname === prefix || pathname.startsWith(`${prefix}/`));
  if (!hasSupabaseConfig()) {
    if (isProtected) return NextResponse.redirect(new URL("/login?error=auth_not_configured", request.url));
    return response;
  }

  const supabase = createServerClient(
    normalizeSupabaseUrl(process.env.NEXT_PUBLIC_SUPABASE_URL!),
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
        },
      },
    },
  );

  // Supabase may refresh the user's session during getUser(). Preserve those
  // Set-Cookie headers even when a protected route needs to redirect.
  const redirectWithCookies = (destination: URL) => {
    const redirectResponse = NextResponse.redirect(destination);
    response.cookies.getAll().forEach((cookie) => redirectResponse.cookies.set(cookie));
    return redirectResponse;
  };

  const { data: { user } } = await supabase.auth.getUser();
  if (isProtected && !user) {
    const login = request.nextUrl.clone();
    login.pathname = "/login";
    login.searchParams.set("next", `${pathname}${search}`);
    return redirectWithCookies(login);
  }

  if (user && isProtected) {
    const matchedRoute = roleRoutes.find(({ prefix }) => pathname === prefix || pathname.startsWith(`${prefix}/`));
    if (matchedRoute?.role === "admin") {
      // Resolve the authenticated user's own canonical profile row. The profile
      // SELECT is constrained to auth.uid() by RLS, and the role cannot be
      // self-assigned because the database protects role changes separately.
      const { data: profile, error } = await supabase
        .from("profiles")
        .select("id,role")
        .eq("id", user.id)
        .maybeSingle();
      if (error) {
        const reason = error.code === "42501"
          ? "permissions"
          : ["42P01", "PGRST202", "PGRST205"].includes(error.code ?? "")
            ? "schema"
            : "unavailable";
        const login = new URL("/login", request.url);
        login.searchParams.set("error", "profile");
        login.searchParams.set("reason", reason);
        return redirectWithCookies(login);
      }
      if (!profile || profile.id !== user.id || profile.role !== "admin") {
        return redirectWithCookies(new URL("/account", request.url));
      }
      return response;
    }

    const { data: profile, error } = await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle();
    if (error) {
      const reason = error.code === "42501"
        ? "permissions"
        : ["42P01", "PGRST205"].includes(error.code ?? "")
          ? "schema"
          : "unavailable";
      const login = new URL("/login", request.url);
      login.searchParams.set("error", "profile");
      login.searchParams.set("reason", reason);
      return redirectWithCookies(login);
    }
    if (matchedRoute && profile?.role !== matchedRoute.role) {
      return redirectWithCookies(new URL(roleHome[profile?.role as AppRole] ?? "/account", request.url));
    }
    if (pathname === "/account" && profile?.role && profile.role !== "customer") {
      return redirectWithCookies(new URL(roleHome[profile.role as AppRole] ?? "/", request.url));
    }
  }
  return response;
}

export const config = {
  matcher: ["/account/:path*", "/deliveries/new", "/deliveries/track", "/applications/:path*", "/rider/:path*", "/business/:path*", "/admin/:path*"],
};
