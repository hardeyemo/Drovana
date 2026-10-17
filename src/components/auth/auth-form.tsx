"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Check, Circle, Eye, EyeOff } from "lucide-react";
import { buttonStyles } from "@/components/ui/button";
import type { AuthState } from "@/app/auth/actions";
import { passwordRequirementResults } from "@/lib/auth/password";

type Props = {
  action: (state: AuthState, formData: FormData) => Promise<AuthState>;
  mode: "login" | "signup" | "forgot" | "reset";
  next?: string;
  email?: string;
};

const labels = {
  login: { title: "Welcome back", intro: "Sign in to manage your Drovna deliveries.", submit: "Sign in" },
  signup: { title: "Create your account", intro: "Order across Ilorin and keep every delivery in view.", submit: "Create account" },
  forgot: { title: "Reset your password", intro: "We’ll email you a secure link to choose a new password.", submit: "Send reset link" },
  reset: { title: "Choose a new password", intro: "Create a strong password to help keep your account secure.", submit: "Update password" },
} as const;

const inputClass = "mt-1.5 h-12 w-full rounded-xl border border-[#dfe3dc] bg-white px-4 font-normal outline-none transition focus:border-[#de7844] focus:ring-2 focus:ring-[#de7844]/20";

function PasswordField({
  label,
  name,
  autoComplete,
  value,
  onValueChange,
  showRequirements = false,
  confirmationFeedback,
}: {
  label: string;
  name: string;
  autoComplete: string;
  value?: string;
  onValueChange?: (value: string) => void;
  showRequirements?: boolean;
  confirmationFeedback?: "match" | "mismatch" | null;
}) {
  const [visible, setVisible] = useState(false);
  const requirements = passwordRequirementResults(value ?? "");
  const requirementsId = `${name}-requirements`;

  return (
    <div>
      <label className="block text-sm font-semibold text-[#34483a]" htmlFor={name}>{label}</label>
      <span className="relative block">
        <input
          id={name}
          autoComplete={autoComplete}
          name={name}
          type={visible ? "text" : "password"}
          required
          minLength={showRequirements ? 8 : undefined}
          maxLength={128}
          value={value}
          onChange={onValueChange ? (event) => onValueChange(event.target.value) : undefined}
          aria-describedby={showRequirements ? requirementsId : confirmationFeedback ? `${name}-match` : undefined}
          aria-invalid={confirmationFeedback === "mismatch" || undefined}
          className={`${inputClass} pr-12`}
        />
        <button
          type="button"
          onClick={() => setVisible((current) => !current)}
          aria-label={visible ? "Hide password" : "Show password"}
          aria-pressed={visible}
          className="absolute right-1.5 top-1/2 grid size-9 -translate-y-1/2 place-items-center rounded-lg text-[#68796d] transition-colors hover:bg-[#f4f5ef] hover:text-[#263d32] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#de7844]"
        >
          {visible ? <EyeOff className="size-5" aria-hidden="true" /> : <Eye className="size-5" aria-hidden="true" />}
        </button>
      </span>
      {showRequirements && <div id={requirementsId} className="mt-3 rounded-xl border border-[#e9ece5] bg-[#f8f9f6] p-3.5" aria-live="polite">
        <p className="text-xs font-semibold text-[#58695d]">Password requirements</p>
        <ul className="mt-2 grid gap-1.5 sm:grid-cols-2">
          {requirements.map(({ id, label: requirementLabel, met }) => <li key={id} className={`flex items-center gap-2 text-xs transition-colors ${met ? "text-[#397448]" : "text-[#778279]"}`}>
            {met ? <Check className="size-3.5 shrink-0" aria-hidden="true" /> : <Circle className="size-3 shrink-0" aria-hidden="true" />}
            <span>{requirementLabel}</span>
          </li>)}
        </ul>
      </div>}
      {confirmationFeedback && <p id={`${name}-match`} className={`mt-2 text-xs ${confirmationFeedback === "match" ? "text-[#397448]" : "text-[#a23e32]"}`} aria-live="polite">{confirmationFeedback === "match" ? "Passwords match." : "Passwords don’t match yet."}</p>}
    </div>
  );
}

export function AuthForm({ action, mode, next, email }: Props) {
  const [state, formAction, pending] = useActionState(action, {});
  const [passwordValue, setPasswordValue] = useState("");
  const [confirmationValue, setConfirmationValue] = useState("");
  const requestInFlight = useRef(false);
  const copy = labels[mode];

  useEffect(() => {
    if (!pending) requestInFlight.current = false;
  }, [pending, state]);

  return (
    <main className="mx-auto w-full max-w-lg px-4 py-8 sm:px-8 sm:py-12">
      <div className="rounded-[1.5rem] border border-[#e5e6df] bg-white p-5 shadow-sm sm:rounded-[1.7rem] sm:p-9">
        <p className="text-xs font-bold uppercase tracking-[.16em] text-[#de7844]">Drovna · Ilorin</p>
        <h1 className="mt-2 font-display text-3xl font-semibold text-[#263d32]">{copy.title}</h1>
        <p className="mt-2 text-sm text-[#718077]">{copy.intro}</p>
        <form action={formAction} aria-busy={pending} onSubmit={(event) => {
          if (requestInFlight.current) event.preventDefault();
          else requestInFlight.current = true;
        }} className="mt-7 space-y-4">
          {next && <input type="hidden" name="next" value={next} />}
          {mode === "signup" && <label className="block text-sm font-semibold text-[#34483a]">Full name<input autoComplete="name" name="full_name" required minLength={2} maxLength={80} className={inputClass} /></label>}
          {(mode === "signup" || mode === "forgot" || mode === "login") && <label className="block text-sm font-semibold text-[#34483a]">Email address<input autoComplete="email" defaultValue={email} name="email" type="email" required maxLength={254} className={inputClass} /></label>}
          {mode === "signup" && <label className="block text-sm font-semibold text-[#34483a]">Nigerian phone number<input autoComplete="tel" name="phone" type="tel" placeholder="080 1234 5678" required className={inputClass} /></label>}
          {(mode === "login" || mode === "signup") && <>
            <PasswordField label="Password" autoComplete={mode === "login" ? "current-password" : "new-password"} name="password" value={mode === "signup" ? passwordValue : undefined} onValueChange={mode === "signup" ? setPasswordValue : undefined} showRequirements={mode === "signup"} />
            {mode === "login" && <Link href="/forgot-password" className={buttonStyles({ variant: "secondary", size: "md", className: "-mt-3 w-full justify-start rounded-xl" })}>Forgot password?</Link>}
          </>}
          {mode === "reset" && <>
            <PasswordField label="New password" autoComplete="new-password" name="password" value={passwordValue} onValueChange={setPasswordValue} showRequirements />
            <PasswordField label="Confirm new password" autoComplete="new-password" name="confirm_password" value={confirmationValue} onValueChange={setConfirmationValue} confirmationFeedback={confirmationValue ? (passwordValue === confirmationValue ? "match" : "mismatch") : null} />
          </>}
          {state.error && <div className="rounded-xl bg-[#fff0ed] p-3 text-sm text-[#a23e32]"><p role="alert">{state.error}</p>{mode === "login" && state.errorActions && <div className="mt-2 flex flex-wrap gap-2 border-t border-[#edcfc9] pt-3">{state.errorActions.includes("reset_password") && <Link href="/forgot-password" className={buttonStyles({ variant: "secondary", size: "md", className: "rounded-xl" })}>Reset password</Link>}{state.errorActions.includes("create_account") && <Link href="/signup" className={buttonStyles({ variant: "secondary", size: "md", className: "rounded-xl" })}>Create an account</Link>}</div>}</div>}
          {state.success && <p role="status" className="rounded-xl bg-[#edf6eb] p-3 text-sm text-[#426d48]">{state.success}</p>}
          {mode === "signup" && <p className="text-xs leading-relaxed text-[#718077]">Please review Drovna&apos;s <Link href="/terms" className="font-semibold text-[#456349] underline underline-offset-2">Terms &amp; Conditions</Link> before creating your account.</p>}
          <button disabled={pending} className="inline-flex h-12 w-full items-center justify-center rounded-full bg-[#de7844] px-5 font-semibold text-white transition hover:bg-[#c96232] disabled:cursor-wait disabled:opacity-60">{pending ? "Please wait…" : copy.submit}</button>
        </form>
        <div className="mt-5 flex flex-wrap gap-2">
          {mode === "login" && <Link href="/signup" className={buttonStyles({ variant: "secondary", size: "md", className: "w-full rounded-xl sm:w-auto" })}>Create account</Link>}
          {mode === "signup" && <Link href="/login" className={buttonStyles({ variant: "secondary", size: "md", className: "w-full rounded-xl sm:w-auto" })}>Already have an account? Sign in</Link>}
          {mode === "forgot" && <Link href="/login" className={buttonStyles({ variant: "secondary", size: "md", className: "w-full rounded-xl sm:w-auto" })}>Back to sign in</Link>}
        </div>
      </div>
    </main>
  );
}
