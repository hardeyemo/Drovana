import type { Metadata } from "next";
import { AuthForm } from "@/components/auth/auth-form";
import { signUpAction } from "@/app/auth/actions";

export const metadata: Metadata = { title: "Create an account" };
export default function SignupPage() { return <AuthForm action={signUpAction} mode="signup"/>; }
