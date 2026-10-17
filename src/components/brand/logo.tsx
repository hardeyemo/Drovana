import Link from "next/link";
import { cn } from "@/lib/cn";

export function LogoMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      aria-hidden="true"
      className={cn("size-8 shrink-0", className)}
    >
      <rect width="32" height="32" rx="10" fill="#263d32" />
      {/* A neighbourhood route ending in a warm delivery pin */}
      <path
        d="M8 22.5c0-5 4-5.5 8-5.5s8-.5 8-6"
        fill="none"
        stroke="#fff8ed"
        strokeWidth="2.6"
        strokeLinecap="round"
      />
      <circle cx="24" cy="10" r="3.2" fill="#de7844" />
      <circle cx="8" cy="22.5" r="1.8" fill="#f0b977" />
    </svg>
  );
}

export function Logo({
  className,
  tone = "dark",
}: {
  className?: string;
  tone?: "dark" | "light";
}) {
  return (
    <Link
      href="/"
      aria-label="Drovna home"
      className={cn("inline-flex items-center gap-2.5", className)}
    >
      <LogoMark />
      <span
        className={cn(
          "font-display text-[1.35rem] font-semibold tracking-tight",
          tone === "dark" ? "text-navy-900" : "text-white",
        )}
      >
        Drovna
      </span>
    </Link>
  );
}
