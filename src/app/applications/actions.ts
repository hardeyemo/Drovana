"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { requireRole } from "@/lib/auth/server";

export async function riderApplicationAction(formData: FormData) {
  const vehicle = z.string().trim().min(3).max(40).safeParse(formData.get("vehicle_type"));
  const registration = z.string().trim().min(4).max(30).safeParse(formData.get("vehicle_registration"));
  if (!vehicle.success || !registration.success) redirect("/applications/rider?error=details");
  const { supabase } = await requireRole("customer");
  const { error } = await supabase.rpc("submit_rider_application", { p_vehicle_type: vehicle.data, p_vehicle_registration: registration.data });
  if (error) redirect(`/applications/rider?error=${error.code === "23505" ? "exists" : "submit"}`);
  redirect("/applications/rider?sent=1");
}

export async function businessApplicationAction(formData: FormData) {
  const name = z.string().trim().min(2).max(120).safeParse(formData.get("business_name"));
  const category = z.string().trim().min(2).max(60).safeParse(formData.get("category"));
  const address = z.string().trim().min(5).max(300).safeParse(formData.get("address"));
  const phone = z.string().trim().regex(/^(\+?234|0)[789][01]\d{8}$/).safeParse(formData.get("phone"));
  if (!name.success || !category.success || !address.success || !phone.success) redirect("/applications/business?error=details");
  const { supabase } = await requireRole("customer");
  const { error } = await supabase.rpc("submit_business_application", { p_name: name.data, p_category: category.data, p_address: address.data, p_phone: phone.data });
  if (error) redirect(`/applications/business?error=${error.code === "23505" ? "exists" : "submit"}`);
  redirect("/applications/business?sent=1");
}
