"use server";

import { z } from "zod";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { hasSupabaseConfig } from "@/lib/supabase/config";
import { isStrongPassword, passwordErrorMessage } from "@/lib/auth/password";

export type AuthState = {
  error?: string;
  success?: string;
  errorActions?: Array<"reset_password" | "resend_verification" | "create_account">;
};

const emailSchema = z.string().trim().email().max(254);
const signInPasswordSchema = z.string().min(1).max(128);
const strongPasswordSchema = z.string().min(8).max(128).refine(isStrongPassword);
const displayNameSchema = z.string().trim().min(2).max(80);

function formValue(formData: FormData, name: string) {
  const value = formData.get(name);
  return typeof value === "string" ? value : "";
}

function safeNext(value: string) {
  return value.startsWith("/") && !value.startsWith("//") && !value.startsWith("/\\") ? value : "/account";
}

function friendlyAuthError(error: unknown, fallback: string, intent: "signup" | "login" | "email") {
  const detail = error && typeof error === "object" ? error as { code?: unknown; status?: unknown; name?: unknown; message?: unknown } : {};
  const code = typeof detail.code === "string" ? detail.code : "";
  const status = typeof detail.status === "number" ? detail.status : 0;
  if (code === "email_not_confirmed") return "Please confirm your email before signing in. You can request a fresh verification link below.";
  if (code === "invalid_credentials") return "Email or password is incorrect, or this email has no account yet. Check your details, reset your password, or create an account.";
  if (code === "user_not_found") return "No account was found for this email. Check the address or create an account.";
  if (code === "email_exists" || code === "user_already_exists") return intent === "signup" ? "An account may already use this email. Try signing in or reset your password." : "This email is already verified. Try signing in.";
  if (code === "signup_disabled") return "New account registration is currently disabled. Please try again later.";
  if (code === "email_address_invalid") return "That email address could not receive messages. Check it for typos and try again.";
  if (status === 429 || /rate_limit|too_many_requests|over_email_send/.test(code)) return "Too many requests were made. Wait a minute before trying again, then check your inbox and spam folder.";
  if (error instanceof TypeError || (error instanceof Error && /fetch|network|timeout|connection/i.test(error.message))) return "Drovna could not reach the authentication service. Check your connection and try again.";
  const providerMessage = typeof detail.message === "string" ? detail.message.trim().replace(/\s+/g, " ") : "";
  const hasInternalDetails = /https?:\/\/|\.supabase\.co|database|postgres|schema|jwt|service[_ ]role|secret|api key|stack trace/i.test(providerMessage);
  if (detail.name === "AuthApiError" && providerMessage.length > 0 && providerMessage.length <= 180 && !hasInternalDetails && /^[A-Za-z0-9 .,'’!?():;\/-]+$/.test(providerMessage)) return providerMessage;
  return fallback;
}

function signInErrorState(error: unknown, fallback: string): AuthState {
  const detail = error && typeof error === "object" ? error as { code?: unknown } : {};
  const code = typeof detail.code === "string" ? detail.code : "";
  const errorActions: AuthState["errorActions"] = code === "email_not_confirmed"
    ? ["resend_verification"]
    : code === "invalid_credentials" || code === "user_not_found"
      ? ["reset_password", "create_account"]
      : undefined;
  return { error: friendlyAuthError(error, fallback, "login"), errorActions };
}

async function authRedirectUrl(next: string) {
  const configuredUrl = process.env.NEXT_PUBLIC_SITE_URL;
  if (process.env.NODE_ENV === "development") {
    const requestHeaders = await headers();
    const host = requestHeaders.get("x-forwarded-host") ?? requestHeaders.get("host") ?? "";
    // Respect an explicitly configured LAN/tunnel origin. For local browsing,
    // use the incoming host so links retain the actual dev port or LAN address.
    if (configuredUrl) {
      try {
        const siteUrl = new URL(configuredUrl);
        const configuredLoopback = ["localhost", "127.0.0.1", "[::1]"].includes(siteUrl.hostname);
        if (!configuredLoopback && ["http:", "https:"].includes(siteUrl.protocol) && !siteUrl.username && !siteUrl.password) {
          return `${siteUrl.origin}/auth/callback?next=${encodeURIComponent(next)}`;
        }
      } catch {
        // Fall through to the request host and reject invalid configuration below.
      }
    }
    if (/^(localhost|127\.0\.0\.1|\[::1\]|(?:10|192\.168)\.\d{1,3}\.\d{1,3}|172\.(?:1[6-9]|2\d|3[01])\.\d{1,3}\.\d{1,3})(?::\d{1,5})?$/.test(host)) {
      const protocol = requestHeaders.get("x-forwarded-proto") === "https" ? "https" : "http";
      return `${protocol}://${host}/auth/callback?next=${encodeURIComponent(next)}`;
    }
  }

  if (!configuredUrl) return null;
  try {
    const siteUrl = new URL(configuredUrl);
    // HTTP is accepted only in development so LAN devices can complete auth
    // callbacks over a trusted local network. Production always requires HTTPS.
    const developmentHttp = process.env.NODE_ENV !== "production" && siteUrl.protocol === "http:";
    if ((siteUrl.protocol !== "https:" && !developmentHttp) || siteUrl.username || siteUrl.password) return null;
    return `${siteUrl.origin}/auth/callback?next=${encodeURIComponent(next)}`;
  } catch {
    return null;
  }
}

export async function signInAction(_previous: AuthState, formData: FormData): Promise<AuthState> {
  if (!hasSupabaseConfig()) return { error: "Authentication is not configured. Add the Supabase URL and anon key." };
  const email = emailSchema.safeParse(formValue(formData, "email"));
  const password = signInPasswordSchema.safeParse(formValue(formData, "password"));
  if (!email.success || !password.success) return { error: "Enter a valid email address and password." };
  const supabase = await createClient();
  let result;
  try {
    result = await supabase.auth.signInWithPassword({ email: email.data, password: password.data });
  } catch (error) {
    return signInErrorState(error, "We could not sign you in right now. Please try again.");
  }
  const { data, error } = result;
  if (error) return signInErrorState(error, "Sign-in failed. Check your details and try again.");
  if (!data.user.email_confirmed_at) {
    await supabase.auth.signOut();
    redirect("/verify-email?status=not-confirmed");
  }
  redirect(safeNext(formValue(formData, "next")));
}

export async function signUpAction(_previous: AuthState, formData: FormData): Promise<AuthState> {
  if (!hasSupabaseConfig()) return { error: "Authentication is not configured. Add the Supabase URL and anon key." };
  const name = displayNameSchema.safeParse(formValue(formData, "full_name"));
  const email = emailSchema.safeParse(formValue(formData, "email"));
  const passwordValue = formValue(formData, "password");
  const password = strongPasswordSchema.safeParse(passwordValue);
  const phone = z.string().trim().transform((value) => value.replace(/[\s()-]/g, "")).pipe(z.string().regex(/^(\+?234|0)[789][01]\d{8}$/)).safeParse(formValue(formData, "phone"));
  if (!password.success) return { error: passwordErrorMessage(passwordValue) || "Password must be 128 characters or fewer." };
  if (!name.success || !email.success || !phone.success) return { error: "Enter your name, a valid email address and a valid Nigerian phone number." };
  const emailRedirectTo = await authRedirectUrl("/account");
  if (!emailRedirectTo) return { error: "Drovna could not determine a valid email callback URL. Check NEXT_PUBLIC_SITE_URL; use HTTPS in production and a reachable app URL for local testing." };
  const supabase = await createClient();
  let result;
  try {
    result = await supabase.auth.signUp({
      email: email.data,
      password: password.data,
      options: {
        emailRedirectTo,
        data: { full_name: name.data, phone: phone.data },
      },
    });
  } catch (error) {
    return { error: friendlyAuthError(error, "We could not create your account right now. Please try again.", "signup") };
  }
  const { data, error } = result;
  if (error) return { error: friendlyAuthError(error, "Account creation failed. Try signing in or resetting your password if you have registered before.", "signup") };
  if (data.session) redirect("/account");
  redirect("/verify-email");
}

export async function forgotPasswordAction(_previous: AuthState, formData: FormData): Promise<AuthState> {
  if (!hasSupabaseConfig()) return { error: "Authentication is not configured. Add the Supabase URL and anon key." };
  const email = emailSchema.safeParse(formValue(formData, "email"));
  if (!email.success) return { error: "Enter a valid email address." };
  const redirectTo = await authRedirectUrl("/reset-password");
  if (!redirectTo) return { error: "Drovna could not determine a valid reset callback URL. Check NEXT_PUBLIC_SITE_URL; use HTTPS in production and a reachable app URL for local testing." };
  const supabase = await createClient();
  let error;
  try {
    ({ error } = await supabase.auth.resetPasswordForEmail(email.data, { redirectTo }));
  } catch (requestError) {
    return { error: friendlyAuthError(requestError, "We could not send a reset link. Please try again shortly.", "email") };
  }
  if (error) return { error: friendlyAuthError(error, "We could not send a reset link. Please try again shortly.", "email") };
  return { success: "If an account exists for that email, a password reset link is on its way." };
}

export async function updatePasswordAction(_previous: AuthState, formData: FormData): Promise<AuthState> {
  if (!hasSupabaseConfig()) return { error: "Authentication is not configured. Add the Supabase URL and anon key." };
  const passwordValue = formValue(formData, "password");
  const password = strongPasswordSchema.safeParse(passwordValue);
  const confirmation = formValue(formData, "confirm_password");
  if (!password.success) return { error: passwordErrorMessage(passwordValue) || "Password must be 128 characters or fewer." };
  if (password.data !== confirmation) return { error: "Your passwords don’t match. Check both fields and try again." };
  const supabase = await createClient();
  let user;
  try {
    const { data } = await supabase.auth.getUser();
    user = data.user;
  } catch {
    return { error: "We could not validate this reset link. Request a new link and try again." };
  }
  if (!user) return { error: "This reset link is expired or invalid. Request a new one." };
  let error;
  try {
    ({ error } = await supabase.auth.updateUser({ password: password.data }));
  } catch {
    return { error: "We could not update your password. Please request a new reset link." };
  }
  if (error) return { error: friendlyAuthError(error, "We could not update your password. Please request a new reset link.", "email") };
  redirect("/account?password=updated");
}

export async function resendVerificationAction(_previous: AuthState, formData: FormData): Promise<AuthState> {
  if (!hasSupabaseConfig()) return { error: "Authentication is not configured. Add the Supabase URL and anon key." };
  const email = emailSchema.safeParse(formValue(formData, "email"));
  if (!email.success) return { error: "Enter a valid email address." };
  const emailRedirectTo = await authRedirectUrl("/account");
  if (!emailRedirectTo) return { error: "Drovna could not determine a valid email callback URL. Check NEXT_PUBLIC_SITE_URL; use HTTPS in production and a reachable app URL for local testing." };
  const supabase = await createClient();
  let error;
  try {
    ({ error } = await supabase.auth.resend({ type: "signup", email: email.data, options: { emailRedirectTo } }));
  } catch (requestError) {
    return { error: friendlyAuthError(requestError, "We could not resend the link right now. Please try again.", "email") };
  }
  if (error) return { error: friendlyAuthError(error, "We could not resend the link. Check your email address and try again.", "email") };
  return { success: "If the address has a pending account, a verification link is on its way." };
}

export async function signOutAction() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/");
}
