import type { Metadata } from "next";
import { AuthForm } from "@/components/auth/auth-form";
import { signInAction } from "@/app/auth/actions";

export const metadata: Metadata = { title: "Sign in" };
export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string; error?: string; reason?: string }> }) {
  const { next, error, reason } = await searchParams;
  return <>
    {error === "auth_link" && <p role="alert" className="mx-auto mb-4 max-w-lg rounded-xl bg-[#fff0ed] px-5 py-3 text-sm text-[#a23e32]">That sign-in link is invalid, expired, or already used. Please try again.</p>}
    {error === "auth_not_configured" && <p role="alert" className="mx-auto mb-4 max-w-lg rounded-xl bg-[#fff0ed] px-5 py-3 text-sm text-[#a23e32]">Authentication is not configured. Add Supabase project settings to the environment.</p>}
    {error === "profile" && <p role="alert" className="mx-auto mb-4 max-w-lg rounded-xl bg-[#fff0ed] px-5 py-3 text-sm text-[#a23e32]">{reason === "schema" ? "Account profiles are not set up in this environment yet. Please contact support." : reason === "permissions" ? "Your sign-in succeeded, but Drovna could not access your account profile. Please contact support." : "Your sign-in succeeded, but account setup could not be completed. Please try again or contact support."}</p>}
    <AuthForm action={signInAction} mode="login" next={next}/>
  </>;
}
