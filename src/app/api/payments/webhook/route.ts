import { createHmac, timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const secret = process.env.PAYSTACK_SECRET_KEY;
  const signature = request.headers.get("x-paystack-signature");
  if (!secret || !signature) return NextResponse.json({ error: "Invalid signature." }, { status: 401 });
  const rawBody = await request.text();
  const expected = createHmac("sha512", secret).update(rawBody).digest();
  if (!/^[a-f\d]{128}$/i.test(signature)) return NextResponse.json({ error: "Invalid signature." }, { status: 401 });
  const supplied = Buffer.from(signature, "hex");
  if (supplied.length !== expected.length || !timingSafeEqual(supplied, expected)) return NextResponse.json({ error: "Invalid signature." }, { status: 401 });
  let event: { event?: string; data?: { reference?: string; amount?: number; currency?: string; status?: string } };
  try { event = JSON.parse(rawBody); } catch { return NextResponse.json({ error: "Invalid payload." }, { status: 400 }); }
  if (!["charge.success", "charge.failed"].includes(event.event ?? "") || !event.data?.reference) return NextResponse.json({ received: true });
  try {
    const admin = createAdminClient();
    const { data: payment } = await admin.from("payments").select("id, amount_kobo, status").eq("provider_reference", event.data.reference).single();
    if (!payment || event.data.currency !== "NGN" || event.data.amount !== payment.amount_kobo) return NextResponse.json({ error: "Payment does not match." }, { status: 400 });
    const status = event.event === "charge.success" && event.data.status === "success" ? "success" : "failed";
    if (payment.status === "success" || (status === "failed" && payment.status !== "pending")) return NextResponse.json({ received: true });
    const { error } = await admin.from("payments").update({ status }).eq("id", payment.id).eq("status", payment.status);
    if (error) throw new Error("payment_webhook_persist_failed");
    return NextResponse.json({ received: true });
  } catch { return NextResponse.json({ error: "Could not save payment event." }, { status: 503 }); }
}
