import type { Metadata } from "next";
import { AuthForm } from "@/components/auth/auth-form";
import { resendVerificationAction } from "@/app/auth/actions";

export const metadata: Metadata = { title: "Verify your email" };
export default async function VerifyEmailPage({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  const { status } = await searchParams;
  return <div className="mx-auto max-w-xl px-5 py-14 sm:px-8"><div className="rounded-[1.7rem] border border-[#e5e6df] bg-white p-7 sm:p-9"><p className="text-xs font-bold uppercase tracking-[.16em] text-[#de7844]">One quick step</p><h1 className="mt-2 font-display text-3xl font-semibold text-[#263d32]">Check your inbox.</h1><p className="mt-3 text-sm leading-relaxed text-[#718077]">{status === "not-confirmed" ? "Your account still needs email verification before you can sign in." : "If this address is eligible, Supabase has sent a verification link."} Check your inbox and spam folder. Links expire and can only be used once; request a fresh one below if needed.</p><div className="mt-5"><AuthForm action={resendVerificationAction} mode="resend"/></div></div></div>;
}
