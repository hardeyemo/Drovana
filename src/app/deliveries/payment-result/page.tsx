import type { Metadata } from "next";
import Link from "next/link";
import { Check, Clock3, X } from "lucide-react";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Payment status" };

type PaymentState = "success" | "pending" | "failed" | "invalid" | "unavailable" | "sign-in";

export default async function PaymentResultPage({ searchParams }: { searchParams: Promise<{ status?: string; reference?: string }> }) {
  const { status: queryStatus, reference } = await searchParams;
  let status: PaymentState = queryStatus === "invalid" || queryStatus === "unavailable" ? queryStatus : "sign-in";

  if (reference && /^SDPAY-[A-F0-9]{20}$/i.test(reference)) {
    try {
      const supabase = await createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: payment } = await supabase.from("payments").select("status").eq("provider_reference", reference.toUpperCase()).maybeSingle();
        if (payment?.status === "success") status = "success";
        else if (payment?.status === "failed") status = "failed";
        else if (payment?.status === "pending") status = "pending";
        else status = "invalid";
      }
    } catch {
      status = "unavailable";
    }
  }

  const successful = status === "success";
  const pending = status === "pending";
  const failed = status === "failed" || status === "invalid";
  const title = successful ? "Payment confirmed" : pending ? "Payment is being confirmed" : failed ? "Payment was not completed" : status === "sign-in" ? "Sign in to check payment" : "Payment status unavailable";
  const message = successful
    ? "Your payment was confirmed. You can follow delivery status in your account."
    : pending
      ? "We haven’t received final confirmation yet. Check your delivery history in a moment."
      : failed
        ? "No completed payment was found. You can try again from the delivery request."
        : status === "sign-in"
          ? "Sign in to view the payment status for your delivery."
          : "We couldn’t check the payment right now. Please try again shortly.";

  return <main className="mx-auto max-w-xl px-5 py-16"><section className="rounded-3xl border border-[#e5e6df] bg-white p-8 text-center">{successful ? <Check className="mx-auto size-10 text-[#53875a]" aria-hidden="true"/> : failed ? <X className="mx-auto size-10 text-[#a23e32]" aria-hidden="true"/> : <Clock3 className="mx-auto size-10 text-[#de7844]" aria-hidden="true"/>}<h1 className="mt-4 font-display text-3xl font-semibold text-[#263d32]">{title}</h1><p className="mt-2 text-sm leading-relaxed text-[#718077]">{message}</p><Link href={status === "sign-in" ? "/login" : "/account"} className="mt-6 inline-flex h-11 items-center rounded-full bg-[#de7844] px-5 font-semibold text-white">{status === "sign-in" ? "Sign in" : "Go to my account"}</Link></section></main>;
}
