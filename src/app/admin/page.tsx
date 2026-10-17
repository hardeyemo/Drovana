import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth/server";

export default async function AdminEntryPage() {
  await requireAdmin();
  redirect("/admin/dashboard");
}
