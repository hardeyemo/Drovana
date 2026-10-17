import type { Metadata } from "next";
import { AuthForm } from "@/components/auth/auth-form";
import { updatePasswordAction } from "@/app/auth/actions";

export const metadata: Metadata = { title: "Choose a new password" };
export default function ResetPasswordPage() { return <AuthForm action={updatePasswordAction} mode="reset"/>; }
