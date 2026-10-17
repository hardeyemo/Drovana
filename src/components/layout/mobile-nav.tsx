"use client";

import Link from "next/link";
import { useEffect, useId, useRef, useState } from "react";
import { CircleUserRound, Menu, X } from "lucide-react";
import { buttonStyles } from "@/components/ui/button";
import type { NavLink } from "@/lib/config/site";

export function MobileNav({
  links,
  bookingHref,
  signInHref,
  isAuthenticated,
}: {
  links: NavLink[];
  bookingHref: string;
  signInHref: string;
  isAuthenticated: boolean | null;
}) {
  const [open, setOpen] = useState(false);
  const panelId = useId();
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    panelRef.current?.querySelector<HTMLElement>("a")?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        triggerRef.current?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const close = () => setOpen(false);

  return (
    <div className="flex items-center gap-1 lg:hidden">
      {isAuthenticated === true ? (
        <Link
          href="/account"
          aria-label="Your account"
          title="Your account"
          className="inline-flex size-11 items-center justify-center rounded-full text-navy-900 transition-colors hover:bg-paper-deep focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-700 focus-visible:ring-offset-2"
        >
          <CircleUserRound aria-hidden="true" className="size-6" />
        </Link>
      ) : isAuthenticated === null ? (
        <span aria-hidden="true" className="inline-flex size-11" />
      ) : null}
      <button
        ref={triggerRef}
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        aria-label={open ? "Close menu" : "Open menu"}
        onClick={() => setOpen((v) => !v)}
        className="inline-flex size-11 shrink-0 items-center justify-center rounded-control text-navy-900 transition-colors hover:bg-paper-deep"
      >
        {open ? <X className="size-6" /> : <Menu className="size-6" />}
      </button>

      <div
        ref={panelRef}
        id={panelId}
        hidden={!open}
        className="absolute inset-x-0 top-full max-h-[calc(100dvh-4rem)] overflow-y-auto overscroll-contain border-b border-line bg-paper px-4 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-2 shadow-soft sm:px-6"
      >
          <nav aria-label="Mobile">
            <ul className="divide-y divide-line">
              {links.map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    onClick={close}
                    className="block min-h-12 py-3.5 text-base font-semibold text-navy-900"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
              {isAuthenticated === false && (
                <li>
                  <Link
                    href={signInHref}
                    onClick={close}
                    className="block min-h-12 py-3.5 text-base font-semibold text-navy-900"
                  >
                    Sign in
                  </Link>
                </li>
              )}
            </ul>
          </nav>
          <Link
            href={bookingHref}
            onClick={close}
            className={buttonStyles({ size: "lg", className: "mt-4 w-full" })}
          >
            Book a delivery
          </Link>
      </div>
    </div>
  );
}
