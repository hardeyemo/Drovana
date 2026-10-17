"use client";

import Link from "next/link";
import type { AuthChangeEvent, Session } from "@supabase/supabase-js";
import { useEffect, useState } from "react";
import { CircleUserRound } from "lucide-react";
import { Logo } from "@/components/brand/logo";
import { MobileNav } from "@/components/layout/mobile-nav";
import { buttonStyles } from "@/components/ui/button";
import { bookingHref, primaryNav, signInHref } from "@/lib/config/site";
import { createClient } from "@/lib/supabase/client";
import { usePathname } from "next/navigation";

export function SiteHeader() {
  const pathname = usePathname();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    let supabase: ReturnType<typeof createClient>;
    try {
      supabase = createClient();
    } catch {
      setIsAuthenticated(false);
      return;
    }
    let active = true;
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event: AuthChangeEvent, session: Session | null) => {
      if (active) setIsAuthenticated(Boolean(session?.user));
    });

    void supabase.auth.getSession().then(({ data, error }: { data: { session: Session | null }; error: unknown }) => {
      if (active) setIsAuthenticated(!error && Boolean(data.session?.user));
    }).catch(() => {
      if (active) setIsAuthenticated(false);
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, [pathname]);

  const accountLink = isAuthenticated === true ? (
    <Link
      href="/account"
      aria-label="Your account"
      title="Your account"
      className="inline-flex size-11 items-center justify-center rounded-full text-navy-900 transition-colors hover:bg-paper-deep focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-700 focus-visible:ring-offset-2"
    >
      <CircleUserRound aria-hidden="true" className="size-6" />
    </Link>
  ) : isAuthenticated === false ? (
    <Link href={signInHref} className={buttonStyles({ variant: "ghost" })}>
      Sign in
    </Link>
  ) : (
    <span aria-hidden="true" className="inline-flex size-11" />
  );

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-paper/95 backdrop-blur-sm">
      <div className="relative mx-auto flex h-16 max-w-7xl items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
        <Logo />

        <nav aria-label="Primary" className="hidden items-center gap-1 lg:flex">
          {primaryNav.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="rounded-control px-3 py-2 text-sm font-medium text-ink-muted transition-colors hover:bg-paper-deep hover:text-navy-900 xl:px-3.5 xl:text-[0.95rem]"
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-2 lg:flex">
          {accountLink}
          <Link href={bookingHref} className={buttonStyles()}>
            Book a delivery
          </Link>
        </div>

        <MobileNav
          links={primaryNav}
          bookingHref={bookingHref}
          signInHref={signInHref}
          isAuthenticated={isAuthenticated}
        />
      </div>
    </header>
  );
}
