import type { Metadata } from "next";
import { AuthForm } from "@/components/auth/auth-form";
import { forgotPasswordAction } from "@/app/auth/actions";

export const metadata: Metadata = { title: "Reset password" };
export default async function ForgotPasswordPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { error } = await searchParams;
  return <>
    {error === "expired" && <p role="alert" className="mx-auto mb-4 max-w-lg rounded-xl bg-[#fff0ed] px-5 py-3 text-sm text-[#a23e32]">That password reset link is invalid, expired, or already used. Request a new link below.</p>}
    <AuthForm action={forgotPasswordAction} mode="forgot"/>
  </>;
}
