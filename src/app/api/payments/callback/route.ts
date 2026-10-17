import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/admin";

const referenceSchema = z.string().min(8).max(40).regex(/^SDPAY-[A-F0-9]+$/);

function paymentResultUrl(request: NextRequest, status: "invalid" | "unavailable" | "pending" | "success", reference?: string) {
  const url = new URL("/deliveries/payment-result", request.url);
  url.searchParams.set("status", status);
  if (reference) url.searchParams.set("reference", reference);
  return url;
}

export async function GET(request: NextRequest) {
  const parsed = referenceSchema.safeParse(request.nextUrl.searchParams.get("reference"));
  if (!parsed.success) return NextResponse.redirect(paymentResultUrl(request, "invalid"));
  const secret = process.env.PAYSTACK_SECRET_KEY;
  if (!secret) return NextResponse.redirect(paymentResultUrl(request, "unavailable"));
  try {
    const admin = createAdminClient();
    const { data: payment } = await admin.from("payments").select("id, amount_kobo, status").eq("provider_reference", parsed.data).maybeSingle();
    if (!payment) return NextResponse.redirect(paymentResultUrl(request, "invalid"));
    if (payment.status !== "pending") {
      return NextResponse.redirect(paymentResultUrl(request, "pending", parsed.data));
    }
    const response = await fetch(`https://api.paystack.co/transaction/verify/${encodeURIComponent(parsed.data)}`, { headers: { Authorization: `Bearer ${secret}` }, cache: "no-store", signal: AbortSignal.timeout(10000) });
    const result = await response.json() as { status?: boolean; data?: { reference?: string; status?: string; amount?: number; currency?: string } };
    const paid = response.ok && result.status && result.data?.reference === parsed.data && result.data.status === "success" && result.data.amount === payment.amount_kobo && result.data.currency === "NGN";
    if (paid) {
      const { data: updated, error } = await admin.from("payments").update({ status: "success" }).eq("id", payment.id).eq("status", "pending").select("id").maybeSingle();
      if (error) throw new Error("payment_confirmation_persist_failed");
      if (!updated) {
        return NextResponse.redirect(paymentResultUrl(request, "pending", parsed.data));
      }
    }
    return NextResponse.redirect(paymentResultUrl(request, "pending", parsed.data));
  } catch {
    return NextResponse.redirect(paymentResultUrl(request, "pending", parsed.data));
  }
}
