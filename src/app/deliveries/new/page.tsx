import type { Metadata } from "next";
import { DeliveryRequestForm } from "@/components/deliveries/delivery-request-form";
import { requireUser } from "@/lib/auth/server";

export const metadata: Metadata = { title: "Start an order" };
export const dynamic = "force-dynamic";

export default async function NewDeliveryPage() {
  const { supabase } = await requireUser();
  const { data: addresses } = await supabase.from("saved_addresses").select("id,label,address,area").order("created_at", { ascending: false }).limit(20);
  return <DeliveryRequestForm savedAddresses={addresses??[]}/>;
}
