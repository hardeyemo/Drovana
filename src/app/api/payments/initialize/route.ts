import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

const schema = z.object({ delivery_id: z.string().uuid() });

export async function POST(request: Request) {
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid delivery request." }, { status: 400 });
  const secret = process.env.PAYSTACK_SECRET_KEY;
  if (!secret) return NextResponse.json({ error: "Online payment is not configured yet." }, { status: 503 });
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user?.email) return NextResponse.json({ error: "Sign in required." }, { status: 401 });
    const { data: delivery } = await supabase.from("deliveries").select("id, customer_id, estimated_fee_kobo, final_fee_kobo, status").eq("id", parsed.data.delivery_id).maybeSingle();
    if (!delivery || delivery.customer_id !== user.id || delivery.status === "cancelled" || delivery.status === "delivered") return NextResponse.json({ error: "This delivery can’t be paid for." }, { status: 404 });
    const { data: paid } = await supabase.from("payments").select("id").eq("delivery_id", delivery.id).eq("status", "success").maybeSingle();
    if (paid) return NextResponse.json({ error: "This delivery has already been paid." }, { status: 409 });
    const amount = delivery.final_fee_kobo ?? delivery.estimated_fee_kobo;
    const admin = createAdminClient();
    const { data: pending, error: pendingError } = await admin.from("payments").select("provider_reference, amount_kobo").eq("delivery_id", delivery.id).eq("customer_id", user.id).eq("status", "pending").maybeSingle();
    if (pendingError) throw new Error("payment_record_lookup_failed");
    if (pending && pending.amount_kobo !== amount) return NextResponse.json({ error: "The delivery fee changed. Contact support before retrying payment." }, { status: 409 });
    const reference = pending?.provider_reference ?? `SDPAY-${crypto.randomUUID().replaceAll("-", "").slice(0, 20).toUpperCase()}`;
    if (!pending) {
      const { error: saveError } = await admin.from("payments").insert({ delivery_id: delivery.id, customer_id: user.id, provider_reference: reference, amount_kobo: amount });
      if (saveError) {
        if (saveError.code === "23505") return NextResponse.json({ error: "A payment is already processing or this delivery has been paid." }, { status: 409 });
        throw new Error("payment_record_failed");
      }
    }
    const configuredSiteUrl = process.env.NEXT_PUBLIC_SITE_URL;
    let callbackOrigin: string;
    try {
      if (!configuredSiteUrl && process.env.NODE_ENV === "production") throw new Error("site_url_missing");
      if (configuredSiteUrl) {
        const siteUrl = new URL(configuredSiteUrl);
        if (siteUrl.username || siteUrl.password || siteUrl.search || siteUrl.hash) throw new Error("site_url_invalid");
        if (process.env.NODE_ENV === "production" && siteUrl.protocol !== "https:") throw new Error("site_url_must_use_https");
        callbackOrigin = siteUrl.origin;
      } else {
        callbackOrigin = new URL(request.url).origin;
      }
    } catch {
      await admin.from("payments").update({ status: "failed" }).eq("provider_reference", reference).eq("status", "pending");
      return NextResponse.json({ error: "Payment callback URL is not configured correctly." }, { status: 503 });
    }
    const result = await fetch("https://api.paystack.co/transaction/initialize", {
      method: "POST",
      headers: { Authorization: `Bearer ${secret}`, "Content-Type": "application/json" },
      body: JSON.stringify({ email: user.email, amount, currency: "NGN", reference, callback_url: `${callbackOrigin}/api/payments/callback`, metadata: { delivery_id: delivery.id } }),
      signal: AbortSignal.timeout(12000),
      cache: "no-store",
    });
    const payload = await result.json().catch(() => null) as { status?: boolean; data?: { authorization_url?: string } } | null;
    if (!result.ok || !payload?.status || !payload.data?.authorization_url) {
      await admin.from("payments").update({ status: "failed" }).eq("provider_reference", reference);
      return NextResponse.json({ error: "Payment could not be started. Please try again." }, { status: 502 });
    }
    let authorizationUrl: URL;
    try {
      authorizationUrl = new URL(payload.data.authorization_url);
    } catch {
      await admin.from("payments").update({ status: "failed" }).eq("provider_reference", reference);
      return NextResponse.json({ error: "Payment could not be started. Please try again." }, { status: 502 });
    }
    if (authorizationUrl.origin !== "https://checkout.paystack.com") {
      await admin.from("payments").update({ status: "failed" }).eq("provider_reference", reference);
      return NextResponse.json({ error: "Payment could not be started. Please try again." }, { status: 502 });
    }
    return NextResponse.json({ authorization_url: authorizationUrl.toString() });
  } catch {
    return NextResponse.json({ error: "Payment service is temporarily unavailable." }, { status: 503 });
  }
}
